FROM node:latest
COPY ./package*.json /app/slaveNodeJs/
COPY ./index.js /app/slaveNodeJs
WORKDIR /app/slaveNodeJs
RUN npm install

CMD ["npm","start"]
