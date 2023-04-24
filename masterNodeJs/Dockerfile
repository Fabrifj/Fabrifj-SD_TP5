FROM node:latest
COPY ./package*.json /app/masterNodeJs/
COPY ./index.js /app/masterNodeJs
WORKDIR /app/masterNodeJs
RUN npm install

CMD ["npm","start"]
