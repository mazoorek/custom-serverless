provision infrastructure and start cluster:
1) run:
   aws configure
   and on input prompts fill in your AWS Access Key ID, AWS Secret Access Key and your region
2) create terraform.tfvars in infrastructure/ copy here content of terraform-template.tfvars and fill missing input
   variables
3) in infrastructure/ run: 
   terraform init
4) in infrastructure/ run: 
   terraform apply --auto-approve
   5) in infrastructure/ run:
   chmod +x provision-cluster.sh
   ./provision-cluster.sh <path-to-your-aws-instances-private-key>
      
6) you can verify that cluster is running correctly:
   CONTROL_PLANE_IP=$(terraform output control-plane-ip | cut -d "=" -f2 | tr -d "\"")
   ssh ubuntu@<CONTROL_PLANE_IP> -i <PRIVATE_KEY_LOCATION> -o StrictHostKeyChecking=no
   kubectl get nodes
   should return output similar to:
   NAME            STATUS   ROLES                  AGE     VERSION
   control-plane   Ready    control-plane,master   3m52s   v1.21.0
   worker-node-0   Ready    <none>                 2m45s   v1.21.0
   worker-node-1   Ready    <none>                 106s    v1.21.0
   kubectl get pod -A
   every pod should be up and running, there should be as many weave-net pods as control-planes + worker-nodes
   to verify if weave net is working correctly grab one weave net pod from:
   kubectl get pod -n kube-system -o wide | grep weave
   and run:
   kubectl exec -n kube-system <one-of-weaves-pods-name for instance weave-net-gssmt> -c weave -- /home/weave/weave --local status
   in output property status should be ready and connections should be control-planes + worker-nodes -1 so there should be 
   connection to every other node in cluster
   
   to test setup you can schedule test pod and see if it's running on one of worker nodes:
   kubectl run test --image=nginx
   you can verify on which node this test pod was scheduled by running command:
   kubectl get pod -o wide
   





After you are done run:
terraform destroy --auto-approve


terraform-example-alb-352318663.eu-central-1.elb.amazonaws.com
terraform-example-alb-352318663.eu-central-1.elb.amazonaws.com

-----------------
run locally:
1) copy file backend/template.env to a new file: backend/.env and fill the values
2) run:
app /backend/app.js
