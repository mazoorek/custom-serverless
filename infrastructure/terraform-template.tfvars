#for example "100.0.0.0/16", remember: this value must not collide with weave net subnet so you can't put here "10.0.0.0/16"
vpc_cidr_block=FILL_ME
#for example "100.0.1.0/16", remember: this value must not collide with weave net subnet so you can't put here "10.0.0.0/16"
subnet_1_cidr_block=FILL_ME
##for example "100.0.1.0/16", needed because ALB(Application Load Balancer) need at least 2 subnets
subnet_2_cidr_block=FILL_ME
region=FILL_ME
#availability zone for example: "eu-central-1a"
avail_zone=FILL_ME
#availability zone other than avail_zone for ALB for example: "eu-central-1b"
avail_zone_subnet_2=FILL_ME
# EC2 instance type, required minimum "t2.medium"
instance_type=FILL_ME
# location to public key to connect with aws instances
public_key_location=FILL_ME
# number of worker nodes, default is 2
number_of_worker_nodes=FILL_ME
