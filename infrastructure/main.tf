provider "aws" {
  region  = var.region
}

variable vpc_cidr_block {}
variable subnet_1_cidr_block {}
variable avail_zone {}
variable region {}
variable instance_type {}
variable public_key_location {}
variable private_key_location {}
variable worker_names {
  type = list(string)
  default = ["worker-node-0", "worker-node-1"]
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
  tags = {
    Name = "k8s-vpc"
  }
}

resource "aws_subnet" "k8s-subnet-1" {
  vpc_id = aws_vpc.k8s-vpc.id
  cidr_block = var.subnet_1_cidr_block
  availability_zone = var.avail_zone
  tags = {
    Name = "k8s-subnet-1"
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

resource "aws_route_table_association" "a-rtb-subnet" {
  subnet_id      = aws_subnet.k8s-subnet-1.id
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
  availability_zone			  = var.avail_zone

  tags = {
    Name = "control-plane"
  }

  connection {
    type = "ssh"
    host = self.public_ip
    user = "ubuntu"
    private_key = file(var.private_key_location)
  }

  provisioner "remote-exec" {
    inline = [
      "touch a.txt",
    ]
  }

  provisioner "local-exec" {
    command = "ssh ubuntu@${self.public_ip} -oStrictHostKeyChecking=no hostname"
  }
}

resource "aws_instance" "worker-node" {
  count = 2
  ami                         = data.aws_ami.amazon-linux-image.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.ssh-key.key_name
  associate_public_ip_address = true
  subnet_id                   = aws_subnet.k8s-subnet-1.id
  vpc_security_group_ids      = [aws_security_group.k8s-worker-node-sg.id]
  availability_zone			  = var.avail_zone

  tags = {
    Name = "worker-node-${count.index}"
  }
}

output "control-plane-ip" {
  value = aws_instance.control-plane.public_ip
}

output "worker-nodes-ips" {
  value = [for worker in flatten(aws_instance.worker-node):
  worker.public_ip
  ]
}









