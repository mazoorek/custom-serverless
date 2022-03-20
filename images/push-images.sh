aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 444773651763.dkr.ecr.eu-central-1.amazonaws.com
echo "---------------------------------push custom-serverless backend--------------------------------------------------"
docker build -t custom-serverless-backend -f ../backend/Dockerfile ../backend/
docker tag custom-serverless-backend:latest 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-backend:latest
docker push 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-backend:latest
echo "---------------------------------push custom-serverless frontend-------------------------------------------------"
docker build -t custom-serverless-frontend -f ../frontend/Dockerfile ../frontend/
docker tag custom-serverless-frontend:latest 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-frontend:latest
docker push 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-frontend:latest
echo "---------------------------------push custom-serverless runtime-------------------------------------------------"
docker build -t custom-serverless-runtime -f ../runtime/Dockerfile ../runtime/
docker tag custom-serverless-runtime:latest 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-runtime:latest
docker push 444773651763.dkr.ecr.eu-central-1.amazonaws.com/custom-serverless-runtime:latest
