# Documento de Requerimientos de Software
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

1. [Introducción](#1-introducción)
2. [Requerimientos Funcionales](#2-requerimientos-funcionales)
3. [Requerimientos No Funcionales](#3-requerimientos-no-funcionales) ← todas las subcategorías siguientes pertenecen a este grupo
   - 3.1 [Generales](#31-requerimientos-generales)
   - 3.2 [Seguridad (RS)](#32-requerimientos-de-seguridad) — subcategoría RNF
   - 3.3 [Rendimiento (RP)](#33-requerimientos-de-rendimiento) — subcategoría RNF
   - 3.4 [Disponibilidad (RD)](#34-requerimientos-de-disponibilidad) — subcategoría RNF
   - 3.5 [Escalabilidad (RE)](#35-requerimientos-de-escalabilidad) — subcategoría RNF
   - 3.6 [Mantenibilidad (RM)](#36-requerimientos-de-mantenibilidad) — subcategoría RNF
   - 3.7 [Usabilidad (RU)](#37-requerimientos-de-usabilidad) — subcategoría RNF
   - 3.8 [Integridad de Datos (RI)](#38-requerimientos-de-integridad-de-datos) — subcategoría RNF
   - 3.9 [Auditoría y Trazabilidad (RA)](#39-requerimientos-de-auditoría-y-trazabilidad) — subcategoría RNF

---

## Tabla Resumen de Requerimientos

### Requerimientos Funcionales (RF)

| N° RF | Nombre | Módulo | Prioridad |
|-------|--------|--------|-----------|
| RF-001 | Registro de nuevo usuario | Autenticación | ALTA |
| RF-002 | Autenticación de usuario registrado | Autenticación | ALTA |
| RF-003 | Renovación automática de access token | Autenticación | ALTA |
| RF-004 | Cierre de sesión del usuario | Autenticación | ALTA |
| RF-005 | Visualización del perfil del usuario | Perfil | MEDIA |
| RF-006 | Modificación del nombre del usuario | Perfil | MEDIA |
| RF-007 | Cambio de contraseña | Perfil | MEDIA |
| RF-008 | Registro de movimiento con lenguaje natural | Movimientos | ALTA |
| RF-009 | Catálogo de categorías de movimientos | Movimientos | ALTA |
| RF-010 | Ver detalle de movimiento individual | Movimientos | MEDIA |
| RF-011 | Editar movimiento financiero | Movimientos | MEDIA |
| RF-012 | Eliminar movimiento financiero | Movimientos | MEDIA |
| RF-013 | Historial de movimientos con filtros | Movimientos | ALTA |
| RF-014 | Dashboard principal | Dashboard | ALTA |
| RF-015 | Crear meta de ahorro | Metas | MEDIA |
| RF-016 | Ver progreso de meta de ahorro | Metas | MEDIA |
| RF-017 | Agregar aporte a meta de ahorro | Metas | MEDIA |
| RF-018 | Editar meta de ahorro | Metas | BAJA |
| RF-019 | Eliminar meta de ahorro | Metas | BAJA |
| RF-020 | Archivar meta completada | Metas | BAJA |
| RF-021 | Resumen de metas en dashboard | Dashboard | MEDIA |
| RF-022 | Cierre de sesión en todos los dispositivos | Autenticación | MEDIA |

### Requerimientos No Funcionales (RNF)

> Los requerimientos no funcionales definen **cómo debe comportarse** el sistema, no qué debe hacer. Se subdividen en categorías de calidad según la norma ISO/IEC 25010. Todas las subcategorías siguientes (seguridad, rendimiento, usabilidad, etc.) son requerimientos no funcionales clasificados por su atributo de calidad.

#### RNF — Generales

| N° RNF | Nombre | Prioridad |
|--------|--------|-----------|
| RNF-001 | Arquitectura del sistema por capas | ALTA |
| RNF-002 | Estándares de código TypeScript | ALTA |
| RNF-003 | Pruebas unitarias y cobertura con Vitest | ALTA |

#### RNF — Seguridad (RS)

| N° RS | Nombre | Prioridad |
|-------|--------|-----------|
| RS-001 | Protección de endpoints mediante JWT | ALTA |
| RS-002 | Protección contra inyección SQL | ALTA |
| RS-003 | Protección contra XSS y CSRF | ALTA |
| RS-004 | Cifrado de datos sensibles | ALTA |

#### RNF — Rendimiento (RP)

| N° RP | Nombre | Prioridad |
|-------|--------|-----------|
| RP-001 | Tiempo de respuesta de la API | ALTA |
| RP-002 | Optimización de consultas a base de datos | MEDIA |

#### RNF — Disponibilidad (RD)

| N° RD | Nombre | Prioridad |
|-------|--------|-----------|
| RD-001 | Degradación elegante ante fallas de servicios externos | ALTA |

#### RNF — Escalabilidad (RE)

| N° RE | Nombre | Prioridad |
|-------|--------|-----------|
| RE-001 | Backend stateless | MEDIA |

#### RNF — Mantenibilidad (RM)

| N° RM | Nombre | Prioridad |
|-------|--------|-----------|
| RM-001 | Estructura modular del proyecto | ALTA |
| RM-002 | Variables de entorno y configuración | ALTA |

#### RNF — Usabilidad (RU)

| N° RU | Nombre | Prioridad |
|-------|--------|-----------|
| RU-001 | Diseño responsivo | ALTA |
| RU-002 | Retroalimentación visual al usuario | ALTA |

#### RNF — Integridad de Datos (RI)

| N° RI | Nombre | Prioridad |
|-------|--------|-----------|
| RI-001 | Consistencia transaccional | ALTA |
| RI-002 | Validación en múltiples capas | ALTA |

#### RNF — Auditoría y Trazabilidad (RA)

| N° RA | Nombre | Prioridad |
|-------|--------|-----------|
| RA-001 | Registro de eventos del sistema | MEDIA |
| RA-002 | Trazabilidad de movimientos financieros | MEDIA |

---

## 1. Introducción

### 1.1 Propósito
Este documento describe de manera exhaustiva y formal los requerimientos de software del sistema **Quipu**, una aplicación web de gestión de finanzas personales con inteligencia artificial. Está dirigido a desarrolladores, evaluadores académicos y cualquier parte interesada en comprender el comportamiento esperado del sistema desde una perspectiva de ingeniería de software.

### 1.2 Convenciones de Identificación

| Prefijo | Tipo de Requerimiento |
|--------|-----------------------|
| RF | Requerimiento Funcional |
| RNF | Requerimiento No Funcional |
| RS | Requerimiento de Seguridad |
| RP | Requerimiento de Rendimiento |
| RD | Requerimiento de Disponibilidad |
| RE | Requerimiento de Escalabilidad |
| RM | Requerimiento de Mantenibilidad |
| RU | Requerimiento de Usabilidad |
| RI | Requerimiento de Integridad de Datos |
| RA | Requerimiento de Auditoría y Trazabilidad |

### 1.3 Niveles de Prioridad

| Nivel | Descripción |
|-------|-------------|
| ALTA | Indispensable para el funcionamiento del sistema. Sin este requerimiento el sistema no puede operar. |
| MEDIA | Importante para la experiencia del usuario. Su ausencia reduce la calidad pero no inutiliza el sistema. |
| BAJA | Mejora la experiencia pero puede implementarse en versiones posteriores. |

### 1.4 Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| Usuario Registrado | Persona autenticada con acceso completo a las funcionalidades del sistema. |
| Usuario Anónimo | Persona sin autenticación. Solo puede acceder al login y registro. |
| Sistema IA | Modelo `gemini-2.0-flash` de Google que procesa lenguaje natural y retorna datos estructurados. |
| Sistema | Backend de Quipu (Node.js + Express) que orquesta todas las operaciones. |

---

## 2. Requerimientos Funcionales

### Módulo de Autenticación

---

### RF-001 — Registro de Usuario

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-001 |
| **Nombre** | Registro de nuevo usuario |
| **Prioridad** | ALTA |
| **Dependencias** | Ninguna |

**Descripción:**
El sistema debe permitir que un usuario anónimo cree una cuenta nueva proporcionando nombre completo, correo electrónico y contraseña. El sistema verifica que el correo no esté previamente registrado, aplica validaciones de seguridad y almacena la contraseña mediante hash criptográfico bcrypt antes de persistir el registro.

**Objetivo:**
Permitir el acceso controlado al sistema mediante identidades únicas verificables, garantizando que cada cuenta esté asociada a un correo electrónico válido y una contraseña segura.

**Actor involucrado:** Usuario Anónimo, Sistema.

**Precondiciones:**
- El usuario no debe tener una sesión activa.
- El correo electrónico proporcionado no debe estar registrado previamente.
- El servicio de base de datos debe estar operativo.

**Flujo Principal:**
1. El usuario accede a `/register`.
2. El usuario completa el formulario con nombre completo, correo, contraseña y confirmación.
3. El usuario envía el formulario.
4. El sistema valida que todos los campos estén completos.
5. El sistema valida el formato del correo electrónico.
6. El sistema valida que la contraseña cumpla los criterios de seguridad.
7. El sistema valida que contraseña y confirmación sean idénticas.
8. El sistema verifica que el correo no esté registrado en la base de datos.
9. El sistema genera un hash bcrypt con salt de mínimo 12 rondas.
10. El sistema persiste el nuevo usuario en la base de datos.
11. El sistema genera un access token JWT y un refresh token.
12. El sistema retorna los tokens y redirige al dashboard.

**Flujos Alternativos:**
- **FA-001-A:** Si el correo ya está registrado → retorna `EMAIL_ALREADY_EXISTS` (HTTP 409).
- **FA-001-B:** Si la contraseña no cumple los criterios → retorna `WEAK_PASSWORD` (HTTP 422).
- **FA-001-C:** Si las contraseñas no coinciden → retorna `PASSWORD_MISMATCH` (HTTP 422).
- **FA-001-D:** Si la base de datos no está disponible → retorna `SERVICE_UNAVAILABLE` (HTTP 503).

**Validaciones:**
- Nombre completo: mínimo 3 caracteres, máximo 100, sin números ni caracteres especiales excepto espacios, guiones y apóstrofes.
- Correo electrónico: estándar RFC 5322, máximo 254 caracteres.
- Contraseña: mínimo 8 caracteres, máximo 72, debe contener mayúscula, minúscula, número y carácter especial.
- Confirmación: debe ser idéntica al campo de contraseña.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `EMAIL_ALREADY_EXISTS` | El correo ya está registrado | 409 |
| `WEAK_PASSWORD` | La contraseña no cumple los criterios | 422 |
| `PASSWORD_MISMATCH` | Las contraseñas no coinciden | 422 |
| `INVALID_EMAIL_FORMAT` | Formato de correo inválido | 422 |
| `INVALID_NAME` | El nombre contiene caracteres no permitidos | 422 |
| `SERVICE_UNAVAILABLE` | Error interno del servidor | 503 |

**Restricciones:**
- Un correo electrónico solo puede estar asociado a una cuenta.
- La contraseña nunca se almacena en texto plano.
- El sistema no debe revelar si un correo existe en mensajes públicos (mitigación de enumeración).

**Criterios de Aceptación:**
- Dado correo no registrado y contraseña válida → el sistema crea la cuenta y retorna tokens.
- Dado correo ya registrado → retorna HTTP 409 sin crear duplicados.
- Dado contraseña débil → retorna HTTP 422 indicando el criterio fallido.
- La contraseña almacenada es un hash bcrypt irreversible.

---

### RF-002 — Inicio de Sesión

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-002 |
| **Nombre** | Autenticación de usuario registrado |
| **Prioridad** | ALTA |
| **Dependencias** | RF-001 |

**Descripción:**
El sistema debe permitir que un usuario registrado inicie sesión con su correo y contraseña. Verificadas las credenciales, el sistema genera un access token JWT (15 minutos de validez) y un refresh token (7 días) para mantener la sesión.

**Objetivo:**
Autenticar la identidad del usuario y proveer los mecanismos de sesión necesarios para el acceso seguro a los recursos protegidos.

**Actor involucrado:** Usuario Anónimo, Sistema.

**Precondiciones:**
- El usuario debe tener una cuenta registrada.
- El usuario no debe tener una sesión activa válida.

**Flujo Principal:**
1. El usuario accede a `/login`.
2. El usuario ingresa correo y contraseña.
3. El sistema valida que ambos campos estén presentes.
4. El sistema busca el usuario por correo en la base de datos.
5. El sistema compara la contraseña con el hash bcrypt almacenado.
6. El sistema genera un access token JWT con expiración de 15 minutos.
7. El sistema genera un refresh token con expiración de 7 días y lo almacena hasheado.
8. El sistema retorna el access token en el cuerpo y el refresh token en cookie HttpOnly.
9. El sistema redirige al dashboard.

**Flujos Alternativos:**
- **FA-002-A:** Credenciales incorrectas → retorna `INVALID_CREDENTIALS` (HTTP 401) sin especificar cuál campo falló.
- **FA-002-B:** 5 intentos fallidos en 15 minutos → bloqueo temporal de 15 minutos, retorna `ACCOUNT_TEMPORARILY_LOCKED` (HTTP 429).
- **FA-002-C:** Access token aún válido → redirige directamente al dashboard.

**Validaciones:**
- Correo: requerido, formato RFC 5322.
- Contraseña: requerida, mínimo 1 carácter.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INVALID_CREDENTIALS` | Credenciales incorrectas | 401 |
| `ACCOUNT_TEMPORARILY_LOCKED` | Cuenta bloqueada por intentos fallidos | 429 |
| `MISSING_FIELDS` | Campos requeridos ausentes | 422 |
| `SERVICE_UNAVAILABLE` | Error interno del servidor | 503 |

**Restricciones:**
- El sistema nunca debe indicar si el error es en el correo o en la contraseña.
- El refresh token se almacena hasheado (SHA-256) en la base de datos.
- La cookie del refresh token debe tener atributos `HttpOnly`, `Secure` y `SameSite=Strict`.

**Criterios de Aceptación:**
- Dado credenciales válidas → retorna access token y cookie con refresh token.
- Dado credenciales inválidas → HTTP 401 con mensaje genérico.
- Tras 5 intentos fallidos → cuenta bloqueada temporalmente.
- El access token expira exactamente a los 15 minutos.

---

### RF-003 — Renovación de Token de Acceso

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-003 |
| **Nombre** | Renovación automática de access token mediante refresh token |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002 |

**Descripción:**
El sistema debe proveer un mecanismo para renovar el access token expirado utilizando el refresh token en la cookie HttpOnly, sin requerir que el usuario reingrese sus credenciales. El sistema valida que el refresh token sea válido, no haya sido revocado y no haya expirado antes de emitir un nuevo access token.

**Objetivo:**
Mantener la sesión del usuario activa de forma transparente y segura, evitando interrupciones en la experiencia de uso.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe poseer un refresh token válido en su cookie HttpOnly.
- El refresh token no debe haber sido revocado ni expirado.

**Flujo Principal:**
1. El cliente detecta respuesta HTTP 401 con código `TOKEN_EXPIRED`.
2. El cliente realiza petición a `POST /api/auth/refresh`.
3. El sistema extrae el refresh token de la cookie HttpOnly.
4. El sistema busca y verifica que el refresh token no haya sido revocado.
5. El sistema verifica que el refresh token no haya expirado.
6. El sistema verifica la firma criptográfica del token.
7. El sistema genera un nuevo access token con expiración de 15 minutos.
8. El sistema invalida el refresh token anterior (rotación).
9. El sistema emite un nuevo refresh token y retorna el access token.
10. El cliente reintenta la petición original con el nuevo access token.

**Flujos Alternativos:**
- **FA-003-A:** Refresh token revocado → `INVALID_REFRESH_TOKEN` (HTTP 401), redirige al login.
- **FA-003-B:** Refresh token expirado → `REFRESH_TOKEN_EXPIRED` (HTTP 401), elimina cookie y redirige al login.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INVALID_REFRESH_TOKEN` | Token inválido o revocado | 401 |
| `REFRESH_TOKEN_EXPIRED` | Token expirado | 401 |
| `MISSING_REFRESH_TOKEN` | Cookie ausente | 401 |

**Restricciones:**
- Rotación obligatoria: el refresh token anterior se invalida al emitir uno nuevo.
- El sistema mantiene una lista de refresh tokens válidos en la base de datos.

**Criterios de Aceptación:**
- Dado refresh token válido → nuevo access token sin requerir credenciales.
- Dado refresh token revocado → HTTP 401 y fuerza el relogin.
- El token anterior queda invalidado tras la renovación.

---

### RF-004 — Cierre de Sesión

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-004 |
| **Nombre** | Cierre de sesión del usuario |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002, RF-003 |

**Descripción:**
El sistema debe permitir que el usuario cierre su sesión activa de forma segura. Al cerrar sesión, el refresh token es revocado en la base de datos y la cookie HttpOnly es eliminada del cliente.

**Objetivo:**
Garantizar que al cerrar sesión el usuario no pueda continuar accediendo al sistema con tokens previamente emitidos.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe tener una sesión activa con refresh token válido.

**Flujo Principal:**
1. El usuario selecciona "Cerrar sesión".
2. El cliente realiza petición autenticada a `POST /api/auth/logout`.
3. El sistema extrae el refresh token de la cookie.
4. El sistema marca el refresh token como revocado en la base de datos.
5. El sistema elimina la cookie HttpOnly en la respuesta.
6. El sistema retorna HTTP 200 con confirmación.
7. El cliente limpia el access token del estado en memoria y redirige al login.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `MISSING_REFRESH_TOKEN` | No hay cookie de refresh token | 400 |
| `ALREADY_LOGGED_OUT` | El token ya fue revocado | 200 (idempotente) |

**Restricciones:**
- El cierre de sesión debe ser idempotente.
- El sistema no debe almacenar access tokens en localStorage ni sessionStorage.

**Criterios de Aceptación:**
- Tras el logout → refresh token revocado en base de datos y cookie eliminada.
- Intentar renovar el access token tras el logout → HTTP 401.

---

### Módulo de Perfil de Usuario

---

### RF-005 — Ver Perfil del Usuario

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-005 |
| **Nombre** | Visualización del perfil del usuario autenticado |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002 |

**Descripción:**
El sistema debe permitir al usuario autenticado visualizar los datos de su perfil personal, incluyendo nombre completo, correo electrónico, fecha de registro en el sistema y estadísticas generales de uso (total de movimientos registrados, total de metas creadas).

**Objetivo:**
Proveer al usuario una vista centralizada de su información personal y estadísticas de uso dentro del sistema.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado con un access token válido.

**Flujo Principal:**
1. El usuario accede a `/perfil`.
2. El sistema verifica el access token.
3. El sistema consulta los datos del usuario por su `userId` del token.
4. El sistema consulta el total de movimientos y metas del usuario.
5. El sistema retorna HTTP 200 con los datos del perfil y las estadísticas.
6. El frontend renderiza la vista del perfil.

**Flujos Alternativos:**
- **FA-005-A:** Si el access token es inválido o expirado → retorna HTTP 401 y redirige al login.

**Validaciones:**
- El `userId` del token debe corresponder a un usuario existente en la base de datos.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `USER_NOT_FOUND` | El usuario del token no existe | 404 |
| `UNAUTHORIZED` | Token inválido o ausente | 401 |

**Restricciones:**
- El correo electrónico no puede ser modificado desde esta vista (es el identificador único del usuario).
- El campo `contraseña` nunca se retorna en la respuesta, ni siquiera hasheado.

**Criterios de Aceptación:**
- El perfil muestra nombre, correo, fecha de registro y estadísticas correctas.
- La contraseña no aparece en ningún campo de la respuesta de la API.
- Un usuario no puede ver el perfil de otro usuario.

---

### RF-006 — Editar Perfil del Usuario

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-006 |
| **Nombre** | Modificación del nombre del usuario autenticado |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002, RF-005 |

**Descripción:**
El sistema debe permitir al usuario autenticado modificar su nombre completo. El correo electrónico no puede ser modificado al ser el identificador único de autenticación del sistema.

**Objetivo:**
Permitir al usuario mantener actualizada su información personal dentro del sistema.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El nuevo nombre no puede ser idéntico al nombre actual.

**Flujo Principal:**
1. El usuario accede a la opción de editar perfil desde `/perfil`.
2. El sistema muestra el formulario con el nombre actual precargado.
3. El usuario modifica el nombre y envía el formulario.
4. El sistema valida el nuevo nombre.
5. El sistema verifica que el nuevo nombre sea diferente al actual.
6. El sistema actualiza el campo `name` y el campo `updatedAt` en la base de datos.
7. El sistema retorna HTTP 200 con los datos actualizados.
8. El frontend actualiza la vista del perfil sin recargar la página.

**Flujos Alternativos:**
- **FA-006-A:** Si el nombre es idéntico al actual → retorna `NAME_UNCHANGED` (HTTP 422).
- **FA-006-B:** Si el nombre no cumple las validaciones → retorna `INVALID_NAME` (HTTP 422).

**Validaciones:**
- Nombre completo: requerido, mínimo 3 caracteres, máximo 100, sin números ni caracteres especiales excepto espacios, guiones y apóstrofes.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INVALID_NAME` | El nombre no cumple las validaciones | 422 |
| `NAME_UNCHANGED` | El nuevo nombre es idéntico al actual | 422 |
| `UNAUTHORIZED` | Token inválido o ausente | 401 |

**Restricciones:**
- Solo el nombre puede modificarse. El correo electrónico es inmutable.
- El campo `updatedAt` se actualiza automáticamente en cada modificación.

**Criterios de Aceptación:**
- Dado un nombre válido y diferente → el sistema actualiza y retorna HTTP 200.
- Dado un nombre idéntico al actual → retorna HTTP 422.
- El cambio se refleja inmediatamente en todas las vistas del sistema.

---

### RF-007 — Cambiar Contraseña

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-007 |
| **Nombre** | Cambio de contraseña del usuario autenticado |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002 |

**Descripción:**
El sistema debe permitir al usuario autenticado cambiar su contraseña actual proporcionando la contraseña actual como verificación de identidad, la nueva contraseña y su confirmación. Tras el cambio exitoso, todos los refresh tokens activos del usuario son revocados, forzando el relogin en todos los dispositivos.

**Objetivo:**
Permitir al usuario actualizar su contraseña de forma segura, garantizando que conoce la contraseña actual y que todos los dispositivos activos son notificados del cambio.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El usuario debe conocer su contraseña actual.

**Flujo Principal:**
1. El usuario accede a la opción "Cambiar contraseña" desde `/perfil`.
2. El usuario ingresa la contraseña actual, la nueva contraseña y su confirmación.
3. El sistema verifica que la contraseña actual sea correcta comparándola con el hash almacenado.
4. El sistema valida que la nueva contraseña cumpla los criterios de seguridad.
5. El sistema valida que la nueva contraseña y su confirmación sean idénticas.
6. El sistema valida que la nueva contraseña sea diferente a la actual.
7. El sistema genera un nuevo hash bcrypt de la nueva contraseña.
8. El sistema actualiza la contraseña en la base de datos.
9. El sistema revoca todos los refresh tokens activos del usuario.
10. El sistema retorna HTTP 200 y cierra la sesión actual.
11. El frontend redirige al login con mensaje informativo.

**Flujos Alternativos:**
- **FA-007-A:** Contraseña actual incorrecta → `INCORRECT_CURRENT_PASSWORD` (HTTP 401).
- **FA-007-B:** Nueva contraseña igual a la actual → `SAME_PASSWORD` (HTTP 422).
- **FA-007-C:** Nueva contraseña no cumple criterios → `WEAK_PASSWORD` (HTTP 422).
- **FA-007-D:** Confirmación no coincide → `PASSWORD_MISMATCH` (HTTP 422).

**Validaciones:**
- Contraseña actual: requerida.
- Nueva contraseña: mínimo 8 caracteres, máximo 72, con mayúscula, minúscula, número y carácter especial.
- Confirmación: idéntica a la nueva contraseña.
- Nueva contraseña ≠ contraseña actual.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INCORRECT_CURRENT_PASSWORD` | La contraseña actual es incorrecta | 401 |
| `SAME_PASSWORD` | La nueva contraseña es igual a la actual | 422 |
| `WEAK_PASSWORD` | La nueva contraseña no cumple los criterios | 422 |
| `PASSWORD_MISMATCH` | La confirmación no coincide | 422 |

**Restricciones:**
- La revocación de todos los refresh tokens es obligatoria tras el cambio de contraseña.
- El sistema no debe revelar detalles del hash almacenado en ningún mensaje de error.

**Criterios de Aceptación:**
- Dado contraseña actual correcta y nueva contraseña válida → contraseña actualizada y sesión cerrada en todos los dispositivos.
- Dado contraseña actual incorrecta → HTTP 401 sin actualizar nada.
- Tras el cambio → todos los refresh tokens del usuario quedan revocados en la base de datos.

---

### Módulo de Movimientos Financieros

---

### RF-008 — Registrar Movimiento con Lenguaje Natural

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-008 |
| **Nombre** | Registro de movimiento financiero mediante texto en lenguaje natural |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002, RF-009 |

**Descripción:**
El sistema debe permitir al usuario registrar un movimiento financiero escribiendo una descripción en lenguaje natural en español. El sistema envía el texto al modelo `gemini-2.0-flash`, el cual extrae el monto, tipo (gasto/ingreso), categoría y descripción estructurada. El usuario confirma o edita los datos antes de persistirlos.

**Objetivo:**
Reducir la fricción en el registro de movimientos eliminando formularios complejos, permitiendo al usuario describir transacciones de forma natural.

**Actor involucrado:** Usuario Registrado, Sistema IA, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El servicio de Gemini API debe estar disponible.

**Flujo Principal:**
1. El usuario escribe una descripción en lenguaje natural (ej: *"gasté 45 soles en el supermercado"*).
2. El usuario envía el texto.
3. El sistema valida que el texto no esté vacío y no exceda 500 caracteres.
4. El sistema construye un prompt estructurado y lo envía al modelo `gemini-2.0-flash`.
5. El modelo retorna un JSON con: `tipo`, `monto`, `moneda`, `categoria`, `descripcion`, `fecha`.
6. El sistema valida el JSON retornado.
7. El sistema presenta los datos extraídos en un modal de confirmación.
8. El usuario confirma o edita los datos.
9. El sistema persiste el movimiento en la base de datos.
10. El sistema retorna HTTP 201 con los datos del movimiento creado.

**Flujos Alternativos:**
- **FA-008-A:** Texto sin información financiera → notifica al usuario, no persiste datos.
- **FA-008-B:** Gemini API no disponible → activa formulario manual de respaldo.
- **FA-008-C:** JSON retornado por IA inválido → activa formulario manual y registra error en logs.
- **FA-008-D:** Usuario edita datos en el modal → persiste los datos editados, no los de la IA.

**Validaciones:**
- Texto: requerido, mínimo 5 caracteres, máximo 500.
- Monto extraído: número positivo mayor a 0, máximo 999,999.99.
- Tipo: exactamente `"gasto"` o `"ingreso"`.
- Categoría: debe pertenecer al catálogo definido en RF-009.
- Fecha: si no se menciona, se asume la fecha y hora actual del servidor.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `EMPTY_INPUT` | El texto está vacío | 422 |
| `INPUT_TOO_LONG` | El texto supera 500 caracteres | 422 |
| `AI_LOW_CONFIDENCE` | La IA no pudo interpretar el texto | 422 |
| `AI_SERVICE_UNAVAILABLE` | Gemini API no disponible | 503 |
| `INVALID_AI_RESPONSE` | Respuesta de IA con formato incorrecto | 500 |

**Restricciones:**
- El sistema nunca persiste un movimiento sin confirmación explícita del usuario.
- El monto siempre se almacena en Soles peruanos (PEN).
- La comunicación con Gemini API se realiza exclusivamente desde el backend.

**Criterios de Aceptación:**
- Dado *"gasté 50 soles en almuerzo"* → extrae tipo=gasto, monto=50, categoría=Alimentación.
- Dado *"me pagaron 1500 soles de sueldo"* → extrae tipo=ingreso, monto=1500, categoría=Salario.
- Dado texto sin información financiera → no persiste datos y notifica al usuario.

---

### RF-009 — Catálogo de Categorías de Movimientos

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-009 |
| **Nombre** | Gestión del catálogo de categorías para clasificación de movimientos |
| **Prioridad** | ALTA |
| **Dependencias** | Ninguna |

**Descripción:**
El sistema debe mantener un catálogo predefinido de categorías para clasificar los movimientos financieros, utilizado tanto por el sistema de IA como por el usuario en la categorización manual.

**Objetivo:**
Proveer una taxonomía estándar y consistente para la clasificación de movimientos financieros que garantice la coherencia de los datos y la utilidad de las estadísticas del dashboard.

**Actor involucrado:** Sistema, Usuario Registrado.

**Precondiciones:**
- Las categorías predefinidas deben existir en la base de datos desde el seed inicial del sistema.

**Flujo Principal:**
1. El sistema carga las categorías predefinidas al inicializar la base de datos (seed).
2. El usuario puede consultar las categorías disponibles al registrar o editar un movimiento.
3. El usuario puede crear categorías personalizadas adicionales con nombre único por usuario.

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

**Validaciones:**
- Nombre de categoría personalizada: requerido, mínimo 3 caracteres, máximo 50, único por usuario.
- Las categorías predefinidas del sistema no pueden ser eliminadas ni modificadas por el usuario.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `CATEGORY_NAME_DUPLICATE` | El nombre de categoría ya existe para el usuario | 409 |
| `CATEGORY_NOT_FOUND` | La categoría especificada no existe | 404 |
| `SYSTEM_CATEGORY_IMMUTABLE` | Intento de modificar una categoría del sistema | 403 |

**Restricciones:**
- La IA solo puede asignar categorías existentes en el catálogo del sistema.
- Eliminar una categoría personalizada reasigna sus movimientos a "Otros gastos" u "Otros ingresos".

**Criterios de Aceptación:**
- Las categorías predefinidas existen desde el seed inicial sin requerir acción del usuario.
- El usuario puede crear categorías personalizadas con nombre único.
- Intentar eliminar una categoría del sistema retorna HTTP 403.

---

### RF-010 — Ver Detalle de Movimiento Individual

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-010 |
| **Nombre** | Visualización del detalle completo de un movimiento financiero |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002, RF-008 |

**Descripción:**
El sistema debe permitir al usuario visualizar el detalle completo de un movimiento financiero individual, incluyendo todos sus campos: descripción original en lenguaje natural, descripción estructurada generada por la IA, monto, categoría, tipo, fecha de transacción, fecha de registro en el sistema y fecha de última modificación.

**Objetivo:**
Permitir al usuario revisar la información completa de un movimiento específico, incluyendo el texto original con el que fue registrado y los datos interpretados por la IA, para verificar la exactitud del registro.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El movimiento debe pertenecer al usuario autenticado.
- El movimiento no debe haber sido eliminado (soft delete).

**Flujo Principal:**
1. El usuario selecciona un movimiento del historial.
2. El cliente realiza una petición a `GET /api/movements/:id`.
3. El sistema verifica el access token.
4. El sistema verifica que el movimiento existe y pertenece al usuario autenticado.
5. El sistema retorna HTTP 200 con todos los campos del movimiento.
6. El frontend renderiza la vista de detalle.

**Flujos Alternativos:**
- **FA-010-A:** El movimiento no existe → `MOVEMENT_NOT_FOUND` (HTTP 404).
- **FA-010-B:** El movimiento pertenece a otro usuario → `FORBIDDEN` (HTTP 403).
- **FA-010-C:** El movimiento fue eliminado (soft delete) → `MOVEMENT_NOT_FOUND` (HTTP 404).

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `MOVEMENT_NOT_FOUND` | El movimiento no existe o fue eliminado | 404 |
| `FORBIDDEN` | El movimiento pertenece a otro usuario | 403 |
| `UNAUTHORIZED` | Token inválido o ausente | 401 |

**Restricciones:**
- Un usuario solo puede ver el detalle de sus propios movimientos.
- Los movimientos con `deletedAt` poblado retornan HTTP 404 como si no existieran.

**Criterios de Aceptación:**
- Dado un `id` válido y propio → retorna todos los campos del movimiento.
- Dado un `id` de movimiento de otro usuario → retorna HTTP 403.
- Dado un `id` de movimiento eliminado → retorna HTTP 404.

---

### RF-011 — Editar Movimiento Financiero

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-011 |
| **Nombre** | Modificación de un movimiento financiero existente |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-008, RF-010 |

**Descripción:**
El sistema debe permitir al usuario editar los campos de un movimiento financiero previamente registrado. Los campos editables son: monto, descripción, categoría, tipo y fecha de transacción. El campo `updatedAt` se actualiza automáticamente.

**Objetivo:**
Permitir la corrección de errores en movimientos registrados, garantizando que el historial financiero refleje información precisa.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El movimiento debe pertenecer al usuario autenticado.
- El movimiento no debe tener más de 90 días de antigüedad.

**Flujo Principal:**
1. El usuario selecciona "Editar" en un movimiento del historial.
2. El sistema carga el formulario con los datos actuales del movimiento.
3. El usuario modifica los campos deseados.
4. El sistema valida los nuevos datos.
5. El sistema actualiza el registro y el campo `updatedAt`.
6. El sistema retorna HTTP 200 con los datos actualizados.
7. El frontend actualiza la vista sin recargar la página.

**Flujos Alternativos:**
- **FA-011-A:** Movimiento de otro usuario → `FORBIDDEN` (HTTP 403).
- **FA-011-B:** Movimiento mayor a 90 días → `MOVEMENT_TOO_OLD` (HTTP 422).
- **FA-011-C:** Datos inválidos → `VALIDATION_ERROR` (HTTP 422) con detalle de campos.

**Validaciones:**
- Monto: número positivo, mayor a 0, máximo 999,999.99.
- Tipo: exactamente `"gasto"` o `"ingreso"`.
- Categoría: debe pertenecer al catálogo del usuario.
- Fecha: no puede ser futura.
- Descripción: máximo 255 caracteres.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `MOVEMENT_NOT_FOUND` | El movimiento no existe | 404 |
| `FORBIDDEN` | El movimiento es de otro usuario | 403 |
| `MOVEMENT_TOO_OLD` | El movimiento supera los 90 días | 422 |
| `VALIDATION_ERROR` | Datos inválidos en los campos | 422 |

**Restricciones:**
- No se permite editar movimientos con más de 90 días de antigüedad.
- La edición actualiza el balance del dashboard automáticamente.

**Criterios de Aceptación:**
- Dado un movimiento propio válido → actualiza correctamente y retorna HTTP 200.
- Dado un movimiento mayor a 90 días → retorna HTTP 422.
- El balance del dashboard refleja el cambio inmediatamente.

---

### RF-012 — Eliminar Movimiento Financiero

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-012 |
| **Nombre** | Eliminación lógica de un movimiento financiero |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-008, RF-010 |

**Descripción:**
El sistema debe permitir al usuario eliminar un movimiento financiero. La eliminación es de tipo lógico (soft delete), marcando el registro con la fecha de eliminación en el campo `deletedAt` sin borrarlo físicamente de la base de datos, preservando así el historial para auditoría.

**Objetivo:**
Permitir al usuario remover movimientos incorrectos de todas sus vistas activas, preservando la integridad del historial de datos para fines de auditoría y trazabilidad.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- El movimiento debe pertenecer al usuario autenticado.
- El movimiento no debe haber sido previamente eliminado.

**Flujo Principal:**
1. El usuario selecciona "Eliminar" en un movimiento.
2. El sistema muestra un diálogo de confirmación con el detalle del movimiento.
3. El usuario confirma la eliminación.
4. El sistema realiza el soft delete: establece `deletedAt = NOW()`.
5. El movimiento desaparece de todas las vistas del usuario.
6. El sistema retorna HTTP 200.
7. El frontend actualiza el historial y el dashboard.

**Flujos Alternativos:**
- **FA-012-A:** El usuario cancela en el diálogo → no se realiza ninguna operación.
- **FA-012-B:** Movimiento de otro usuario → `FORBIDDEN` (HTTP 403).

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `MOVEMENT_NOT_FOUND` | El movimiento no existe o ya fue eliminado | 404 |
| `FORBIDDEN` | El movimiento es de otro usuario | 403 |

**Restricciones:**
- La eliminación es siempre lógica. Nunca se borran registros físicamente.
- El movimiento eliminado es excluido de todos los cálculos del dashboard.

**Criterios de Aceptación:**
- Tras la eliminación → el movimiento desaparece del historial y del dashboard.
- El registro permanece en la base de datos con `deletedAt` poblado.
- El balance del dashboard se actualiza correctamente tras la eliminación.

---

### RF-013 — Historial de Movimientos con Filtros

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-013 |
| **Nombre** | Listado, filtrado y paginación del historial de movimientos |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002, RF-008 |

**Descripción:**
El sistema debe proveer una vista de historial que liste todos los movimientos financieros del usuario con capacidades de filtrado por rango de fechas, tipo de movimiento y categoría. El historial debe estar paginado para garantizar el rendimiento ante grandes volúmenes de datos.

**Objetivo:**
Permitir al usuario navegar, buscar y filtrar su historial financiero completo de forma eficiente y sin degradación del rendimiento.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.

**Flujo Principal:**
1. El usuario accede a `/movimientos`.
2. El sistema carga los movimientos del mes en curso, ordenados por fecha descendente, con paginación de 20 registros por página.
3. El usuario aplica filtros opcionales: rango de fechas, tipo (gasto/ingreso/todos), categoría.
4. El sistema retorna los movimientos filtrados con paginación.
5. Cada movimiento muestra: fecha, descripción, categoría, tipo, monto.

**Validaciones:**
- Fecha de inicio no puede ser posterior a la fecha de fin.
- Rango máximo de fechas: 12 meses.
- Paginación: máximo 20 registros por página.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INVALID_DATE_RANGE` | La fecha de inicio es posterior a la de fin | 422 |
| `DATE_RANGE_TOO_WIDE` | El rango supera 12 meses | 422 |
| `INVALID_PAGE` | Número de página inválido | 422 |

**Criterios de Aceptación:**
- Los filtros funcionan de forma combinada simultáneamente.
- La paginación no repite ni omite registros.
- Los movimientos eliminados (soft delete) no aparecen en el historial.

---

### Módulo de Dashboard

---

### RF-014 — Dashboard Principal

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-014 |
| **Nombre** | Visualización del resumen financiero en el dashboard principal |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002, RF-008 |

**Descripción:**
El sistema debe presentar al usuario autenticado un dashboard con el resumen financiero del mes en curso: balance total, total de ingresos, total de gastos, gráfica de distribución por categoría (torta), gráfica de evolución diaria (barras/líneas) y los últimos 5 movimientos registrados.

**Objetivo:**
Proveer al usuario una vista consolidada e inmediata de su situación financiera personal, facilitando la toma de decisiones basada en datos visuales.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.

**Flujo Principal:**
1. El usuario accede a `/dashboard`.
2. El sistema verifica el access token.
3. El sistema consulta todos los movimientos del usuario en el mes en curso.
4. El sistema calcula: total ingresos, total gastos, balance = ingresos - gastos.
5. El sistema agrupa gastos por categoría para la gráfica de torta.
6. El sistema agrupa movimientos por día para la gráfica de evolución.
7. El sistema obtiene los últimos 5 movimientos.
8. El sistema retorna todos los datos en una sola respuesta JSON optimizada.
9. El frontend renderiza el dashboard.

**Validaciones:**
- Si el usuario no tiene movimientos, el dashboard muestra valores en cero con mensaje de bienvenida.
- Balance negativo (gastos > ingresos) se muestra en color rojo.
- Balance positivo se muestra en color verde.

**Restricciones:**
- El dashboard solo muestra datos del usuario autenticado.
- Todos los montos se muestran en Soles peruanos (S/) con dos decimales.
- La carga inicial no debe superar los 2 segundos.

**Criterios de Aceptación:**
- El balance es matemáticamente correcto.
- Las gráficas muestran correctamente los datos del mes en curso.
- Los datos se actualizan tras registrar un nuevo movimiento sin recargar la página.

---

### Módulo de Metas de Ahorro

---

### RF-015 — Crear Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-015 |
| **Nombre** | Creación de una nueva meta de ahorro |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002 |

**Descripción:**
El sistema debe permitir al usuario crear una meta de ahorro especificando nombre, monto objetivo, fecha límite y monto inicial aportado opcional. La meta queda activa desde su creación hasta que sea completada o archivada.

**Objetivo:**
Proveer al usuario una herramienta de planificación financiera que le permita definir y monitorear objetivos de ahorro concretos con plazos definidos.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.

**Flujo Principal:**
1. El usuario accede a `/metas` y selecciona "Nueva meta".
2. El usuario completa: nombre, monto objetivo, fecha límite y monto inicial (opcional).
3. El sistema valida todos los campos.
4. El sistema persiste la meta con estado `ACTIVA` y `progreso = monto inicial / monto objetivo * 100`.
5. El sistema retorna HTTP 201 con los datos de la meta creada.

**Validaciones:**
- Nombre: requerido, mínimo 3 caracteres, máximo 80.
- Monto objetivo: requerido, número positivo, máximo 999,999.99 PEN.
- Fecha límite: requerida, debe ser una fecha futura.
- Monto inicial: opcional, no puede superar el monto objetivo.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `INVALID_GOAL_NAME` | Nombre inválido | 422 |
| `INVALID_AMOUNT` | Monto fuera de rango | 422 |
| `INVALID_DEADLINE` | Fecha límite en el pasado | 422 |
| `INITIAL_EXCEEDS_GOAL` | Monto inicial supera el objetivo | 422 |

**Criterios de Aceptación:**
- Dado datos válidos → meta creada con estado ACTIVA y progreso correcto.
- Dado fecha límite en el pasado → retorna HTTP 422.
- El usuario puede tener múltiples metas activas simultáneamente.

---

### RF-016 — Ver Progreso de Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-016 |
| **Nombre** | Visualización del progreso de una meta de ahorro |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-015 |

**Descripción:**
El sistema debe permitir al usuario visualizar el progreso de cada meta de ahorro activa, mostrando el monto acumulado, el monto objetivo, el porcentaje de avance mediante una barra de progreso visual, los días restantes para la fecha límite y el monto diario sugerido para alcanzar la meta a tiempo.

**Objetivo:**
Proveer retroalimentación visual clara sobre el avance del usuario hacia sus objetivos de ahorro, incluyendo proyecciones calculadas automáticamente.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- La meta debe pertenecer al usuario autenticado.

**Flujo Principal:**
1. El usuario accede a `/metas`.
2. El sistema consulta todas las metas activas del usuario.
3. El sistema calcula para cada meta: porcentaje de avance, días restantes, monto diario sugerido.
4. El sistema retorna HTTP 200 con los datos calculados.
5. El frontend renderiza las barras de progreso y métricas.

**Criterios de Aceptación:**
- El porcentaje de avance es matemáticamente correcto.
- Al alcanzar el 100% → el sistema muestra notificación de meta completada.
- Los días restantes se calculan desde la fecha actual hasta la fecha límite.
- El monto diario sugerido = (monto objetivo - monto acumulado) / días restantes.

---

### RF-017 — Agregar Aporte a Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-017 |
| **Nombre** | Registro de un aporte económico a una meta de ahorro activa |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-015, RF-016 |

**Descripción:**
El sistema debe permitir al usuario agregar aportes monetarios a una meta de ahorro activa. Cada aporte incrementa el monto acumulado de la meta. Si el aporte completa o supera el monto objetivo, la meta cambia automáticamente a estado `COMPLETADA`.

**Objetivo:**
Permitir al usuario registrar el progreso real de sus ahorros hacia una meta específica, manteniendo el historial de aportes para trazabilidad.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- La meta debe estar en estado `ACTIVA`.
- La meta debe pertenecer al usuario.

**Flujo Principal:**
1. El usuario selecciona una meta activa y elige "Agregar aporte".
2. El usuario ingresa el monto del aporte.
3. El sistema valida el monto.
4. El sistema suma el aporte al monto acumulado de la meta.
5. El sistema verifica si el monto acumulado >= monto objetivo.
6. Si se completó la meta → el sistema cambia el estado a `COMPLETADA`.
7. El sistema persiste el aporte y retorna HTTP 200 con el progreso actualizado.

**Validaciones:**
- Monto del aporte: requerido, número positivo, mayor a 0.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `GOAL_NOT_ACTIVE` | La meta no está en estado ACTIVA | 422 |
| `INVALID_AMOUNT` | Monto inválido | 422 |
| `GOAL_NOT_FOUND` | La meta no existe | 404 |

**Criterios de Aceptación:**
- Dado aporte válido → monto acumulado incrementa y barra de progreso se actualiza.
- Si el aporte completa la meta → estado cambia a COMPLETADA automáticamente.

---

### RF-018 — Editar Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-018 |
| **Nombre** | Modificación de una meta de ahorro existente |
| **Prioridad** | BAJA |
| **Dependencias** | RF-015 |

**Descripción:**
El sistema debe permitir al usuario modificar el nombre, monto objetivo y fecha límite de una meta de ahorro en estado `ACTIVA`. No se permite editar metas en estado `COMPLETADA` o `ARCHIVADA`.

**Objetivo:**
Permitir al usuario ajustar sus metas de ahorro ante cambios en sus circunstancias financieras o prioridades personales.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- La meta debe estar en estado `ACTIVA`.
- La meta debe pertenecer al usuario.

**Flujo Principal:**
1. El usuario selecciona "Editar" en una meta activa.
2. El sistema carga el formulario con los datos actuales.
3. El usuario modifica nombre, monto objetivo o fecha límite.
4. El sistema valida los nuevos datos.
5. El sistema verifica que el nuevo monto objetivo no sea menor al monto ya acumulado.
6. El sistema actualiza la meta y retorna HTTP 200.

**Validaciones:**
- Nombre: mínimo 3 caracteres, máximo 80.
- Nuevo monto objetivo: debe ser mayor o igual al monto ya acumulado.
- Nueva fecha límite: debe ser una fecha futura.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `GOAL_NOT_ACTIVE` | Solo se pueden editar metas activas | 422 |
| `AMOUNT_BELOW_ACCUMULATED` | El nuevo objetivo es menor al monto acumulado | 422 |
| `INVALID_DEADLINE` | La nueva fecha límite es en el pasado | 422 |

**Criterios de Aceptación:**
- Dado datos válidos → meta actualizada y progreso recalculado correctamente.
- Intentar editar meta completada → retorna HTTP 422.
- Nuevo monto objetivo menor al acumulado → retorna HTTP 422.

---

### RF-019 — Eliminar Meta de Ahorro

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-019 |
| **Nombre** | Eliminación lógica de una meta de ahorro |
| **Prioridad** | BAJA |
| **Dependencias** | RF-015 |

**Descripción:**
El sistema debe permitir al usuario eliminar una meta de ahorro en estado `ACTIVA`. La eliminación es lógica (soft delete), preservando el historial de aportes en la base de datos. Las metas completadas no pueden eliminarse, solo archivarse.

**Objetivo:**
Permitir al usuario remover metas que ya no son relevantes para su planificación financiera, sin destruir el historial de aportes asociado.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.
- La meta debe estar en estado `ACTIVA`.
- La meta debe pertenecer al usuario.

**Flujo Principal:**
1. El usuario selecciona "Eliminar" en una meta.
2. El sistema muestra un diálogo de confirmación advirtiendo que se perderá la meta.
3. El usuario confirma.
4. El sistema realiza el soft delete de la meta (`deletedAt = NOW()`).
5. La meta desaparece de la vista del usuario.
6. El sistema retorna HTTP 200.

**Flujos Alternativos:**
- **FA-019-A:** Meta completada → `GOAL_COMPLETED_IMMUTABLE` (HTTP 422). Las metas completadas solo pueden archivarse.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `GOAL_NOT_FOUND` | La meta no existe o ya fue eliminada | 404 |
| `GOAL_COMPLETED_IMMUTABLE` | Las metas completadas no pueden eliminarse | 422 |
| `FORBIDDEN` | La meta pertenece a otro usuario | 403 |

**Criterios de Aceptación:**
- Dado meta activa propia → soft delete exitoso y desaparece de la vista.
- Intentar eliminar meta completada → retorna HTTP 422.
- El historial de aportes de la meta eliminada se preserva en la base de datos.

---

### RF-020 — Archivar Meta Completada

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-020 |
| **Nombre** | Archivado de una meta de ahorro completada |
| **Prioridad** | BAJA |
| **Dependencias** | RF-017 |

**Descripción:**
El sistema debe permitir al usuario archivar una meta de ahorro en estado `COMPLETADA`. Las metas archivadas se mueven a una sección de historial de metas y no aparecen en la vista principal de metas activas.

**Objetivo:**
Proveer un mecanismo para que el usuario mantenga organizada su lista de metas activas, moviendo las completadas a un historial sin eliminar su registro.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- La meta debe estar en estado `COMPLETADA`.
- La meta debe pertenecer al usuario autenticado.

**Flujo Principal:**
1. El usuario selecciona "Archivar" en una meta completada.
2. El sistema cambia el estado de la meta a `ARCHIVADA`.
3. La meta desaparece de la vista principal y aparece en el historial de metas.
4. El sistema retorna HTTP 200.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `GOAL_NOT_COMPLETED` | Solo se pueden archivar metas completadas | 422 |
| `GOAL_NOT_FOUND` | La meta no existe | 404 |

**Criterios de Aceptación:**
- Dado meta completada → estado cambia a ARCHIVADA y desaparece de la vista principal.
- Intentar archivar meta activa → retorna HTTP 422.

---

### RF-021 — Resumen de Metas en Dashboard

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-021 |
| **Nombre** | Visualización del resumen de metas activas en el dashboard |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-014, RF-015, RF-016 |

**Descripción:**
El dashboard principal debe incluir una sección que muestre un resumen de las metas de ahorro activas del usuario, con la barra de progreso de cada meta, el porcentaje de avance y los días restantes. Se muestran máximo 3 metas en el dashboard, con un enlace para ver todas.

**Objetivo:**
Proveer visibilidad inmediata del estado de las metas de ahorro en el punto de entrada principal de la aplicación, sin requerir navegación adicional.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado.

**Criterios de Aceptación:**
- El dashboard muestra máximo 3 metas activas ordenadas por fecha límite ascendente.
- Si no hay metas activas → muestra mensaje invitando a crear la primera meta.
- El enlace "Ver todas" redirige a `/metas`.

---

### RF-022 — Cierre de Sesión en Todos los Dispositivos

| Campo | Detalle |
|-------|---------|
| **Identificador** | RF-022 |
| **Nombre** | Revocación de todas las sesiones activas del usuario |
| **Prioridad** | MEDIA |
| **Dependencias** | RF-002, RF-007 |

**Descripción:**
El sistema debe permitir al usuario cerrar sesión en todos sus dispositivos activos simultáneamente desde la vista de perfil. Esta operación revoca todos los refresh tokens activos asociados al usuario en la base de datos, forzando el relogin en cualquier dispositivo donde tenga una sesión activa.

**Objetivo:**
Proveer al usuario control total sobre sus sesiones activas, especialmente útil en situaciones de seguridad como pérdida o robo del dispositivo.

**Actor involucrado:** Usuario Registrado, Sistema.

**Precondiciones:**
- El usuario debe estar autenticado en al menos un dispositivo.

**Flujo Principal:**
1. El usuario accede a `/perfil` y selecciona "Cerrar sesión en todos los dispositivos".
2. El sistema muestra un diálogo de confirmación.
3. El usuario confirma.
4. El sistema revoca todos los refresh tokens activos del usuario en la base de datos.
5. El sistema cierra la sesión actual del usuario.
6. El sistema retorna HTTP 200 y redirige al login.

**Criterios de Aceptación:**
- Tras la operación → todos los refresh tokens del usuario quedan con estado revocado.
- Cualquier intento de renovar access token desde cualquier dispositivo retorna HTTP 401.
- El usuario actual es redirigido al login inmediatamente.

---

## 3. Requerimientos No Funcionales

> Los requerimientos no funcionales definen **cómo se comporta el sistema**, en contraposición a los funcionales que definen **qué hace el sistema**. Se clasifican en subcategorías siguiendo la norma **ISO/IEC 25010** de calidad del software, lo que facilita la trazabilidad y revisión por área de calidad.

### 3.1 Requerimientos Generales

### RNF-001 — Arquitectura del Sistema

| Campo | Detalle |
|-------|---------|
| **Identificador** | RNF-001 |
| **Nombre** | Separación de responsabilidades en arquitectura por capas |
| **Prioridad** | ALTA |

**Descripción:**
El sistema debe implementarse siguiendo una arquitectura en capas claramente separadas: presentación (Next.js), aplicación/API (Express), dominio (servicios y lógica de negocio) y datos (Prisma + PostgreSQL). Ninguna capa accede directamente a una capa no adyacente. El frontend nunca accede directamente a la base de datos.

**Criterios de Aceptación:**
- El frontend se comunica con el backend únicamente mediante peticiones HTTP a la API REST.
- La lógica de negocio reside exclusivamente en la capa de servicios del backend.
- Los controladores no contienen lógica de negocio, solo orquestan llamadas a servicios.
- Las consultas a la base de datos están encapsuladas en la capa de Prisma.

---

### RNF-002 — Estándares de Código

| Campo | Detalle |
|-------|---------|
| **Identificador** | RNF-002 |
| **Nombre** | Calidad y consistencia del código fuente |
| **Prioridad** | ALTA |

**Descripción:**
Todo el código fuente debe estar escrito en TypeScript con tipado estricto (`strict: true`). El proyecto debe contar con ESLint y Prettier configurados. No se permite el uso del tipo `any`. Todas las funciones deben tener tipos de retorno explícitos.

**Criterios de Aceptación:**
- El compilador TypeScript no arroja errores con `strict: true`.
- ESLint no reporta advertencias ni errores en código de producción.
- No existe ningún `any` implícito o explícito en el código fuente.

---

### RNF-003 — Pruebas Unitarias y Cobertura de Código

| Campo | Detalle |
|-------|---------|
| **Identificador** | RNF-003 |
| **Nombre** | Suite de pruebas unitarias con reporte de cobertura mediante Vitest |
| **Prioridad** | ALTA |

**Descripción:**
El sistema debe contar con una suite completa de pruebas unitarias implementadas con Vitest, cubriendo todos los servicios de la capa de negocio, middlewares de autenticación, funciones de validación y utilidades del sistema. El reporte de cobertura debe ser generado por Istanbul en formato HTML y texto. Las dependencias externas (base de datos, Gemini API) deben ser mockeadas en todos los tests.

**Restricciones:**
- Las pruebas deben ser independientes entre sí (sin estado compartido).
- El reporte de cobertura HTML debe estar disponible en `./coverage/index.html`.
- Cada servicio principal debe tener al menos un test para el flujo feliz y uno para el flujo de error.

**Criterios de Aceptación:**
- El comando `vitest run --coverage` ejecuta exitosamente sin pruebas fallidas.
- El reporte HTML de cobertura es generado y visualizable en el navegador.
- Los mocks de dependencias externas funcionan correctamente en todos los tests.

---

### 3.2 Requerimientos de Seguridad

### RS-001 — Protección de Endpoints mediante JWT

| Campo | Detalle |
|-------|---------|
| **Identificador** | RS-001 |
| **Nombre** | Autenticación basada en JWT para recursos protegidos |
| **Prioridad** | ALTA |
| **Dependencias** | RF-002, RF-003 |

**Descripción:**
Todos los endpoints que acceden a datos de usuario deben estar protegidos mediante un middleware que valide el access token JWT en cada petición. El middleware verifica la firma del token, su expiración y que el usuario asociado exista en la base de datos.

**Manejo de Errores:**

| Código Error | Descripción | HTTP Status |
|-------------|-------------|-------------|
| `MISSING_TOKEN` | Header Authorization ausente | 401 |
| `INVALID_TOKEN` | Token con firma inválida | 401 |
| `TOKEN_EXPIRED` | Token expirado | 401 |
| `USER_NOT_FOUND` | Usuario del token no existe | 401 |

**Criterios de Aceptación:**
- Cualquier petición sin token válido a un endpoint protegido retorna HTTP 401.
- El payload del token nunca contiene la contraseña ni datos sensibles.

---

### RS-002 — Protección contra Inyección SQL

| Campo | Detalle |
|-------|---------|
| **Identificador** | RS-002 |
| **Nombre** | Prevención de inyección SQL mediante ORM parametrizado |
| **Prioridad** | ALTA |

**Descripción:**
El sistema debe utilizar exclusivamente Prisma ORM para todas las interacciones con la base de datos. Está prohibido el uso de queries SQL crudas con interpolación de strings de entrada del usuario.

**Criterios de Aceptación:**
- No existe ninguna query SQL construida mediante concatenación de strings del usuario.
- Todo acceso a la base de datos se realiza mediante el cliente Prisma tipado.

---

### RS-003 — Protección contra XSS y CSRF

| Campo | Detalle |
|-------|---------|
| **Identificador** | RS-003 |
| **Nombre** | Mitigación de ataques XSS y CSRF |
| **Prioridad** | ALTA |

**Descripción:**
El sistema debe implementar headers de seguridad HTTP mediante `helmet.js` (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options), sanitización de todos los inputs de usuario y uso de cookies con atributo `SameSite=Strict`.

**Criterios de Aceptación:**
- El header `Content-Security-Policy` está presente en todas las respuestas HTTP.
- Los inputs del usuario son sanitizados antes de ser procesados o almacenados.
- La cookie del refresh token tiene los atributos `HttpOnly`, `Secure` y `SameSite=Strict`.

---

### RS-004 — Cifrado de Datos Sensibles

| Campo | Detalle |
|-------|---------|
| **Identificador** | RS-004 |
| **Nombre** | Almacenamiento seguro de credenciales y tokens |
| **Prioridad** | ALTA |

**Descripción:**
Las contraseñas se almacenan con bcrypt (mínimo 12 rondas). Los refresh tokens se almacenan hasheados (SHA-256). Las claves de API se gestionan exclusivamente mediante variables de entorno y nunca deben estar en el código fuente ni en el repositorio.

**Criterios de Aceptación:**
- El archivo `.env` está incluido en `.gitignore`.
- Las contraseñas en la base de datos son hashes bcrypt irreversibles.
- No existen credenciales hardcodeadas en el código fuente.

---

## 5. Requerimientos de Rendimiento

### RP-001 — Tiempo de Respuesta de la API

| Campo | Detalle |
|-------|---------|
| **Identificador** | RP-001 |
| **Nombre** | Latencia máxima aceptable para endpoints de la API REST |
| **Prioridad** | ALTA |

**Descripción:**
Los endpoints sin llamadas a servicios externos deben responder en máximo 500ms. Los endpoints que invocan la Gemini API tienen un máximo aceptable de 5 segundos.

**Criterios de Aceptación:**
- `GET /api/dashboard` responde en menos de 500ms con hasta 1,000 movimientos.
- `POST /api/movements/parse` responde en menos de 5 segundos incluyendo la llamada a Gemini API.
- `POST /api/auth/login` responde en menos de 1 segundo.

---

### RP-002 — Optimización de Consultas a Base de Datos

| Campo | Detalle |
|-------|---------|
| **Identificador** | RP-002 |
| **Nombre** | Indexación y optimización de consultas frecuentes |
| **Prioridad** | MEDIA |

**Descripción:**
Las tablas deben contar con índices en las columnas usadas frecuentemente en cláusulas `WHERE` y `ORDER BY`: índice en `movements.userId`, índice en `movements.createdAt`, índice compuesto en `movements.userId + movements.createdAt`, e índice en `refresh_tokens.token`.

**Criterios de Aceptación:**
- Las consultas de historial ejecutan en menos de 100ms para usuarios con hasta 10,000 registros.
- No existen consultas N+1 en ningún endpoint de la API.

---

## 6. Requerimientos de Disponibilidad

### RD-001 — Degradación Elegante ante Fallas de Servicios Externos

| Campo | Detalle |
|-------|---------|
| **Identificador** | RD-001 |
| **Nombre** | Fallback ante indisponibilidad de la Gemini API |
| **Prioridad** | ALTA |

**Descripción:**
Cuando la Gemini API no esté disponible, el sistema activa automáticamente un formulario de registro manual notificando al usuario que la categorización automática no está disponible, sin interrumpir el flujo principal.

**Criterios de Aceptación:**
- Si Gemini API retorna error 503 o timeout → el formulario manual se activa en menos de 1 segundo.
- El sistema registra en logs cada falla del servicio externo con timestamp y tipo de error.

---

## 7. Requerimientos de Escalabilidad

### RE-001 — Backend Stateless

| Campo | Detalle |
|-------|---------|
| **Identificador** | RE-001 |
| **Nombre** | Backend sin estado para facilitar escalabilidad horizontal |
| **Prioridad** | MEDIA |

**Descripción:**
El backend no almacena información de sesión en memoria. El estado de autenticación se gestiona mediante JWT y la base de datos. Esto permite múltiples instancias del backend operando sin sincronización de estado.

**Criterios de Aceptación:**
- El backend no utiliza sesiones en memoria ni `express-session`.
- El reinicio del servidor no afecta las sesiones activas de los usuarios.

---

## 8. Requerimientos de Mantenibilidad

### RM-001 — Estructura Modular del Proyecto

| Campo | Detalle |
|-------|---------|
| **Identificador** | RM-001 |
| **Nombre** | Organización modular del código fuente por dominio de negocio |
| **Prioridad** | ALTA |

**Descripción:**
El código fuente del backend debe organizarse por módulos de dominio. Cada módulo contiene sus propios controladores, servicios, rutas y tests co-ubicados.

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.test.ts
│   ├── movements/
│   │   ├── movements.controller.ts
│   │   ├── movements.service.ts
│   │   ├── movements.routes.ts
│   │   └── movements.service.test.ts
│   ├── goals/
│   │   ├── goals.controller.ts
│   │   ├── goals.service.ts
│   │   ├── goals.routes.ts
│   │   └── goals.service.test.ts
│   └── users/
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.routes.ts
│       └── users.service.test.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── auth.middleware.test.ts
├── utils/
│   ├── jwt.utils.ts
│   └── jwt.utils.test.ts
└── app.ts
```

**Criterios de Aceptación:**
- Cada módulo es independiente y modificable sin afectar otros módulos.
- Los tests están co-ubicados con el código que prueban.
- No existe lógica de negocio en archivos de rutas ni en `app.ts`.

---

### RM-002 — Variables de Entorno y Configuración

| Campo | Detalle |
|-------|---------|
| **Identificador** | RM-002 |
| **Nombre** | Gestión centralizada de configuración mediante variables de entorno |
| **Prioridad** | ALTA |

**Descripción:**
Toda configuración que varía entre entornos debe gestionarse mediante variables de entorno. El proyecto incluye `.env.example` con todas las variables documentadas. El sistema valida al arrancar que todas las variables requeridas estén definidas.

**Variables de entorno requeridas:**
```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GEMINI_API_KEY=
NODE_ENV=
PORT=
CORS_ORIGIN=
```

**Criterios de Aceptación:**
- El servidor no arranca si alguna variable requerida está ausente.
- El archivo `.env` está en `.gitignore`.
- El archivo `.env.example` existe con todas las variables documentadas.

---

## 9. Requerimientos de Usabilidad

### RU-001 — Diseño Responsivo

| Campo | Detalle |
|-------|---------|
| **Identificador** | RU-001 |
| **Nombre** | Interfaz adaptable a diferentes tamaños de pantalla |
| **Prioridad** | ALTA |

**Descripción:**
La interfaz debe ser completamente responsiva para escritorio (1280px+), tablets (768px-1279px) y móviles (320px-767px) usando enfoque mobile-first con Tailwind CSS.

**Criterios de Aceptación:**
- El dashboard es usable en pantallas de 320px sin scroll horizontal.
- Las gráficas se redimensionan proporcionalmente según el viewport.
- Los formularios son accesibles y utilizables en dispositivos táctiles.

---

### RU-002 — Retroalimentación Visual al Usuario

| Campo | Detalle |
|-------|---------|
| **Identificador** | RU-002 |
| **Nombre** | Estados de carga, éxito y error claramente comunicados |
| **Prioridad** | ALTA |

**Descripción:**
Toda operación asíncrona muestra un indicador de carga. Las operaciones exitosas muestran toast verde. Los errores se muestran con mensajes descriptivos y amigables, nunca con stack traces o códigos técnicos internos.

**Criterios de Aceptación:**
- Todas las peticiones muestran spinner o skeleton loader mientras se procesan.
- Las operaciones exitosas muestran toast verde por 3 segundos.
- Los errores de validación aparecen inline junto al campo correspondiente.
- Los errores del servidor se muestran como toast rojo con mensaje amigable.

---

## 10. Requerimientos de Integridad de Datos

### RI-001 — Consistencia Transaccional

| Campo | Detalle |
|-------|---------|
| **Identificador** | RI-001 |
| **Nombre** | Uso de transacciones de base de datos para operaciones críticas |
| **Prioridad** | ALTA |

**Descripción:**
Las operaciones que involucran múltiples escrituras en la base de datos deben ejecutarse dentro de transacciones atómicas usando `prisma.$transaction()`. Cualquier falla revierte todas las operaciones de la transacción.

**Criterios de Aceptación:**
- El registro de un movimiento y la actualización de la meta asociada ocurren en la misma transacción.
- Si la creación del refresh token falla durante el login, el login completo falla.
- No existen estados inconsistentes en la base de datos tras un error de servidor.

---

### RI-002 — Validación en Múltiples Capas

| Campo | Detalle |
|-------|---------|
| **Identificador** | RI-002 |
| **Nombre** | Validación de datos de entrada en frontend y backend |
| **Prioridad** | ALTA |

**Descripción:**
La validación se implementa en dos capas: frontend (retroalimentación inmediata) y backend (fuente de verdad de seguridad). El backend usa `zod` para la validación de schemas en todos los endpoints. La validación del frontend nunca se considera suficiente.

**Criterios de Aceptación:**
- Todos los endpoints validan su payload con schemas Zod.
- Un request malformado enviado directamente a la API retorna HTTP 422 con detalle de campos inválidos.
- Los schemas Zod están definidos en archivos separados y son reutilizables.

---

## 11. Requerimientos de Auditoría y Trazabilidad

### RA-001 — Registro de Eventos del Sistema

| Campo | Detalle |
|-------|---------|
| **Identificador** | RA-001 |
| **Nombre** | Logging estructurado de eventos relevantes del sistema |
| **Prioridad** | MEDIA |

**Descripción:**
El sistema debe registrar en logs estructurados (formato JSON) los siguientes eventos: inicio y cierre de sesión, creación/edición/eliminación de movimientos, errores de autenticación, errores de integración con Gemini API y errores internos del servidor. Los logs incluyen timestamp, nivel de severidad, userId cuando aplique y descripción del evento.

**Criterios de Aceptación:**
- Los logs se generan en formato JSON estructurado.
- Cada log incluye: `timestamp`, `level`, `userId`, `event`, `details`.
- Los errores HTTP 5xx generan un log de nivel `ERROR` con el stack trace completo.

---

### RA-002 — Trazabilidad de Movimientos Financieros

| Campo | Detalle |
|-------|---------|
| **Identificador** | RA-002 |
| **Nombre** | Preservación del historial de cambios en movimientos financieros |
| **Prioridad** | MEDIA |

**Descripción:**
Todos los movimientos financieros cuentan con campos de auditoría: `createdAt`, `updatedAt` y `deletedAt`, gestionados automáticamente por Prisma. La eliminación siempre es lógica (soft delete), preservando el historial en la base de datos.

**Criterios de Aceptación:**
- Todo movimiento tiene `createdAt` poblado automáticamente al crearse.
- `updatedAt` se actualiza automáticamente en cada modificación.
- Los movimientos con `deletedAt` poblado son excluidos de todos los cálculos del dashboard.

---

## Resumen de Requerimientos

| Tipo | Subcategoría | Cantidad |
|------|-------------|----------|
| Requerimientos Funcionales (RF) | — | 22 |
| Requerimientos No Funcionales (RNF) | **Total subcategorías** | **19** |
| ↳ RNF | Generales | 3 |
| ↳ RNF | Seguridad (RS) | 4 |
| ↳ RNF | Rendimiento (RP) | 2 |
| ↳ RNF | Disponibilidad (RD) | 1 |
| ↳ RNF | Escalabilidad (RE) | 1 |
| ↳ RNF | Mantenibilidad (RM) | 2 |
| ↳ RNF | Usabilidad (RU) | 2 |
| ↳ RNF | Integridad de Datos (RI) | 2 |
| ↳ RNF | Auditoría y Trazabilidad (RA) | 2 |
| **TOTAL GENERAL** | | **41** |

> **Nota:** Los requerimientos de Seguridad, Rendimiento, Disponibilidad, Escalabilidad, Mantenibilidad, Usabilidad, Integridad de Datos y Auditoría son todos **subcategorías de los Requerimientos No Funcionales**, clasificados según los atributos de calidad del software definidos por la norma **ISO/IEC 25010**. Se presentan por separado para facilitar su lectura, trazabilidad y verificación.

---

*Fin del Documento de Requerimientos de Software — Quipu v1.0.0*
