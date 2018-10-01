FROM solita/ubuntu-systemd:latest

# configure apt for non standard packages
RUN apt-get update \
 && apt-get install -y \
      curl apt-transport-https \
      pkg-config

# add node 9.x repo
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -

# add yarn repo
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# install build tools
RUN apt-get update \
 && apt-get install -y \
      git yarn nodejs python bzip2

# install dependencies
RUN apt-get install -y \
      dbus libdbus-1-dev docker.io

# Replace reboot with a command to restart the container
RUN rm /sbin/reboot
RUN echo "#!/bin/sh\ndocker restart webui" > /sbin/reboot
RUN chmod +x /sbin/reboot

# knotd mock
# install modules
WORKDIR /usr/local/bin/knotd
COPY ./docker/knotd/package.json .
RUN npm_config_tmp=/tmp TMP=/tmp yarn

# install app
COPY ./docker/knotd/.babelrc ./.babelrc
COPY ./docker/knotd/src ./src
RUN npm_config_tmp=/tmp TMP=/tmp yarn build
RUN rm -rf ./src

# install configuration files
COPY ./docker/knotd/config ./config
COPY ./docker/knotd/br.org.cesar.knot.conf /etc/dbus-1/system.d

# install init script
COPY ./docker/knotd/knotd.service /lib/systemd/system/knotd.service
COPY ./docker/knotd/knotd.sh /usr/local/bin/knotd.sh
RUN chmod +x /usr/local/bin/knotd.sh
RUN systemctl enable knotd

# devices
# install modules
WORKDIR /usr/local/bin/devices
COPY ./docker/devices/package.json .
RUN npm_config_tmp=/tmp TMP=/tmp yarn

# install app
COPY ./docker/devices/.babelrc ./.babelrc
COPY ./docker/devices/src ./src
RUN npm_config_tmp=/tmp TMP=/tmp yarn build
RUN rm -rf ./src

# install script
COPY ./docker/devices/devices.sh /usr/local/bin/devices.sh
RUN chmod +x /usr/local/bin/devices.sh

# knot-web
# install modules
WORKDIR /usr/local/bin/knot-web-app
COPY package.json .
RUN npm_config_tmp=/tmp TMP=/tmp yarn

# install configuration files
RUN mkdir -p /etc/knot
COPY ./config/gatewayConfig.json ./config/keys.json /etc/knot/
RUN mkdir -p /usr/local/bin/knot-fog-source && touch /usr/local/bin/knot-fog-source/.env
RUN mkdir -p /usr/local/bin/knot-fog-connector && mkdir -p /usr/local/bin/knot-fog-connector/config
COPY ./docker/knot-fog-connector/config.json /usr/local/bin/knot-fog-connector/config/default.json

# install init script
COPY ./docker/knot-web/knot-web.service /lib/systemd/system/knot-web.service
COPY ./docker/knot-web/knot-web.sh /usr/local/bin/knot-web.sh
RUN chmod +x /usr/local/bin/knot-web.sh
RUN systemctl enable knot-web

CMD ["/bin/bash", "-c", "exec  /sbin/init --log-target=journal 3>&1"]
