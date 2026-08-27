FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html 404.html demo.html /usr/share/nginx/html/
COPY main.js advanced-features.js scientific.mjs style.css /usr/share/nginx/html/
COPY logo-esiea.png robots.txt sitemap.xml CNAME /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
