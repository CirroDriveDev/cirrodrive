FROM node:20 AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run generate
RUN npm run build

FROM node:20

ENV DOCKERIZE_VERSION=v0.8.0

RUN apt-get update \
  && apt-get install -y wget \
  && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
  && apt-get autoremove -yqq --purge wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY docker-entrypoint.sh ./docker-entrypoint.sh

COPY package.json ./
COPY package-lock.json ./

RUN npm install --omit=dev

COPY prisma/schema.prisma ./prisma/schema.prisma

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

EXPOSE 3000

ENTRYPOINT [ "sh", "docker-entrypoint.sh" ]