FROM kthregistry.azurecr.io/kth-nodejs-22:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD [ "node", "server.js" ]