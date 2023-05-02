echo "Inicializando Swarm"
docker swarm init

echo "Levantamos la red y el registro"
docker service create --name registry --publish published=5000,target=5000 registry:2

echo "Iniciando creación de las imágenes"
docker build -t "tp4-master" ./masterNodeJs
docker build -t "tp4-slave" ./slavesNodeJs

echo "Crear y etiquetar imágenes"
docker tag tp4-master 172.18.48.1:5000/tp4-master
docker push 172.18.48.1:5000/tp4-master

docker tag tp4-slave 172.18.48.1:5000/tp4-slave
docker push 172.18.48.1:5000/tp4-slave

echo "Levantar servicios master y slave"
docker stack deploy -c docker-compose.yml master_slave
