FROM node:lts-alpine3.12 as build-stage
WORKDIR /app
COPY package*.json ./
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage

COPY --from=build-stage /app/dist /app
COPY nginx-docker.conf /etc/nginx/nginx.conf

EXPOSE 8080
