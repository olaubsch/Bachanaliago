# Etap 1: node.js backend
FROM node:20

# Katalog roboczy
WORKDIR /app


COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy całą resztę kodu
COPY . .

# Wystawiamy port
EXPOSE 5000

# Start serwera
CMD ["node", "server.js"]
