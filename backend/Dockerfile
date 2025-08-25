# backend/Dockerfile
# Node.js 14 temel imajını kullan
FROM node:14-alpine

# Çalışma dizinini ayarla
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Node modüllerini yükle
RUN npm install

# Uygulama kodunu kopyala
COPY . .

# Uygulamanın 3000 portunda dinlemesini belirt
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "index.js"]
