# frontend/Dockerfile
# Nginx web sunucusu imajını kullan
FROM nginx:1.19-alpine

# Statik dosyaları Nginx varsayılan dizinine kopyala
COPY . /usr/share/nginx/html

# Nginx ayar dosyasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
