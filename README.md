# Splitsy

Las cuentas claras, el amor intacto.

App web mobile-first para que una pareja controle sus gastos compartidos en tiempo real.

## Stack Tecnológico

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)
- **Hosting:** Vercel (recomendado) o Firebase Hosting

## Características

- ✅ Login con Google
- ✅ Onboarding de pareja (código de 6 letras)
- ✅ Añadir gastos rápidos
- ✅ Resumen semanal con cálculo automático de deudas
- ✅ Sistema de liquidación con Bizum
- ✅ Navegación móvil intuitiva
- ✅ Diseño mobile-first (390px viewport)
- ✅ Estados vacíos amigables
- ✅ Microinteracciones

## Setup del proyecto

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd splitsy
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Google Authentication**:
   - Authentication → Sign-in method → Google
3. Crear base de datos **Firestore**:
   - Firestore Database → Create database
4. Configurar reglas de seguridad (ver abajo)
5. Obtener configuración del proyecto:
   - Project Settings → General → Your apps → Web → Register app
6. Copiar la configuración en `.env.local`

### 4. Variables de entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Rellenar las variables con los valores de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Para Firebase Admin SDK (opcional, para server-side)
# Descargar service account key desde Firebase Console
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Reglas de seguridad Firestore

En Firebase Console → Firestore → Rules, configurar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados
    function isSignedIn() {
      return request.auth != null;
    }

    // Usuarios solo pueden acceder a sus propios datos y los de su pareja
    function isUserOrPartner(userId) {
      return isSignedIn() && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.partnerId == userId
      );
    }

    // Users: solo leer/escribir propio documento
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }

    // Expenses: leer si es mi gasto o de mi pareja
    match /expenses/{expenseId} {
      allow read: if isUserOrPartner(resource.data.paidBy);
      allow create: if isSignedIn() && request.resource.data.paidBy == request.auth.uid;
      allow update, delete: if false; // No permitir modificar/eliminar
    }

    // Settlements: leer si involucra al usuario actual
    match /settlements/{settlementId} {
      allow read: if isSignedIn() && (
        resource.data.payerId == request.auth.uid ||
        resource.data.receiverId == request.auth.uid
      );
      allow create: if isSignedIn() && (
        request.resource.data.payerId == request.auth.uid ||
        request.resource.data.receiverId == request.auth.uid
      );
      allow update: if isSignedIn() && (
        request.resource.data.receiverId == request.auth.uid &&
        resource.data.status == 'pending' &&
        request.resource.data.status == 'confirmed'
      );
    }
  }
}
```

## Estructura del proyecto

```
splitsy/
├── app/                      # App Router
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/
│   │   └── onboarding/
│   ├── (main)/              # Rutas principales
│   │   ├── page.tsx         # Añadir gasto (/)
│   │   ├── resumen/
│   │   ├── liquidar/
│   │   └── layout.tsx      # Layout con navegación
│   ├── api/                 # API Routes
│   │   ├── expenses/
│   │   ├── settlements/
│   │   └── partner/
│   ├── layout.tsx           # Layout root
│   └── globals.css
├── components/
│   ├── ui/                  # Componentes reutilizables
│   ├── forms/               # Formularios
│   └── navigation/          # Navegación
├── hooks/                   # Custom hooks
├── lib/                     # Utilidades
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── types.ts
│   └── utils.ts
└── public/                  # Assets estáticos
```

## Deploy

### Vercel (recomendado)

1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configurar variables de entorno en Vercel Dashboard

### Firebase Hosting

1. Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Build:
```bash
npm run build
```

3. Deploy:
```bash
firebase deploy
```

## Testing manual

1. **Crear pareja:**
   - Login con Google
   - Crear cuenta compartida
   - Copiar código

2. **Unir pareja:**
   - Logout y login con otra cuenta
   - Unirse con código

3. **Añadir gastos:**
   - Añadir gastos con ambos usuarios
   - Verificar que aparecen en resumen

4. **Liquidación:**
   - Comprobar cálculo de deudas
   - Procesar liquidación
   - Confirmar recepción

## Próximas mejoras

- [ ] Notificaciones push (viernes)
- [ ] Email semanal con resumen
- [ ] Historial de semanas anteriores
- [ ] Gráficos de gastos
- [ ] Categorías de gastos
- [ ] Exportar a CSV

## Licencia

MIT

## Créditos

Diseñado y desarrollado con ❤️ para parejas que comparten gastos.
