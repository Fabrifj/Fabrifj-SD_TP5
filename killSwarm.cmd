echo "Matar el swarm"
docker stack rm master_slave
docker swarm leave --force
echo "Matar el swarm"
docker stack rm master_slave
docker swarm leave --force