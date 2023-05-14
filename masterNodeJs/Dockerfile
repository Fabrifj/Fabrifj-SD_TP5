FROM node:latest
WORKDIR /app/masterNodeJs
COPY /master .
RUN npm install
RUN apt-get update && apt-get install -y netcat
CMD ["node","./index.js"]