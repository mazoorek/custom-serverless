output "control-plane-ip" {
  value = aws_instance.control-plane.public_ip
}

output "worker-nodes-ips" {
  value = [for worker in flatten(aws_instance.worker-node):
  worker.public_ip
  ]
}
