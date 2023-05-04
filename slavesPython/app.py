import paho.mqtt.client as mqtt
import socket
import time
import random
import grpc
import master_slave_pb2
import master_slave_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp

slave_id = socket.gethostname()
ip = '172.2.0.2'

channel = grpc.insecure_channel('master:50051')
clientgrpc = master_slave_pb2_grpc.MasterSlaveServiceStub(channel)

clientmqtt = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    client.subscribe("work")

    current_time = Timestamp()
    current_time.GetCurrentTime()
    register_message = master_slave_pb2.RegisterSlaveRequest(slave_id=slave_id, ip=ip, timestamp=current_time)

    try:
        response = clientgrpc.RegisterSlave(register_message)
        print(f"Registro exitoso: {response.message}")
    except grpc.RpcError as error:
        print(f"Error al registrar el Slave: {error}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode("utf-8")
    topic = msg.topic

    if topic == "work":
        msg_data = master_slave_pb2.WorkMessage()
        msg_data.ParseFromString(msg.payload)

        if msg_data.slave_id == slave_id:
            random_delay = random.randint(1, 10)

            time.sleep(random_delay)

            current_time = Timestamp()
            current_time.GetCurrentTime()
            results_message = master_slave_pb2.SendResultRequest(slave_id=slave_id, data=str({
                'duration': random_delay,
                'timestamp': current_time.ToJsonString(),
            }))

            try:
                response = clientgrpc.SendResult(results_message)
                print(f"Resultado recibido: {response.message}")
            except grpc.RpcError as error:
                print(f"Error al enviar el resultado: {error}")

clientmqtt.on_connect = on_connect
clientmqtt.on_message = on_message
clientmqtt.connect("broker_mqtt", 1883, 60)
clientmqtt.loop_forever()