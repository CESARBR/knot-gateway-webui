FROM solita/ubuntu-systemd:latest

# configure apt for non standard packages
RUN apt-get update \
 && apt-get install -y \
      curl apt-transport-https

# add node 6.x repo
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -

# add yarn repo
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# install build tools
RUN apt-get update \
 && apt-get install -y \
      git yarn nodejs python bzip2

# install dependencies
RUN apt-get install -y \
      dbus docker.io

# Replace reboot with a command to restart the container
RUN rm /sbin/reboot
RUN echo "#!/bin/sh\ndocker restart webui" > /sbin/reboot
RUN chmod +x /sbin/reboot

# install modules
WORKDIR /usr/local/bin/knot-web-app
COPY package.json .
RUN npm_config_tmp=/tmp TMP=/tmp yarn

# install configuration files
RUN mkdir -p /etc/knot
COPY ./config/gatewayConfig.json ./config/keys.json /etc/knot/
RUN mkdir -p /usr/local/bin/knot-fog-source && touch /usr/local/bin/knot-fog-source/.env

# install init script
COPY ./docker/knot-web/knot-web.service /lib/systemd/system/knot-web.service
COPY ./docker/knot-web/knot-web.sh /usr/local/bin/knot-web.sh
RUN chmod +x /usr/local/bin/knot-web.sh
RUN systemctl enable knot-web

CMD ["/bin/bash", "-c", "exec  /sbin/init --log-target=journal 3>&1"]
