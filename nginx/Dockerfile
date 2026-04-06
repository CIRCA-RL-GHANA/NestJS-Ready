FROM nginx:1.25-alpine

# Bake the main config into the image to avoid bind-mount file-vs-directory issues
COPY nginx.conf /etc/nginx/nginx.conf
