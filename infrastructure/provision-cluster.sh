#!/bin/bash

export PRIVATE_KEY_LOCATION=$1
export CONTROL_PLANE_IP=$(terraform output control-plane-ip | cut -d "=" -f2 | tr -d "\"")
export WORKER_NODES_IPS=($(terraform output worker-nodes-ips | grep -o '"[^"]\+"' | tr -d "\""))
echo "---------------------------------control-plane: provision-host---------------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./provision-host.sh "control-plane" "$CONTROL_PLANE_IP" "${WORKER_NODES_IPS[@]}"
echo "---------------------------------control-plane: install-containerd-----------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
echo "---------------------------------control-plane: install-k8s-components-------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./install-k8s-components.sh
echo "---------------------------------control-plane: provision-control-plane------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./provision-control-plane.sh
echo "---------------------------------control-plane: get-join-cluster-command-----------------------------------------"
export JOIN_CLUSTER_COMMAND=$(ssh ubuntu@"$CONTROL_PLANE_IP" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no kubeadm token create --print-join-command)
export index=0
for workerNodeIp in "${WORKER_NODES_IPS[@]}"
do
   echo "---------------------------------worker-node-$index: provision-host-------------------------------------------"
   ssh ubuntu@"$workerNodeIp" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./provision-host.sh "worker-node-$index" "$CONTROL_PLANE_IP" "${WORKER_NODES_IPS[@]}"
   echo "---------------------------------worker-node-$index: install-containerd---------------------------------------"
   ssh ubuntu@"$workerNodeIp" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
   echo "---------------------------------worker-node-$index: install-k8s-components-----------------------------------"
   ssh ubuntu@"$workerNodeIp" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no "bash -s" < ./install-k8s-components.sh
   echo "---------------------------------worker-node-$index: join-cluster---------------------------------------------"
   ssh ubuntu@"$workerNodeIp" -i "$PRIVATE_KEY_LOCATION" -o StrictHostKeyChecking=no sudo $JOIN_CLUSTER_COMMAND
   index=$((index + 1))
done
echo "---------------------------------creating secret for pulling images from AWS ECR---------------------------------"
export AWS_DOCKER_LOGIN_COMMAND=$(aws ecr get-login)
export AWS_DOCKER_LOGIN_USER=$(echo $AWS_DOCKER_LOGIN_COMMAND | cut -d " " -f 4)
export AWS_DOCKER_LOGIN_PASSWORD=$(echo $AWS_DOCKER_LOGIN_COMMAND | cut -d " " -f 6)
kubectl create secret docker-registry backend-ecr-secret \
--docker-server=444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-backend \
--docker-username=$AWS_DOCKER_LOGIN_USER \
--docker-password=$AWS_DOCKER_LOGIN_PASSWORD \
--dry-run=client -o yaml > ../manifests/secrets/backend-ecr-secret.yaml \
-n=custom-serverless

kubectl create secret docker-registry frontend-ecr-secret \
--docker-server=444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-frontend \
--docker-username=$AWS_DOCKER_LOGIN_USER \
--docker-password=$AWS_DOCKER_LOGIN_PASSWORD \
--dry-run=client -o yaml > ../manifests/secrets/frontend-ecr-secret.yaml \
-n=custom-serverless

kubectl create secret docker-registry runtime-ecr-secret \
--docker-server=444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-runtime \
--docker-username=$AWS_DOCKER_LOGIN_USER \
--docker-password=$AWS_DOCKER_LOGIN_PASSWORD \
--dry-run=client -o yaml > ../manifests/secrets/runtime-ecr-secret.yaml \
-n=custom-serverless-runtime

kubectl create secret docker-registry apps-ecr-secret \
--docker-server=444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-apps \
--docker-username=$AWS_DOCKER_LOGIN_USER \
--docker-password=$AWS_DOCKER_LOGIN_PASSWORD \
--dry-run=client -o yaml > ../manifests/secrets/apps-ecr-secret.yaml \
-n=custom-serverless-apps
echo "---------------------------------control-plane: copy app manifest files------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no mkdir -p /tmp/custom-serverless/
scp -r -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no ../manifests ubuntu@"$CONTROL_PLANE_IP":/tmp/custom-serverless/manifests
echo "---------------------------------control-plane: deploy manifest files--------------------------------------------"
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/namespaces/
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/controllers/
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/service-accounts/
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/secrets/
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/secrets/mongodb/mongodb-secret.yaml -n=custom-serverless
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/secrets/mongodb/mongodb-secret.yaml -n=custom-serverless-runtime
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/secrets/mongodb/mongodb-secret.yaml -n=custom-serverless-apps
ssh ubuntu@"$CONTROL_PLANE_IP" -i /home/piotr/.ssh/id_rsa -o StrictHostKeyChecking=no kubectl apply -f /tmp/custom-serverless/manifests/
