#!/usr/bin/env bash

# Variables
APPENV=local
DBHOST=localhost
DBNAME=worldscope_db
DBUSER=root
DBPASSWD=

# return 1 if global command line program installed, else 0
function program_is_installed {
# set to 1 initially
    local return_=1
# set to 0 if not found
    type $1 >/dev/null 2>&1 || { local return_=0; }
# return value
    echo "$return_"
}

echo -e "Starting Bootstrapping process for WorldScope"

echo -e "\n--- Installing MySQL ---\n"
if [ $(program_is_installed mysql) == 1 ]; then
    echo "mysql is already installed"
else
    echo "mysql-server mysql-server/root_password password $DBPASSWD" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password $DBPASSWD" | debconf-set-selections
    sudo apt-get -y install mysql-server-5.5
fi

echo -e "\n--- Setting up our MySQL user and db ---\n"
if [ ! mysql -u$DBUSER -p$DBPASSWD -e "USE $DBNAME" ]; then
    mysql -u$DBUSER -p$DBPASSWD -e "CREATE DATABASE $DBNAME"
    mysql -uroot -p$DBPASSWD -e "grant all privileges on $DBNAME.* to '$DBUSER'@'localhost' identified by '$DBPASSWD'"
else
    echo -e "worldscope_db already exists"
fi

echo -e "\n--- Installing NodeJS and NPM ---\n"
if [ $(program_is_installed node) == 1 ]; then
    echo "Node is already installed"
else
    echo "Installing node"
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

sudo apt-get install npm

echo -e "\n--- Installing WorldScope Dependencies ---\n"
cd /vagrant/
npm install

echo -e "\n--- Completed ---\n"
