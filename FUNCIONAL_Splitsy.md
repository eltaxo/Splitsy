# Funcional Técnico — Splitsy
> Documento para Claude Code

---

## 1. Visión general

App web mobile-first para que una pareja registre sus gastos compartidos, calcule quién le debe qué a quién, y gestione la liquidación semanal mediante Bizum. Sin notificaciones push. Sin complejidad innecesaria.

---

## 2. Stack tecnológico

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Auth:** NextAuth.js con Google OAuth
- **Base de datos:** Supabase (PostgreSQL) — tablas simples
- **Backend:** API Routes de Next.js (serverless)
- **Hosting:** Vercel
- **Email (resumen semanal):** Resend (free tier)

---

## 3. Modelo de datos (Supabase)

### Tabla `users`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | ID de Supabase Auth |
| email | text | Email Google |
| name | text | Nombre para mostrar |
| partner_id | uuid (FK → users) | ID del otro usuario de la pareja |
| created_at | timestamp | — |

> La pareja se vincula manualmente: el primer usuario crea la pareja y comparte un código/link de invitación al segundo.

### Tabla `expenses`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | — |
| paid_by | uuid (FK → users) | Quién pagó |
| amount | numeric(10,2) | Importe en EUR |
| concept | text | Descripción breve |
| created_at | timestamp | Fecha del gasto |
| week_start | date | Lunes de la semana a la que pertenece (para agrupar) |

### Tabla `settlements`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | — |
| week_start | date | Semana liquidada (lunes) |
| payer_id | uuid (FK → users) | Quien hace el Bizum |
| receiver_id | uuid (FK → users) | Quien lo recibe |
| amount | numeric(10,2) | Importe del Bizum |
| status | enum: `pending` / `confirmed` | Estado |
| sent_at | timestamp | Cuando se registró el envío |
| confirmed_at | timestamp | Cuando se confirmó la recepción |
| created_at | timestamp | — |

---

## 4. Autenticación y onboarding

### 4.1 Login
- Pantalla única con botón "Entrar con Google"
- Si el usuario no tiene pareja vinculada → pantalla de **onboarding de pareja**

### 4.2 Vinculación de pareja
Flujo de dos pasos:

**Opción A — Crear pareja:**
- Usuario A crea la pareja y obtiene un **código de 6 letras** (o link directo)
- Comparte el código/link con su pareja

**Opción B — Unirse a pareja:**
- Usuario B introduce el código → queda vinculado
- A partir de ese momento ambos ven los gastos del otro

> Un usuario solo puede pertenecer a una pareja. Si ya tiene pareja, el onboarding se salta.

---

## 5. Pantallas y funcionalidad

### 5.1 Pantalla principal — Añadir gasto
**Ruta:** `/`

Componentes:
- Campo numérico grande para el **importe** (teclado numérico en móvil, tipo `inputmode="decimal"`)
- Campo de texto para el **concepto** (max 60 caracteres)
- Botón principal **"Guardar gasto"**

Lógica:
- Al guardar, se crea un registro en `expenses` con `paid_by = usuario actual` y `week_start = lunes de la semana actual`
- Feedback inmediato: toast de confirmación
- Campos se limpian tras guardar para meter otro gasto rápido

---

### 5.2 Pantalla de resumen
**Ruta:** `/resumen`

Datos a mostrar:

**Bloque "Esta semana":**
- Total gastado por Usuario A (nombre real)
- Total gastado por Usuario B (nombre real)
- Diferencia y conclusión: *"[Nombre] le debe [X]€ a [Nombre]"*

**Lógica de cálculo:**
```
total_A = suma de expenses de A en la semana actual
total_B = suma de expenses de B en la semana actual
mitad = (total_A + total_B) / 2
deuda_A = mitad - total_A  → si positivo, A debe a B
deuda_B = mitad - total_B  → si positivo, B debe a A
```
Si los importes son iguales → *"¡Estáis al día!"*

**Bloque "Últimas semanas":**
- Lista de semanas anteriores con su estado: liquidada ✓ / pendiente
- Tap en una semana → detalle de gastos de esa semana

**Bloque "Lista de gastos":**
- Gastos de la semana actual ordenados por fecha descendente
- Cada item: concepto, importe, quién pagó, hora

---

### 5.3 Pantalla de liquidación semanal
**Ruta:** `/liquidar`

Esta pantalla es el flujo de cierre de semana. Se accede desde el banner de aviso del viernes o desde el menú.

**Vista para quien debe pagar (payer):**
- Resumen de la semana: quién gastó qué
- Importe exacto a pagar mediante Bizum
- Botón **"Ya he hecho el Bizum"** → crea un registro en `settlements` con `status = pending`

**Vista para quien debe confirmar (receiver):**
- Notificación in-app: *"[Nombre] dice que te ha enviado [X]€ por Bizum"*
- Botón **"Confirmar recepción"** → actualiza `settlements.status = confirmed` y `confirmed_at = now()`

**Vista una vez confirmado:**
- Estado: *"Semana liquidada ✓"*
- La semana queda cerrada y los gastos de la siguiente empiezan desde cero

---

### 5.4 Banner de aviso semanal (viernes)
No es push. Es un **banner prominente dentro de la app** que aparece cada viernes.

Lógica:
- Cada vez que se carga la app, se comprueba:
  - ¿Es viernes (o posterior) y hay gastos pendientes de liquidar esta semana?
  - ¿No hay ya un settlement `pending` o `confirmed` para esta semana?
- Si sí → mostrar banner en la pantalla principal y en resumen

Contenido del banner:
> *"Es viernes 💸 Esta semana [Nombre] le debe [X]€ a [Nombre]. ¿Lo liquidamos?"*  
> Botón → `/liquidar`

---

### 5.5 Resumen semanal por email (viernes)
Adicional al banner in-app, los viernes a las 20:00h se envía un email a ambos usuarios con:
- Total gastado por cada uno
- Quién debe qué a quién
- Link directo a `/liquidar`

Implementación:
- Cron job en Vercel (vercel.json con `crons`) → llama a `/api/cron/weekly-summary` cada viernes a las 20:00
- La API genera el email con Resend

---

## 6. Navegación

Menú inferior fijo (mobile nav bar) con 3 tabs:
1. **＋ Gasto** → `/`
2. **Resumen** → `/resumen`
3. **Liquidar** → `/liquidar`

---

## 7. Seguridad y acceso

- Un usuario solo puede ver datos de su propia pareja
- Las queries a Supabase siempre filtran por `partner_id` del usuario autenticado
- Row Level Security (RLS) activado en Supabase para todas las tablas

---

## 8. Variables de entorno necesarias

```
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

---

## 9. Orden de implementación sugerido

1. Setup Next.js + Tailwind + Supabase
2. Auth con Google (NextAuth)
3. Onboarding de pareja (crear/unirse con código)
4. Pantalla añadir gasto
5. Pantalla resumen con lógica de cálculo
6. Pantalla liquidación + confirmación
7. Banner in-app de viernes
8. Cron + email semanal con Resend

---

## 10. Consideraciones adicionales

- La app es exclusiva para 2 usuarios (una pareja). No hay multi-pareja ni grupos.
- Los importes siempre son positivos.
- La semana siempre va de lunes a domingo.
- Si hay una liquidación `pending` sin confirmar de semanas anteriores, mostrar aviso también.
- En móvil, el campo de importe debe abrirse con teclado numérico directamente.
