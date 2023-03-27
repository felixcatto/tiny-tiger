FROM caddy:2.6.4

RUN apk update
RUN apk add nss-tools
COPY --from=tiger-app /app/dist/public /srv
RUN rm /srv/index.html
COPY Caddyfile /etc/caddy/Caddyfile
