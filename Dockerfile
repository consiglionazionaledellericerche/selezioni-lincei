### STAGE 1: sorgente (selezioni-online + personalizzazioni Lincei) e build ###
FROM node:22-slim AS builder

ENV NG_CLI_ANALYTICS=false \
    NG_BUILD_MAX_WORKERS=2 \
    NODE_OPTIONS="--max-old-space-size=3072"

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /lincei
COPY . .
# versione di selezioni-online: upstream.json (ref sovrascrivibile con --build-arg SELEZIONI_ONLINE_REF=...)
ARG SELEZIONI_ONLINE_REF
RUN if [ -n "$SELEZIONI_ONLINE_REF" ]; then \
      node -e "const f='upstream.json',j=require('./'+f);j.ref=process.env.SELEZIONI_ONLINE_REF;require('fs').writeFileSync(f,JSON.stringify(j,null,2))"; \
    fi \
 && node scripts/overlay.mjs

WORKDIR /lincei/.build
RUN npm ci --legacy-peer-deps --no-audit --no-fund \
 && npx ng build --configuration production --output-hashing=all

### STAGE 2: nginx ###
FROM nginx:1.27-alpine
COPY --from=builder /lincei/.build/nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /lincei/.build/dist /usr/share/nginx/html
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
