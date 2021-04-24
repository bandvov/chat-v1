FROM node:latest

WORKDIR /client

COPY package.json .

RUN npm install

RUN npm run build
COPY . .

EXPOSE 8000

CMD ["npm","run","start"]