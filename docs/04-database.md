# Documento de Diseño de Base de Datos
## Quipu — Arquitectura de Datos y Modelo Relacional

| Campo | Detalle |
|-------|---------|
| **Versión** | 1.0.0 |
| **Estado** | Aprobado |
| **Fecha** | Mayo 2026 |
| **Fase SDD** | D — Diseño |
| **Autor** | Arquitectura de Software — Quipu |

### Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0.0 | Mayo 2026 | Versión inicial del documento de base de datos |

---

## Tabla de Contenidos

1. [Introducción Técnica](#1-introducción-técnica)
2. [Modelo Conceptual](#2-modelo-conceptual)
3. [Modelo Lógico](#3-modelo-lógico)
4. [Diseño Completo de Tablas](#4-diseño-completo-de-tablas)
5. [Reglas de Integridad](#5-reglas-de-integridad)
6. [Índices y Optimización](#6-índices-y-optimización)
7. [Prisma Schema Completo](#7-prisma-schema-completo)
8. [SQL PostgreSQL](#8-sql-postgresql)
9. [Explicación Arquitectónica](#9-explicación-arquitectónica)
10. [Buenas Prácticas Aplicadas](#10-buenas-prácticas-aplicadas)

---

## 1. Introducción Técnica

### 1.1 Justificación de PostgreSQL

PostgreSQL es el sistema gestor de bases de datos relacionales de código abierto más avanzado del mundo. Su elección para **Quipu** no es arbitraria: responde a necesidades técnicas concretas que emergen de los requerimientos del sistema financiero.

**Fortaleza transaccional (ACID completo):**
En un sistema financiero, la integridad de los datos es innegociable. PostgreSQL implementa completamente las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad). Cuando un usuario registra un movimiento y ese registro debe actualizar simultáneamente una meta de ahorro, ambas operaciones deben tener éxito o fallar juntas. PostgreSQL garantiza esto a nivel de motor de base de datos, no solo a nivel de aplicación.

**Tipos de datos financieros:**
El tipo `NUMERIC(precision, scale)` de PostgreSQL garantiza aritmética exacta para valores monetarios, evitando los errores de redondeo inherentes al tipo `FLOAT` o `DOUBLE PRECISION`. Para Quipu, que opera en Soles peruanos (PEN) con precisión de dos decimales, esto es fundamental.

**JSON nativo (JSONB):**
La integración con Gemini API requiere almacenar respuestas estructuradas de la IA. PostgreSQL ofrece el tipo `JSONB` (JSON binario), que permite almacenamiento eficiente, indexación GIN y consultas sobre campos JSON, lo que es ideal para los logs de parsing de IA.

**Capacidades avanzadas de indexación:**
PostgreSQL soporta índices parciales, índices compuestos, índices de expresión, índices GIN para búsqueda de texto completo y índices BRIN para datos temporales. Estos mecanismos permiten optimizar consultas complejas como el historial filtrado de movimientos o las agregaciones del dashboard sin necesidad de vistas materializadas.

**Extensibilidad y funciones:**
Las funciones almacenadas, triggers y extensiones de PostgreSQL (como `uuid-ossp` o `pgcrypto`) permiten implementar lógica de integridad directamente en la base de datos como segunda línea de defensa.

**Concurrencia MVCC:**
El mecanismo de Control de Concurrencia Multi-Versión (MVCC) de PostgreSQL permite que múltiples sesiones lean y escriban simultáneamente sin bloqueos innecesarios, lo que es crítico para soportar múltiples sesiones activas de un mismo usuario (RF-022).

### 1.2 Justificación de Prisma ORM

Prisma es un ORM de nueva generación para Node.js y TypeScript que ofrece ventajas significativas frente a alternativas como Sequelize o TypeORM en el contexto de Quipu.

**Type-safety end-to-end:**
El cliente Prisma genera tipos TypeScript directamente del schema, lo que significa que cualquier consulta incorrecta (campos inexistentes, tipos incompatibles) se detecta en tiempo de compilación, no en tiempo de ejecución. En un sistema financiero, donde un campo mal consultado podría causar cálculos incorrectos, esto representa una capa adicional de seguridad.

**Schema como fuente de verdad:**
El archivo `schema.prisma` es la única fuente de verdad del modelo de datos. Cualquier cambio en el esquema se propaga automáticamente hacia el cliente TypeScript y hacia las migraciones SQL, eliminando inconsistencias entre el modelo de dominio y la base de datos real.

**Migraciones declarativas:**
Prisma Migrate genera SQL de migración a partir de diferencias entre el schema actual y el estado anterior, generando archivos SQL versionados que se pueden revisar, modificar y aplicar de forma controlada.

**Prisma.$transaction():**
La API de transacciones de Prisma, que soporta tanto transacciones interactivas como transacciones de lote, permite implementar el requerimiento RI-001 (consistencia transaccional) de forma limpia y tipada.

**Rendimiento controlado:**
A diferencia de ORMs que generan consultas N+1 silenciosamente, Prisma requiere que las relaciones se declaren explícitamente con `include` o `select`, haciendo el rendimiento predecible y visible en el código.

### 1.3 Enfoque Relacional

Quipu adopta un modelo de datos completamente relacional, evitando la tentación de usar almacenamiento documental (MongoDB) que pudiera parecer más simple inicialmente.

Los datos financieros exhiben relaciones inherentes y estrictas:
- Un movimiento **pertenece a** exactamente un usuario.
- Un movimiento **pertenece a** exactamente una categoría.
- Un aporte **pertenece a** exactamente una meta.
- Una meta **pertenece a** exactamente un usuario.

Estas relaciones no son opcionales ni flexibles: son invariantes del dominio. El modelo relacional garantiza estas invariantes mediante claves foráneas con restricciones de integridad referencial, algo que un modelo documental no puede garantizar de forma nativa.

Adicionalmente, las consultas del dashboard requieren agregaciones complejas (`SUM`, `GROUP BY`, `DATE_TRUNC`) que SQL ejecuta de forma nativa y eficiente, mientras que equivalentes en bases documentales requieren pipelines de agregación más complejos y menos eficientes.

### 1.4 Escalabilidad

La arquitectura de datos de Quipu está diseñada para escalar en tres dimensiones:

**Escalabilidad vertical:** Los índices estratégicos, el uso de `NUMERIC` en lugar de `FLOAT`, y la normalización adecuada garantizan que las consultas mantengan rendimiento aceptable a medida que el volumen de datos crece.

**Escalabilidad horizontal:** La separación entre datos de usuario (tabla `users`) y datos transaccionales (tabla `movements`) permite en el futuro aplicar particionamiento por `user_id` o por rango de fechas sin cambios en la lógica de aplicación.

**Escalabilidad funcional:** El diseño de tablas como `ai_parsing_logs` y `audit_logs` como entidades independientes permite en el futuro moverlas a sistemas de almacenamiento especializados (time-series databases, log aggregators) sin afectar el core transaccional.

### 1.5 Integridad Transaccional

Quipu opera bajo el principio de que **ninguna inconsistencia de datos es aceptable**. Este principio se implementa en cuatro niveles:

1. **Nivel de motor:** Restricciones `NOT NULL`, `UNIQUE`, `CHECK` y claves foráneas en PostgreSQL.
2. **Nivel ORM:** Schema Prisma como contrato declarativo del modelo de datos.
3. **Nivel de aplicación:** Validación con Zod en cada endpoint antes de cualquier operación de base de datos.
4. **Nivel de transacción:** `prisma.$transaction()` para operaciones multi-tabla.

---

## 2. Modelo Conceptual

### 2.1 Entidades del Sistema

El sistema Quipu opera sobre las siguientes entidades fundamentales:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MODELO CONCEPTUAL — QUIPU                           │
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│  │  USUARIO │      │   REFRESH    │      │       AUDIT LOG          │  │
│  │          │──1:N─│    TOKEN     │      │  (registro de eventos)   │  │
│  │  user    │      │              │      │                          │  │
│  └────┬─────┘      └──────────────┘      └──────────────────────────┘  │
│       │                                                                 │
│       ├────────────────────────────────────────────────────┐           │
│       │                                                    │           │
│      1:N                                                  1:N          │
│       │                                                    │           │
│  ┌────▼─────────┐       ┌──────────┐      ┌───────────────▼────────┐  │
│  │  MOVIMIENTO  │──N:1──│ CATEGORÍA│      │    META DE AHORRO      │  │
│  │              │       │          │      │                        │  │
│  │  movement    │       │ category │      │    saving_goal         │  │
│  └──────┬───────┘       └──────────┘      └───────────┬────────────┘  │
│         │                                              │               │
│         │                                             1:N              │
│        1:1                                             │               │
│         │                                  ┌───────────▼────────────┐  │
│  ┌──────▼───────┐                          │   APORTE A META        │  │
│  │  LOG DE IA   │                          │                        │  │
│  │              │                          │  goal_contribution     │  │
│  │ai_parsing_log│                          └────────────────────────┘  │
│  └──────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Descripción de Entidades

| Entidad | Nombre Técnico | Descripción |
|---------|----------------|-------------|
| Usuario | `users` | Persona registrada en el sistema. Entidad raíz de toda la jerarquía de datos. |
| Refresh Token | `refresh_tokens` | Token de renovación de sesión. Permite múltiples sesiones activas por usuario. |
| Categoría | `categories` | Clasificación de movimientos financieros. Puede ser del sistema o personalizada por el usuario. |
| Movimiento | `movements` | Registro de ingreso o gasto financiero. Entidad transaccional central. |
| Log de IA | `ai_parsing_logs` | Registro del procesamiento de lenguaje natural por Gemini API para un movimiento. |
| Meta de Ahorro | `saving_goals` | Objetivo económico que el usuario desea alcanzar. |
| Aporte a Meta | `goal_contributions` | Aporte monetario realizado hacia una meta de ahorro específica. |
| Log de Auditoría | `audit_logs` | Registro inmutable de eventos relevantes del sistema para trazabilidad. |

### 2.3 Relaciones y Cardinalidades

| Entidad Origen | Cardinalidad | Entidad Destino | Descripción |
|----------------|--------------|-----------------|-------------|
| `users` | 1 : N | `refresh_tokens` | Un usuario puede tener múltiples tokens activos (múltiples dispositivos). |
| `users` | 1 : N | `movements` | Un usuario puede registrar muchos movimientos financieros. |
| `users` | 1 : N | `saving_goals` | Un usuario puede tener múltiples metas de ahorro. |
| `users` | 1 : N | `categories` | Un usuario puede crear categorías personalizadas. |
| `users` | 1 : N | `audit_logs` | Un usuario puede generar múltiples eventos de auditoría. |
| `categories` | 1 : N | `movements` | Una categoría puede clasificar muchos movimientos. |
| `movements` | 1 : 1 | `ai_parsing_logs` | Un movimiento puede tener un log de parseo de IA asociado. |
| `saving_goals` | 1 : N | `goal_contributions` | Una meta puede recibir múltiples aportes. |

### 2.4 Dependencias de Existencia

Las siguientes dependencias de existencia son invariantes del sistema:

- Un `refresh_token` **no puede existir** sin un `user` que lo posea.
- Un `movement` **no puede existir** sin un `user` propietario.
- Un `movement` **no puede existir** sin una `category` asignada.
- Un `ai_parsing_log` **no puede existir** sin un `movement` asociado.
- Un `goal_contribution` **no puede existir** sin una `saving_goal` receptora.
- Una `saving_goal` **no puede existir** sin un `user` propietario.

---

## 3. Modelo Lógico

### 3.1 Tabla: `users`

**Propósito:** Almacena la identidad y credenciales de todos los usuarios registrados en el sistema. Es la entidad raíz de la que depende toda la jerarquía de datos personales y financieros.

**Relaciones:**
- PK: `id` — referenciada por `refresh_tokens.user_id`, `movements.user_id`, `saving_goals.user_id`, `categories.user_id`, `audit_logs.user_id`.

**Dependencias:** Ninguna (entidad raíz).

---

### 3.2 Tabla: `refresh_tokens`

**Propósito:** Implementa el sistema de sesiones múltiples (RF-022) mediante tokens de renovación únicos por dispositivo/sesión. Permite la invalidación selectiva de sesiones y el logout global.

**Relaciones:**
- FK: `user_id` → `users.id` (ON DELETE CASCADE)
- PK: `id` — identificador único del token

**Dependencias:** `users`

---

### 3.3 Tabla: `categories`

**Propósito:** Catálogo de categorías para clasificar movimientos financieros. Soporta tanto categorías del sistema (predefinidas, compartidas) como categorías personalizadas por usuario.

**Relaciones:**
- FK: `user_id` → `users.id` (ON DELETE CASCADE, nullable para categorías del sistema)
- PK: `id` — referenciada por `movements.category_id`

**Dependencias:** `users` (opcional, solo para categorías personalizadas)

---

### 3.4 Tabla: `movements`

**Propósito:** Entidad transaccional central. Registra cada ingreso o gasto del usuario con su monto, descripción, categoría y metadatos. Implementa soft delete para preservar el historial financiero (RA-002).

**Relaciones:**
- FK: `user_id` → `users.id` (ON DELETE CASCADE)
- FK: `category_id` → `categories.id` (ON DELETE RESTRICT)
- PK: `id` — referenciada por `ai_parsing_logs.movement_id`

**Dependencias:** `users`, `categories`

---

### 3.5 Tabla: `ai_parsing_logs`

**Propósito:** Registro de auditoría del procesamiento de lenguaje natural por Gemini API. Almacena el texto original del usuario, la respuesta completa de la IA, la confianza del parseo y el tiempo de respuesta. Permite diagnóstico y mejora del sistema de IA.

**Relaciones:**
- FK: `movement_id` → `movements.id` (ON DELETE CASCADE)
- PK: `id`

**Dependencias:** `movements`

---

### 3.6 Tabla: `saving_goals`

**Propósito:** Registro de metas de ahorro con sus estados, montos objetivos y fechas límite. Implementa máquina de estados (activa → completada → archivada) y soft delete.

**Relaciones:**
- FK: `user_id` → `users.id` (ON DELETE CASCADE)
- PK: `id` — referenciada por `goal_contributions.goal_id`

**Dependencias:** `users`

---

### 3.7 Tabla: `goal_contributions`

**Propósito:** Registro de cada aporte monetario realizado hacia una meta de ahorro. Permite calcular el progreso acumulado y mantener el historial de aportes. Implementa soft delete para preservar trazabilidad.

**Relaciones:**
- FK: `goal_id` → `saving_goals.id` (ON DELETE CASCADE)
- FK: `user_id` → `users.id` (ON DELETE CASCADE)
- PK: `id`

**Dependencias:** `saving_goals`, `users`

---

### 3.8 Tabla: `audit_logs`

**Propósito:** Registro inmutable de eventos relevantes del sistema para cumplir con RA-001 (auditoría). Almacena acciones de autenticación, modificaciones de datos financieros y errores del sistema. Es append-only (nunca se actualiza ni elimina).

**Relaciones:**
- FK: `user_id` → `users.id` (ON DELETE SET NULL — los logs sobreviven al usuario)
- PK: `id`

**Dependencias:** `users` (opcional, eventos de sistema pueden no tener usuario)

---

## 4. Diseño Completo de Tablas

### 4.1 Tabla: `users`

**Descripción técnica:** Entidad de identidad del sistema. La contraseña se almacena exclusivamente como hash bcrypt (costo ≥ 12). El campo `email` tiene restricción `UNIQUE` a nivel de base de datos. `is_active` permite la desactivación de cuentas sin eliminación física. Los campos de auditoría `created_at` y `updated_at` son gestionados por Prisma automáticamente.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. UUID v4 generado por PostgreSQL. |
| `name` | `VARCHAR(100)` | NO | — | Nombre completo del usuario. Máximo 100 caracteres. |
| `email` | `VARCHAR(255)` | NO | — | Correo electrónico único. Normalizado a minúsculas en aplicación. |
| `password_hash` | `VARCHAR(255)` | NO | — | Hash bcrypt de la contraseña. El hash bcrypt tiene longitud fija ~60 chars. |
| `is_active` | `BOOLEAN` | NO | `TRUE` | Indica si la cuenta está activa. Permite desactivación sin DELETE físico. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación con zona horaria. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. Actualizado por Prisma. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `users_pkey` | PRIMARY KEY | `id` | Identificador único del usuario. |
| `users_email_key` | UNIQUE | `email` | Garantiza un solo registro por email. |
| `users_name_check` | CHECK | `name` | `LENGTH(TRIM(name)) > 0` — nombre no vacío. |
| `users_email_format` | CHECK | `email` | `email ~* '^[^@]+@[^@]+\.[^@]+$'` — formato email básico. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `users_pkey` | BTREE (implícito) | `id` | PK — acceso por ID en cada operación autenticada. |
| `idx_users_email` | BTREE | `email` | Login: búsqueda de usuario por email. Operación de alta frecuencia. |
| `idx_users_is_active` | BTREE PARCIAL | `is_active` WHERE `is_active = TRUE` | Filtra usuarios activos sin escanear inactivos. |

---

### 4.2 Tabla: `refresh_tokens`

**Descripción técnica:** Implementa el patrón de Refresh Token Rotation. Cada token tiene un identificador único (`token_hash`), una familia (`family`) para detección de reutilización, y una fecha de expiración. El campo `is_revoked` permite la invalidación selectiva de tokens sin eliminarlos físicamente (útil para auditoría). La columna `device_info` almacena información del cliente para la interfaz de sesiones activas.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `user_id` | `UUID` | NO | — | FK → `users.id`. Propietario del token. |
| `token_hash` | `VARCHAR(255)` | NO | — | Hash SHA-256 del token JWT de refresh. Nunca el token en texto plano. |
| `family` | `UUID` | NO | `gen_random_uuid()` | Identificador de familia de tokens para detección de reutilización. |
| `is_revoked` | `BOOLEAN` | NO | `FALSE` | Indica si el token ha sido invalidado manualmente. |
| `expires_at` | `TIMESTAMPTZ` | NO | — | Timestamp de expiración del token. |
| `device_info` | `VARCHAR(500)` | SÍ | `NULL` | User-Agent u otra info del dispositivo cliente. Opcional. |
| `ip_address` | `INET` | SÍ | `NULL` | Dirección IP del cliente al momento de emisión. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación del token. |
| `last_used_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Última vez que este token fue usado para renovar sesión. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `refresh_tokens_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `refresh_tokens_token_hash_key` | UNIQUE | `token_hash` | Un hash de token solo puede existir una vez. |
| `refresh_tokens_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE CASCADE — al eliminar usuario, se eliminan sus tokens. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `refresh_tokens_pkey` | BTREE | `id` | PK. |
| `idx_refresh_tokens_token_hash` | BTREE | `token_hash` | Validación de token en cada renovación de sesión. Crítico. |
| `idx_refresh_tokens_user_id` | BTREE | `user_id` | Listado de sesiones activas de un usuario (RF-022). |
| `idx_refresh_tokens_user_active` | BTREE PARCIAL | `user_id, expires_at` WHERE `is_revoked = FALSE` | Tokens activos por usuario. Evita escanear tokens revocados. |
| `idx_refresh_tokens_expires_at` | BTREE | `expires_at` | Limpieza periódica de tokens expirados (job de mantenimiento). |

---

### 4.3 Tabla: `categories`

**Descripción técnica:** Catálogo dual de categorías. Las categorías del sistema tienen `user_id = NULL`, `is_system = TRUE` y son compartidas por todos los usuarios. Las categorías personalizadas tienen `user_id` poblado e `is_system = FALSE`. El campo `icon` almacena el nombre de un ícono (e.g., emoji o nombre de ícono de librería). `color` almacena un color hexadecimal para la UI del dashboard. El constraint `CHECK` garantiza consistencia entre `is_system` y `user_id`.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `user_id` | `UUID` | SÍ | `NULL` | FK → `users.id`. NULL para categorías del sistema. |
| `name` | `VARCHAR(100)` | NO | — | Nombre de la categoría (e.g., "Alimentación", "Transporte"). |
| `description` | `VARCHAR(255)` | SÍ | `NULL` | Descripción opcional de la categoría. |
| `icon` | `VARCHAR(100)` | SÍ | `NULL` | Nombre del ícono o emoji para representación visual. |
| `color` | `CHAR(7)` | SÍ | `'#6B7280'` | Color hexadecimal para UI (e.g., `#EF4444`). Default gris. |
| `type` | `category_type` | NO | — | Enum: `INCOME` o `EXPENSE`. Define si aplica a ingresos o gastos. |
| `is_system` | `BOOLEAN` | NO | `FALSE` | TRUE = categoría predefinida del sistema, FALSE = personalizada. |
| `is_active` | `BOOLEAN` | NO | `TRUE` | Permite desactivar categorías sin eliminarlas. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `categories_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `categories_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE CASCADE. |
| `categories_system_check` | CHECK | `is_system, user_id` | `(is_system = TRUE AND user_id IS NULL) OR (is_system = FALSE AND user_id IS NOT NULL)` |
| `categories_color_check` | CHECK | `color` | `color ~* '^#[0-9A-Fa-f]{6}$'` — formato hexadecimal válido. |
| `categories_name_user_unique` | UNIQUE | `user_id, name, type` | Un usuario no puede tener dos categorías del mismo nombre y tipo. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `categories_pkey` | BTREE | `id` | PK — referenciada por `movements.category_id`. |
| `idx_categories_user_id` | BTREE | `user_id` | Obtener categorías personalizadas de un usuario. |
| `idx_categories_system` | BTREE PARCIAL | `type, is_active` WHERE `is_system = TRUE` | Obtener categorías del sistema activas. Alta frecuencia. |
| `idx_categories_user_type` | BTREE | `user_id, type` WHERE `is_active = TRUE` | Categorías activas de un usuario filtradas por tipo. |

---

### 4.4 Tabla: `movements`

**Descripción técnica:** Tabla transaccional central. El campo `amount` usa `NUMERIC(12,2)` para garantizar exactitud aritmética financiera hasta 9,999,999,999.99 PEN. El campo `original_text` preserva el texto natural que el usuario ingresó, para referencia y posible re-parseo. El campo `source` indica cómo fue registrado el movimiento. `deleted_at` implementa soft delete según RA-002. El campo `notes` permite anotaciones adicionales del usuario.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `user_id` | `UUID` | NO | — | FK → `users.id`. Propietario del movimiento. |
| `category_id` | `UUID` | NO | — | FK → `categories.id`. Categoría asignada. |
| `type` | `movement_type` | NO | — | Enum: `INCOME` (ingreso) o `EXPENSE` (gasto). |
| `amount` | `NUMERIC(12,2)` | NO | — | Monto del movimiento en PEN. Siempre positivo. |
| `description` | `VARCHAR(500)` | NO | — | Descripción del movimiento (generada por IA o editada por usuario). |
| `original_text` | `TEXT` | SÍ | `NULL` | Texto original en lenguaje natural ingresado por el usuario. |
| `movement_date` | `DATE` | NO | `CURRENT_DATE` | Fecha del movimiento (no necesariamente la de registro). |
| `source` | `movement_source` | NO | `'MANUAL'` | Enum: `AI_PARSED`, `MANUAL`. Cómo fue registrado. |
| `notes` | `TEXT` | SÍ | `NULL` | Notas adicionales del usuario. |
| `is_confirmed` | `BOOLEAN` | NO | `TRUE` | FALSE si el movimiento está pendiente de confirmación por el usuario. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación del registro. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. |
| `deleted_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Timestamp de eliminación lógica (soft delete). NULL = activo. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `movements_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `movements_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE CASCADE. |
| `movements_category_id_fkey` | FOREIGN KEY | `category_id` → `categories.id` | ON DELETE RESTRICT — protege contra eliminación de categorías en uso. |
| `movements_amount_check` | CHECK | `amount` | `amount > 0` — el monto siempre es positivo. El tipo determina ingreso/gasto. |
| `movements_date_check` | CHECK | `movement_date` | `movement_date <= CURRENT_DATE + INTERVAL '1 day'` — no permite fechas futuras lejanas. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `movements_pkey` | BTREE | `id` | PK. |
| `idx_movements_user_active` | BTREE | `user_id, movement_date DESC` WHERE `deleted_at IS NULL` | Historial activo del usuario ordenado por fecha. Consulta más frecuente. |
| `idx_movements_user_type` | BTREE | `user_id, type` WHERE `deleted_at IS NULL` | Dashboard: separar ingresos de gastos de un usuario. |
| `idx_movements_user_category` | BTREE | `user_id, category_id` WHERE `deleted_at IS NULL` | Filtrar movimientos por categoría. |
| `idx_movements_user_date_range` | BTREE | `user_id, movement_date` WHERE `deleted_at IS NULL` | Filtros por rango de fechas (historial con filtros RF-013). |
| `idx_movements_deleted_at` | BTREE PARCIAL | `user_id` WHERE `deleted_at IS NOT NULL` | Acceso a movimientos eliminados (consultas de auditoría). |

---

### 4.5 Tabla: `ai_parsing_logs`

**Descripción técnica:** Registro de auditoría de cada interacción con Gemini API para parsear texto en lenguaje natural. Almacena tanto la solicitud enviada como la respuesta completa en formato JSONB, permitiendo diagnóstico de errores, análisis de calidad del parseo y posibles mejoras del prompt. El campo `confidence_score` es la confianza normalizada (0.0 a 1.0) extraída de la respuesta de la IA. `response_time_ms` permite monitorear el rendimiento de la integración.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `movement_id` | `UUID` | NO | — | FK → `movements.id`. Movimiento resultado del parseo. |
| `input_text` | `TEXT` | NO | — | Texto original enviado al modelo de IA para procesar. |
| `prompt_sent` | `TEXT` | NO | — | Prompt completo enviado a Gemini, incluyendo instrucciones del sistema. |
| `raw_response` | `JSONB` | SÍ | `NULL` | Respuesta JSON completa de Gemini API. NULL si hubo error de red. |
| `parsed_amount` | `NUMERIC(12,2)` | SÍ | `NULL` | Monto extraído por la IA. NULL si el parseo falló. |
| `parsed_description` | `VARCHAR(500)` | SÍ | `NULL` | Descripción extraída por la IA. |
| `parsed_category` | `VARCHAR(100)` | SÍ | `NULL` | Categoría sugerida por la IA (nombre de texto, no FK). |
| `parsed_type` | `movement_type` | SÍ | `NULL` | Tipo de movimiento extraído por la IA. |
| `confidence_score` | `NUMERIC(3,2)` | SÍ | `NULL` | Confianza del parseo entre 0.00 y 1.00. |
| `was_successful` | `BOOLEAN` | NO | `FALSE` | TRUE si el parseo produjo datos utilizables. |
| `error_message` | `TEXT` | SÍ | `NULL` | Mensaje de error si el parseo o la llamada a la API falló. |
| `model_used` | `VARCHAR(100)` | NO | `'gemini-2.0-flash'` | Versión del modelo de IA utilizado. |
| `response_time_ms` | `INTEGER` | SÍ | `NULL` | Tiempo de respuesta de la API en milisegundos. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de la operación de parseo. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `ai_parsing_logs_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `ai_parsing_logs_movement_id_fkey` | FOREIGN KEY | `movement_id` → `movements.id` | ON DELETE CASCADE. |
| `ai_parsing_logs_movement_id_key` | UNIQUE | `movement_id` | Un movimiento tiene como máximo un log de parseo. |
| `ai_parsing_logs_confidence_check` | CHECK | `confidence_score` | `confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)` |
| `ai_parsing_logs_response_time_check` | CHECK | `response_time_ms` | `response_time_ms IS NULL OR response_time_ms >= 0` |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `ai_parsing_logs_pkey` | BTREE | `id` | PK. |
| `ai_parsing_logs_movement_id_key` | BTREE | `movement_id` | Acceso por movimiento (UNIQUE implica índice). |
| `idx_ai_logs_was_successful` | BTREE | `was_successful, created_at DESC` | Análisis de tasa de éxito del parseo en el tiempo. |
| `idx_ai_logs_created_at` | BTREE | `created_at DESC` | Consultas de diagnóstico y monitoreo por fecha. |

---

### 4.6 Tabla: `saving_goals`

**Descripción técnica:** Implementa las metas de ahorro con una máquina de estados explícita mediante el enum `goal_status`. El campo `current_amount` se mantiene actualizado mediante la suma de `goal_contributions.amount` para cada meta activa, pero se almacena denormalizado para evitar sumas repetidas en el dashboard. La columna `target_date` es opcional (metas sin plazo). `deleted_at` implementa soft delete para preservar el historial de metas completadas.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `user_id` | `UUID` | NO | — | FK → `users.id`. Propietario de la meta. |
| `name` | `VARCHAR(200)` | NO | — | Nombre descriptivo de la meta (e.g., "Viaje a Cusco"). |
| `description` | `TEXT` | SÍ | `NULL` | Descripción ampliada de la meta. |
| `target_amount` | `NUMERIC(12,2)` | NO | — | Monto objetivo de la meta en PEN. |
| `current_amount` | `NUMERIC(12,2)` | NO | `0.00` | Monto acumulado actual. Denormalizado para rendimiento. |
| `status` | `goal_status` | NO | `'ACTIVE'` | Enum: `ACTIVE`, `COMPLETED`, `ARCHIVED`, `CANCELLED`. |
| `target_date` | `DATE` | SÍ | `NULL` | Fecha límite para alcanzar la meta. Opcional. |
| `icon` | `VARCHAR(100)` | SÍ | `NULL` | Ícono representativo de la meta. |
| `color` | `CHAR(7)` | SÍ | `'#3B82F6'` | Color hexadecimal para UI. Default azul. |
| `completed_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Timestamp en que se alcanzó el 100% de la meta. |
| `archived_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Timestamp en que se archivó la meta. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. |
| `deleted_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Soft delete. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `saving_goals_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `saving_goals_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE CASCADE. |
| `saving_goals_target_amount_check` | CHECK | `target_amount` | `target_amount > 0` — monto objetivo positivo. |
| `saving_goals_current_amount_check` | CHECK | `current_amount` | `current_amount >= 0` — no puede ser negativo. |
| `saving_goals_amounts_check` | CHECK | `current_amount, target_amount` | `current_amount <= target_amount * 1.01` — tolerancia del 1% por redondeo. |
| `saving_goals_color_check` | CHECK | `color` | `color ~* '^#[0-9A-Fa-f]{6}$'` |
| `saving_goals_completed_check` | CHECK | `status, completed_at` | `(status = 'COMPLETED' AND completed_at IS NOT NULL) OR (status != 'COMPLETED' AND completed_at IS NULL)` |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `saving_goals_pkey` | BTREE | `id` | PK. |
| `idx_saving_goals_user_active` | BTREE | `user_id, created_at DESC` WHERE `deleted_at IS NULL AND status = 'ACTIVE'` | Dashboard: metas activas del usuario. Consulta frecuente. |
| `idx_saving_goals_user_status` | BTREE | `user_id, status` WHERE `deleted_at IS NULL` | Filtrar metas por estado. |
| `idx_saving_goals_target_date` | BTREE | `target_date` WHERE `status = 'ACTIVE' AND target_date IS NOT NULL` | Alertas de metas próximas a vencer. |

---

### 4.7 Tabla: `goal_contributions`

**Descripción técnica:** Registro granular de cada aporte hacia una meta. Mantiene `user_id` además de `goal_id` para facilitar consultas de auditoría sin hacer JOIN con `saving_goals`. El campo `notes` permite que el usuario anote el contexto del aporte. Soft delete implementado para no alterar el progreso histórico visible. Cuando se registra un aporte, la aplicación actualiza atómicamente `saving_goals.current_amount` en la misma transacción (RI-001).

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `goal_id` | `UUID` | NO | — | FK → `saving_goals.id`. Meta receptora del aporte. |
| `user_id` | `UUID` | NO | — | FK → `users.id`. Usuario que realiza el aporte. |
| `amount` | `NUMERIC(12,2)` | NO | — | Monto del aporte en PEN. |
| `notes` | `VARCHAR(500)` | SÍ | `NULL` | Nota opcional del usuario sobre el aporte. |
| `contribution_date` | `DATE` | NO | `CURRENT_DATE` | Fecha del aporte. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación del registro. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. |
| `deleted_at` | `TIMESTAMPTZ` | SÍ | `NULL` | Soft delete del aporte. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `goal_contributions_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `goal_contributions_goal_id_fkey` | FOREIGN KEY | `goal_id` → `saving_goals.id` | ON DELETE CASCADE. |
| `goal_contributions_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE CASCADE. |
| `goal_contributions_amount_check` | CHECK | `amount` | `amount > 0` — los aportes siempre son positivos. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `goal_contributions_pkey` | BTREE | `id` | PK. |
| `idx_goal_contributions_goal_active` | BTREE | `goal_id, contribution_date DESC` WHERE `deleted_at IS NULL` | Historial de aportes de una meta. |
| `idx_goal_contributions_user` | BTREE | `user_id, created_at DESC` WHERE `deleted_at IS NULL` | Aportes recientes de un usuario. |

---

### 4.8 Tabla: `audit_logs`

**Descripción técnica:** Tabla append-only de auditoría. **Nunca se actualiza ni elimina** ningún registro (sin `updated_at`, sin `deleted_at`). El campo `action` usa el enum `audit_action` que describe el tipo de evento. `entity_type` y `entity_id` permiten relacionar el log con cualquier entidad del sistema sin claves foráneas (para preservar el log incluso si la entidad es eliminada). `metadata` almacena contexto adicional en JSONB (e.g., campos modificados, IP, contexto de error). `user_id` es nullable porque algunos eventos del sistema no tienen usuario asociado.

| Columna | Tipo PostgreSQL | Nullable | Default | Descripción |
|---------|----------------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Clave primaria. |
| `user_id` | `UUID` | SÍ | `NULL` | FK → `users.id`. Usuario que generó el evento. NULL para eventos de sistema. |
| `action` | `audit_action` | NO | — | Enum que identifica el tipo de evento auditado. |
| `entity_type` | `VARCHAR(100)` | SÍ | `NULL` | Nombre de la entidad afectada (e.g., `'movement'`, `'saving_goal'`). |
| `entity_id` | `UUID` | SÍ | `NULL` | ID de la entidad afectada. Sin FK para preservar log tras eliminación. |
| `ip_address` | `INET` | SÍ | `NULL` | IP del cliente que generó el evento. |
| `user_agent` | `VARCHAR(500)` | SÍ | `NULL` | User-Agent del cliente. |
| `metadata` | `JSONB` | SÍ | `'{}'` | Contexto adicional del evento en formato JSON. |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp del evento. Inmutable. |

**Constraints:**

| Nombre | Tipo | Columna(s) | Descripción |
|--------|------|-----------|-------------|
| `audit_logs_pkey` | PRIMARY KEY | `id` | Identificador único. |
| `audit_logs_user_id_fkey` | FOREIGN KEY | `user_id` → `users.id` | ON DELETE SET NULL — el log sobrevive al usuario. |

**Índices:**

| Nombre | Tipo | Columna(s) | Justificación |
|--------|------|-----------|---------------|
| `audit_logs_pkey` | BTREE | `id` | PK. |
| `idx_audit_logs_user_id` | BTREE | `user_id, created_at DESC` | Historial de acciones de un usuario específico. |
| `idx_audit_logs_action` | BTREE | `action, created_at DESC` | Filtrar logs por tipo de acción (e.g., todos los LOGIN_FAILED). |
| `idx_audit_logs_entity` | BTREE | `entity_type, entity_id` | Obtener el historial de auditoría de una entidad específica. |
| `idx_audit_logs_created_at` | BRIN | `created_at` | Consultas de rango temporal sobre datos de auditoría. BRIN eficiente para datos temporales append-only. |
| `idx_audit_logs_metadata_gin` | GIN | `metadata` | Búsqueda dentro del JSONB de metadatos. |

---

## 5. Reglas de Integridad

### 5.1 Comportamiento ON DELETE

Las relaciones de clave foránea en Quipu siguen una política deliberada y justificada para cada caso:

| Tabla Hija | FK | ON DELETE | Justificación |
|-----------|-----|-----------|---------------|
| `refresh_tokens` | `user_id` | `CASCADE` | Si un usuario es eliminado, sus sesiones pierden sentido. Eliminación física correcta. |
| `movements` | `user_id` | `CASCADE` | Los movimientos financieros pertenecen exclusivamente al usuario. |
| `movements` | `category_id` | `RESTRICT` | **No se puede eliminar una categoría si tiene movimientos asociados.** Protege la integridad del historial. El administrador debe reasignar los movimientos primero. |
| `ai_parsing_logs` | `movement_id` | `CASCADE` | El log de parseo no tiene valor sin el movimiento. |
| `saving_goals` | `user_id` | `CASCADE` | Las metas son exclusivas del usuario. |
| `goal_contributions` | `goal_id` | `CASCADE` | Los aportes no tienen sentido sin la meta receptora. |
| `goal_contributions` | `user_id` | `CASCADE` | Los aportes pertenecen al usuario. |
| `audit_logs` | `user_id` | `SET NULL` | **Los logs de auditoría deben sobrevivir al usuario.** Si el usuario es eliminado, el log se preserva con `user_id = NULL` para cumplir con RA-001. |
| `categories` | `user_id` | `CASCADE` | Las categorías personalizadas de un usuario se eliminan con él. |

### 5.2 Comportamiento ON UPDATE

Todas las claves foráneas usan `ON UPDATE CASCADE`, ya que los `id` son UUID generados y no cambian en la práctica. Esto es una salvaguarda defensiva.

### 5.3 Soft Delete

El soft delete se implementa mediante el campo `deleted_at TIMESTAMPTZ NULL` en las tablas donde el historial debe preservarse:

| Tabla | Tiene Soft Delete | Justificación |
|-------|-----------------|---------------|
| `users` | NO (usa `is_active`) | Los usuarios no se eliminan físicamente, se desactivan. |
| `movements` | **SÍ** | RA-002: trazabilidad total del historial financiero. |
| `saving_goals` | **SÍ** | Historial de metas completadas y canceladas. |
| `goal_contributions` | **SÍ** | Trazabilidad de aportes. |
| `refresh_tokens` | NO (usa `is_revoked`) | Los tokens tienen expiración natural. |
| `categories` | NO (usa `is_active`) | Las categorías se desactivan, no se eliminan. |
| `ai_parsing_logs` | NO | Inmutables. No se eliminan. |
| `audit_logs` | NO | Append-only. Inmutables. |

**Regla de exclusión universal para soft delete:**
Toda consulta que opere sobre datos activos **debe incluir** el filtro `WHERE deleted_at IS NULL`. En Prisma, esto se implementa mediante middleware global o mediante campos de filtro explícitos en cada query.

Ejemplo Prisma:
```typescript
// Siempre excluir soft-deleted en queries de usuario
const movements = await prisma.movement.findMany({
  where: {
    userId: currentUserId,
    deletedAt: null,   // <-- filtro obligatorio
  }
});
```

### 5.4 Transacciones y Consistencia

Las siguientes operaciones **deben ejecutarse dentro de transacciones atómicas** (`prisma.$transaction()`):

**Login (RF-002):**
```
BEGIN
  1. Validar credenciales del usuario
  2. Crear registro en refresh_tokens
  3. Crear registro en audit_logs (LOGIN_SUCCESS)
COMMIT / ROLLBACK
```

**Registro de movimiento con IA (RF-008):**
```
BEGIN
  1. Llamar a Gemini API (fuera de la transacción — red)
  2. Crear registro en movements
  3. Crear registro en ai_parsing_logs
  4. Crear registro en audit_logs (MOVEMENT_CREATED)
COMMIT / ROLLBACK
```

**Aporte a meta (RF-017):**
```
BEGIN
  1. Crear registro en goal_contributions
  2. UPDATE saving_goals SET current_amount = current_amount + :amount
  3. Si current_amount >= target_amount:
     UPDATE saving_goals SET status = 'COMPLETED', completed_at = NOW()
  4. Crear registro en audit_logs (GOAL_CONTRIBUTION_ADDED)
COMMIT / ROLLBACK
```

**Logout global (RF-022):**
```
BEGIN
  1. UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = :userId AND is_revoked = FALSE
  2. Crear registro en audit_logs (LOGOUT_ALL)
COMMIT / ROLLBACK
```

### 5.5 Validaciones CHECK a Nivel de Base de Datos

Los constraints `CHECK` en PostgreSQL actúan como segunda línea de defensa tras la validación en aplicación (Zod):

| Constraint | Tabla | Regla | Error prevenido |
|-----------|-------|-------|----------------|
| `amount > 0` | `movements` | Monto siempre positivo | Movimientos con monto cero o negativo |
| `amount > 0` | `goal_contributions` | Aporte siempre positivo | Aportes de reducción de metas |
| `target_amount > 0` | `saving_goals` | Objetivo financiero válido | Metas sin valor objetivo |
| `current_amount >= 0` | `saving_goals` | Balance no negativo | Inconsistencias en cálculo de aportes |
| `confidence_score BETWEEN 0 AND 1` | `ai_parsing_logs` | Score normalizado | Valores de confianza inválidos |
| Color hex válido | `categories`, `saving_goals` | Formato `#RRGGBB` | Strings de color inválidos en UI |

---

## 6. Índices y Optimización

### 6.1 Estrategia de Indexación

Los índices en Quipu siguen los siguientes principios de diseño:

1. **Índices en columnas de JOIN:** Toda columna de clave foránea tiene índice.
2. **Índices compuestos para queries frecuentes:** Orden de columnas: alta cardinalidad primero, columna de filtro segundo.
3. **Índices parciales para soft delete:** Solo indexan filas activas (`WHERE deleted_at IS NULL`), reduciendo el tamaño del índice y mejorando los insert.
4. **BRIN para datos temporales append-only:** `audit_logs.created_at` usa BRIN (Block Range Index), que es extremadamente eficiente para datos que se insertan en orden cronológico.
5. **GIN para JSONB:** Los campos `metadata` y `raw_response` usan índices GIN para soportar búsquedas dentro de objetos JSON.

### 6.2 Índices por Caso de Uso

#### Dashboard principal (RF-014)

El dashboard requiere los siguientes datos:
- Balance total del mes actual (suma de ingresos - gastos)
- Distribución por categoría del mes actual
- Últimos N movimientos

```sql
-- Consulta representativa del dashboard
SELECT
  SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END) AS balance,
  category_id,
  SUM(amount) AS total_by_category
FROM movements
WHERE user_id = $1
  AND deleted_at IS NULL
  AND movement_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND movement_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY category_id;
```

**Índice utilizado:** `idx_movements_user_date_range (user_id, movement_date) WHERE deleted_at IS NULL`

Este índice permite al planner de PostgreSQL:
1. Filtrar por `user_id` usando el índice (evita escaneo secuencial).
2. Usar el rango de fechas sin escanear filas fuera del mes.
3. El predicado parcial excluye filas con `deleted_at IS NOT NULL`.

#### Historial con filtros (RF-013)

```sql
-- Historial con filtro por categoría y rango de fechas
SELECT * FROM movements
WHERE user_id = $1
  AND deleted_at IS NULL
  AND category_id = $2
  AND movement_date BETWEEN $3 AND $4
ORDER BY movement_date DESC, created_at DESC
LIMIT 20 OFFSET $5;
```

**Índice utilizado:** `idx_movements_user_category (user_id, category_id) WHERE deleted_at IS NULL`

#### Autenticación / Login (RF-002)

```sql
-- Búsqueda de usuario por email durante login
SELECT id, password_hash, is_active FROM users WHERE email = $1;
```

**Índice utilizado:** `idx_users_email (email)` — índice BTREE único, O(log n).

#### Validación de Refresh Token (RF-003)

```sql
-- Validar token en renovación de sesión
SELECT id, user_id, family, is_revoked, expires_at
FROM refresh_tokens
WHERE token_hash = $1;
```

**Índice utilizado:** `refresh_tokens_token_hash_key (token_hash)` — índice UNIQUE, O(log n).

#### Metas de ahorro (RF-016)

```sql
-- Metas activas del usuario para dashboard
SELECT id, name, target_amount, current_amount, target_date, status
FROM saving_goals
WHERE user_id = $1
  AND deleted_at IS NULL
  AND status = 'ACTIVE'
ORDER BY created_at DESC;
```

**Índice utilizado:** `idx_saving_goals_user_active (user_id, created_at DESC) WHERE deleted_at IS NULL AND status = 'ACTIVE'`

#### Limpieza de tokens expirados (mantenimiento)

```sql
-- Job periódico para limpiar tokens expirados
DELETE FROM refresh_tokens
WHERE expires_at < NOW() - INTERVAL '7 days'
  AND is_revoked = TRUE;
```

**Índice utilizado:** `idx_refresh_tokens_expires_at (expires_at)` — permite ubicar eficientemente tokens viejos.

### 6.3 Índices Compuestos vs. Simples

| Índice | Tipo | Razón de la elección |
|--------|------|---------------------|
| `(user_id, movement_date)` | Compuesto | `user_id` reduce el dataset primero; `movement_date` permite rangos sobre ese subconjunto. |
| `(user_id, category_id)` | Compuesto | Filtro combinado frecuente en historial. |
| `(user_id, type)` | Compuesto | Dashboard separa ingresos y gastos por usuario. |
| `(action, created_at DESC)` | Compuesto | Filtrar logs por tipo de acción ordenados cronológicamente. |
| `(goal_id, contribution_date DESC)` | Compuesto | Historial de aportes de una meta, más recientes primero. |

---

## 7. Prisma Schema Completo

```prisma
// ============================================================
// schema.prisma — Quipu Financial App
// PostgreSQL + Prisma ORM
// Versión: 1.0.0
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

/// Tipo de movimiento financiero
enum MovementType {
  INCOME  @map("INCOME")  // Ingreso
  EXPENSE @map("EXPENSE") // Gasto

  @@map("movement_type")
}

/// Fuente de registro del movimiento
enum MovementSource {
  AI_PARSED @map("AI_PARSED") // Registrado mediante parsing de IA
  MANUAL    @map("MANUAL")    // Registrado manualmente por el usuario

  @@map("movement_source")
}

/// Tipo de movimiento que aplica a una categoría
enum CategoryType {
  INCOME  @map("INCOME")
  EXPENSE @map("EXPENSE")

  @@map("category_type")
}

/// Estado del ciclo de vida de una meta de ahorro
enum GoalStatus {
  ACTIVE    @map("ACTIVE")    // Meta activa en progreso
  COMPLETED @map("COMPLETED") // Meta alcanzada al 100%
  ARCHIVED  @map("ARCHIVED")  // Meta archivada por el usuario
  CANCELLED @map("CANCELLED") // Meta cancelada antes de completarse

  @@map("goal_status")
}

/// Tipos de eventos registrados en auditoría
enum AuditAction {
  // Autenticación
  USER_REGISTERED      @map("USER_REGISTERED")
  LOGIN_SUCCESS        @map("LOGIN_SUCCESS")
  LOGIN_FAILED         @map("LOGIN_FAILED")
  LOGOUT               @map("LOGOUT")
  LOGOUT_ALL           @map("LOGOUT_ALL")
  TOKEN_REFRESHED      @map("TOKEN_REFRESHED")
  TOKEN_REVOKED        @map("TOKEN_REVOKED")

  // Perfil
  PROFILE_UPDATED      @map("PROFILE_UPDATED")
  PASSWORD_CHANGED     @map("PASSWORD_CHANGED")

  // Movimientos
  MOVEMENT_CREATED     @map("MOVEMENT_CREATED")
  MOVEMENT_UPDATED     @map("MOVEMENT_UPDATED")
  MOVEMENT_DELETED     @map("MOVEMENT_DELETED")

  // Metas
  GOAL_CREATED         @map("GOAL_CREATED")
  GOAL_UPDATED         @map("GOAL_UPDATED")
  GOAL_DELETED         @map("GOAL_DELETED")
  GOAL_COMPLETED       @map("GOAL_COMPLETED")
  GOAL_ARCHIVED        @map("GOAL_ARCHIVED")
  GOAL_CONTRIBUTION_ADDED @map("GOAL_CONTRIBUTION_ADDED")
  GOAL_CONTRIBUTION_DELETED @map("GOAL_CONTRIBUTION_DELETED")

  // Sistema
  AI_PARSING_FAILED    @map("AI_PARSING_FAILED")
  SYSTEM_ERROR         @map("SYSTEM_ERROR")

  @@map("audit_action")
}

// ============================================================
// MODELOS
// ============================================================

/// Usuarios registrados en el sistema.
/// Entidad raíz de la jerarquía de datos.
model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String   @db.VarChar(100)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // Relaciones
  refreshTokens     RefreshToken[]
  movements         Movement[]
  savingGoals       SavingGoal[]
  categories        Category[]
  goalContributions GoalContribution[]
  auditLogs         AuditLog[]

  @@index([email], name: "idx_users_email")
  @@map("users")
}

/// Tokens de renovación de sesión.
/// Soporta múltiples sesiones activas por usuario.
model RefreshToken {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  tokenHash   String    @unique @map("token_hash") @db.VarChar(255)
  family      String    @default(dbgenerated("gen_random_uuid()")) @map("family") @db.Uuid
  isRevoked   Boolean   @default(false) @map("is_revoked")
  expiresAt   DateTime  @map("expires_at") @db.Timestamptz
  deviceInfo  String?   @map("device_info") @db.VarChar(500)
  ipAddress   String?   @map("ip_address") @db.VarChar(45) // IPv6 max 45 chars
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz
  lastUsedAt  DateTime? @map("last_used_at") @db.Timestamptz

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId], name: "idx_refresh_tokens_user_id")
  @@index([expiresAt], name: "idx_refresh_tokens_expires_at")
  @@map("refresh_tokens")
}

/// Categorías de movimientos financieros.
/// Soporta categorías del sistema (user_id = null) y personalizadas.
model Category {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String?      @map("user_id") @db.Uuid
  name        String       @db.VarChar(100)
  description String?      @db.VarChar(255)
  icon        String?      @db.VarChar(100)
  color       String?      @default("#6B7280") @db.Char(7)
  type        CategoryType
  isSystem    Boolean      @default(false) @map("is_system")
  isActive    Boolean      @default(true) @map("is_active")
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  // Relaciones
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  movements Movement[]

  @@unique([userId, name, type], name: "categories_name_user_unique")
  @@index([userId], name: "idx_categories_user_id")
  @@index([type, isActive], name: "idx_categories_type_active")
  @@map("categories")
}

/// Movimientos financieros (ingresos y gastos).
/// Entidad transaccional central del sistema.
model Movement {
  id           String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String         @map("user_id") @db.Uuid
  categoryId   String         @map("category_id") @db.Uuid
  type         MovementType
  amount       Decimal        @db.Decimal(12, 2)
  description  String         @db.VarChar(500)
  originalText String?        @map("original_text") @db.Text
  movementDate DateTime       @default(dbgenerated("CURRENT_DATE")) @map("movement_date") @db.Date
  source       MovementSource @default(MANUAL)
  notes        String?        @db.Text
  isConfirmed  Boolean        @default(true) @map("is_confirmed")
  createdAt    DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime       @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt    DateTime?      @map("deleted_at") @db.Timestamptz

  // Relaciones
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  aiParsingLog AiParsingLog?

  @@index([userId, movementDate(sort: Desc)], name: "idx_movements_user_date")
  @@index([userId, type], name: "idx_movements_user_type")
  @@index([userId, categoryId], name: "idx_movements_user_category")
  @@map("movements")
}

/// Logs de procesamiento de lenguaje natural con Gemini API.
/// Registro de auditoría de cada interacción con la IA.
model AiParsingLog {
  id                String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  movementId        String       @unique @map("movement_id") @db.Uuid
  inputText         String       @map("input_text") @db.Text
  promptSent        String       @map("prompt_sent") @db.Text
  rawResponse       Json?        @map("raw_response") @db.JsonB
  parsedAmount      Decimal?     @map("parsed_amount") @db.Decimal(12, 2)
  parsedDescription String?      @map("parsed_description") @db.VarChar(500)
  parsedCategory    String?      @map("parsed_category") @db.VarChar(100)
  parsedType        MovementType? @map("parsed_type")
  confidenceScore   Decimal?     @map("confidence_score") @db.Decimal(3, 2)
  wasSuccessful     Boolean      @default(false) @map("was_successful")
  errorMessage      String?      @map("error_message") @db.Text
  modelUsed         String       @default("gemini-2.0-flash") @map("model_used") @db.VarChar(100)
  responseTimeMs    Int?         @map("response_time_ms")
  createdAt         DateTime     @default(now()) @map("created_at") @db.Timestamptz

  // Relaciones
  movement Movement @relation(fields: [movementId], references: [id], onDelete: Cascade)

  @@index([wasSuccessful, createdAt(sort: Desc)], name: "idx_ai_logs_successful_date")
  @@index([createdAt(sort: Desc)], name: "idx_ai_logs_created_at")
  @@map("ai_parsing_logs")
}

/// Metas de ahorro del usuario.
/// Implementa ciclo de vida: ACTIVE → COMPLETED → ARCHIVED.
model SavingGoal {
  id            String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String     @map("user_id") @db.Uuid
  name          String     @db.VarChar(200)
  description   String?    @db.Text
  targetAmount  Decimal    @map("target_amount") @db.Decimal(12, 2)
  currentAmount Decimal    @default(0.00) @map("current_amount") @db.Decimal(12, 2)
  status        GoalStatus @default(ACTIVE)
  targetDate    DateTime?  @map("target_date") @db.Date
  icon          String?    @db.VarChar(100)
  color         String?    @default("#3B82F6") @db.Char(7)
  completedAt   DateTime?  @map("completed_at") @db.Timestamptz
  archivedAt    DateTime?  @map("archived_at") @db.Timestamptz
  createdAt     DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime   @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt     DateTime?  @map("deleted_at") @db.Timestamptz

  // Relaciones
  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  contributions GoalContribution[]

  @@index([userId, status], name: "idx_saving_goals_user_status")
  @@index([userId, createdAt(sort: Desc)], name: "idx_saving_goals_user_created")
  @@map("saving_goals")
}

/// Aportes monetarios hacia una meta de ahorro.
/// Cada aporte incrementa el progreso de la meta.
model GoalContribution {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  goalId           String    @map("goal_id") @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  amount           Decimal   @db.Decimal(12, 2)
  notes            String?   @db.VarChar(500)
  contributionDate DateTime  @default(dbgenerated("CURRENT_DATE")) @map("contribution_date") @db.Date
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz

  // Relaciones
  goal SavingGoal @relation(fields: [goalId], references: [id], onDelete: Cascade)
  user User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([goalId, contributionDate(sort: Desc)], name: "idx_contributions_goal_date")
  @@index([userId, createdAt(sort: Desc)], name: "idx_contributions_user_created")
  @@map("goal_contributions")
}

/// Registro inmutable de eventos del sistema para auditoría.
/// Tabla append-only: nunca se actualiza ni elimina.
model AuditLog {
  id         String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String?     @map("user_id") @db.Uuid
  action     AuditAction
  entityType String?     @map("entity_type") @db.VarChar(100)
  entityId   String?     @map("entity_id") @db.Uuid
  ipAddress  String?     @map("ip_address") @db.VarChar(45)
  userAgent  String?     @map("user_agent") @db.VarChar(500)
  metadata   Json?       @default("{}") @db.JsonB
  createdAt  DateTime    @default(now()) @map("created_at") @db.Timestamptz

  // Relaciones
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)], name: "idx_audit_logs_user_date")
  @@index([action, createdAt(sort: Desc)], name: "idx_audit_logs_action_date")
  @@index([entityType, entityId], name: "idx_audit_logs_entity")
  @@map("audit_logs")
}
```

---

## 8. SQL PostgreSQL

### 8.1 Extensiones Requeridas

```sql
-- Habilitar generación de UUID v4 nativa en PostgreSQL 13+
-- gen_random_uuid() está disponible en pgcrypto o nativo en PG 13+
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 8.2 Tipos Enum

```sql
-- ============================================================
-- TIPOS ENUM
-- ============================================================

CREATE TYPE movement_type AS ENUM (
  'INCOME',
  'EXPENSE'
);

CREATE TYPE movement_source AS ENUM (
  'AI_PARSED',
  'MANUAL'
);

CREATE TYPE category_type AS ENUM (
  'INCOME',
  'EXPENSE'
);

CREATE TYPE goal_status AS ENUM (
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED',
  'CANCELLED'
);

CREATE TYPE audit_action AS ENUM (
  'USER_REGISTERED',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT',
  'LOGOUT_ALL',
  'TOKEN_REFRESHED',
  'TOKEN_REVOKED',
  'PROFILE_UPDATED',
  'PASSWORD_CHANGED',
  'MOVEMENT_CREATED',
  'MOVEMENT_UPDATED',
  'MOVEMENT_DELETED',
  'GOAL_CREATED',
  'GOAL_UPDATED',
  'GOAL_DELETED',
  'GOAL_COMPLETED',
  'GOAL_ARCHIVED',
  'GOAL_CONTRIBUTION_ADDED',
  'GOAL_CONTRIBUTION_DELETED',
  'AI_PARSING_FAILED',
  'SYSTEM_ERROR'
);
```

### 8.3 Creación de Tablas

```sql
-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE users (
  id            UUID          NOT NULL DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_pkey
    PRIMARY KEY (id),

  CONSTRAINT users_email_key
    UNIQUE (email),

  CONSTRAINT users_name_check
    CHECK (LENGTH(TRIM(name)) > 0),

  CONSTRAINT users_email_format
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

COMMENT ON TABLE  users              IS 'Usuarios registrados en el sistema. Entidad raíz.';
COMMENT ON COLUMN users.id           IS 'Identificador único UUID v4.';
COMMENT ON COLUMN users.email        IS 'Correo electrónico único. Normalizado a minúsculas en aplicación.';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt (costo ≥ 12). Nunca la contraseña en texto plano.';
COMMENT ON COLUMN users.is_active    IS 'FALSE = cuenta desactivada. Nunca se elimina físicamente.';


-- ============================================================
-- TABLA: refresh_tokens
-- ============================================================
CREATE TABLE refresh_tokens (
  id           UUID          NOT NULL DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL,
  token_hash   VARCHAR(255)  NOT NULL,
  family       UUID          NOT NULL DEFAULT gen_random_uuid(),
  is_revoked   BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ   NOT NULL,
  device_info  VARCHAR(500)      NULL,
  ip_address   VARCHAR(45)       NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ       NULL,

  CONSTRAINT refresh_tokens_pkey
    PRIMARY KEY (id),

  CONSTRAINT refresh_tokens_token_hash_key
    UNIQUE (token_hash),

  CONSTRAINT refresh_tokens_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

COMMENT ON TABLE  refresh_tokens             IS 'Tokens de renovación de sesión. Soporte para múltiples dispositivos.';
COMMENT ON COLUMN refresh_tokens.token_hash  IS 'SHA-256 del JWT de refresh. Nunca el token en texto plano.';
COMMENT ON COLUMN refresh_tokens.family      IS 'UUID de familia para detección de reutilización de tokens robados.';
COMMENT ON COLUMN refresh_tokens.is_revoked  IS 'TRUE = token invalidado manualmente (logout o revocación de seguridad).';


-- ============================================================
-- TABLA: categories
-- ============================================================
CREATE TABLE categories (
  id          UUID            NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID                NULL,
  name        VARCHAR(100)    NOT NULL,
  description VARCHAR(255)        NULL,
  icon        VARCHAR(100)        NULL,
  color       CHAR(7)             NULL DEFAULT '#6B7280',
  type        category_type   NOT NULL,
  is_system   BOOLEAN         NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT categories_pkey
    PRIMARY KEY (id),

  CONSTRAINT categories_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT categories_system_consistency_check
    CHECK (
      (is_system = TRUE  AND user_id IS NULL) OR
      (is_system = FALSE AND user_id IS NOT NULL)
    ),

  CONSTRAINT categories_color_check
    CHECK (color IS NULL OR color ~* '^#[0-9A-Fa-f]{6}$'),

  CONSTRAINT categories_name_user_unique
    UNIQUE (user_id, name, type)
);

COMMENT ON TABLE  categories          IS 'Categorías financieras. Sistema (user_id NULL) y personalizadas (user_id NOT NULL).';
COMMENT ON COLUMN categories.is_system IS 'TRUE = categoría predefinida compartida. FALSE = categoría del usuario.';
COMMENT ON COLUMN categories.color    IS 'Hexadecimal #RRGGBB para representación visual en dashboard.';


-- ============================================================
-- TABLA: movements
-- ============================================================
CREATE TABLE movements (
  id            UUID             NOT NULL DEFAULT gen_random_uuid(),
  user_id       UUID             NOT NULL,
  category_id   UUID             NOT NULL,
  type          movement_type    NOT NULL,
  amount        NUMERIC(12, 2)   NOT NULL,
  description   VARCHAR(500)     NOT NULL,
  original_text TEXT                 NULL,
  movement_date DATE             NOT NULL DEFAULT CURRENT_DATE,
  source        movement_source  NOT NULL DEFAULT 'MANUAL',
  notes         TEXT                 NULL,
  is_confirmed  BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ          NULL,

  CONSTRAINT movements_pkey
    PRIMARY KEY (id),

  CONSTRAINT movements_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT movements_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES categories (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT movements_amount_positive
    CHECK (amount > 0),

  CONSTRAINT movements_date_not_future
    CHECK (movement_date <= CURRENT_DATE + INTERVAL '1 day')
);

COMMENT ON TABLE  movements              IS 'Movimientos financieros (ingresos y gastos). Entidad transaccional central.';
COMMENT ON COLUMN movements.amount       IS 'NUMERIC(12,2) para exactitud financiera. Siempre positivo; el tipo determina ingreso/gasto.';
COMMENT ON COLUMN movements.original_text IS 'Texto en lenguaje natural original del usuario. Preservado para trazabilidad.';
COMMENT ON COLUMN movements.deleted_at   IS 'Soft delete. NULL = activo. Toda query de usuario debe filtrar WHERE deleted_at IS NULL.';


-- ============================================================
-- TABLA: ai_parsing_logs
-- ============================================================
CREATE TABLE ai_parsing_logs (
  id                 UUID             NOT NULL DEFAULT gen_random_uuid(),
  movement_id        UUID             NOT NULL,
  input_text         TEXT             NOT NULL,
  prompt_sent        TEXT             NOT NULL,
  raw_response       JSONB                NULL,
  parsed_amount      NUMERIC(12, 2)       NULL,
  parsed_description VARCHAR(500)         NULL,
  parsed_category    VARCHAR(100)         NULL,
  parsed_type        movement_type        NULL,
  confidence_score   NUMERIC(3, 2)        NULL,
  was_successful     BOOLEAN          NOT NULL DEFAULT FALSE,
  error_message      TEXT                 NULL,
  model_used         VARCHAR(100)     NOT NULL DEFAULT 'gemini-2.0-flash',
  response_time_ms   INTEGER              NULL,
  created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT ai_parsing_logs_pkey
    PRIMARY KEY (id),

  CONSTRAINT ai_parsing_logs_movement_id_key
    UNIQUE (movement_id),

  CONSTRAINT ai_parsing_logs_movement_id_fkey
    FOREIGN KEY (movement_id)
    REFERENCES movements (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT ai_parsing_logs_confidence_range
    CHECK (
      confidence_score IS NULL OR
      (confidence_score >= 0.00 AND confidence_score <= 1.00)
    ),

  CONSTRAINT ai_parsing_logs_response_time_positive
    CHECK (response_time_ms IS NULL OR response_time_ms >= 0)
);

COMMENT ON TABLE  ai_parsing_logs               IS 'Logs de procesamiento NLP con Gemini API. Uno por movimiento. Inmutable.';
COMMENT ON COLUMN ai_parsing_logs.raw_response  IS 'Respuesta JSON completa de la API. JSONB para indexación y consultas.';
COMMENT ON COLUMN ai_parsing_logs.confidence_score IS 'Score 0.00-1.00 de confianza del parseo de IA.';
COMMENT ON COLUMN ai_parsing_logs.model_used    IS 'Versión del modelo Gemini utilizado. Permite comparar versiones.';


-- ============================================================
-- TABLA: saving_goals
-- ============================================================
CREATE TABLE saving_goals (
  id             UUID           NOT NULL DEFAULT gen_random_uuid(),
  user_id        UUID           NOT NULL,
  name           VARCHAR(200)   NOT NULL,
  description    TEXT               NULL,
  target_amount  NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status         goal_status    NOT NULL DEFAULT 'ACTIVE',
  target_date    DATE               NULL,
  icon           VARCHAR(100)       NULL,
  color          CHAR(7)            NULL DEFAULT '#3B82F6',
  completed_at   TIMESTAMPTZ        NULL,
  archived_at    TIMESTAMPTZ        NULL,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ        NULL,

  CONSTRAINT saving_goals_pkey
    PRIMARY KEY (id),

  CONSTRAINT saving_goals_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT saving_goals_target_amount_positive
    CHECK (target_amount > 0),

  CONSTRAINT saving_goals_current_amount_non_negative
    CHECK (current_amount >= 0),

  CONSTRAINT saving_goals_amounts_consistency
    CHECK (current_amount <= target_amount * 1.01),

  CONSTRAINT saving_goals_color_check
    CHECK (color IS NULL OR color ~* '^#[0-9A-Fa-f]{6}$'),

  CONSTRAINT saving_goals_completed_consistency
    CHECK (
      (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
      (status != 'COMPLETED' AND completed_at IS NULL)
    )
);

COMMENT ON TABLE  saving_goals               IS 'Metas de ahorro. Ciclo: ACTIVE → COMPLETED → ARCHIVED / CANCELLED.';
COMMENT ON COLUMN saving_goals.current_amount IS 'Denormalizado para rendimiento. Actualizado atómicamente en cada aporte (RI-001).';
COMMENT ON COLUMN saving_goals.completed_at  IS 'Poblado automáticamente cuando current_amount >= target_amount.';


-- ============================================================
-- TABLA: goal_contributions
-- ============================================================
CREATE TABLE goal_contributions (
  id                UUID           NOT NULL DEFAULT gen_random_uuid(),
  goal_id           UUID           NOT NULL,
  user_id           UUID           NOT NULL,
  amount            NUMERIC(12, 2) NOT NULL,
  notes             VARCHAR(500)       NULL,
  contribution_date DATE           NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ        NULL,

  CONSTRAINT goal_contributions_pkey
    PRIMARY KEY (id),

  CONSTRAINT goal_contributions_goal_id_fkey
    FOREIGN KEY (goal_id)
    REFERENCES saving_goals (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT goal_contributions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT goal_contributions_amount_positive
    CHECK (amount > 0)
);

COMMENT ON TABLE  goal_contributions         IS 'Aportes monetarios hacia metas de ahorro. Soft delete para trazabilidad.';
COMMENT ON COLUMN goal_contributions.user_id IS 'Redundante con goal.user_id. Facilita consultas de auditoría sin JOIN.';


-- ============================================================
-- TABLA: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id          UUID          NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID              NULL,
  action      audit_action  NOT NULL,
  entity_type VARCHAR(100)      NULL,
  entity_id   UUID              NULL,
  ip_address  VARCHAR(45)       NULL,
  user_agent  VARCHAR(500)      NULL,
  metadata    JSONB             NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT audit_logs_pkey
    PRIMARY KEY (id),

  CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

COMMENT ON TABLE  audit_logs          IS 'Registro inmutable de eventos del sistema. Append-only. Nunca actualizar ni eliminar.';
COMMENT ON COLUMN audit_logs.entity_id IS 'Sin FK explícita: el log sobrevive a la eliminación de la entidad referenciada.';
COMMENT ON COLUMN audit_logs.metadata  IS 'JSONB con contexto del evento: campos modificados, errores, contexto de sesión.';
```

### 8.4 Creación de Índices

```sql
-- ============================================================
-- ÍNDICES — users
-- ============================================================
CREATE INDEX idx_users_email
  ON users (email);

CREATE INDEX idx_users_is_active
  ON users (id)
  WHERE is_active = TRUE;


-- ============================================================
-- ÍNDICES — refresh_tokens
-- ============================================================
CREATE INDEX idx_refresh_tokens_user_id
  ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_user_active
  ON refresh_tokens (user_id, expires_at)
  WHERE is_revoked = FALSE;

CREATE INDEX idx_refresh_tokens_expires_at
  ON refresh_tokens (expires_at);


-- ============================================================
-- ÍNDICES — categories
-- ============================================================
CREATE INDEX idx_categories_user_id
  ON categories (user_id);

CREATE INDEX idx_categories_system
  ON categories (type, is_active)
  WHERE is_system = TRUE;

CREATE INDEX idx_categories_user_type
  ON categories (user_id, type)
  WHERE is_active = TRUE;


-- ============================================================
-- ÍNDICES — movements
-- ============================================================
CREATE INDEX idx_movements_user_active
  ON movements (user_id, movement_date DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_movements_user_type
  ON movements (user_id, type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_movements_user_category
  ON movements (user_id, category_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_movements_user_date_range
  ON movements (user_id, movement_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_movements_deleted_at
  ON movements (user_id)
  WHERE deleted_at IS NOT NULL;


-- ============================================================
-- ÍNDICES — ai_parsing_logs
-- ============================================================
CREATE INDEX idx_ai_logs_was_successful
  ON ai_parsing_logs (was_successful, created_at DESC);

CREATE INDEX idx_ai_logs_created_at
  ON ai_parsing_logs (created_at DESC);


-- ============================================================
-- ÍNDICES — saving_goals
-- ============================================================
CREATE INDEX idx_saving_goals_user_active
  ON saving_goals (user_id, created_at DESC)
  WHERE deleted_at IS NULL AND status = 'ACTIVE';

CREATE INDEX idx_saving_goals_user_status
  ON saving_goals (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_saving_goals_target_date
  ON saving_goals (target_date)
  WHERE status = 'ACTIVE' AND target_date IS NOT NULL;


-- ============================================================
-- ÍNDICES — goal_contributions
-- ============================================================
CREATE INDEX idx_goal_contributions_goal_active
  ON goal_contributions (goal_id, contribution_date DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_goal_contributions_user
  ON goal_contributions (user_id, created_at DESC)
  WHERE deleted_at IS NULL;


-- ============================================================
-- ÍNDICES — audit_logs
-- ============================================================
CREATE INDEX idx_audit_logs_user_id
  ON audit_logs (user_id, created_at DESC);

CREATE INDEX idx_audit_logs_action
  ON audit_logs (action, created_at DESC);

CREATE INDEX idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id);

-- BRIN para datos temporales secuenciales (muy eficiente en append-only)
CREATE INDEX idx_audit_logs_created_at_brin
  ON audit_logs USING BRIN (created_at);

-- GIN para búsqueda dentro de JSONB
CREATE INDEX idx_audit_logs_metadata_gin
  ON audit_logs USING GIN (metadata);
```

### 8.5 Trigger: Actualización Automática de `updated_at`

```sql
-- ============================================================
-- FUNCIÓN Y TRIGGERS: auto-update de updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas que tienen updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_movements_updated_at
  BEFORE UPDATE ON movements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_saving_goals_updated_at
  BEFORE UPDATE ON saving_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_goal_contributions_updated_at
  BEFORE UPDATE ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 8.6 Datos Semilla: Categorías del Sistema

```sql
-- ============================================================
-- SEED: Categorías del sistema (is_system = TRUE, user_id = NULL)
-- ============================================================

INSERT INTO categories (name, description, icon, color, type, is_system) VALUES

-- Categorías de GASTO
('Alimentación',    'Restaurantes, mercados, supermercados y comida en general', '🍽️',  '#EF4444', 'EXPENSE', TRUE),
('Transporte',      'Taxi, bus, combustible, transporte público y privado',      '🚌',  '#F97316', 'EXPENSE', TRUE),
('Salud',           'Medicamentos, consultas médicas, laboratorios y farmacia',  '🏥',  '#EC4899', 'EXPENSE', TRUE),
('Educación',       'Cursos, libros, matrículas, materiales educativos',         '📚',  '#8B5CF6', 'EXPENSE', TRUE),
('Entretenimiento', 'Cine, streaming, eventos, hobbies y actividades recreativas','🎬', '#06B6D4', 'EXPENSE', TRUE),
('Servicios',       'Luz, agua, internet, telefonía e internet del hogar',       '💡',  '#84CC16', 'EXPENSE', TRUE),
('Vestimenta',      'Ropa, calzado y accesorios personales',                     '👕',  '#F59E0B', 'EXPENSE', TRUE),
('Hogar',           'Alquiler, mobiliario, artículos del hogar y mantenimiento', '🏠',  '#78716C', 'EXPENSE', TRUE),
('Ahorro',          'Depósitos en cuentas de ahorro y fondos de emergencia',     '🏦',  '#10B981', 'EXPENSE', TRUE),
('Otros gastos',    'Gastos varios no clasificados en otras categorías',         '📦',  '#6B7280', 'EXPENSE', TRUE),

-- Categorías de INGRESO
('Sueldo',          'Salario mensual o quincenal del empleo principal',          '💼',  '#10B981', 'INCOME',  TRUE),
('Freelance',       'Ingresos por trabajos independientes o por proyecto',       '💻',  '#3B82F6', 'INCOME',  TRUE),
('Negocio',         'Ganancias de negocio propio o emprendimiento',              '🏪',  '#6366F1', 'INCOME',  TRUE),
('Inversiones',     'Dividendos, intereses, retornos de inversión',              '📈',  '#F59E0B', 'INCOME',  TRUE),
('Transferencias',  'Transferencias recibidas de familiares o amigos',           '💸',  '#06B6D4', 'INCOME',  TRUE),
('Otros ingresos',  'Ingresos varios no clasificados en otras categorías',       '📥',  '#6B7280', 'INCOME',  TRUE);
```

---

## 9. Explicación Arquitectónica

### 9.1 Por Qué Esta Arquitectura es Escalable

La arquitectura de datos de Quipu fue diseñada con tres horizontes temporales en mente: el presente (v1.0), el corto plazo (v1.x) y el largo plazo (v2.0+).

**Separación de concerns a nivel de tabla:**
Cada tabla tiene una responsabilidad única y bien definida. `movements` contiene exclusivamente datos transaccionales. `ai_parsing_logs` es un log de diagnóstico completamente separado. `audit_logs` es inmutable y append-only. Esta separación permite en el futuro mover cada tabla a un sistema de almacenamiento especializado (p.ej., `audit_logs` a una base de datos de series de tiempo como TimescaleDB) sin alterar el core transaccional.

**UUID como clave primaria:**
El uso de UUID v4 en lugar de `SERIAL` (enteros auto-incrementales) tiene implicaciones de escalabilidad importantes:
- Los UUID son globalmente únicos, lo que permite la creación de registros en el cliente o en múltiples instancias de backend sin coordinación centralizada.
- No revelan el volumen de datos (un ID de tipo `INT = 1547` revela que hay ~1547 usuarios; un UUID no revela nada).
- Son necesarios para arquitecturas futuras de bases de datos distribuidas o sharding.

**Campos de auditoría estándar:**
Todas las tablas mutan tienen `created_at` y `updated_at`. Las tablas transaccionales tienen adicionalmente `deleted_at` para soft delete. Esta uniformidad garantiza que cualquier módulo de análisis, auditoría o exportación de datos pueda operar sobre todas las entidades con el mismo patrón.

**Denormalización controlada de `current_amount`:**
El campo `saving_goals.current_amount` es deliberadamente denormalizado. En lugar de calcularlo como `SUM(goal_contributions.amount)` en cada consulta del dashboard, se mantiene actualizado atómicamente en cada transacción de aporte. Este es un patrón estándar en sistemas financieros donde el rendimiento de lectura es crítico y la escritura puede asumir el costo adicional de mantener el valor.

**Categorías del sistema vs. personalizadas:**
El diseño de la tabla `categories` con `user_id NULL` para categorías del sistema es una decisión arquitectónica que evita duplicar 16 filas de categorías por cada usuario registrado. En un sistema con 10,000 usuarios, esto representa 160,000 filas evitadas. El constraint `CHECK` garantiza consistencia entre `is_system` y `user_id`.

### 9.2 Cómo Evita Inconsistencias

**Primera línea: Constraints de PostgreSQL.**
Los constraints `CHECK`, `NOT NULL`, `UNIQUE` y `FOREIGN KEY` actúan como la última barrera de defensa. Incluso si la aplicación tiene un bug, PostgreSQL rechazará cualquier dato que viole las invariantes del dominio. Esto es especialmente crítico en un sistema financiero donde un monto negativo o una FK inválida podría causar inconsistencias graves.

**Segunda línea: Transacciones atómicas.**
Las operaciones multi-tabla (registro de movimiento + log de IA, aporte a meta + actualización de `current_amount`) se ejecutan dentro de `prisma.$transaction()`. Si cualquier paso de la transacción falla, PostgreSQL revierte automáticamente todos los cambios previos, garantizando que nunca existan estados parcialmente completados en la base de datos.

**Tercera línea: Soft delete en vez de DELETE.**
Al usar soft delete en `movements`, `saving_goals` y `goal_contributions`, se evita la posibilidad de eliminar datos financieros accidentalmente. Un bug en la aplicación que genere un `DELETE` incorrecto solo establecerá `deleted_at`, y el dato puede recuperarse trivialmente. La recuperación de un `DELETE` físico requeriría un restore del backup.

**Cuarta línea: `RESTRICT` en la FK `movements.category_id`.**
Esta es una decisión deliberada: si un usuario intenta eliminar una categoría que tiene movimientos asociados, PostgreSQL rechazará la operación con un error. Esto fuerza al desarrollador/usuario a reasignar los movimientos antes de eliminar la categoría, garantizando que nunca existan movimientos sin categoría válida.

### 9.3 Cómo Soporta Crecimiento Futuro

**Particionamiento de `movements`:**
Cuando el volumen de movimientos crezca (millones de filas), la tabla `movements` puede particionarse por rango de `movement_date` usando `PARTITION BY RANGE (movement_date)`. Las queries del dashboard ya filtran por rango de fechas, lo que haría el particionamiento transparente para la aplicación.

```sql
-- Ejemplo futuro de particionamiento
CREATE TABLE movements_2024 PARTITION OF movements
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**Particionamiento de `audit_logs`:**
Los logs de auditoría crecen indefinidamente. La tabla puede particionarse por mes o año, y las particiones antiguas pueden moverse a tablespaces de almacenamiento más económico o archivarse en sistemas de log externos.

**Migración de `ai_parsing_logs` a almacenamiento analítico:**
A medida que el volumen de logs de IA crezca, esta tabla puede migrarse a un sistema OLAP (columnar) sin afectar la aplicación principal. La FK con `ON DELETE CASCADE` garantiza que la tabla de `movements` no dependa de los logs para su operación.

**Multi-tenancy futuro:**
El diseño con `user_id` en todas las tablas transaccionales facilita una eventual arquitectura multi-tenant con Row-Level Security (RLS) de PostgreSQL:

```sql
-- Ejemplo futuro de Row-Level Security
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY movements_user_isolation ON movements
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 9.4 Cómo Protege Datos Financieros

**Hash de contraseñas:**
El campo `password_hash` almacena exclusivamente el hash bcrypt de la contraseña. Ningún campo de la base de datos almacena contraseñas en texto plano. Un atacante que obtenga acceso de lectura a la base de datos no puede obtener las contraseñas originales.

**Hash de tokens:**
De forma análoga, `refresh_tokens.token_hash` almacena el SHA-256 del token JWT, nunca el token en texto plano. Si la base de datos es comprometida, los atacantes no pueden usar los hashes para autenticarse (SHA-256 de un UUID aleatorio es computacionalmente inviable de revertir).

**Trazabilidad de IPs:**
Los campos `ip_address` en `refresh_tokens` y `audit_logs` permiten detectar accesos desde ubicaciones geográficas inusuales y correlacionar eventos de seguridad con dirección IP.

**Datos financieros `NUMERIC` vs. `FLOAT`:**
Usar `NUMERIC(12,2)` en lugar de `FLOAT` o `DOUBLE PRECISION` garantiza que `100.00 + 200.50 = 300.50` y no `300.4999999999998` (error de punto flotante). En sistemas financieros, cualquier error de redondeo, aunque sea de un centavo, es inaceptable.

---

## 10. Buenas Prácticas Aplicadas

### 10.1 Auditoría

| Práctica | Implementación en Quipu |
|----------|------------------------|
| Registro de autenticación | Cada login exitoso y fallido genera un registro en `audit_logs` con IP y user-agent. |
| Trazabilidad de modificaciones | Toda modificación a `movements` y `saving_goals` genera un registro `MOVEMENT_UPDATED` / `GOAL_UPDATED` en `audit_logs` con los campos modificados en `metadata`. |
| Immutabilidad del log | `audit_logs` no tiene `updated_at` ni `deleted_at`. Los triggers previenen actualizaciones (o la aplicación garantiza que nunca se llame a `prisma.auditLog.update()`). |
| Log de IA | Cada llamada a Gemini API, exitosa o fallida, se registra en `ai_parsing_logs` con el prompt completo, la respuesta y el tiempo de respuesta. |
| Supervivencia al usuario | `audit_logs.user_id` usa `ON DELETE SET NULL`, garantizando que los logs se preserven incluso si el usuario es eliminado. |

### 10.2 Seguridad

| Práctica | Implementación en Quipu |
|----------|------------------------|
| No almacenar secretos en texto plano | `password_hash` (bcrypt), `token_hash` (SHA-256). |
| UUID para IDs | Evita ataques de enumeración (IDOR). Un atacante no puede adivinar `UUID v4`. |
| Constraints de base de datos | Segunda línea de defensa contra datos inválidos tras la validación Zod en aplicación. |
| Soft delete de datos financieros | Imposibilita la eliminación accidental irreversible de movimientos. |
| `ON DELETE RESTRICT` en categorías | Protege contra eliminación de categorías referenciadas. |
| Registro de IPs en tokens y auditoría | Facilita detección de accesos fraudulentos. |
| Familia de tokens | El campo `family` en `refresh_tokens` permite implementar Refresh Token Rotation: si un token de una familia es usado después de ser rotado, toda la familia se invalida (detección de robo). |

### 10.3 Trazabilidad

| Práctica | Implementación en Quipu |
|----------|------------------------|
| `created_at` en todas las tablas | Todo registro tiene timestamp de creación (Prisma lo gestiona automáticamente). |
| `updated_at` en tablas mutables | Prisma gestiona `@updatedAt` automáticamente, con trigger SQL como respaldo. |
| `deleted_at` en tablas financieras | Los movimientos y aportes nunca se eliminan físicamente. |
| `original_text` en movimientos | El texto original del usuario se preserva junto a la descripción procesada por la IA. |
| `model_used` en logs de IA | Permite comparar el comportamiento entre versiones del modelo Gemini. |

### 10.4 Performance

| Práctica | Implementación en Quipu |
|----------|------------------------|
| Índices parciales en soft delete | Los índices solo incluyen filas activas, reduciendo su tamaño y mejorando el rendimiento. |
| Índices compuestos para queries frecuentes | `(user_id, movement_date)`, `(user_id, type)`, `(user_id, category_id)` cubren las consultas del dashboard. |
| `NUMERIC(12,2)` exacto | Evita conversiones de tipo y garantiza exactitud en aritmética financiera. |
| BRIN para audit_logs | Índice eficiente para columnas temporales de tablas append-only. Ocupa una fracción del espacio de un índice BTREE. |
| GIN para JSONB | Permite búsquedas eficientes dentro de campos JSON sin escanear todas las filas. |
| `current_amount` denormalizado | Evita `SUM()` costosos en cada consulta del dashboard de metas. |
| UUID generado en PostgreSQL | `gen_random_uuid()` es más eficiente que generar UUID en Node.js y pasarlo en el query. |

### 10.5 Mantenibilidad

| Práctica | Implementación en Quipu |
|----------|------------------------|
| Enums para tipos fijos | `movement_type`, `goal_status`, `audit_action` usan enums PostgreSQL + Prisma. Añadir un nuevo valor requiere una migración explícita (intencional). |
| Nombres de columnas en snake_case con `@map` en Prisma | El código TypeScript usa camelCase; la base de datos usa snake_case. Prisma traduce automáticamente. |
| `COMMENT ON TABLE/COLUMN` | Cada tabla y columna crítica tiene comentario SQL documentando su propósito. |
| Categorías del sistema en seed | Las categorías del sistema son datos de referencia gestionados en la seed de Prisma, no hardcoded en la aplicación. |
| Schema Prisma como fuente de verdad | El `schema.prisma` es el único lugar donde se define el modelo de datos. Las migraciones SQL se generan automáticamente. |
| Migraciones versionadas | Prisma Migrate genera archivos SQL numerados y auditables en `prisma/migrations/`. |

---

## Resumen del Modelo de Datos

| Tabla | Filas estimadas (1,000 usuarios) | Tipo | Soft Delete |
|-------|----------------------------------|------|-------------|
| `users` | ~1,000 | Maestro | `is_active` |
| `refresh_tokens` | ~3,000 (3 dispositivos/usuario) | Sesiones | `is_revoked` |
| `categories` | ~16 sistema + ~5,000 personalizadas | Catálogo | `is_active` |
| `movements` | ~300,000 (25/usuario/mes × 12 meses) | Transaccional | `deleted_at` |
| `ai_parsing_logs` | ~250,000 (80% de movimientos via IA) | Log | — (inmutable) |
| `saving_goals` | ~5,000 (5 metas/usuario) | Maestro | `deleted_at` |
| `goal_contributions` | ~30,000 (6 aportes/meta) | Transaccional | `deleted_at` |
| `audit_logs` | ~1,500,000 (10 eventos/usuario/mes) | Auditoría | — (append-only) |

> **Total estimado:** ~2,084,016 filas para 1,000 usuarios activos durante 1 año. La arquitectura de índices parciales y compuestos está diseñada para mantener tiempos de respuesta por debajo de 200ms (RP-001) en este volumen de datos.

---

*Fin del Documento de Diseño de Base de Datos — Quipu v1.0.0*
