#!/bin/bash

# Script de despliegue para VPS propio
# Splitsy - App para parejas

echo "🚀 Desplegando Splitsy en tu VPS..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio del proyecto"
    exit 1
fi

echo -e "${GREEN}✓${NC} Directorio correcto"

# Construir la aplicación
echo -e "${YELLOW}📦 Construyendo la aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la construcción"
    exit 1
fi

echo -e "${GREEN}✓${NC} Construcción completada"

# Construir imagen Docker
echo -e "${YELLOW}🐳 Construyendo imagen Docker...${NC}"
docker build -t splitsy:latest .

if [ $? -ne 0 ]; then
    echo "❌ Error al construir imagen Docker"
    exit 1
fi

echo -e "${GREEN}✓${NC} Imagen Docker construida"

# Parar contenedor anterior si existe
echo -e "${YELLOW}🛑 Parando contenedor anterior...${NC}"
docker stop splitsy-app 2>/dev/null || true
docker rm splitsy-app 2>/dev/null || true

# Iniciar nuevo contenedor
echo -e "${YELLOW}🚀 Iniciando nuevo contenedor...${NC}"
docker run -d \
    --name splitsy-app \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env.production \
    splitsy:latest

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar contenedor"
    exit 1
fi

echo -e "${GREEN}✓${NC} Contenedor iniciado"

# Configurar Nginx (opcional)
if [ -f "nginx.conf" ]; then
    echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"
    echo "Copia nginx.conf a /etc/nginx/sites-available/splitsy"
    echo "Y ejecuta: sudo ln -s /etc/nginx/sites-available/splitsy /etc/nginx/sites-enabled/"
    echo "Luego: sudo nginx -t && sudo systemctl reload nginx"
fi

echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado!${NC}"
echo ""
echo "📍 Tu aplicación está corriendo en:"
echo "   http://tu-vps-ip:3000"
echo ""
echo "🔧 Para configurar dominio personalizado:"
echo "   1. Edita nginx.conf con tu dominio"
echo "   2. Copia a /etc/nginx/sites-available/splitsy"
echo "   3. Activa el sitio: sudo ln -s /etc/nginx/sites-available/splitsy /etc/nginx/sites-enabled/"
echo "   4. Recarga Nginx: sudo systemctl reload nginx"
echo ""
echo "📊 Ver logs: docker logs -f splitsy-app"
echo "🔄 Reiniciar: docker restart splitsy-app"
echo "🛑 Parar: docker stop splitsy-app"