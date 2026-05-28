// ============================================================
// modules/movements/aiService.test.ts — AI Service Tests
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIService } from './aiService'

vi.mock('../../config', () => ({
  config: {
    gemini: {
      apiKey: 'test-gemini-key',
    },
  },
}))

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    aiService = new AIService()
    vi.clearAllMocks()
  })

  describe('parseText', () => {
    it('should parse text successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      type: 'EXPENSE',
                      amount: 50,
                      description: 'Comida',
                      category: 'Alimentación',
                      confidence: 0.9,
                    }),
                  },
                ],
              },
            },
          ],
        }),
      })

      const result = await aiService.parseText('Gasté 50 soles en comida')

      expect(result.type).toBe('EXPENSE')
      expect(result.amount).toBe(50)
      expect(result.description).toBe('Comida')
      expect(result.category).toBe('Alimentación')
    })


    it('should retry on 429 error', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        type: 'EXPENSE',
                        amount: 50,
                        description: 'Comida',
                        category: 'Alimentación',
                        confidence: 0.9,
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        })
      })

      const result = await aiService.parseText('Gasté 50 soles en comida')

      expect(callCount).toBe(2)
      expect(result.type).toBe('EXPENSE')
    })

    it('should throw error after max retries', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      })

      await expect(aiService.parseText('test')).rejects.toThrow('Gemini API error: 429')
    })

    it('should throw error if no JSON in response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'No JSON here',
                  },
                ],
              },
            },
          ],
        }),
      })

      await expect(aiService.parseText('test')).rejects.toThrow('No JSON found in AI response')
    })

    it('should parse income correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      type: 'INCOME',
                      amount: 1000,
                      description: 'Salario',
                      category: 'Otros',
                      confidence: 0.95,
                    }),
                  },
                ],
              },
            },
          ],
        }),
      })

      const result = await aiService.parseText('Recibí 1000 soles de salario')

      expect(result.type).toBe('INCOME')
      expect(result.amount).toBe(1000)
    })
  })
})
