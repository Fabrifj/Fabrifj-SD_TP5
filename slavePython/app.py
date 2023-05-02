import paho.mqtt.client as mqtt
import socket
import time
import grpc
import master_slave_pb2
import master_slave_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp
from datetime import datetime

slave_id = socket.gethostname()
ip = '172.2.0.2'

channel = grpc.insecure_channel('master:50051')
clientgrpc = master_slave_pb2_grpc.MasterSlaveServiceStub(channel)

clientmqtt = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    client.subscribe("work")

    register_message = master_slave_pb2.RegisterSlaveRequest(slave_id=slave_id, ip=ip, timestamp=Timestamp().GetCurrentTime())

    try:
        response = clientgrpc.RegisterSlave(register_message)
        print(f"Registro exitoso: {response.message}")
    except grpc.RpcError as error:
        print(f"Error al registrar el Slave: {error}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode("utf-8")
    topic = msg.topic

    if topic == "work" and payload == slave_id:
        random_delay = random.randint(1, 10)

        time.sleep(random_delay)

        results_message = master_slave_pb2.SendResultRequest(slave_id=slave_id, duration=random_delay, timestamp=Timestamp().GetCurrentTime())

        try:
            response = clientgrpc.SendResult(results_message)
            print(f"Resultado recibido: {response.message}")
        except grpc.RpcError as error:
            print(f"Error al enviar el resultado: {error}")

clientmqtt.on_connect = on_connect
clientmqtt.on_message = on_message
clientmqtt.connect("broker_mqtt", 1883, 60)
clientmqtt.loop_forever()
