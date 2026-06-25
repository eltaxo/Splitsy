# Guión de Diseño — Splitsy
> Documento para Claude Design

---

## Brief de producto

**Qué es:** App web mobile-first para que una pareja controle sus gastos compartidos y sepa en tiempo real quién le debe qué a quién.

**Quién la usa:** Una pareja. Dos personas que se conocen muy bien, con mucha confianza. No es una app corporativa ni de finanzas serias. Es algo íntimo, cotidiano y un poco divertido.

**El trabajo principal de la UI:** Que registrar un gasto sea tan rápido que no de pereza hacerlo en el momento. Velocidad y claridad por encima de todo.

**Plataforma:** 100% móvil. Diseñar en viewport 390px (iPhone 14). Todo debe funcionar con el pulgar.

---

## Identidad visual

**Nombre:** Splitsy

**Tono:** Cercano, sin pretensiones. Un poco cómplice. Como cuando tu pareja te manda un "ey, me debes el café de ayer" con un emoji. Nada de banca seria ni finanzas frías.

**Dirección estética:**
Minimalismo cálido. Fondos muy claros casi blancos (no cream genérico), un solo color de acento vibrante pero no agresivo — piensa en un amarillo yema o un coral suave, algo que recuerde a una nota Post-it o una transferencia bancaria con energía. Tipografía redondeada y amable, no la sans-serif corporativa de siempre.

**Paleta propuesta (orientativa, Claude Design puede interpretar):**
- Fondo principal: blanco roto muy sutil `#F9F8F6`
- Acento principal: amarillo limón / mostaza suave — algo como `#F2C94C` o `#F5A623`
- Texto primario: casi negro suave `#1A1A1A`
- Texto secundario: gris medio `#888888`
- Verde confirmación: `#27AE60`
- Rojo/alerta: `#EB5757`
- Fondo cards: blanco puro `#FFFFFF`

**Tipografía:**
- Display / importes grandes: algo redondeado y con carácter — Inter, Nunito, o similar
- Body: mismo family o complementario, legible a tamaños pequeños
- Los importes deben ser GRANDES. El número es el protagonista.

**Elemento firma:**
Un detalle visual que identifique la app: podría ser una pequeña ilustración/icono de dos monedas o dos flechas cruzándose (el intercambio), usado en la pantalla de liquidación y en el logo. Algo que transmita "esto es entre los dos".

---

## Pantallas a diseñar

### Pantalla 1 — Login
**Ruta:** `/login`

Contenido:
- Logo + nombre de app en grande
- Tagline corto: algo como *"Las cuentas claras, el amor intacto."*
- Botón "Continuar con Google" (estilo oficial Google, fondo blanco, borde suave)
- Fondo limpio, quizás con un motivo gráfico muy sutil (líneas, puntos, una textura ligera)

---

### Pantalla 2 — Onboarding de pareja
**Ruta:** `/onboarding`

Dos estados:

**2A — Crear pareja:**
- Título: *"Crea vuestra cuenta compartida"*
- Subtítulo explicativo breve
- Botón grande: "Crear y obtener código"
- Tras pulsar: se muestra el código de 6 letras en grande, con botón para copiar/compartir
- Instrucción: *"Comparte este código con tu pareja"*

**2B — Unirse a pareja:**
- Link/tab alternativo: "¿Tienes un código? Úsalo aquí"
- Input de 6 caracteres (grande, centrado, tipo OTP visual)
- Botón: "Unirme"

---

### Pantalla 3 — Añadir gasto (pantalla principal)
**Ruta:** `/`

Esta es la pantalla más importante. El objetivo: el usuario llega aquí, mete el importe y el concepto, y guarda en menos de 10 segundos.

Estructura:
- Header mínimo: avatar del usuario + nombre, icono de menú o tabs
- **Campo de importe:** ocupa el tercio superior de la pantalla. Número enorme (40-48px+), centrado. Símbolo € integrado. Al tocar, abre teclado numérico.
  - Estilo: casi como una calculadora elegante, fondo ligeramente diferenciado
- **Campo concepto:** debajo del importe, input de texto con placeholder como *"¿En qué lo gastaste?"*
  - Sugerencias rápidas como chips/pills: "Super", "Restaurante", "Gasolina", "Farmacia", "Ocio" — tocables para rellenar el concepto al instante
