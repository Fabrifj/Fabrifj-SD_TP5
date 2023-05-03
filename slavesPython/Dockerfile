FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./app.py .
COPY ./master_slave_pb2_grpc.py .
COPY ./master_slave_pb2.py .
COPY ./master_slave.proto .

CMD ["python", "app.py"]
