provider "aws" {
  region = var.region
}

data "aws_ami" "amazon-linux-image" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "k8s-vpc" {
  cidr_block = var.vpc_cidr_block
  tags       = {
    Name = "k8s-vpc"
  }
}

resource "aws_subnet" "k8s-subnet-1" {
  vpc_id            = aws_vpc.k8s-vpc.id
  cidr_block        = var.subnet_1_cidr_block
  availability_zone = var.avail_zone
  tags              = {
    Name = "k8s-subnet-1"
  }
}

resource "aws_subnet" "k8s-subnet-2" {
  vpc_id            = aws_vpc.k8s-vpc.id
  cidr_block        = var.subnet_2_cidr_block
  availability_zone = var.avail_zone_subnet_2
  tags              = {
    Name = "k8s-subnet-2"
  }
}

resource "aws_security_group" "k8s-control-plane-sg" {
  name   = "k8s-control-plane-sg"
  vpc_id = aws_vpc.k8s-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "ssh - open to anyone"
  }

  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "API server - open to anyone"
  }

  ingress {
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "etcd server client API. Used by kube-apiserver, etcd"
  }

  ingress {
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "kubelet api, used by self, Control plane"
  }

  ingress {
    from_port   = 10251
    to_port     = 10251
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "kube-scheduler, used by self"
  }

  ingress {
    from_port   = 10252
    to_port     = 10252
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "kube-controller-manager, used by self"
  }

  ingress {
    from_port   = 6783
    to_port     = 6783
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "Weave Net port. Used within VPC"
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
    prefix_list_ids = []
  }

  tags = {
    Name = "k8s-control-plane-sg"
  }
}

resource "aws_security_group" "k8s-worker-node-sg" {
  name   = "k8s-worker-node-sg"
  vpc_id = aws_vpc.k8s-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "kubelet api, used by self, Control plane"
  }

  ingress {
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "NodePort Services. Used by all"
  }

  ingress {
    from_port   = 6783
    to_port     = 6783
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
    description = "Weave Net port. Used within VPC"
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
    prefix_list_ids = []
  }

  tags = {
    Name = "k8s-worker-node-sg"
  }
}

resource "aws_internet_gateway" "k8s-igw" {
  vpc_id = aws_vpc.k8s-vpc.id

  tags = {
    Name = "k8s-internet-gateway"
  }
}

resource "aws_route_table" "k8s-route-table" {
  vpc_id = aws_vpc.k8s-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.k8s-igw.id
  }


  tags = {
    Name = "k8s-route-table"
  }
}

resource "aws_route_table_association" "rtb-subnet-1" {
  subnet_id      = aws_subnet.k8s-subnet-1.id
  route_table_id = aws_route_table.k8s-route-table.id
}

resource "aws_route_table_association" "rtb-subnet-2" {
  subnet_id      = aws_subnet.k8s-subnet-2.id
  route_table_id = aws_route_table.k8s-route-table.id
}

resource "aws_key_pair" "ssh-key" {
  key_name   = "k8s-key"
  public_key = file(var.public_key_location)
}

resource "aws_instance" "control-plane" {
  ami                         = data.aws_ami.amazon-linux-image.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.ssh-key.key_name
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.k8s-subnet-1.id
  vpc_security_group_ids      = [aws_security_group.k8s-control-plane-sg.id]
  availability_zone           = var.avail_zone

  tags = {
    Name = "control-plane"
  }
}

resource "aws_instance" "worker-node" {
  count                       = var.number_of_worker_nodes
  ami                         = data.aws_ami.amazon-linux-image.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.ssh-key.key_name
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.k8s-subnet-1.id
  vpc_security_group_ids      = [aws_security_group.k8s-worker-node-sg.id]
  availability_zone           = var.avail_zone

  tags = {
    Name = "worker-node-${count.index}"
  }
}

resource "aws_security_group" "alb" {
  name        = "k8s_alb_security_group"
  description = "k8s ALB security group"
  vpc_id      = aws_vpc.k8s-vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "k8s ALB security group"
  }
}

resource "aws_alb" "alb" {
  name            = "k8s-alb"
  security_groups = [aws_security_group.alb.id]
  subnets         = [aws_subnet.k8s-subnet-1.id, aws_subnet.k8s-subnet-2.id]
  tags            = {
    Name = "k8s ALB"
  }
}

resource "aws_alb_target_group" "group" {
  name        = "k8s-alb-target-group"
  port        = 30000
  protocol    = "HTTP"
  target_type = "instance"
  vpc_id      = aws_vpc.k8s-vpc.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    interval            = 10
    matcher             = "200-499"
  }
}

resource "aws_alb_listener" "listener_http" {
  load_balancer_arn = aws_alb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.group.arn
    type             = "forward"
  }
}

resource "aws_alb_target_group_attachment" "target_group_attachment" {
  count            = var.number_of_worker_nodes
  target_group_arn = aws_alb_target_group.group.arn
  target_id        = aws_instance.worker-node[count.index].id
}

data "aws_route53_zone" "hosted_zone" {
  name = var.route53_hosted_zone_name
}

resource "aws_route53_record" "route53_record" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = var.route53_hosted_zone_url
  type    = "A"
  alias {
    name                   = aws_alb.alb.dns_name
    zone_id                = aws_alb.alb.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "route53_record_subdomains" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = var.route53_hosted_zone_subdomains_url
  type    = "A"
  alias {
    name                   = aws_alb.alb.dns_name
    zone_id                = aws_alb.alb.zone_id
    evaluate_target_health = false
  }
}









