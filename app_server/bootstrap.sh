#!/usr/bin/env bash

# Variables
APPENV=local
APP=WORLDSCOPE
DBHOST=localhost
DBNAME=worldscope_db
# DBUSER must be root
DBUSER=root
DBPASSWD=password
NODE_VERSION=5.9.0

# return 1 if global command line program installed, else 0
function program_is_installed {
# set to 1 initially
    local return_=1
# set to 0 if not found
    type $1 >/dev/null 2>&1 || { local return_=0; }
# return value
    echo "$return_"
}

function install_node {
    ws_log "Installing NodeJS"
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo apt-get install npm
}

function remove_node {
    ws_log "Node version outdated, removing previous versions of node"
    sudo apt-get remove nodejs
    sudo apt-get remove npm
}

function ws_log {
    echo -e "\n--- $APP LOG: $1 ---\n"
}

ws_log "Starting Bootstrapping process for WorldScope"

# MYSQL
ws_log "Checking MySQL"
if [ $(program_is_installed mysql) == 1 ]; then
    ws_log "MySQL is already installed"
else
    ws_log "Installing MySQL"
    echo "mysql-server mysql-server/root_password password $DBPASSWD" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password $DBPASSWD" | debconf-set-selections
    sudo apt-get -y install mysql-server-5.5
fi

ws_log "Setting up our MySQL database"
if ! mysql -u$DBUSER -p$DBPASSWD -e "USE $DBNAME" ; then
    ws_log "$DBNAME created"
    mysql -u$DBUSER -p$DBPASSWD -e "CREATE DATABASE $DBNAME"
    mysql -uroot -p$DBPASSWD -e "grant all privileges on $DBNAME.* to '$DBUSER'@'localhost' identified by '$DBPASSWD'"
else
    ws_log "$DBNAME already exists"
fi

# NODEJS
ws_log "Checking NodeJS and NPM"
if [ $(program_is_installed node) == 1 ]; then
    ws_log "Node is already installed, checking Node version: "
    node -v
    res=$(node -v | grep -c  ${NODE_VERSION})
    if [ $res != 1 ]; then
        remove_node
        install_node
    fi
else
    install_node
fi

ws_log "Installing WorldScope Dependencies"
cd /vagrant/
npm install

ws_log "Completed"
