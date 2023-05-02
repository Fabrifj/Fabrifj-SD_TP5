package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/golang/protobuf/proto"
	"google.golang.org/grpc"
	pb "path/to/your/generated/grpc/package"
)

func main() {
	// gRPC client
	conn, err := grpc.Dial("master:50051", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Error al conectar al Master: %v", err)
	}
	defer conn.Close()

	grpcClient := pb.NewMasterSlaveServiceClient(conn)

	// MQTT client
	mqttOpts := mqtt.NewClientOptions()
	mqttOpts.AddBroker("tcp://broker_mqtt:1883")
	mqttClient := mqtt.NewClient(mqttOpts)
	token := mqttClient.Connect()
	token.Wait()
	if token.Error() != nil {
		log.Fatalf("Error al conectar al broker MQTT: %v", token.Error())
	}
	defer mqttClient.Disconnect(250)

	slaveID := os.Getenv("HOSTNAME")
	ip := "172.2.0.2"

	registerMessage := &pb.RegisterSlaveRequest{
		SlaveId:   slaveID,
		Ip:        ip,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	// Registra el Slave en el Master
	_, err = grpcClient.RegisterSlave(context.Background(), registerMessage)
	if err != nil {
		log.Fatalf("Error al registrar el Slave: %v", err)
	} else {
		log.Println("Registro exitoso")
	}

	// Suscribe al tópico 'work'
	mqttClient.Subscribe("work", 0, func(client mqtt.Client, msg mqtt.Message) {
		var workMessage pb.WorkMessage
		err := proto.Unmarshal(msg.Payload(), &workMessage)
		if err != nil {
			log.Printf("Error al deserializar el mensaje work: %v", err)
			return
		}

		if workMessage.SlaveId == slaveID {
			randomDelay := time.Duration(rand.Intn(10)+1) * time.Second
			time.Sleep(randomDelay)

			sendResultMessage := &pb.SendResultRequest{
				SlaveId:   slaveID,
				Duration:  int32(randomDelay.Seconds()),
				Timestamp: time.Now().Format(time.RFC3339),
			}

			// Envía un resultado al Master
			_, err := grpcClient.SendResult(context.Background(), sendResultMessage)
			if err != nil {
				log.Printf("Error al enviar el resultado: %v", err)
			} else {
				log.Printf("Resultado enviado: duración %v segundos", randomDelay.Seconds())
			}
		}
	})

	// Espera a que el programa termine
	select {}
}
