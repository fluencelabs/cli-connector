FROM node:16-alpine as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN npm install --production --silent && npm run build

FROM caddy:2.6
WORKDIR /
COPY --from=builder ./app/build /dist
COPY Caddyfile /Caddyfile
VOLUME /data
ENV CONNECTOR_PORT=8080
CMD ["caddy", "run", "--config", "/Caddyfile"]
