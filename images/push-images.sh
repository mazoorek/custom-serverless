aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 444773651763.dkr.ecr.eu-central-1.amazonaws.com
echo "---------------------------------push custom-serverless backend--------------------------------------------------"
docker build -t custom-serverless-backend -f ../backend/Dockerfile ../backend/
docker tag custom-serverless-backend:latest 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-backend:latest
docker push 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-backend:latest