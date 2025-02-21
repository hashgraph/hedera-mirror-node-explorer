#!/bin/bash

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
exit $result