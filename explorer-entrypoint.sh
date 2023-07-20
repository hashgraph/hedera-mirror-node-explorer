#!/bin/sh

JSON_STRING='window.configs = { \
  "VITE_APP_LOCAL_MIRROR_NODE_MENU_NAME":"'"${VITE_APP_LOCAL_MIRROR_NODE_MENU_NAME}"'", \
  "VITE_APP_LOCAL_MIRROR_NODE_URL":"'"${VITE_APP_LOCAL_MIRROR_NODE_URL}"'", \
}'

sed -i "s@// CONFIGURATIONS_PLACEHOLDER@${JSON_STRING}@" /app/index.html

nginx -g "daemon off;"