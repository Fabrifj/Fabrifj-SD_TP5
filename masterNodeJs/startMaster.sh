sh -c "./wait-for broker_mqtt:1883 -- npm start"
npm start

#
#docker stack rm master_slave
#docker swarm leave --force
#