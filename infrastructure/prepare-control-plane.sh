sudo kubeadm init
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config # make kubectl work without sudo kubectl <command> --kubeconfig /etc/kubernetes/admin.conf
sudo chown $(id -u):$(id -g) $HOME/.kube/config
wget "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')" -O "weave.yaml"
kubectl apply -f weave.yaml
