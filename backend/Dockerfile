FROM node:16

WORKDIR /usr/src/app

COPY app/package*.json ./
COPY app/app.js ./

RUN npm install

EXPOSE 8080
CMD [ "node", "app.js" ]
