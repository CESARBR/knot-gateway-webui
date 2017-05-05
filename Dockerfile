FROM solita/ubuntu-systemd:latest

# install packages
RUN apt-get update \
 && apt-get install -y \
      dbus connman \
      mongodb nodejs-legacy npm \
 && apt-get clean

# install modules
WORKDIR /usr/local/bin/knot-web-app
COPY package.json .
RUN npm install

# install configuration files
RUN mkdir -p /etc/knot
COPY ./app/config/gatewayConfig.json /app/config/keys.json /etc/knot/
RUN mkdir -p /usr/local/bin/knot-fog-source && touch /usr/local/bin/knot-fog-source/.env

# install init script
COPY ./docker-knot-web.service /lib/systemd/system/knot-web.service
RUN systemctl enable knot-web

# copy files
COPY . .

CMD ["/bin/bash", "-c", "exec  /sbin/init --log-target=journal 3>&1"]
