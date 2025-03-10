#!/bin/bash

TARGET_DIR=$(npm prefix)/sourcify-setup

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "⚠️ Did not find the sourcify-setup directory under project root."
  echo "Do not run this script directly and make sure to use the npm command sourcify:check-setup"
  exit 1
fi

##################################################
### CHECK /etc/hosts/setup

HOSTNAME="repository.local"
HOSTS_FILE="/etc/hosts"

# Check if the hostname is already mapped to 127.0.0.1
if grep -qE "^127\.0\.0\.1\s+.*\b${HOSTNAME}\b" "$HOSTS_FILE"; then
    echo "✅ Host ${HOSTNAME} is correctly mapped to 127.0.0.1 in $HOSTS_FILE."
    result=0
else
    echo "⚠️ Host ${HOSTNAME} is NOT correctly mapped to 127.0.0.1 in /etc/hosts"
    echo "--> Edit /etc/hosts or execute the following command:"
    echo "  sudo bash -c 'echo "127.0.0.1       repository.local" >> /etc/hosts'"
    result=1
fi

echo
##################################################
### CHECK VALID CERTIFICATE IN PLACE

DOMAIN="localhost"
DAYS=365
CERT_DIR="$TARGET_DIR/nginx/certificate"
CRT_FILE="$CERT_DIR/$DOMAIN.crt"
KEY_FILE="$CERT_DIR/$DOMAIN.key"

if [[ -f "$CRT_FILE" && -f "$KEY_FILE" ]]; then
    VALIDITY=$(openssl x509 -checkend 0 -noout -in "$CRT_FILE")
    if [[ $VALIDITY != "Certificate will not expire" ]]; then
       echo "⚠️ Certificate is not valid"
       echo "--> Clean up remaining certificate and/or key files and re-run this script"
       result=1
    else
       echo "✅ Valid self-signed certificate for $DOMAIN is already installed"
       result=0
    fi
elif [[ ! -f "$CRT_FILE" && -f "$KEY_FILE" ]]; then
    echo "⚠️ Certificate file missing"
    echo "--> Clean up remaining key file and re-run this script"
    result=1
elif [[ ! -f "$KEY_FILE" && -f "$CRT_FILE" ]]; then
    echo "⚠️ Key file missing"
    echo "--> Clean up remaining certificate file and re-run this script"
    result=1
else
  echo "✅ Generating self-signed certificate for $DOMAIN..."
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days "$DAYS" -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/CN=$DOMAIN"
  echo "Certificate : $CRT_FILE"
  echo "Private key : $KEY_FILE"
    result=0
fi

echo
##################################################
### CHECK WHETHER DOCKER IS RUNNING

if docker info > /dev/null 2>&1; then
  echo "✅ Docker is running"
    result=0
else
  echo "⚠️ Docker is not running!"
     echo "--> Make sure docker is running -- e.g. by starting Docker Desktop"
     result=1
fi


exit $result