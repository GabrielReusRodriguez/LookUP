# Catsalut LookUP - Docker Image
# Serveix l'aplicació estàtica amb Nginx
FROM nginx:alpine

# Copia els fitxers de l'aplicació al directori web de Nginx
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY app.js /usr/share/nginx/html/app.js
COPY cache.appcache /usr/share/nginx/html/cache.appcache
COPY LICENSE /usr/share/nginx/html/LICENSE

# Exposa el port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
