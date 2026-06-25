# Handoff — Splitsy · tema Oscuro + Lima

> **Para Claude Code.** Pega este documento entero como contexto. El objetivo es que la app
> se vea **igual que el prototipo aprobado** (oscuro + lima). Una primera pasada ya se hizo
> (`globals.css`, `ExpenseForm`, `BottomNav`, `FridayBanner`, fuentes en `layout.tsx`), pero
> quedaron pantallas y componentes con el tema **claro antiguo**, las **fuentes no se aplican**
> y los **importes salen con `.` en vez de `,`**. Abajo está exactamente qué tocar y con qué valores.

El prototipo de referencia visual está en `Phone.dc.html` (incluido en este bundle). Es una
maqueta HTML — **no la copies literal**; reimplementa su aspecto con los componentes React/Tailwind
ya existentes en el repo.

Fidelidad: **alta (hi-fi)**. Colores, tipografía y radios son finales.

---

## 0) Tokens de diseño (paleta Oscuro + Lima)

| Rol | Hex | Uso |
|---|---|---|
| Fondo app | `#15140F` | `body`, fondo de todas las pantallas |
| Superficie / card | `#211F18` | tarjetas, inputs, chips, avatar pareja |
| Panel énfasis | `#0D0C0A` | bloques "hero" (importe a pagar, resultado de deuda, resumen) |
| Borde | `#302D24` | borde de cards/inputs |
| Borde sutil | `#2A2820` | divisores, borde de paneles énfasis, nav |
| **Acento lima** | `#C8FF4D` | importes protagonistas, botón primario, avatar propio, tab activo |
| Acento lima oscuro | `#9BE63A` | hover del botón primario |
| Verde confirmar (texto) | `#5FE39A` | "¡Estáis al día!", "Semana cerrada", confirmado |
| Verde confirmar (botón) | `#34D17F` | botón "Confirmar que lo he recibido" (texto `#0C2417`) |
| Texto principal | `#F4F1E8` | títulos y texto sobre fondo oscuro |
| Texto secundario | `#8E887B` | subtítulos, metadatos |
| Texto muted | `#6B6759` | labels, placeholders, iconos inactivos |
| Aviso / pendiente | `#E0B85C` sobre `#2A2516` | badge "Pendiente" |
| Error | `#FF8077` | textos de error, "Hay un problema" |
| Texto sobre lima | `#15140F` | texto/iconos encima de superficies lima |

**Tipografía:** `Sora` (importes, títulos, labels de botón) + `Manrope` (todo lo demás).
**Radios:** chips/badges 12–13px · inputs/cards 16–20px · tarjeta importe 24px · avatares 12–14px (cuadrados redondeados, **no círculos**).
**Importes:** SIEMPRE formato es-ES con coma y espacio antes del símbolo → `34,50 €` (nunca `34.50€`).

---

## 1) ⚠️ Bug de fuentes (alta prioridad)

`layout.tsx` carga `Sora`/`Manrope` con `next/font` y expone las variables `--font-sora` y
`--font-manrope`. Pero `globals.css` y algunos componentes referencian el nombre literal
`'Sora'` / `'Manrope'`, que **no existe** con `next/font` → la app cae a la fuente del sistema
(por eso en las capturas no se ven las tipografías correctas).

**Fix A — `tailwind.config.ts`** (añade dentro de `theme.extend`):
```ts
fontFamily: {
  sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
  display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
},
```

**Fix B — `app/globals.css`**: sustituye los literales por las variables.
```css
@layer base {
  body { font-family: var(--font-manrope), system-ui, sans-serif; }
  h1, h2, h3, h4, h5, h6 { font-family: var(--font-sora), sans-serif; }
}
.btn-primary { font-family: var(--font-sora), sans-serif; }
.input-amount { font-family: var(--font-sora), sans-serif; }
```
A partir de aquí, en componentes usa `font-display` (Sora) donde quieras números/títulos.

---

## 2) `lib/utils.ts` — formato de moneda + emoji por categoría

