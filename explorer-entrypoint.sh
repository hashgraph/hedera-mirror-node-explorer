#!/bin/sh

JSON_STRING='window.configs = { \
  "DOCKER_LOCAL_MIRROR_NODE_MENU_NAME":"'"${DOCKER_LOCAL_MIRROR_NODE_MENU_NAME}"'", \
  "DOCKER_LOCAL_MIRROR_NODE_URL":"'"${DOCKER_LOCAL_MIRROR_NODE_URL}"'", \
}'

sed -i "s@// CONFIGURATIONS_PLACEHOLDER@${JSON_STRING}@" /app/index.html

nginx -g "daemon off;"