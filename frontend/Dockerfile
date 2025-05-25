# frontend/Dockerfile

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Zostawiamy build w /app/dist do skopiowania przez głównego nginx-a
