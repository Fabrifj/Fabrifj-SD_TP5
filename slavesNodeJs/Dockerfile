FROM node:latest
RUN apt-get update
RUN apt-get install -y povray
RUN apt-get install -y netcat

WORKDIR /slavesNodeJs
COPY /slave .
RUN mkdir output
RUN npm install
COPY povray.conf /root/.povray/3.7/

CMD ["./start.sh"]