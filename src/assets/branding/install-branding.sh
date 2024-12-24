#!/bin/bash

# Install possible assets customization
BRANDING_DIR="${BRANDING_LOCATION:-./branding}"
cp ${BRANDING_DIR}/public/* ./public/ 2>/dev/null | :
cp -R ${BRANDING_DIR}/public/.well-known ./public/ 2>/dev/null | :
cp ${BRANDING_DIR}/.env ./ 2>/dev/null | :
cp ${BRANDING_DIR}/index.html ./ 2>/dev/null | :
