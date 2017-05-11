FROM solita/ubuntu-systemd:latest

# configure apt for non standard packages
RUN apt-get update \
 && apt-get install -y \
      curl apt-transport-https

# add yarn repo
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# add node 6.x repo
RUN curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN echo "deb https://deb.nodesource.com/node_6.x xenial main" | tee /etc/apt/sources.list.d/nodesource.list

# install dependencies
RUN apt-get update \
 && apt-get install -y \
      yarn nodejs \
      dbus connman \
      mongodb

# install modules
WORKDIR /usr/local/bin/knot-web-app
COPY package.json .
RUN yarn

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
