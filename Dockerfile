FROM node:20-alpine AS build

WORKDIR /app

COPY scripts/build-static.mjs ./scripts/build-static.mjs
COPY index.html 404.html demo.html main.js advanced-features.js scientific.mjs style.css ./
COPY logo-esiea.png logo-esiea.webp robots.txt sitemap.xml CNAME ./

RUN node scripts/build-static.mjs

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/_site /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
