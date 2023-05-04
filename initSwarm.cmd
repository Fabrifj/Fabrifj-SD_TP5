echo "Inicializando Swarm"
docker swarm init

echo "Levantamos la red y el registro"
docker service create --name registry --publish published=5000,target=5000 registry:2

echo "Iniciando creación de las imágenes"
docker build -t "tp5-master" ./masterNodeJs
docker build -t "tp5-slave-nj" ./slavesNodeJs
docker build -t "tp5-slave-py" ./slavesPython
docker build -t "tp5-slave-go" ./slavesGo


echo "Crear y etiquetar imágenes"
docker tag tp5-master 10.1.2.112:5000/tp5-master

docker tag tp5-slave-nj 10.1.2.112:5000/tp5-slave-nj
docker push 10.1.2.112:5000/tp5-slave-nj

docker tag tp5-slave-py 10.1.2.112:5000/tp5-slave-py
docker push 10.1.2.112:5000/tp5-slave-py

docker tag tp5-slave-go 10.1.2.112:5000/tp5-slave-go
docker push 10.1.2.112:5000/tp5-slave-go

echo "Levantar servicios master y slave"
docker stack deploy -c docker-compose.yml master_slave
