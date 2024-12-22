FROM node:18-alpine as build-stage

RUN apk update && apk add bash

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
# Remove any existing config files
RUN rm /etc/nginx/conf.d/*
COPY ./default.conf /etc/nginx/conf.d/

