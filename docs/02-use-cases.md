# Documento de Casos de Uso
## Quipu — Aplicación Web de Finanzas Personales con IA

| Campo | Detalle |
|-------|---------|
| **Versión** | 1.0.0 |
| **Estado** | En revisión |
| **Fecha** | Mayo 2026 |
| **Metodología** | SDD (Software Design Document) |

### Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0.0 | Mayo 2026 | Versión inicial del documento |

---

## Tabla de Contenidos

1. [Actores del Sistema](#1-actores-del-sistema)
2. [Diagrama de Actores](#2-diagrama-de-actores)
3. [Tabla Resumen de Casos de Uso](#3-tabla-resumen-de-casos-de-uso)
4. [Especificaciones Detalladas](#4-especificaciones-detalladas)
   - [CU-001 — Registrar Usuario](#cu-001--registrar-usuario)
   - [CU-002 — Iniciar Sesión](#cu-002--iniciar-sesión)
   - [CU-003 — Renovar Token de Acceso](#cu-003--renovar-token-de-acceso)
   - [CU-004 — Cerrar Sesión](#cu-004--cerrar-sesión)
   - [CU-005 — Ver Perfil](#cu-005--ver-perfil)
   - [CU-006 — Editar Perfil](#cu-006--editar-perfil)
   - [CU-007 — Cambiar Contraseña](#cu-007--cambiar-contraseña)
   - [CU-008 — Registrar Movimiento con Lenguaje Natural](#cu-008--registrar-movimiento-con-lenguaje-natural)
   - [CU-009 — Consultar Catálogo de Categorías](#cu-009--consultar-catálogo-de-categorías)
   - [CU-010 — Ver Detalle de Movimiento](#cu-010--ver-detalle-de-movimiento)
   - [CU-011 — Editar Movimiento](#cu-011--editar-movimiento)
   - [CU-012 — Eliminar Movimiento](#cu-012--eliminar-movimiento)
   - [CU-013 — Ver Historial de Movimientos](#cu-013--ver-historial-de-movimientos)
   - [CU-014 — Ver Dashboard Principal](#cu-014--ver-dashboard-principal)
   - [CU-015 — Crear Meta de Ahorro](#cu-015--crear-meta-de-ahorro)
   - [CU-016 — Ver Progreso de Meta](#cu-016--ver-progreso-de-meta)
   - [CU-017 — Agregar Aporte a Meta](#cu-017--agregar-aporte-a-meta)
   - [CU-018 — Editar Meta de Ahorro](#cu-018--editar-meta-de-ahorro)
   - [CU-019 — Eliminar Meta de Ahorro](#cu-019--eliminar-meta-de-ahorro)
   - [CU-020 — Archivar Meta Completada](#cu-020--archivar-meta-completada)
   - [CU-021 — Ver Resumen de Metas en Dashboard](#cu-021--ver-resumen-de-metas-en-dashboard)
   - [CU-022 — Cerrar Sesión en Todos los Dispositivos](#cu-022--cerrar-sesión-en-todos-los-dispositivos)

---

## 1. Actores del Sistema

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Usuario Anónimo** | Primario | Persona sin autenticación. Solo puede acceder a las rutas públicas: `/login` y `/register`. |
| **Usuario Registrado** | Primario | Persona autenticada con acceso completo a todas las funcionalidades del sistema. |
| **Sistema IA** | Secundario | Modelo `gemini-2.0-flash` de Google. Procesa texto en lenguaje natural y retorna datos financieros estructurados en JSON. |
| **Sistema** | Interno | Backend de Quipu (Node.js + Express + TypeScript). Orquesta todas las operaciones, aplica reglas de negocio y gestiona la persistencia. |

---

## 2. Diagrama de Actores

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SISTEMA QUIPU                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MÓDULO AUTENTICACIÓN                      │   │
│  │  CU-001 Registrar  CU-002 Login  CU-003 Refresh  CU-004 Logout │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      MÓDULO PERFIL                           │   │
│  │       CU-005 Ver Perfil   CU-006 Editar   CU-007 Contraseña │   │
│  │                         CU-022 Cerrar Todas las Sesiones    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   MÓDULO MOVIMIENTOS                         │   │
│  │   CU-008 Registrar(NLP)  CU-009 Catálogo  CU-010 Ver Detalle│   │
│  │   CU-011 Editar  CU-012 Eliminar  CU-013 Historial          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     MÓDULO DASHBOARD                         │   │
│  │              CU-014 Dashboard  CU-021 Resumen Metas          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   MÓDULO METAS DE AHORRO                     │   │
│  │  CU-015 Crear  CU-016 Ver Progreso  CU-017 Agregar Aporte   │   │
│  │  CU-018 Editar  CU-019 Eliminar  CU-020 Archivar            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Actores externos:
  [Usuario Anónimo] ──────► CU-001, CU-002
  [Usuario Registrado] ───► CU-003 al CU-022
  [Sistema IA] ───────────► CU-008 (actor secundario invocado por el Sistema)
```

---

## 3. Tabla Resumen de Casos de Uso

| N° CU | Nombre | Módulo | Actores | RF Relacionado | Prioridad |
|-------|--------|--------|---------|----------------|-----------|
| CU-001 | Registrar Usuario | Autenticación | Usuario Anónimo, Sistema | RF-001 | ALTA |
| CU-002 | Iniciar Sesión | Autenticación | Usuario Anónimo, Sistema | RF-002 | ALTA |
| CU-003 | Renovar Token de Acceso | Autenticación | Usuario Registrado, Sistema | RF-003 | ALTA |
| CU-004 | Cerrar Sesión | Autenticación | Usuario Registrado, Sistema | RF-004 | ALTA |
| CU-005 | Ver Perfil | Perfil | Usuario Registrado, Sistema | RF-005 | MEDIA |
| CU-006 | Editar Perfil | Perfil | Usuario Registrado, Sistema | RF-006 | MEDIA |
| CU-007 | Cambiar Contraseña | Perfil | Usuario Registrado, Sistema | RF-007 | MEDIA |
| CU-008 | Registrar Movimiento con Lenguaje Natural | Movimientos | Usuario Registrado, Sistema IA, Sistema | RF-008 | ALTA |
| CU-009 | Consultar Catálogo de Categorías | Movimientos | Usuario Registrado, Sistema | RF-009 | ALTA |
| CU-010 | Ver Detalle de Movimiento | Movimientos | Usuario Registrado, Sistema | RF-010 | MEDIA |
| CU-011 | Editar Movimiento | Movimientos | Usuario Registrado, Sistema | RF-011 | MEDIA |
| CU-012 | Eliminar Movimiento | Movimientos | Usuario Registrado, Sistema | RF-012 | MEDIA |
| CU-013 | Ver Historial de Movimientos | Movimientos | Usuario Registrado, Sistema | RF-013 | ALTA |
| CU-014 | Ver Dashboard Principal | Dashboard | Usuario Registrado, Sistema | RF-014 | ALTA |
| CU-015 | Crear Meta de Ahorro | Metas | Usuario Registrado, Sistema | RF-015 | MEDIA |
| CU-016 | Ver Progreso de Meta | Metas | Usuario Registrado, Sistema | RF-016 | MEDIA |
| CU-017 | Agregar Aporte a Meta | Metas | Usuario Registrado, Sistema | RF-017 | MEDIA |
| CU-018 | Editar Meta de Ahorro | Metas | Usuario Registrado, Sistema | RF-018 | BAJA |
| CU-019 | Eliminar Meta de Ahorro | Metas | Usuario Registrado, Sistema | RF-019 | BAJA |
| CU-020 | Archivar Meta Completada | Metas | Usuario Registrado, Sistema | RF-020 | BAJA |
| CU-021 | Ver Resumen de Metas en Dashboard | Dashboard | Usuario Registrado, Sistema | RF-021 | MEDIA |
| CU-022 | Cerrar Sesión en Todos los Dispositivos | Perfil | Usuario Registrado, Sistema | RF-022 | MEDIA |

---

## 4. Especificaciones Detalladas

---

### CU-001 — Registrar Usuario

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-001 |
| **Nombre** | Registrar Usuario |
| **RF Relacionado** | RF-001 |
| **Módulo** | Autenticación |
| **Prioridad** | ALTA |
| **Actores** | Usuario Anónimo (iniciador), Sistema |

**Descripción:**
El usuario anónimo crea una cuenta nueva en el sistema proporcionando sus datos personales. El sistema valida los datos, verifica la unicidad del correo y persiste el registro con la contraseña hasheada.

**Precondiciones:**
- El usuario no tiene una sesión activa.
- El correo electrónico no está registrado previamente en el sistema.
- El servicio de base de datos está operativo.

**Postcondiciones:**
- Se crea un nuevo registro de usuario en la base de datos con contraseña hasheada (bcrypt, mínimo 12 rondas).
- El sistema emite un access token JWT (15 min) y un refresh token (7 días).
- El usuario queda autenticado y es redirigido al dashboard.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Anónimo | Accede a la ruta `/register` |
| 2 | Sistema | Renderiza el formulario de registro |
| 3 | Usuario Anónimo | Completa nombre completo, correo, contraseña y confirmación de contraseña |
| 4 | Usuario Anónimo | Envía el formulario |
| 5 | Sistema | Valida que todos los campos estén presentes y con formato correcto |
| 6 | Sistema | Verifica que el correo no esté registrado (`SELECT` por correo) |
| 7 | Sistema | Genera hash bcrypt de la contraseña con salt de 12 rondas |
| 8 | Sistema | Persiste el nuevo usuario en la base de datos |
| 9 | Sistema | Genera access token JWT y refresh token; almacena el refresh token hasheado |
| 10 | Sistema | Retorna HTTP 201 con los tokens y redirige al dashboard |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-001-A | El correo ya está registrado (paso 6) | Retorna HTTP 409 con código `EMAIL_ALREADY_EXISTS`. El flujo termina. |
| FA-001-B | La contraseña no cumple los criterios de seguridad (paso 5) | Retorna HTTP 422 con código `WEAK_PASSWORD` indicando el criterio fallido. El flujo termina. |
| FA-001-C | La confirmación de contraseña no coincide (paso 5) | Retorna HTTP 422 con código `PASSWORD_MISMATCH`. El flujo termina. |
| FA-001-D | La base de datos no está disponible (paso 8) | Retorna HTTP 503 con código `SERVICE_UNAVAILABLE`. El flujo termina. |

**Flujos de Excepción:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FE-001-A | Error inesperado durante la escritura en BD | Rollback de la transacción. Retorna HTTP 500. Registra el error en logs. |

**Reglas de Negocio:**
- Un correo electrónico solo puede estar asociado a una única cuenta en el sistema.
- La contraseña nunca se almacena en texto plano bajo ninguna circunstancia.
- El sistema no debe revelar si un correo existe en mensajes públicos de error (mitigación de enumeración de usuarios).

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Nombre completo | Requerido. Mínimo 3 caracteres, máximo 100. Solo letras, espacios, guiones y apóstrofes. Sin números. |
| Correo electrónico | Requerido. Formato RFC 5322. Máximo 254 caracteres. |
| Contraseña | Requerida. Mínimo 8 caracteres, máximo 72. Debe incluir mayúscula, minúscula, número y carácter especial. |
| Confirmación | Requerida. Debe ser idéntica al campo contraseña. |

**Entradas:** `{ name: string, email: string, password: string, confirmPassword: string }`

**Salidas (éxito):** `HTTP 201 — { accessToken: string, user: { id, name, email } }` + cookie HttpOnly con refresh token.

---

### CU-002 — Iniciar Sesión

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-002 |
| **Nombre** | Iniciar Sesión |
| **RF Relacionado** | RF-002 |
| **Módulo** | Autenticación |
| **Prioridad** | ALTA |
| **Actores** | Usuario Anónimo (iniciador), Sistema |

**Descripción:**
El usuario registrado autentica su identidad con correo y contraseña. El sistema verifica las credenciales y emite los tokens de sesión necesarios para el acceso a los recursos protegidos.

**Precondiciones:**
- El usuario tiene una cuenta registrada y activa.
- El usuario no tiene una sesión activa con access token válido.

**Postcondiciones:**
- El sistema emite un access token JWT (15 min) y un refresh token (7 días, almacenado hasheado en BD).
- El usuario queda autenticado y es redirigido al dashboard.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Anónimo | Accede a `/login` |
| 2 | Sistema | Renderiza el formulario de inicio de sesión |
| 3 | Usuario Anónimo | Ingresa correo y contraseña |
| 4 | Usuario Anónimo | Envía el formulario |
| 5 | Sistema | Valida presencia y formato básico de los campos |
| 6 | Sistema | Busca al usuario por correo electrónico en la base de datos |
| 7 | Sistema | Compara la contraseña ingresada con el hash bcrypt almacenado |
| 8 | Sistema | Genera access token JWT con expiración de 15 minutos |
| 9 | Sistema | Genera refresh token, lo hashea (SHA-256) y lo almacena en BD con expiración de 7 días |
| 10 | Sistema | Retorna HTTP 200 con el access token en el cuerpo y el refresh token en cookie HttpOnly, Secure, SameSite=Strict |
| 11 | Sistema | Redirige al dashboard |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-002-A | Correo no encontrado o contraseña incorrecta (pasos 6-7) | Retorna HTTP 401 con código `INVALID_CREDENTIALS` sin especificar cuál campo falló. |
| FA-002-B | 5 intentos fallidos en 15 minutos | Bloqueo temporal de 15 minutos. Retorna HTTP 429 con código `ACCOUNT_TEMPORARILY_LOCKED`. |
| FA-002-C | El access token del usuario aún es válido | El sistema redirige directamente al dashboard sin generar nuevos tokens. |

**Flujos de Excepción:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FE-002-A | Error al almacenar el refresh token en BD | Rollback completo del login. Retorna HTTP 503. |

**Reglas de Negocio:**
- El mensaje de error ante credenciales inválidas es siempre genérico: nunca se indica si el correo existe o si la contraseña es incorrecta.
- El refresh token se almacena hasheado (SHA-256) en la base de datos, nunca en texto plano.
- La cookie del refresh token debe tener atributos `HttpOnly`, `Secure` y `SameSite=Strict`.

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Correo | Requerido. Formato RFC 5322. |
| Contraseña | Requerida. Mínimo 1 carácter. |

**Entradas:** `{ email: string, password: string }`

**Salidas (éxito):** `HTTP 200 — { accessToken: string, user: { id, name, email } }` + cookie HttpOnly con refresh token.

---

### CU-003 — Renovar Token de Acceso

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-003 |
| **Nombre** | Renovar Token de Acceso |
| **RF Relacionado** | RF-003 |
| **Módulo** | Autenticación |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador implícito), Sistema |

**Descripción:**
El sistema renueva automáticamente el access token expirado usando el refresh token de la cookie HttpOnly, sin que el usuario tenga que reingresar sus credenciales. Implementa rotación obligatoria del refresh token.

**Precondiciones:**
- El usuario posee un refresh token válido y no revocado en su cookie HttpOnly.
- El access token del usuario ha expirado (respuesta HTTP 401 con `TOKEN_EXPIRED`).

**Postcondiciones:**
- Se emite un nuevo access token (15 min).
- El refresh token anterior queda invalidado en la base de datos (rotación).
- Se emite un nuevo refresh token en la cookie HttpOnly.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Sistema (cliente) | Detecta respuesta HTTP 401 con código `TOKEN_EXPIRED` en una petición protegida |
| 2 | Sistema (cliente) | Realiza petición automática a `POST /api/auth/refresh` |
| 3 | Sistema | Extrae el refresh token de la cookie HttpOnly |
| 4 | Sistema | Busca el refresh token hasheado en la base de datos |
| 5 | Sistema | Verifica que el token no haya sido revocado |
| 6 | Sistema | Verifica que el token no haya expirado (fecha `expiresAt`) |
| 7 | Sistema | Verifica la firma criptográfica del token |
| 8 | Sistema | Genera un nuevo access token con expiración de 15 minutos |
| 9 | Sistema | Invalida el refresh token anterior en BD (rotación) |
| 10 | Sistema | Genera y almacena un nuevo refresh token; lo retorna en la cookie HttpOnly |
| 11 | Sistema (cliente) | Reintenta la petición original con el nuevo access token |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-003-A | Refresh token revocado (paso 5) | Retorna HTTP 401 con `INVALID_REFRESH_TOKEN`. Elimina la cookie. Redirige al login. |
| FA-003-B | Refresh token expirado (paso 6) | Retorna HTTP 401 con `REFRESH_TOKEN_EXPIRED`. Elimina la cookie. Redirige al login. |
| FA-003-C | Cookie de refresh token ausente (paso 3) | Retorna HTTP 401 con `MISSING_REFRESH_TOKEN`. Redirige al login. |

**Reglas de Negocio:**
- La rotación del refresh token es obligatoria: el token anterior siempre se invalida al emitir uno nuevo.
- El sistema mantiene en BD la lista de refresh tokens válidos para verificación.

**Entradas:** Cookie HttpOnly con refresh token (automático, sin acción del usuario).

**Salidas (éxito):** `HTTP 200 — { accessToken: string }` + nueva cookie HttpOnly con refresh token rotado.

---

### CU-004 — Cerrar Sesión

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-004 |
| **Nombre** | Cerrar Sesión |
| **RF Relacionado** | RF-004 |
| **Módulo** | Autenticación |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario cierra su sesión activa. El sistema revoca el refresh token en la base de datos y elimina la cookie HttpOnly del cliente, garantizando que los tokens previos ya no sean utilizables.

**Precondiciones:**
- El usuario tiene una sesión activa con refresh token válido.

**Postcondiciones:**
- El refresh token queda marcado como revocado en la base de datos.
- La cookie HttpOnly es eliminada del cliente.
- El usuario es redirigido a `/login`.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona la opción "Cerrar sesión" en la interfaz |
| 2 | Sistema | Extrae el refresh token de la cookie HttpOnly |
| 3 | Sistema | Busca y revoca el refresh token en la base de datos (`revokedAt = NOW()`) |
| 4 | Sistema | Elimina la cookie HttpOnly del cliente con `Max-Age=0` |
| 5 | Sistema | Retorna HTTP 200 |
| 6 | Sistema | Redirige al usuario a `/login` |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-004-A | Cookie de refresh token ausente | El sistema igual retorna HTTP 200 y redirige al login (idempotente). |

**Reglas de Negocio:**
- El cierre de sesión es idempotente: si no hay cookie activa, la operación se completa sin error.
- El access token sigue siendo técnicamente válido hasta su expiración natural (15 min), pero sin refresh token el usuario no puede renovarlo.

**Entradas:** Cookie HttpOnly con refresh token.

**Salidas (éxito):** `HTTP 200` + eliminación de cookie + redirección a `/login`.

---

### CU-005 — Ver Perfil

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-005 |
| **Nombre** | Ver Perfil |
| **RF Relacionado** | RF-005 |
| **Módulo** | Perfil |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario autenticado visualiza sus datos personales y estadísticas generales de uso (total de movimientos y metas creadas).

**Precondiciones:**
- El usuario está autenticado con un access token válido.

**Postcondiciones:**
- El sistema retorna los datos del perfil del usuario autenticado.
- La contraseña (ni hasheada) no aparece en ningún campo de la respuesta.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/perfil` |
| 2 | Sistema | Verifica el access token JWT en el header de autorización |
| 3 | Sistema | Extrae el `userId` del payload del token |
| 4 | Sistema | Consulta los datos del usuario por `userId` en la BD |
| 5 | Sistema | Consulta el total de movimientos y metas del usuario (conteos) |
| 6 | Sistema | Retorna HTTP 200 con nombre, correo, fecha de registro y estadísticas |
| 7 | Sistema | El frontend renderiza la vista del perfil |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-005-A | Access token inválido o expirado (paso 2) | Retorna HTTP 401 con `UNAUTHORIZED`. Redirige al flujo CU-003 (refresh) o al login. |
| FA-005-B | Usuario del token no existe en BD (paso 4) | Retorna HTTP 404 con `USER_NOT_FOUND`. |

**Reglas de Negocio:**
- Un usuario solo puede ver su propio perfil. No existe endpoint para ver el perfil de otro usuario.
- El correo electrónico es inmutable y no puede modificarse desde esta vista.

**Entradas:** Header `Authorization: Bearer <accessToken>`

**Salidas (éxito):** `HTTP 200 — { id, name, email, createdAt, stats: { totalMovements, totalGoals } }`

---

### CU-006 — Editar Perfil

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-006 |
| **Nombre** | Editar Perfil |
| **RF Relacionado** | RF-006 |
| **Módulo** | Perfil |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario autenticado modifica su nombre completo. El correo electrónico es inmutable y no puede editarse.

**Precondiciones:**
- El usuario está autenticado.
- El nuevo nombre es diferente al nombre actual registrado.

**Postcondiciones:**
- El campo `name` del usuario queda actualizado en la base de datos.
- El campo `updatedAt` se actualiza automáticamente.
- La vista del perfil refleja el nuevo nombre sin recargar la página.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a la opción "Editar perfil" desde `/perfil` |
| 2 | Sistema | Muestra el formulario con el nombre actual precargado |
| 3 | Usuario Registrado | Modifica el nombre y envía el formulario |
| 4 | Sistema | Valida el nuevo nombre según reglas de formato |
| 5 | Sistema | Verifica que el nuevo nombre sea diferente al nombre actual |
| 6 | Sistema | Actualiza `name` y `updatedAt` en la base de datos |
| 7 | Sistema | Retorna HTTP 200 con los datos del usuario actualizados |
| 8 | Sistema | El frontend actualiza la vista sin recargar la página |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-006-A | El nuevo nombre es idéntico al actual (paso 5) | Retorna HTTP 422 con `NAME_UNCHANGED`. |
| FA-006-B | El nombre no cumple las validaciones de formato (paso 4) | Retorna HTTP 422 con `INVALID_NAME`. |

**Reglas de Negocio:**
- El correo electrónico es un campo inmutable; no puede modificarse desde ningún endpoint.
- Un usuario solo puede editar su propio perfil. No existe endpoint para editar el perfil de otro usuario.
- La actualización es idempotente en datos: si el nombre enviado es igual al actual, el sistema rechaza la operación (FA-006-A) en lugar de ejecutar un UPDATE innecesario.

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Nombre | Requerido. Mínimo 3 caracteres, máximo 100. Solo letras, espacios, guiones y apóstrofes. |

**Entradas:** `{ name: string }` + Header `Authorization: Bearer <accessToken>`

**Salidas (éxito):** `HTTP 200 — { id, name, email, updatedAt }`

---

### CU-007 — Cambiar Contraseña

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-007 |
| **Nombre** | Cambiar Contraseña |
| **RF Relacionado** | RF-007 |
| **Módulo** | Perfil |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario autenticado cambia su contraseña verificando previamente la contraseña actual. Tras el cambio exitoso, todos los refresh tokens activos del usuario son revocados, forzando el relogin en todos los dispositivos.

**Precondiciones:**
- El usuario está autenticado.
- El usuario conoce su contraseña actual.

**Postcondiciones:**
- La contraseña del usuario queda actualizada en la base de datos (nuevo hash bcrypt).
- Todos los refresh tokens activos del usuario quedan revocados.
- La sesión actual es cerrada. El usuario es redirigido al login.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a "Cambiar contraseña" desde `/perfil` |
| 2 | Usuario Registrado | Ingresa contraseña actual, nueva contraseña y confirmación |
| 3 | Sistema | Verifica que la contraseña actual coincida con el hash almacenado (bcrypt.compare) |
| 4 | Sistema | Valida que la nueva contraseña cumpla los criterios de seguridad |
| 5 | Sistema | Valida que la nueva contraseña sea diferente a la actual |
| 6 | Sistema | Valida que la confirmación coincida con la nueva contraseña |
| 7 | Sistema | Genera nuevo hash bcrypt de la nueva contraseña (12 rondas) |
| 8 | Sistema | Actualiza la contraseña en la base de datos |
| 9 | Sistema | Revoca todos los refresh tokens activos del usuario en BD |
| 10 | Sistema | Retorna HTTP 200 y elimina la cookie HttpOnly actual |
| 11 | Sistema | El frontend redirige al login con mensaje informativo |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-007-A | Contraseña actual incorrecta (paso 3) | Retorna HTTP 401 con `INCORRECT_CURRENT_PASSWORD`. Sin cambios en BD. |
| FA-007-B | Nueva contraseña igual a la actual (paso 5) | Retorna HTTP 422 con `SAME_PASSWORD`. |
| FA-007-C | Nueva contraseña no cumple criterios (paso 4) | Retorna HTTP 422 con `WEAK_PASSWORD`. |
| FA-007-D | Confirmación no coincide (paso 6) | Retorna HTTP 422 con `PASSWORD_MISMATCH`. |

**Reglas de Negocio:**
- La revocación de todos los refresh tokens es obligatoria tras el cambio de contraseña (seguridad).
- El sistema no revela detalles del hash almacenado en ningún mensaje de error.

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Contraseña actual | Requerida. |
| Nueva contraseña | Requerida. Mínimo 8 caracteres, máximo 72. Con mayúscula, minúscula, número y carácter especial. Distinta a la actual. |
| Confirmación | Requerida. Idéntica a la nueva contraseña. |

**Entradas:** `{ currentPassword, newPassword, confirmNewPassword }` + Header `Authorization`

**Salidas (éxito):** `HTTP 200` + eliminación de cookie + redirección al login.

---

### CU-008 — Registrar Movimiento con Lenguaje Natural

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-008 |
| **Nombre** | Registrar Movimiento con Lenguaje Natural |
| **RF Relacionado** | RF-008 |
| **Módulo** | Movimientos |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador), Sistema IA (secundario), Sistema |

**Descripción:**
El usuario describe una transacción financiera en lenguaje natural en español. El sistema envía el texto al modelo `gemini-2.0-flash`, que extrae los datos estructurados. El usuario confirma o edita antes de persistir.

**Precondiciones:**
- El usuario está autenticado.
- El servicio de Gemini API está disponible.

**Postcondiciones:**
- El movimiento financiero queda persistido en la base de datos con los datos confirmados por el usuario.
- El dashboard y el historial reflejan el nuevo movimiento.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Escribe una descripción en lenguaje natural (ej: "gasté 45 soles en el supermercado") |
| 2 | Usuario Registrado | Envía el texto |
| 3 | Sistema | Valida que el texto no esté vacío y no exceda 500 caracteres |
| 4 | Sistema | Construye un prompt estructurado con instrucciones para el modelo |
| 5 | Sistema | Envía el prompt a la API de `gemini-2.0-flash` |
| 6 | Sistema IA | Procesa el texto y retorna JSON con: `tipo`, `monto`, `moneda`, `categoria`, `descripcion`, `fecha` |
| 7 | Sistema | Valida el JSON retornado por la IA (estructura y tipos) |
| 8 | Sistema | Presenta los datos extraídos en un modal de confirmación |
| 9 | Usuario Registrado | Revisa los datos y confirma (o edita los campos incorrectos) |
| 10 | Sistema | Persiste el movimiento en la base de datos con los datos confirmados |
| 11 | Sistema | Retorna HTTP 201 con los datos del movimiento creado |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-008-A | El texto no contiene información financiera interpretable (paso 6) | La IA retorna confianza baja. El sistema notifica al usuario y no persiste datos. |
| FA-008-B | Gemini API no está disponible (paso 5) | El sistema activa automáticamente el formulario manual de registro como respaldo. |
| FA-008-C | El JSON retornado por la IA es inválido o incompleto (paso 7) | Activa formulario manual. Registra el error en los logs del sistema. |
| FA-008-D | El usuario edita los datos en el modal (paso 9) | El sistema persiste los datos editados por el usuario, no los originales de la IA. |

**Flujos de Excepción:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FE-008-A | Timeout de la API de Gemini | Retorna HTTP 503 con `AI_SERVICE_UNAVAILABLE`. Activa formulario manual. |

**Reglas de Negocio:**
- El sistema nunca persiste un movimiento sin confirmación explícita del usuario.
- El monto siempre se almacena en Soles peruanos (PEN).
- La comunicación con Gemini API se realiza exclusivamente desde el backend (nunca desde el cliente).
- Si no se menciona fecha, se asume la fecha y hora actual del servidor.

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Texto de entrada | Requerido. Mínimo 5 caracteres, máximo 500. |
| Monto extraído | Número positivo mayor a 0. Máximo 999,999.99. |
| Tipo | Exactamente `"gasto"` o `"ingreso"`. |
| Categoría | Debe pertenecer al catálogo predefinido (RF-009). |

**Entradas:** `{ text: string }` + Header `Authorization`

**Salidas (éxito):** `HTTP 201 — { id, tipo, monto, categoria, descripcion, fecha, createdAt }`

---

### CU-009 — Consultar Catálogo de Categorías

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-009 |
| **Nombre** | Consultar Catálogo de Categorías |
| **RF Relacionado** | RF-009 |
| **Módulo** | Movimientos |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario consulta las categorías disponibles para clasificar movimientos. El catálogo incluye 14 categorías predefinidas del sistema más las categorías personalizadas creadas por el usuario.

**Precondiciones:**
- Las categorías predefinidas del sistema existen en la base de datos (cargadas en el seed inicial).
- El usuario está autenticado.

**Postcondiciones:**
- El sistema retorna la lista completa de categorías disponibles para el usuario (sistema + personalizadas propias).

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede al formulario de registro o edición de un movimiento |
| 2 | Sistema | Consulta las categorías predefinidas del sistema (globales) |
| 3 | Sistema | Consulta las categorías personalizadas del usuario autenticado |
| 4 | Sistema | Retorna HTTP 200 con la lista combinada de categorías |
| 5 | Sistema | El frontend renderiza las categorías en el selector |

**Flujo Alternativo — Crear Categoría Personalizada:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Agregar categoría" |
| 2 | Usuario Registrado | Ingresa el nombre de la nueva categoría |
| 3 | Sistema | Valida el nombre (único por usuario, 3-50 caracteres) |
| 4 | Sistema | Persiste la nueva categoría asociada al usuario |
| 5 | Sistema | Retorna HTTP 201 con la nueva categoría |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-009-A | El nombre de categoría personalizada ya existe para ese usuario (paso 3) | Retorna HTTP 409 con `CATEGORY_ALREADY_EXISTS`. El flujo termina. |
| FA-009-B | El nombre no cumple las validaciones de formato (paso 3) | Retorna HTTP 422 con `INVALID_CATEGORY_NAME`. |
| FA-009-C | El usuario intenta eliminar una categoría predefinida del sistema | Retorna HTTP 403 con `SYSTEM_CATEGORY_IMMUTABLE`. |

**Reglas de Negocio:**
- Las categorías predefinidas del sistema (CAT-001 a CAT-014) no pueden ser eliminadas ni modificadas por ningún usuario.
- La IA solo puede asignar categorías existentes en el catálogo del sistema.
- Si se elimina una categoría personalizada, los movimientos asociados se reasignan a "Otros gastos" u "Otros ingresos" según corresponda.

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Nombre categoría personalizada | Requerido. Mínimo 3 caracteres, máximo 50. Único por usuario. |

**Categorías Predefinidas del Sistema:**

| ID | Nombre | Tipo |
|----|--------|------|
| CAT-001 | Alimentación | Gasto |
| CAT-002 | Transporte | Gasto |
| CAT-003 | Vivienda | Gasto |
| CAT-004 | Salud | Gasto |
| CAT-005 | Educación | Gasto / Ingreso |
| CAT-006 | Entretenimiento | Gasto |
| CAT-007 | Ropa y calzado | Gasto |
| CAT-008 | Tecnología | Gasto |
| CAT-009 | Servicios | Gasto |
| CAT-010 | Salario | Ingreso |
| CAT-011 | Freelance | Ingreso |
| CAT-012 | Inversiones | Ingreso |
| CAT-013 | Otros gastos | Gasto |
| CAT-014 | Otros ingresos | Ingreso |

**Entradas:** Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { system: Category[], custom: Category[] }`

---

### CU-010 — Ver Detalle de Movimiento

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-010 |
| **Nombre** | Ver Detalle de Movimiento |
| **RF Relacionado** | RF-010 |
| **Módulo** | Movimientos |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario visualiza el detalle completo de un movimiento financiero propio: texto original en lenguaje natural, datos estructurados, monto, categoría, tipo, fechas de transacción, registro y última modificación.

**Precondiciones:**
- El usuario está autenticado.
- El movimiento existe, pertenece al usuario y no ha sido eliminado (soft delete).

**Postcondiciones:**
- El sistema retorna todos los campos del movimiento solicitado.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona un movimiento del historial |
| 2 | Sistema | Recibe `GET /api/movements/:id` |
| 3 | Sistema | Verifica el access token |
| 4 | Sistema | Busca el movimiento por `id` verificando que `userId` coincida y `deletedAt` sea null |
| 5 | Sistema | Retorna HTTP 200 con todos los campos del movimiento |
| 6 | Sistema | El frontend renderiza la vista de detalle |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-010-A | El movimiento no existe o fue eliminado (paso 4) | Retorna HTTP 404 con `MOVEMENT_NOT_FOUND`. |
| FA-010-B | El movimiento pertenece a otro usuario (paso 4) | Retorna HTTP 403 con `FORBIDDEN`. |

**Reglas de Negocio:**
- Los movimientos con `deletedAt` poblado se tratan como inexistentes y retornan HTTP 404.

**Entradas:** URL param `:id` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { id, originalText, tipo, monto, categoria, descripcion, transactionDate, createdAt, updatedAt }`

---

### CU-011 — Editar Movimiento

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-011 |
| **Nombre** | Editar Movimiento |
| **RF Relacionado** | RF-011 |
| **Módulo** | Movimientos |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario modifica los datos de un movimiento financiero propio existente: monto, tipo, categoría, descripción y/o fecha de transacción.

**Precondiciones:**
- El usuario está autenticado.
- El movimiento existe, pertenece al usuario y no ha sido eliminado.

**Postcondiciones:**
- Los campos modificados quedan actualizados en la base de datos.
- El campo `updatedAt` se actualiza automáticamente.
- El dashboard se actualiza para reflejar los cambios.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Editar" en un movimiento del historial o detalle |
| 2 | Sistema | Carga el formulario con los datos actuales del movimiento precargados |
| 3 | Usuario Registrado | Modifica los campos deseados y envía |
| 4 | Sistema | Verifica que el movimiento existe y pertenece al usuario |
| 5 | Sistema | Valida los datos ingresados |
| 6 | Sistema | Actualiza los campos en la base de datos |
| 7 | Sistema | Retorna HTTP 200 con los datos actualizados |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-011-A | El movimiento no existe, fue eliminado o pertenece a otro usuario | Retorna HTTP 404 o 403 según corresponda. |
| FA-011-B | Los datos ingresados no cumplen las validaciones | Retorna HTTP 422 con detalle de los campos inválidos. |

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Monto | Número positivo mayor a 0. Máximo 999,999.99. |
| Tipo | `"gasto"` o `"ingreso"`. |
| Categoría | Debe existir en el catálogo disponible para el usuario. |
| Fecha de transacción | No puede ser una fecha futura. |

**Reglas de Negocio:**
- Un usuario solo puede editar sus propios movimientos; el sistema verifica la titularidad en cada operación.
- Los movimientos con `deletedAt` no nulo son tratados como inexistentes y retornan HTTP 404.
- Si se cambia la categoría a una personalizada y esta es eliminada posteriormente, el sistema no afecta el movimiento ya guardado.
- El campo `originalText` (texto en lenguaje natural) es inmutable y no puede editarse; refleja la entrada original del usuario.

**Entradas:** URL param `:id` + `{ monto?, tipo?, categoriaId?, descripcion?, transactionDate? }` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { id, tipo, monto, categoria, descripcion, transactionDate, updatedAt }`

---

### CU-012 — Eliminar Movimiento

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-012 |
| **Nombre** | Eliminar Movimiento |
| **RF Relacionado** | RF-012 |
| **Módulo** | Movimientos |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario elimina un movimiento financiero propio. La eliminación es lógica (soft delete): se popula el campo `deletedAt` y el movimiento deja de aparecer en todas las vistas del sistema.

**Precondiciones:**
- El usuario está autenticado.
- El movimiento existe, pertenece al usuario y no ha sido eliminado previamente.

**Postcondiciones:**
- El campo `deletedAt` del movimiento queda poblado con la fecha y hora actual.
- El movimiento desaparece del historial y del dashboard.
- Los cálculos del dashboard se recalculan excluyendo el movimiento eliminado.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Eliminar" en un movimiento |
| 2 | Sistema | Muestra diálogo de confirmación de eliminación |
| 3 | Usuario Registrado | Confirma la eliminación |
| 4 | Sistema | Verifica que el movimiento existe y pertenece al usuario |
| 5 | Sistema | Ejecuta soft delete: `UPDATE movements SET deletedAt = NOW() WHERE id = :id` |
| 6 | Sistema | Retorna HTTP 200 |
| 7 | Sistema | El frontend elimina el movimiento de la vista sin recargar la página |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-012-A | El usuario cancela el diálogo de confirmación (paso 3) | El flujo termina sin ningún cambio en la BD. |
| FA-012-B | El movimiento no existe, ya fue eliminado o pertenece a otro usuario | Retorna HTTP 404 o 403 según corresponda. |

**Reglas de Negocio:**
- La eliminación es siempre lógica (soft delete). Nunca se elimina físicamente un registro de movimiento.
- Los movimientos eliminados quedan preservados en la BD para auditoría (RA-002).

**Entradas:** URL param `:id` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { message: "Movimiento eliminado correctamente" }`

---

### CU-013 — Ver Historial de Movimientos

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-013 |
| **Nombre** | Ver Historial de Movimientos |
| **RF Relacionado** | RF-013 |
| **Módulo** | Movimientos |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario navega por su historial completo de movimientos financieros con paginación y filtros opcionales por rango de fechas, tipo (gasto/ingreso) y categoría.

**Precondiciones:**
- El usuario está autenticado.

**Postcondiciones:**
- El sistema retorna la lista de movimientos filtrados y paginados del usuario.
- Los movimientos eliminados (soft delete) no aparecen en los resultados.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/movimientos` |
| 2 | Sistema | Carga por defecto los movimientos del mes en curso, ordenados por fecha descendente, página 1 (20 registros) |
| 3 | Usuario Registrado | Aplica filtros opcionales: rango de fechas, tipo, categoría |
| 4 | Sistema | Valida los parámetros de filtro |
| 5 | Sistema | Ejecuta la consulta con los filtros activos, excluyendo registros con `deletedAt` no nulo |
| 6 | Sistema | Retorna HTTP 200 con los movimientos, total de registros y metadata de paginación |
| 7 | Sistema | El frontend renderiza la lista con paginación |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-013-A | No hay movimientos para los filtros aplicados | Retorna HTTP 200 con lista vacía y mensaje informativo. |
| FA-013-B | El rango de fechas supera los 12 meses | Retorna HTTP 422 con `DATE_RANGE_TOO_WIDE`. |
| FA-013-C | La fecha de inicio es posterior a la fecha de fin | Retorna HTTP 422 con `INVALID_DATE_RANGE`. |

**Validaciones:**

| Parámetro | Regla |
|-----------|-------|
| Fecha inicio | Opcional. No puede ser posterior a fecha fin. |
| Fecha fin | Opcional. |
| Rango máximo | 12 meses. |
| Tipo | Opcional. `"gasto"`, `"ingreso"` o `"todos"`. |
| Categoría | Opcional. Debe ser una categoría válida del catálogo. |
| Página | Número entero positivo. Máximo 20 registros por página. |

**Reglas de Negocio:**
- Los movimientos con `deletedAt` no nulo nunca aparecen en los resultados, independientemente de los filtros aplicados.
- El orden por defecto es fecha descendente (más reciente primero); no se expone un parámetro de ordenamiento al cliente en esta versión.
- Si no se especifican `fechaInicio` ni `fechaFin`, el sistema filtra por el mes en curso.
- La paginación es obligatoria; el sistema nunca retorna la colección completa sin límite.

**Entradas:** Query params `{ fechaInicio?, fechaFin?, tipo?, categoriaId?, page?, limit? }` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { data: Movement[], total: number, page: number, totalPages: number }`

---

### CU-014 — Ver Dashboard Principal

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-014 |
| **Nombre** | Ver Dashboard Principal |
| **RF Relacionado** | RF-014 |
| **Módulo** | Dashboard |
| **Prioridad** | ALTA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario visualiza el resumen financiero del mes en curso: balance, totales de ingresos y gastos, gráficas de distribución por categoría y evolución diaria, y los últimos 5 movimientos registrados.

**Precondiciones:**
- El usuario está autenticado.

**Postcondiciones:**
- El sistema retorna todos los datos del dashboard en una única respuesta JSON optimizada.
- La carga inicial no supera los 2 segundos.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/dashboard` |
| 2 | Sistema | Verifica el access token |
| 3 | Sistema | Consulta todos los movimientos del usuario en el mes en curso (sin `deletedAt`) |
| 4 | Sistema | Calcula: total ingresos, total gastos, balance = ingresos − gastos |
| 5 | Sistema | Agrupa gastos por categoría para la gráfica de torta |
| 6 | Sistema | Agrupa movimientos por día para la gráfica de evolución (barras/líneas) |
| 7 | Sistema | Obtiene los últimos 5 movimientos ordenados por fecha descendente |
| 8 | Sistema | Retorna HTTP 200 con todos los datos en un único objeto JSON |
| 9 | Sistema | El frontend renderiza las tarjetas de resumen y gráficas |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-014-A | El usuario no tiene movimientos en el mes en curso | Retorna HTTP 200 con todos los valores en cero y mensaje de bienvenida. |

**Reglas de Negocio:**
- El balance negativo (gastos > ingresos) se muestra en color rojo; balance positivo en color verde.
- Todos los montos se muestran en Soles peruanos (S/) con dos decimales.
- Los datos del dashboard se actualizan tras registrar un nuevo movimiento sin recargar la página (actualización reactiva del estado del cliente).

**Entradas:** Header `Authorization`

**Salidas (éxito):**
```json
HTTP 200 — {
  "balance": number,
  "totalIngresos": number,
  "totalGastos": number,
  "gastosPorCategoria": [{ "categoria": string, "monto": number }],
  "evolucionDiaria": [{ "fecha": string, "ingresos": number, "gastos": number }],
  "ultimosMovimientos": Movement[]
}
```

---

### CU-015 — Crear Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-015 |
| **Nombre** | Crear Meta de Ahorro |
| **RF Relacionado** | RF-015 |
| **Módulo** | Metas |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario crea una nueva meta de ahorro especificando nombre, monto objetivo, fecha límite y un monto inicial opcional. La meta queda activa desde su creación.

**Precondiciones:**
- El usuario está autenticado.

**Postcondiciones:**
- La meta queda persistida en la base de datos con estado `ACTIVA`.
- El porcentaje de progreso inicial es calculado en base al monto inicial aportado.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/metas` y selecciona "Nueva meta" |
| 2 | Sistema | Renderiza el formulario de creación |
| 3 | Usuario Registrado | Completa nombre, monto objetivo, fecha límite y monto inicial (opcional) |
| 4 | Usuario Registrado | Envía el formulario |
| 5 | Sistema | Valida todos los campos |
| 6 | Sistema | Calcula el progreso inicial: `(montoInicial / montoObjetivo) * 100` |
| 7 | Sistema | Persiste la meta con estado `ACTIVA` |
| 8 | Sistema | Retorna HTTP 201 con los datos de la meta creada |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-015-A | La fecha límite es en el pasado | Retorna HTTP 422 con `INVALID_DEADLINE`. |
| FA-015-B | El monto inicial supera el monto objetivo | Retorna HTTP 422 con `INITIAL_EXCEEDS_GOAL`. |

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Nombre | Requerido. Mínimo 3 caracteres, máximo 80. |
| Monto objetivo | Requerido. Número positivo mayor a 0. Máximo 999,999.99 PEN. |
| Fecha límite | Requerida. Debe ser una fecha futura. |
| Monto inicial | Opcional. Si se provee, debe ser positivo y no superar el monto objetivo. |

**Reglas de Negocio:**
- Una meta recién creada siempre inicia en estado `ACTIVA`; no existe estado "borrador".
- Todos los montos se almacenan en Soles peruanos (PEN); no se soportan otras monedas.
- Si se provee `montoInicial`, este se registra como el primer aporte y el progreso inicial refleja ese valor.
- Un usuario puede tener múltiples metas activas simultáneamente; no hay límite por cuenta.

**Entradas:** `{ nombre, montoObjetivo, fechaLimite, montoInicial? }` + Header `Authorization`

**Salidas (éxito):** `HTTP 201 — { id, nombre, montoObjetivo, montoAcumulado, progreso, estado, fechaLimite, createdAt }`

---

### CU-016 — Ver Progreso de Meta

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-016 |
| **Nombre** | Ver Progreso de Meta |
| **RF Relacionado** | RF-016 |
| **Módulo** | Metas |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario visualiza el progreso de sus metas de ahorro activas: monto acumulado, porcentaje de avance, días restantes y monto diario sugerido para alcanzar la meta a tiempo.

**Precondiciones:**
- El usuario está autenticado.
- El usuario tiene al menos una meta activa.

**Postcondiciones:**
- El sistema retorna las métricas calculadas para cada meta activa del usuario.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/metas` |
| 2 | Sistema | Consulta todas las metas activas del usuario (estado = `ACTIVA`) |
| 3 | Sistema | Para cada meta calcula: `progreso = (montoAcumulado / montoObjetivo) * 100` |
| 4 | Sistema | Calcula días restantes: `fechaLimite - fechaActual` |
| 5 | Sistema | Calcula monto diario sugerido: `(montoObjetivo - montoAcumulado) / diasRestantes` |
| 6 | Sistema | Retorna HTTP 200 con todas las metas y sus métricas calculadas |
| 7 | Sistema | El frontend renderiza las barras de progreso y métricas |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-016-A | El usuario no tiene metas activas | Retorna HTTP 200 con lista vacía y mensaje invitando a crear una meta. |
| FA-016-B | Una meta alcanza el 100% de progreso | El sistema muestra notificación de meta completada y habilita la opción de archivar. |

**Reglas de Negocio:**
- Si `diasRestantes <= 0` (meta vencida sin completar), el monto diario sugerido muestra "N/A".
- El progreso nunca supera el 100% visualmente, aunque el monto acumulado pueda superar el objetivo.

**Entradas:** Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { goals: [{ id, nombre, montoObjetivo, montoAcumulado, progreso, diasRestantes, montoDiarioSugerido, estado, fechaLimite }] }`

---

### CU-017 — Agregar Aporte a Meta

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-017 |
| **Nombre** | Agregar Aporte a Meta |
| **RF Relacionado** | RF-017 |
| **Módulo** | Metas |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario registra un aporte monetario a una meta de ahorro activa. Si el aporte completa o supera el monto objetivo, la meta cambia automáticamente a estado `COMPLETADA`.

**Precondiciones:**
- El usuario está autenticado.
- La meta existe, está en estado `ACTIVA` y pertenece al usuario.

**Postcondiciones:**
- El monto acumulado de la meta se incrementa con el valor del aporte.
- Si `montoAcumulado >= montoObjetivo` → el estado de la meta cambia a `COMPLETADA`.
- El progreso de la meta queda actualizado.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona una meta activa y elige "Agregar aporte" |
| 2 | Usuario Registrado | Ingresa el monto del aporte |
| 3 | Sistema | Valida el monto ingresado |
| 4 | Sistema | Suma el aporte al `montoAcumulado` de la meta |
| 5 | Sistema | Verifica si `montoAcumulado >= montoObjetivo` |
| 6 | Sistema | Si se completó: actualiza el estado a `COMPLETADA` |
| 7 | Sistema | Persiste los cambios en la base de datos |
| 8 | Sistema | Retorna HTTP 200 con el estado actualizado de la meta |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-017-A | La meta no está en estado `ACTIVA` | Retorna HTTP 422 con `GOAL_NOT_ACTIVE`. |
| FA-017-B | La meta no existe o pertenece a otro usuario | Retorna HTTP 404 o 403 según corresponda. |

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Monto del aporte | Requerido. Número positivo mayor a 0. |

**Reglas de Negocio:**
- Solo se pueden agregar aportes a metas en estado `ACTIVA`; las metas `COMPLETADAS` o `ARCHIVADAS` no aceptan nuevos aportes.
- Si el aporte hace que `montoAcumulado >= montoObjetivo`, el cambio de estado a `COMPLETADA` es automático e inmediato en la misma transacción.
- El sistema permite aportes que superen el monto objetivo (el progreso se muestra al 100% pero el exceso se registra).
- Cada aporte queda registrado individualmente en la tabla de aportes para trazabilidad del historial.

**Entradas:** URL param `:id` + `{ monto: number }` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { id, montoAcumulado, progreso, estado }`

---

### CU-018 — Editar Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-018 |
| **Nombre** | Editar Meta de Ahorro |
| **RF Relacionado** | RF-018 |
| **Módulo** | Metas |
| **Prioridad** | BAJA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario modifica el nombre, monto objetivo o fecha límite de una meta activa. No se pueden editar metas completadas ni archivadas.

**Precondiciones:**
- El usuario está autenticado.
- La meta está en estado `ACTIVA` y pertenece al usuario.

**Postcondiciones:**
- Los campos modificados quedan actualizados en la base de datos.
- El porcentaje de progreso se recalcula con el nuevo monto objetivo.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Editar" en una meta activa |
| 2 | Sistema | Carga el formulario con los datos actuales precargados |
| 3 | Usuario Registrado | Modifica nombre, monto objetivo y/o fecha límite |
| 4 | Sistema | Valida los nuevos datos |
| 5 | Sistema | Verifica que el nuevo monto objetivo no sea menor al monto ya acumulado |
| 6 | Sistema | Actualiza la meta y recalcula el porcentaje de progreso |
| 7 | Sistema | Retorna HTTP 200 con los datos actualizados |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-018-A | La meta no está en estado `ACTIVA` | Retorna HTTP 422 con `GOAL_NOT_ACTIVE`. |
| FA-018-B | El nuevo monto objetivo es menor al monto ya acumulado | Retorna HTTP 422 con `AMOUNT_BELOW_ACCUMULATED`. |
| FA-018-C | La nueva fecha límite es en el pasado | Retorna HTTP 422 con `INVALID_DEADLINE`. |

**Validaciones:**

| Campo | Regla |
|-------|-------|
| Nombre | Mínimo 3 caracteres, máximo 80. |
| Monto objetivo | Debe ser mayor o igual al monto ya acumulado. |
| Fecha límite | Debe ser una fecha futura. |

**Reglas de Negocio:**
- Solo las metas en estado `ACTIVA` pueden editarse; las `COMPLETADAS` y `ARCHIVADAS` son inmutables.
- Al modificar el `montoObjetivo`, el progreso se recalcula automáticamente: `progreso = (montoAcumulado / nuevoMontoObjetivo) * 100`.
- Si el nuevo `montoObjetivo` resulta igual al `montoAcumulado` actual, el sistema actualiza la meta y la marca automáticamente como `COMPLETADA`.
- La edición es parcial (PATCH): solo se actualizan los campos enviados; los omitidos conservan su valor.

**Entradas:** URL param `:id` + `{ nombre?, montoObjetivo?, fechaLimite? }` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { id, nombre, montoObjetivo, montoAcumulado, progreso, fechaLimite, updatedAt }`

---

### CU-019 — Eliminar Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-019 |
| **Nombre** | Eliminar Meta de Ahorro |
| **RF Relacionado** | RF-019 |
| **Módulo** | Metas |
| **Prioridad** | BAJA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario elimina una meta activa. La eliminación es lógica (soft delete). Las metas completadas no pueden eliminarse, solo archivarse.

**Precondiciones:**
- El usuario está autenticado.
- La meta está en estado `ACTIVA` y pertenece al usuario.

**Postcondiciones:**
- El campo `deletedAt` de la meta queda poblado.
- La meta desaparece de todas las vistas del sistema.
- El historial de aportes de la meta eliminada se preserva en la base de datos.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Eliminar" en una meta activa |
| 2 | Sistema | Muestra diálogo de confirmación advirtiendo sobre la eliminación |
| 3 | Usuario Registrado | Confirma la eliminación |
| 4 | Sistema | Verifica que la meta está en estado `ACTIVA` y pertenece al usuario |
| 5 | Sistema | Ejecuta soft delete: `UPDATE goals SET deletedAt = NOW() WHERE id = :id` |
| 6 | Sistema | Retorna HTTP 200 |
| 7 | Sistema | El frontend elimina la meta de la vista |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-019-A | El usuario cancela el diálogo (paso 3) | El flujo termina sin cambios en BD. |
| FA-019-B | La meta está en estado `COMPLETADA` | Retorna HTTP 422 con `GOAL_COMPLETED_IMMUTABLE`. Las metas completadas solo pueden archivarse. |

**Reglas de Negocio:**
- La eliminación es siempre lógica (soft delete). El historial de aportes se preserva en BD para auditoría.

**Entradas:** URL param `:id` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { message: "Meta eliminada correctamente" }`

---

### CU-020 — Archivar Meta Completada

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-020 |
| **Nombre** | Archivar Meta Completada |
| **RF Relacionado** | RF-020 |
| **Módulo** | Metas |
| **Prioridad** | BAJA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario archiva una meta de ahorro completada, moviéndola al historial de metas. Las metas archivadas no aparecen en la vista principal de metas activas.

**Precondiciones:**
- El usuario está autenticado.
- La meta está en estado `COMPLETADA` y pertenece al usuario.

**Postcondiciones:**
- El estado de la meta cambia de `COMPLETADA` a `ARCHIVADA`.
- La meta desaparece de la vista principal y aparece en el historial de metas.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Selecciona "Archivar" en una meta completada |
| 2 | Sistema | Verifica que la meta está en estado `COMPLETADA` y pertenece al usuario |
| 3 | Sistema | Actualiza el estado de la meta a `ARCHIVADA` |
| 4 | Sistema | Retorna HTTP 200 |
| 5 | Sistema | El frontend mueve la meta al historial |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-020-A | La meta no está en estado `COMPLETADA` | Retorna HTTP 422 con `GOAL_NOT_COMPLETED`. |
| FA-020-B | La meta no existe o pertenece a otro usuario | Retorna HTTP 404 o 403 según corresponda. |

**Reglas de Negocio:**
- El archivado es una operación unidireccional: una meta `ARCHIVADA` no puede volver a estado `ACTIVA` ni `COMPLETADA`.
- Las metas archivadas son de solo lectura; no aceptan nuevos aportes ni ediciones.
- El historial de aportes de la meta archivada se conserva íntegro en la base de datos.
- Las metas archivadas no se contabilizan en el resumen del dashboard (CU-021).

**Entradas:** URL param `:id` + Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { id, estado: "ARCHIVADA" }`

---

### CU-021 — Ver Resumen de Metas en Dashboard

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-021 |
| **Nombre** | Ver Resumen de Metas en Dashboard |
| **RF Relacionado** | RF-021 |
| **Módulo** | Dashboard |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El dashboard muestra un resumen de hasta 3 metas de ahorro activas del usuario, con barra de progreso, porcentaje de avance y días restantes. Incluye enlace para ver todas las metas.

**Precondiciones:**
- El usuario está autenticado.

**Postcondiciones:**
- El sistema retorna los datos de las metas activas como parte de la respuesta del dashboard.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/dashboard` (como parte de CU-014) |
| 2 | Sistema | Consulta las metas activas del usuario, ordenadas por fecha límite ascendente |
| 3 | Sistema | Limita el resultado a máximo 3 metas |
| 4 | Sistema | Incluye los datos de las metas en la respuesta del dashboard |
| 5 | Sistema | El frontend renderiza las barras de progreso en la sección de metas del dashboard |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-021-A | El usuario no tiene metas activas | El dashboard muestra un mensaje invitando a crear la primera meta. |

**Reglas de Negocio:**
- Se muestran máximo 3 metas, ordenadas por fecha límite más próxima primero.
- El enlace "Ver todas" siempre está presente y redirige a `/metas`.

**Entradas:** Header `Authorization` (como parte de la petición del dashboard)

**Salidas (éxito):** Incluido en la respuesta de CU-014: `activeGoals: [{ id, nombre, progreso, diasRestantes, montoObjetivo, montoAcumulado }]` (máximo 3 items)

---

### CU-022 — Cerrar Sesión en Todos los Dispositivos

| Campo | Detalle |
|-------|---------|
| **Identificador** | CU-022 |
| **Nombre** | Cerrar Sesión en Todos los Dispositivos |
| **RF Relacionado** | RF-022 |
| **Módulo** | Perfil |
| **Prioridad** | MEDIA |
| **Actores** | Usuario Registrado (iniciador), Sistema |

**Descripción:**
El usuario revoca todos sus refresh tokens activos en todos los dispositivos simultáneamente desde la vista de perfil. Útil en situaciones de seguridad como pérdida o robo de dispositivo.

**Precondiciones:**
- El usuario está autenticado.

**Postcondiciones:**
- Todos los refresh tokens activos del usuario quedan marcados como revocados en la base de datos.
- La sesión actual del usuario es cerrada.
- Cualquier otro dispositivo con sesión activa perderá la capacidad de renovar su token en la próxima petición de refresh.

**Flujo Principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario Registrado | Accede a `/perfil` y selecciona "Cerrar sesión en todos los dispositivos" |
| 2 | Sistema | Muestra mensaje de confirmación explicando el alcance de la acción |
| 3 | Usuario Registrado | Confirma la acción |
| 4 | Sistema | Ejecuta `UPDATE refresh_tokens SET revokedAt = NOW() WHERE userId = :userId AND revokedAt IS NULL` |
| 5 | Sistema | Elimina la cookie HttpOnly del dispositivo actual |
| 6 | Sistema | Retorna HTTP 200 |
| 7 | Sistema | Redirige al login con mensaje informativo |

**Flujos Alternativos:**

| ID | Condición | Respuesta del Sistema |
|----|-----------|----------------------|
| FA-022-A | El usuario cancela la confirmación (paso 3) | El flujo termina sin cambios. |

**Reglas de Negocio:**
- La operación es atómica: todos los tokens se revocan en una sola transacción.
- Los otros dispositivos recibirán HTTP 401 en su próxima petición de refresh y serán redirigidos al login.

**Entradas:** Header `Authorization`

**Salidas (éxito):** `HTTP 200 — { message: "Sesión cerrada en todos los dispositivos", devicesAffected: number }` + eliminación de cookie + redirección al login.

---

## Resumen de Cobertura

| Módulo | N° CU | RF Cubiertos |
|--------|-------|-------------|
| Autenticación | 4 | RF-001, RF-002, RF-003, RF-004 |
| Perfil | 4 | RF-005, RF-006, RF-007, RF-022 |
| Movimientos | 6 | RF-008, RF-009, RF-010, RF-011, RF-012, RF-013 |
| Dashboard | 2 | RF-014, RF-021 |
| Metas de Ahorro | 6 | RF-015, RF-016, RF-017, RF-018, RF-019, RF-020 |
| **TOTAL** | **22** | **22 RF cubiertos** |

> Cada requerimiento funcional (RF) del documento `01-requirements.md` tiene exactamente un caso de uso (CU) correspondiente. La cobertura es 1:1, garantizando trazabilidad completa entre ambos documentos.

---

*Fin del Documento de Casos de Uso — Quipu v1.0.0*
