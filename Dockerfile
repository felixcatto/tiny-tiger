FROM node:18.15.0

RUN mkdir app
WORKDIR app
COPY package.json package-lock.json /app/
RUN npm i
COPY . .
RUN make build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/bin/server.js"]
