FROM node:latest
COPY ./package*.json /app/slaveNodeJs/
COPY ./index.js /app/slaveNodeJs/
COPY ./wait-for /app/slaveNodeJs/
COPY ./master_slave.proto /app/slaveNodeJs/
WORKDIR /app/slaveNodeJs
RUN npm install
RUN chmod +x ./wait-for
RUN apt-get update && apt-get install -y netcat
CMD ["/app/slaveNodeJs/wait-for", "master:5000", "--", "npm", "start"]