FROM node:latest
COPY ./package*.json /app/masterNodeJs/
COPY ./index.js /app/masterNodeJs/
COPY ./wait-for /app/masterNodeJs/
WORKDIR /app/masterNodeJs
RUN npm install
RUN chmod +x ./wait-for
RUN apt-get update && apt-get install -y netcat
CMD ["/app/masterNodeJs/wait-for", "broker_mqtt:1883", "--", "npm", "start"]