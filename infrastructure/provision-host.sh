sudo swapoff -a
sudo su -c "hostnamectl set-hostname $1" #changing  sudo su at start doesn't preserve arguments, sudo su -c does, even sudo su -m doesn't preserve variables
sudo su -c "echo \"$2 control-plane\" >> /etc/hosts"
ARGUMENTS=("$@")
WORKER_NODES_IPS="${ARGUMENTS[@]:2}"
export index=0
for workerNodeIp in $WORKER_NODES_IPS
do
   sudo su -c "echo \"$workerNodeIp worker-node-$index\" >> /etc/hosts"
   index=$((index + 1))
done
