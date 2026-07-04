FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dist/wms-cashier-frontend/browser/ /usr/share/nginx/html/
EXPOSE 80