```ts
// Importe en formato español SIN el símbolo (lo añade el componente con un espacio): "34,50"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Emoji según el concepto del gasto (usa el mismo set que los chips del formulario)
const CATEGORY_EMOJI: Record<string, string> = {
  'súper': '🛒', 'super': '🛒',
  'restaurante': '🍽️',
  'gasolina': '⛽',
  'farmacia': '💊',
  'ocio': '🍿',
  'café': '☕', 'cafe': '☕',
};
export function conceptEmoji(concept: string): string {
  return CATEGORY_EMOJI[concept.trim().toLowerCase()] ?? '🧾';
}
```
> Donde se pinte un importe, renderiza `{formatCurrency(x)} €` (con espacio). Quita los `.toFixed(2)`
> y los `€` pegados que hay repartidos por SummaryCard / ExpenseList / liquidar.

---

## 3) `components/ui/SummaryCard.tsx` — reescritura completa

Este es el componente más roto (avatares amarillos, importes en `#1A1A1A` invisibles, tarjeta
de deuda **blanca con rojo**). Sustitúyelo por:

```tsx
'use client';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
  userTotal: number; partnerTotal: number; debt: number;
  debtor: string | null; creditor: string | null;
  isSettled: boolean; userName: string;
}

export default function SummaryCard({
  userTotal, partnerTotal, debt, debtor, creditor, isSettled, userName,
}: SummaryCardProps) {
  return (
    <div className="space-y-3">
      {/* Tarjetas de totales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#C8FF4D] text-[#15140F] flex items-center justify-center font-bold text-sm font-display">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-[#F4F1E8]">{userName}</span>
          </div>
          <p className="text-2xl font-extrabold text-[#F4F1E8] font-display">{formatCurrency(userTotal)} €</p>
        </div>

        <div className="bg-[#211F18] border border-[#302D24] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#2A2820] text-[#F4F1E8] flex items-center justify-center font-bold text-sm font-display">
              {(creditor ?? 'Pareja').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-[#F4F1E8]">{creditor ?? 'Pareja'}</span>
          </div>
          <p className="text-2xl font-extrabold text-[#F4F1E8] font-display">{formatCurrency(partnerTotal)} €</p>
        </div>
      </div>

      {/* Resultado — panel oscuro de énfasis */}
      {isSettled ? (
        <div className="bg-[#16251B] border border-[#234430] rounded-3xl p-8 text-center">
          <p className="text-5xl mb-2">🎉</p>
          <p className="text-2xl font-extrabold text-[#5FE39A] font-display">¡Estáis al día!</p>
          <p className="text-sm font-semibold text-[#86C9A2] mt-1.5">Ninguno debe nada esta semana</p>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-[#0D0C0A] border border-[#2A2820] rounded-3xl p-6 text-center">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: 'rgba(200,255,77,.13)' }} />
          <p className="relative text-xs font-semibold text-[#B8B2A4]">Cuentas de la semana</p>
          <p className="relative text-lg font-bold text-[#F4F1E8] mt-2 leading-snug font-display">
            {debtor === userName ? 'Tú le debes' : `${debtor} le debe`}
            <br />
            <span className="text-[40px] font-extrabold text-[#C8FF4D] tracking-tight">{formatCurrency(debt)} €</span>
            <br />
            a {debtor === userName ? creditor : userName}
          </p>
        </div>
      )}
    </div>
  );
}
```
> Nota: el importe de deuda es **lima `#C8FF4D`**, NO rojo. El rojo solo es para errores.

---

## 4) `components/ui/ExpenseList.tsx` — reescritura completa

Problemas actuales: texto `#1A1A1A` invisible, avatar genérico 👤/💑 amarillo (debería ser el
**emoji de la categoría** en un tile oscuro), importes con `.`.

