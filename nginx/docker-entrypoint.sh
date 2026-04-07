#!/bin/sh
# ===========================================================
# nginx Docker entrypoint wrapper
#
# Selects the correct nginx configuration at container start
# depending on whether a Let's Encrypt certificate exists yet:
#
#   Cert present  → full HTTPS config  (nginx.conf.template)
#   Cert absent   → HTTP-only bootstrap (nginx-http.conf.template)
#                   Port 80 stays up for the ACME challenge so
#                   certbot / vps-init.sh can issue the cert.
#                   After cert is issued, restart the nginx
#                   container and it will switch to HTTPS automatically.
# ===========================================================
set -e

CERT_PATH="/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem"

if [ -f "${CERT_PATH}" ]; then
    echo "[nginx] SSL cert found for ${API_DOMAIN} — starting in HTTPS mode"
    envsubst '$API_DOMAIN $FRONTEND_DOMAIN' \
        < /etc/nginx/nginx.conf.template \
        > /etc/nginx/nginx.conf
else
    echo "[nginx] SSL cert NOT found at ${CERT_PATH}"
    echo "[nginx] Starting in HTTP-only bootstrap mode — run vps-init.sh to issue the cert"
    echo "[nginx] After the cert is issued, restart this container to enable HTTPS"
    envsubst '$API_DOMAIN' \
        < /etc/nginx/nginx-http.conf.template \
        > /etc/nginx/nginx.conf
fi

# Delegate to the official nginx entrypoint so that
# /docker-entrypoint.d/ scripts (ipv6, worker-process tuning, etc.) still run.
exec /docker-entrypoint.sh nginx -g 'daemon off;'
