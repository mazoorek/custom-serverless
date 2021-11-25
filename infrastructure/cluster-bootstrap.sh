#! /bin/bash

export controlPlaneIP=$(terraform output control-plane-ip | cut -d "=" -f2 | tr -d "\"")
export workerNodesIPs=$(terraform output worker-nodes-ips | grep -o '"[^"]\+"' | tr -d "\"")
ssh ubuntu@"$controlPlaneIP" oStrictHostKeyChecking=no "bash -s" < ./adjust-host.sh "control-plane"
ssh ubuntu@"$controlPlaneIP" oStrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
export index=0
for workerNodeIp in $workerNodesIPs
do
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no "bash -s" < ./adjust-host.sh "worker-node-$index"
   ssh ubuntu@"$workerNodeIp" -oStrictHostKeyChecking=no "bash -s" < ./install-containerd.sh
   index=$((index + 1))
done
