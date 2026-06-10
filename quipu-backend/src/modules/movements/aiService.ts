// ============================================================
// modules/movements/aiService.ts — AI Text Parsing Service
// Gemini API integration for natural language processing
// ============================================================

import { config } from '../../config';

interface ParsedMovement {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  confidence: number;
}

export class AIService {
  async parseText(text: string): Promise<ParsedMovement> {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = `
Eres un asistente financiero que analiza texto en lenguaje natural en español para extraer información de transacciones financieras.

Analiza el siguiente texto y extrae:
1. Tipo: "INCOME" (ingreso) o "EXPENSE" (gasto)
2. Monto: número positivo en soles (S/)
3. Descripción: descripción corta del movimiento
4. Categoría: una de estas categorías: Alimentación, Transporte, Salud, Educación, Entretenimiento, Vivienda, Ropa, Otros

Texto: "${text}"

Responde ÚNICAMENTE en formato JSON así:
{
  "type": "INCOME" o "EXPENSE",
  "amount": número,
  "description": "descripción corta",
  "category": "categoría de la lista",
  "confidence": número entre 0 y 1
}
`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': config.gemini.apiKey,
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          }
        );

        if (!response.ok) {
            const errorText = await response.text();

  console.error('========== GEMINI RESPONSE ==========');
  console.error(errorText);
  console.error('=====================================');

  throw new Error(
    `Gemini API error: ${response.status} - ${errorText}`
  );
        }

        const data = await response.json() as any;
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          type: parsed.type,
          amount: parseFloat(parsed.amount),
          description: parsed.description,
          category: parsed.category,
          confidence: parsed.confidence || 0.8
        };
      } catch (error) {
        console.error(`AI parsing error (attempt ${attempt + 1}/${maxRetries}):`, error);
        lastError = error instanceof Error ? error : new Error('Failed to parse text with AI');
        
        // If this is not a 429 error or it's the last attempt, throw immediately
        if (!(error instanceof Error && error.message.includes('429')) || attempt === maxRetries - 1) {
          throw lastError;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Failed to parse text with AI after retries');
  }
}
