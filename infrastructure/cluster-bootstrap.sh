#!/bin/bash

export CONTROL_PLANE_IP=$(terraform output control-plane-ip | cut -d "=" -f2 | tr -d "\"")
export WORKER_NODES_IPS=($(terraform output worker-nodes-ips | grep -o '"[^"]\+"' | tr -d "\""))
ssh ubuntu@"$CONTROL_PLANE_IP" oStrictHostKeyChecking=no "bash -s" < ./adjust-host.sh "control-plane" "$CONTROL_PLANE_IP" "${WORKER_NODES_IPS[@]}"
ssh ubuntu@"$CONTROL_PLANE_IP" oStrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
ssh ubuntu@"$CONTROL_PLANE_IP" oStrictHostKeyChecking=no "bash -s" < ./install-k8s-components.sh
ssh ubuntu@"$CONTROL_PLANE_IP" oStrictHostKeyChecking=no "bash -s" < ./prepare-control-plane.sh
export JOIN_CLUSTER_COMMAND=$(ssh ubuntu@"$CONTROL_PLANE_IP" oStrictHostKeyChecking=no kubeadm token create --print-join-command)
export index=0
for workerNodeIp in "${WORKER_NODES_IPS[@]}"
do
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no "bash -s" < ./adjust-host.sh "worker-node-$index" "$CONTROL_PLANE_IP" "${WORKER_NODES_IPS[@]}"
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no "bash -s" < ./install-k8s-components.sh
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no sudo $JOIN_CLUSTER_COMMAND
   index=$((index + 1))
done
