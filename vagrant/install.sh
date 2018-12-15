#!/usr/bin/env bash

sudo apt-get update -y
sudo apt-get install lksctp-tools wget mc -y

wget http://www.emqtt.io/downloads/latest/ubuntu16_04-deb
mv ubuntu16_04-deb emqx-ubuntu16.04-v3.0-rc.5_amd64.deb
sudo dpkg --install emqx-ubuntu16.04-v3.0-rc.5_amd64.deb

sudo service emqx start
