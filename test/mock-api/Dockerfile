FROM kthregistry.azurecr.io/kth-nodejs-24:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD [ "node", "server.js" ]