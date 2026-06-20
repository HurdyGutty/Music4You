from node:lts-alpine

workdir /app

copy package*.json ./

run npm ci --omit=dev

copy . .

copy docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
run sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

entrypoint ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]

cmd ["node", "server.js"]

expose 3443