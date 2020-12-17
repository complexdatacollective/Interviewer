# FROM node:8.16-jessie as base
# Pull base image.
FROM ubuntu:16.04 as base

# Install Node.js
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update
# Things we want
RUN apt-get install -y nodejs build-essential git xvfb
# Things we seem to need
RUN apt-get install -y libavahi-compat-libdnssd-dev libxtst6 libxss1 libgtk2.0-0 libgtk-3-0 libnss3 libasound2 libgconf-2-4
RUN apt-get install -y avahi-daemon avahi-discover libnss-mdns
# RUN apt-get install g++-multilib lib32z1 lib32ncurses5 -y
# RUN apt-get install rpm fakeroot dpkg libdbus-1-dev libx11-dev -y
# RUN apt-get install libavahi-compat-libdnssd-dev g++ -y
# RUN apt-get install gcc-4.8-multilib g++-4.8-multilib -y
# RUN apt-get install libgtk2.0-0 libgtk2.0-dev xvfb -y
# RUN apt-get install libxtst6 -y
# RUN apt-get install libxss1 libnss3 libasound2 libgconf-2-4 -y

FROM base as environment
ENV ELECTRON_ENABLE_STACK_DUMPING true
ENV ELECTRON_ENABLE_LOGGING true
ENV DISPLAY :99.0
ENV SCREEN_GEOMETRY "1440x900x24"
ENV CHROMEDRIVER_WHITELISTED_IPS "127.0.0.1"
# ENV CHROMEDRIVER_PORT 4444
# ENV CHROMEDRIVER_URL_BASE ''
# ENV CHROMEDRIVER_EXTRA_ARGS ''

FROM environment as build
WORKDIR /app

# Npm install
COPY package.json /app
COPY package-lock.json /app
RUN npm install

# Necessary config for builds
COPY .eslintrc.json /app
COPY .eslintignore /app
COPY babel.config.js /app

CMD ["/usr/bin/env bash"]
