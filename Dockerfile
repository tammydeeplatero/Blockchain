FROM node:carbon

WORKDIR /usr/src/app

COPY *.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]