```tsx
'use client';
import { formatCurrency, formatTime, formatDate, conceptEmoji } from '@/lib/utils';

interface Expense { id: string; paidBy: string; amount: number; concept: string; createdAt: Date; }
interface ExpenseListProps { expenses: Expense[]; currentUserId: string; currentUserName: string; partnerName: string; }

export default function ExpenseList({ expenses, currentUserId, currentUserName, partnerName }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 rounded-[30px] bg-[#211F18] border border-[#302D24] flex items-center justify-center mx-auto text-4xl">🧾</div>
        <p className="text-xl font-bold text-[#F4F1E8] mt-5 font-display">Aún no hay gastos</p>
        <p className="text-sm font-semibold text-[#8E887B] mt-2">Esta semana empieza limpia. ¡Empezad a apuntar! 🙌</p>
      </div>
    );
  }

  const grouped = expenses.reduce((g, e) => {
    const key = formatDate(new Date(e.createdAt));
    (g[key] ||= []).push(e); return g;
  }, {} as Record<string, Expense[]>);

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dateKey, dayExpenses]) => (
        <div key={dateKey}>
          <h3 className="text-sm font-bold text-[#8E887B] capitalize mb-3">{dateKey}</h3>
          <div className="space-y-2">
            {dayExpenses.map((expense) => {
              const payerName = expense.paidBy === currentUserId ? currentUserName : partnerName;
              return (
                <div key={expense.id} className="flex items-center gap-3 bg-[#211F18] border border-[#302D24] rounded-2xl px-3.5 py-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A2820] flex items-center justify-center text-xl shrink-0">
                    {conceptEmoji(expense.concept)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#F4F1E8] text-[14.5px] leading-tight truncate">{expense.concept}</p>
                    <p className="text-xs text-[#8E887B] mt-0.5 truncate">{payerName} · {formatTime(expense.createdAt)}</p>
                  </div>
                  <p className="text-base font-bold text-[#F4F1E8] font-display whitespace-nowrap">{formatCurrency(expense.amount)} €</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 5) `app/(main)/resumen/page.tsx` — recolorear títulos

Reemplazos (find → replace):
- `text-3xl font-bold text-[#1A1A1A]` (título "Resumen") → `text-3xl font-extrabold text-[#F4F1E8] font-display`
- `<p className="text-gray-500">` ("Esta semana") → `<p className="text-[#8E887B] font-semibold">`
- las dos `<h2 className="text-xl font-bold text-[#1A1A1A] mb-4">` ("Gastos…", "Semanas anteriores") → `text-xl font-bold text-[#F4F1E8] font-display mb-4`
- el placeholder `<div className="card text-center py-6"><p className="text-gray-500 text-sm">` → la `.card` ya es oscura; cambia el texto a `text-[#8E887B]`.
- El bloque de no-pareja: `text-[#1A1A1A]` → `text-[#F4F1E8]`, `text-gray-500` → `text-[#8E887B]`, quita `bg-[#F9F8F6]` (el body ya es oscuro).

---

## 6) `app/(main)/liquidar/page.tsx` — recolorear todos los estados

Es la pantalla "Esperando a tu pareja" de las capturas (título invisible). Aplica estos
reemplazos globales **en este archivo**:

| Buscar | Reemplazar |
|---|---|
| `text-[#1A1A1A]` | `text-[#F4F1E8]` |
| `text-gray-500` | `text-[#8E887B]` |
| `bg-[#F9F8F6]` | `bg-[#0D0C0A] border border-[#2A2820]` |
| `text-[#F2C94C]` (importe grande a pagar) | `text-[#C8FF4D]` |
| `text-[#27AE60]` | `text-[#5FE39A]` |
| `bg-[#27AE60] hover:bg-green-600` (botón confirmar) | `bg-[#34D17F] hover:bg-[#2BBE70] text-[#0C2417]` |
| `text-[#EB5757]` / `border-[#EB5757]` | `text-[#FF8077]` / `border-[#4A2826]` |
| `bg-red-50` | `bg-[#211F18]` |

Además: añade `font-display` a los importes grandes y a los `h1/h2`; usa
`{formatCurrency(x)} €` en lugar de `{x.toFixed(2)}€` y de `summary.debt.toFixed(2)€`.
Para la vista "tienes que enviar", el panel del importe debe ser `bg-[#0D0C0A]` con el número en
`text-[#C8FF4D]` (mira `Phone.dc.html`, pantalla `settle-payer`).

---

## 7) `app/(main)/page.tsx` (home) — header

- Avatar del usuario: `bg-[#F2C94C] ... text-white` → `bg-[#C8FF4D] ... text-[#15140F]`, y radio
  `rounded-full` → `rounded-[14px]` (cuadrado redondeado, como el prototipo).
- Nombre `text-[#1A1A1A]` → `text-[#F4F1E8]`; subtítulo `text-gray-500` → `text-[#8E887B]`.
- Estado sin pareja: `text-[#1A1A1A]` → `text-[#F4F1E8]`, `text-gray-500` → `text-[#8E887B]`,
  quita `bg-[#F9F8F6]`. El `btn-primary` ya es lima.

---

## 8) Pantallas `(auth)` — login + onboarding (siguen en tema claro)

`login/page.tsx`, `onboarding/page.tsx`, `onboarding/create/page.tsx`, `onboarding/join/page.tsx`
no se tocaron. Aplica los tokens:

- Quita todos los `bg-[#F9F8F6]` (el `body` ya es `#15140F`).
- `text-[#1A1A1A]` → `text-[#F4F1E8]`; `text-gray-500` → `text-[#8E887B]`; `text-[#EB5757]` → `text-[#FF8077]`.
- **Botón de Google** (`login`): mantenlo **blanco** (`bg-white`) con texto `#1A1815` — es marca de
  Google y aporta contraste sobre el fondo oscuro. Cambia solo el borde `border-gray-200` → quítalo o `border-[#2A2820]`.
- **Logo/marca** en login: usa el wordmark `splitsy` en `text-[#F4F1E8]` con la "y" en `#C8FF4D`,
  dentro de un cuadro `bg-[#211F18] border border-[#34311F] rounded-[26px]` el icono de las dos
  flechas cruzadas (una `#F4F1E8`, otra `#C8FF4D`). SVG exacto en `Phone.dc.html` → pantalla `login`.
- **Onboarding**: pestañas Crear/Unirme con la activa en `bg-[#C8FF4D] text-[#15140F]` y la inactiva
  `text-[#8E887B]` sobre contenedor `bg-[#211F18]`. El **código** (`QF7K2P`) en `text-[#C8FF4D]`
  grande (Sora 800, letter-spacing 8px) sobre panel `bg-[#0D0C0A]`. Los inputs OTP de `join` son
  cuadrados `bg-[#211F18]` con borde `#302D24` (foco `#C8FF4D`, lleno `#F4F1E8`). Layout exacto en
  `Phone.dc.html` → pantallas `onb-create` / `onb-join`.

---

## 9) `app/globals.css` — restos del tema claro

- Confetti: `background: #F2C94C;` → `#C8FF4D;`
- `.btn-primary:hover` box-shadow `rgba(242, 201, 76, 0.3)` → `rgba(200, 255, 77, 0.25)`
- Scrollbar thumb `background: #ddd;` → `#302D24;`
- `.card:hover` box-shadow `rgba(0,0,0,0.1)` → `rgba(0,0,0,0.4)` (sombra apenas visible en oscuro)

---

## Checklist de verificación

- [ ] Las fuentes Sora/Manrope se ven (no system font) en importes y títulos.
- [ ] No queda ningún texto `#1A1A1A` ni `text-white` sobre fondo oscuro (nada invisible).
- [ ] No queda ningún `#F2C94C` (amarillo) — todos los acentos son lima `#C8FF4D`.
- [ ] La tarjeta de deuda en Resumen es panel oscuro con número **lima**, no blanca con rojo.
- [ ] La lista de gastos muestra el **emoji de la categoría**, no 👤/💑.
- [ ] Todos los importes salen como `34,50 €` (coma + espacio), nunca `34.50€`.
- [ ] Login y onboarding ya no tienen fondo claro.
- [ ] El botón "Confirmar recepción" del Bizum es verde `#34D17F`.

## Capturas de referencia (`screens/`)
PNG de cada pantalla del prototipo, en orden:

1. `screens/01-login.png` — Login
2. `screens/02-crear-pareja.png` — Onboarding · crear pareja (código)
3. `screens/03-unirse-codigo.png` — Onboarding · unirse con código (OTP)
4. `screens/04-anadir-gasto.png` — Añadir gasto + banner de viernes
5. `screens/05-resumen.png` — Resumen semanal
6. `screens/06-resumen-al-dia.png` — Resumen · estáis al día
7. `screens/07-estado-vacio.png` — Estado vacío
8. `screens/08-liquidar-pagas.png` — Liquidar · tú pagas
9. `screens/09-liquidar-esperando.png` — Liquidar · esperando confirmación
10. `screens/10-liquidar-recibes.png` — Liquidar · tú recibes (confirmar Bizum)
11. `screens/11-semana-cerrada.png` — Semana cerrada
12. `screens/12-detalle-semana.png` — Detalle de semana anterior

## Archivos de referencia en este bundle
- `Phone.dc.html` — prototipo HTML con las 12 pantallas/estados y todos los valores exactos.
