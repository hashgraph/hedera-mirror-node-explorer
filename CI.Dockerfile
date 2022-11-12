FROM nginx as production-stage

COPY dist/ /app
COPY nginx-docker.conf /etc/nginx/nginx.conf

EXPOSE 8080