- **Botón "Guardar gasto":** ancho completo, color de acento, tipografía bold, grande. Posicionado para alcanzarlo con el pulgar.
- Después de guardar: micro-animación de confirmación (checkmark, confetti ligero, o similar) y reset de campos

**Banner de aviso de viernes** (condicional, aparece encima del formulario):
- Pill o banner amarillo/acento con texto breve: *"Es viernes 💸 [Nombre] te debe 34€ · Liquidar →"*
- Llamativo pero que no tape el formulario

---

### Pantalla 4 — Resumen
**Ruta:** `/resumen`

Estructura vertical (scroll):

**Bloque 1 — Esta semana:**
- Dos tarjetas lado a lado (o stacked en móvil estrecho):
  - Avatar + nombre + total gastado cada uno
  - Visualmente diferenciadas (color de fondo, borde de acento)
- Debajo: resultado en grande y claro:
  - *"Ana le debe 23,50€ a Carlos"* — texto grande, color de acento
  - O: *"¡Estáis al día! 🎉"* — en verde

**Bloque 2 — Lista de gastos de esta semana:**
- Lista cronológica
- Cada item: 
  - Izquierda: avatar pequeño de quien pagó + concepto
  - Derecha: importe en bold
  - Fecha/hora en gris pequeño
- Separadores de día si hay muchos gastos

**Bloque 3 — Semanas anteriores:**
- Lista compacta de semanas pasadas
- Cada fila: "Semana del 9 junio" + estado (Liquidada ✓ / Pendiente ⚠️)
- Tocable para ver detalle

---

### Pantalla 5 — Liquidación
**Ruta:** `/liquidar`

**5A — Vista "Tú debes pagar":**
- Título: *"Toca liquidar"*
- Resumen visual de la semana (importes de cada uno, diferencia)
- Importe a pagar en grande: `34,50 €`
- Instrucción: *"Haz un Bizum de 34,50€ a [Nombre del otro]"*
- Botón: **"Ya lo he enviado"** — color acento, ancho completo
- Nota pequeña: *"Tu pareja recibirá un aviso para confirmarlo"*

**5B — Vista "Esperando confirmación" (tras pulsar el botón):**
- Estado visual: icono de reloj / pendiente
- Texto: *"Esperando que [Nombre] confirme el Bizum..."*
- El botón queda desactivado / estado "enviado"

**5C — Vista para quien recibe (el otro usuario):**
- Banner/card prominente: *"[Nombre] dice que te ha enviado 34,50€ por Bizum"*
- Botón grande verde: **"Confirmar que lo he recibido"**
- Botón secundario: *"Hay un problema"* (por si el importe no cuadra)

**5D — Vista de semana liquidada (ambos):**
- Estado celebración: *"¡Semana cerrada! ✓"*
- Resumen final de la semana
- Botón: "Ver siguiente semana"

---

### Pantalla 6 — Detalle de semana anterior
**Ruta:** `/resumen/semana/[id]`

Simple:
- Encabezado: "Semana del [fecha]" + badge de estado
- Mismo layout que bloque 2 del resumen: lista de gastos
- Resumen al final: quién pagó más, importe del Bizum, cuándo se liquidó

---

## Notas de UX críticas

1. **El teclado numérico en iOS/Android debe aparecer automáticamente** al llegar a la pantalla principal (autofocus en el campo de importe).

2. **Los estados vacíos deben ser amables:** Si no hay gastos esta semana, mostrar algo como *"Aún no hay gastos esta semana. ¡Empezad!"* con un icono simpático, no una pantalla en blanco.

3. **La confirmación del Bizum es el momento más importante de trust.** Diseñarlo con cuidado: botón grande, lenguaje claro, sin ambigüedad.

4. **Bottom navigation fija** con 3 tabs:
   - Icono + label: "Gasto" / "Resumen" / "Liquidar"
   - Tab activo destacado con color acento
   - Safe area para iPhone (padding inferior)

5. **Microinteracciones:** Al guardar un gasto, algo satisfactorio. Al confirmar un Bizum, algo que se sienta definitivo. No exagerar, pero que se note.

6. **El banner de viernes** debe ser visible pero no invasivo. Que puedas descartarlo si no es el momento, pero que vuelva a aparecer.

---

## Entregables esperados

- Diseño de las 6 pantallas principales (con sus variantes de estado donde aplica)
- Componentes reutilizables: bottom nav, cards de gasto, botón primario, input de importe, banner de aviso
- Todo en viewport 390px
- Exportable para que Claude Code pueda implementarlo
