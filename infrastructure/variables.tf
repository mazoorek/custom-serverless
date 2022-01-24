variable vpc_cidr_block {}
variable subnet_1_cidr_block {}
variable subnet_2_cidr_block {}
variable avail_zone {}
variable avail_zone_subnet_2 {}
variable region {}
variable instance_type {}
variable public_key_location {}
variable number_of_worker_nodes {
  type = number
  default = 2
}
variable route53_hosted_zone_name {}
variable route53_hosted_zone_url {}
variable route53_hosted_zone_subdomains_url {}
