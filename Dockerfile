FROM node:18-alpine as deps
WORKDIR /app
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

FROM deps as ts-builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM deps as be-builder
WORKDIR /app
COPY --from=ts-builder /app/package.json ./package.json
RUN npm ci --production

FROM node:18-alpine
WORKDIR /app
COPY . .
COPY --from=be-builder /app/node_modules ./node_modules
COPY --from=ts-builder /app/build ./build

EXPOSE 3000
CMD npm start