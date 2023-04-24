echo "Iniciando creacion de las imagenes"
docker build -t "tp4-master" ./masterNodeJs
docker build -t "tp4-slave" ./slavesNodeJs
echo "Levantar Swarm"
docker swarm init
docker stack deploy -c docker-compose.yml master_slave

