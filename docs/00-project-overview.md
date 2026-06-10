# Quipu — Visión General del Proyecto

## 1. Descripción del Proyecto

**Quipu** es una aplicación web de gestión de finanzas personales con inteligencia artificial integrada. Su nombre hace referencia al sistema de cuerdas y nudos utilizado por los Incas para registrar información numérica — un homenaje a la cultura andina aplicado al contexto moderno del control financiero.

La aplicación permite a cualquier usuario registrar sus gastos e ingresos de forma natural, escribiendo en lenguaje cotidiano, y obtener una visión clara y organizada de su situación económica personal.

---

## 2. Problema que Resuelve

La mayoría de personas no lleva un control real de sus finanzas personales. Los motivos más comunes son:

- Las herramientas existentes son complejas o requieren conocimientos contables.
- Registrar gastos manualmente es tedioso y se abandona rápidamente.
- No existe retroalimentación útil que ayude a mejorar hábitos financieros.

Como resultado, las personas llegan a fin de mes sin saber exactamente en qué gastaron su dinero, lo que dificulta el ahorro y la planificación.

**Quipu** resuelve esto permitiendo que el usuario registre un movimiento simplemente escribiendo en lenguaje natural — por ejemplo: *"gasté 35 soles en almuerzo"* — y dejando que la inteligencia artificial se encargue de interpretar, categorizar y organizar la información automáticamente.

---

## 3. Objetivos del Proyecto

### Objetivo General
Desarrollar una aplicación web full stack que permita a los usuarios gestionar sus finanzas personales de manera sencilla, utilizando inteligencia artificial para automatizar la categorización de movimientos económicos.

### Objetivos Específicos
- Implementar un sistema de autenticación seguro con JWT y refresh tokens.
- Desarrollar una API REST robusta con Node.js, Express y TypeScript.
- Integrar el modelo `gemini-2.0-flash` de Google para el procesamiento de lenguaje natural.
- Construir un dashboard interactivo con gráficas de gastos e ingresos.
- Aplicar el ciclo de vida del software (SDD) en las fases A, D e I con documentación en cada fase.
- Alcanzar cobertura de tests unitarios con Vitest, enfocándose en la calidad del código.

---

## 4. Alcance del Proyecto

### Incluido (dentro del alcance)
- Registro e inicio de sesión de usuarios.
- Registro de gastos e ingresos mediante texto en lenguaje natural.
- Categorización automática de movimientos con IA (Gemini API).
- Dashboard con gráficas de distribución por categoría.
- Historial de movimientos con filtros por fecha y categoría.
- Gestión de metas de ahorro.
- Tests unitarios con reporte de cobertura de código.

### No incluido (fuera del alcance)
- Pruebas de integración y end-to-end (Fase P).
- Despliegue con Docker o en la nube (Fase D).
- Aplicación móvil nativa.
- Integración con bancos o cuentas reales.
- Pagos o transacciones reales.
- Notificaciones push o por correo electrónico.
- Multi-moneda (se trabajará en Soles peruanos - PEN).

---

## 5. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Inteligencia Artificial | Google Gemini API (`gemini-3.5-flash`) |
| Autenticación | JWT + Refresh Tokens |
| Tests y Cobertura | Vitest + Istanbul |
| Cliente DB | DBeaver |
| Editor | Windsurf |

---

## 6. Arquitectura General

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │  HTTP   │                 │  Query  │                 │
│  Next.js 14     │ ──────► │  Express API    │ ──────► │  PostgreSQL     │
│  (Frontend)     │         │  (Backend)      │         │                 │
│                 │ ◄────── │                 │ ◄────── │                 │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                                     │ Gemini API
                                     ▼
                            ┌─────────────────┐
                            │  Google Gemini  │
                            │  gemini-3.0-    │
                            │  flash (gratis) │
                            └─────────────────┘
```

---

## 7. Ciclo de Vida Aplicado (SDD)

El proyecto aplica las siguientes fases del ciclo SDD:

| Fase | Descripción | Entregables |
|------|-------------|-------------|
| A — Análisis | Requerimientos y casos de uso | `01-requirements.md`, `02-use-cases.md` |
| D — Diseño | Interfaces, prototipos y base de datos | `03-interfaces.md`, `04-database.md` |
| I — Implementación | Código fuente + pruebas unitarias + cobertura | `05-implementation.md` |

> Las fases P (Pruebas de integración) y D (Despliegue) serán implementadas en la entrega final del ciclo completo. Este entregable cubre únicamente las fases A, D e I.

---

## 8. Información del Proyecto

| Campo | Detalle |
|-------|---------|
| Nombre | Quipu |
| Tipo | Aplicación web (SPA + REST API) |
| Moneda | Soles peruanos (PEN) |
| Idioma | Español |
| Versión | 1.0.0 |
| Estado | En desarrollo |
