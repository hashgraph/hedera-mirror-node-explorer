FROM nginx as production-stage

COPY /dist/ /app
COPY nginx-docker.conf /etc/nginx/nginx.conf
COPY explorer-entrypoint.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/explorer-entrypoint.sh

EXPOSE 8080
