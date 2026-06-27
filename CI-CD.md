# 🔄 CI/CD con GitHub Actions

Splitsy tiene integración continua configurada. Cada vez que hagas push a `main`, se desplegará automáticamente en tu VPS.

## ⚙️ CONFIGURACIÓN REQUERIDA

### 1. **Secrets de GitHub (Repository Settings)**

Ve a tu repo → Settings → Secrets and variables → Actions → New repository secret

Añade estos secrets:

```
VPS_HOST=tu-ip-vps-o_dominio
VPS_USER=tu_usuario_ssh
VPS_PORT=22
VPS_SSH_KEY=tu_clave_ssh_privada
```

### 2. **Generar clave SSH para GitHub Actions**

En tu VPS:
```bash
# Generar clave SSH dedicada para GitHub Actions
ssh-keygen -t github-actions -f ~/.ssh/github_actions -N ""

# Añadir clave pública a authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Mostrar clave privada (copia esto para GitHub secret)
cat ~/.ssh/github_actions
```

### 3. **Configurar archivo .env.production en VPS**

El archivo `.env.production` debe existir en el VPS con las credenciales Firebase.

## 🚀 FLUJO DE TRABAJO

### **Desarrollo Local:**
```bash
# 1. Trabajar en local
npm run dev

# 2. Hacer commit y push
git add .
git commit -m "nueva funcionalidad"
git push origin main
```

### **Automático:**
- GitHub Actions detecta el push
- Se conecta a tu VPS via SSH
- Actualiza el código
- Reconstruye Docker
- Reinicia el contenedor
- **¡Listo!** Tu app actualizada en producción

## 📋 ESTRUCTURA DEL WORKFLOW

El workflow `.github/workflows/deploy-vps.yml`:

1. **Checkout** - Obtiene el último código
2. **SSH Deploy** - Se conecta a tu VPS
3. **Git Pull** - Actualiza el código
4. **Docker Build** - Construye nueva imagen
5. **Container Restart** - Reinicia con nueva versión
6. **Health Check** - Verifica que funciona

## 🔧 MONITOREO

### **Ver despliegues:**
- GitHub: Repo → Actions tab
- VPS: `docker logs splitsy-app`

### **Troubleshooting:**
```bash
# En VPS
docker ps -a           # Ver todos los contenedores
docker logs splitsy-app # Ver logs
docker restart splitsy-app # Reiniciar manualmente
```

## ⚡ CARACTERÍSTICAS

- ✅ **Despliegue automático** al hacer push
- ✅ **Build en el VPS** (más rápido)
- ✅ **Zero downtime** (reinicio graceful)
- ✅ **Health checks** automáticos
- ✅ **Notificaciones** de estado

## 🎯 RESULTADO FINAL

Trabajas en local → Push a GitHub → **Despliegue automático en VPS** → App actualizada para tu mujer

¡Splitsy siempre actualizado con el último código!