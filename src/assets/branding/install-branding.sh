#!/bin/bash

# Install default logos and theme
cp ./src/assets/brand*.png ./src/assets/branding/
cp ./src/assets/styles/brand-theme.css ./src/assets/branding/

# Install possible assets customization
BRANDING_DIR="${BRANDING_LOCATION:-./branding}"
cp ${BRANDING_DIR}/assets/* ./src/assets/branding/ 2>/dev/null | :
cp ${BRANDING_DIR}/public/* ./public/ 2>/dev/null | :
cp -R ${BRANDING_DIR}/public/.well-known ./public/ 2>/dev/null | :
cp ${BRANDING_DIR}/.env ./ 2>/dev/null | :
cp ${BRANDING_DIR}/index.html ./ 2>/dev/null | :

# When custom theme provided: pre-process SASS/SCSS files based on it
#npx sass ./src/assets/branding/brand-theme.scss ./src/assets/branding/brand-theme.css
#npx sass ./src/assets/styles/explorer.scss ./src/assets/styles/explorer.css
#npx sass ./src/assets/styles/explorer-bulma.sass ./src/assets/styles/explorer-bulma.css
npx sass ./src/assets/styles/explorer-oruga.scss ./src/assets/styles/explorer-oruga.css
