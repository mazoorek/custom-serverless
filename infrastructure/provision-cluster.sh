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
