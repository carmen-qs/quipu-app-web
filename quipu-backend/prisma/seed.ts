// ============================================================
// prisma/seed.ts — Database Seed
// Seeds system categories for Quipu
// ============================================================

import { PrismaClient, CategoryType } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if categories already exist
  const existingCategories = await prisma.category.count({
    where: { isSystem: true },
  });

  if (existingCategories > 0) {
    console.log('✅ System categories already exist. Skipping seed.');
    return;
  }

  // Insert system categories
  const categories = [
    // EXPENSE categories
    {
      name: 'Alimentación',
      description: 'Restaurantes, mercados, supermercados y comida en general',
      icon: '🍽️',
      color: '#EF4444',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Transporte',
      description: 'Taxi, bus, combustible, transporte público y privado',
      icon: '🚌',
      color: '#F97316',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Salud',
      description: 'Medicamentos, consultas médicas, laboratorios y farmacia',
      icon: '🏥',
      color: '#EC4899',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Educación',
      description: 'Cursos, libros, matrículas, materiales educativos',
      icon: '📚',
      color: '#8B5CF6',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Entretenimiento',
      description: 'Cine, streaming, eventos, hobbies y actividades recreativas',
      icon: '🎬',
      color: '#06B6D4',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Servicios',
      description: 'Luz, agua, internet, telefonía e internet del hogar',
      icon: '💡',
      color: '#84CC16',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Vestimenta',
      description: 'Ropa, calzado y accesorios personales',
      icon: '👕',
      color: '#F59E0B',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Hogar',
      description: 'Alquiler, mobiliario, artículos del hogar y mantenimiento',
      icon: '🏠',
      color: '#78716C',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Ahorro',
      description: 'Depósitos en cuentas de ahorro y fondos de emergencia',
      icon: '🏦',
      color: '#10B981',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    {
      name: 'Otros gastos',
      description: 'Gastos varios no clasificados en otras categorías',
      icon: '📦',
      color: '#6B7280',
      type: CategoryType.EXPENSE,
      isSystem: true,
    },
    // INCOME categories
    {
      name: 'Sueldo',
      description: 'Salario mensual o quincenal del empleo principal',
      icon: '💼',
      color: '#10B981',
      type: CategoryType.INCOME,
      isSystem: true,
    },
    {
      name: 'Freelance',
      description: 'Ingresos por trabajos independientes o por proyecto',
      icon: '💻',
      color: '#3B82F6',
      type: CategoryType.INCOME,
      isSystem: true,
    },
    {
      name: 'Negocio',
      description: 'Ganancias de negocio propio o emprendimiento',
      icon: '🏪',
      color: '#6366F1',
      type: CategoryType.INCOME,
      isSystem: true,
    },
    {
      name: 'Inversiones',
      description: 'Dividendos, intereses, retornos de inversión',
      icon: '📈',
      color: '#F59E0B',
      type: CategoryType.INCOME,
      isSystem: true,
    },
    {
      name: 'Transferencias',
      description: 'Transferencias recibidas de familiares o amigos',
      icon: '💸',
      color: '#06B6D4',
      type: CategoryType.INCOME,
      isSystem: true,
    },
    {
      name: 'Otros ingresos',
      description: 'Ingresos varios no clasificados en otras categorías',
      icon: '📥',
      color: '#6B7280',
      type: CategoryType.INCOME,
      isSystem: true,
    },
  ];

  await prisma.category.createMany({
    data: categories,
  });

  console.log(`✅ Created ${categories.length} system categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
