sudo swapoff -a
sudo su -c "hostnamectl set-hostname $1" #changing  sudo su at start doesn't preserve arguments, sudo su -c does, even sudo su -m doesn't preserve variables
sudo su -c "echo \"control-plane $2\" >> /etc/hosts"
ARGUMENTS=("$@")
WORKER_NODE_IPS="${ARGUMENTS[@]:2}"
export index=0
for workerNodeIp in $WORKER_NODE_IPS
do
   sudo su -c "echo \"worker-node-$index $workerNodeIp\" >> /etc/hosts"
   index=$((index + 1))
done
