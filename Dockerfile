FROM node:carbon

WORKDIR /usr/src/blockchain/app

COPY *.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]