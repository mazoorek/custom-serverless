provision infrastructure and start cluster:
1) set environment variables in terminal
$ export AWS_ACCESS_KEY_ID="anaccesskey"
$ export AWS_SECRET_ACCESS_KEY="asecretkey"
2) create terraform.tfvars in infrastructure/ copy here content of terraform-template.tfvars and fill missing input
   variables
3) run terraform init
4) run terraform apply
