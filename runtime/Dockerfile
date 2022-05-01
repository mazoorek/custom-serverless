FROM node:16

WORKDIR /usr/src/app
COPY app.js ./
ENV PACKAGE_JSON='{"name":"custom-serverless-runtime","version":"1.0.0","description":"","main":"index.js","scripts":{"test":"echo \"Error: no test specified\" && exit 1"},"keywords":[],"author":"","license":"ISC","dependencies":{"express":"^4.17.3","mongoose": "^6.3.0"}}'
EXPOSE 8080
CMD echo $PACKAGE_JSON > package.json && npm install && node app.js
