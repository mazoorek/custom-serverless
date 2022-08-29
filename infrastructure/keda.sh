# tutorial: https://blog.cloudacode.com/how-to-autoscale-kubernetes-pods-based-on-ingress-request-prometheus-keda-and-k6-84ae4250a9f3
# prometheus and grafana metrics scraping tutorial: https://kubernetes.github.io/ingress-nginx/user-guide/monitoring/#prometheus-and-grafana-installation-using-pod-annotations

# helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# keda
kubectl create ns keda
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm upgrade --install keda kedacore/keda -n keda

#pv dla prometheusa
mkdir /tmp/data-pv-1
mkdir /tmp/data-pv-2
mkdir /tmp/data-pv-3

kubectl create namespace prometheus

## prometheus
#
#kubectl create namespace prometheus
#helm repo add prometheus-community https://prometheus-community.github.io/helm-charts --namespace prometheus
#helm repo update
#helm upgrade --install prometheus prometheus-community/prometheus -n prometheus
