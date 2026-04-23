FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY live-server/ ./live-server/

EXPOSE 3001

CMD ["node", "live-server/index.js"]
