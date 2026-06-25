# Usar Node.js 18 como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar resto de archivos
COPY . .

# Exponer puerto 3000
EXPOSE 3000

# Variable de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]