#!/bin/bash

set -euo pipefail;

error_msg() {
    echo "Some error!";
}
ok_msg() {
    echo "All done! For easy maintenance U may use ./psql.sh command!"
    echo "U may find credentials on ./access.sec file"
}
trap error_msg EXIT;

APP_USER=$(whoami); #TODO: create user e.g. www-data
DB_USER="egouser";
DB_NAME="egodb";
DB_PASS=$(openssl rand -hex 9);
DB_HOST="localhost";
DB_PORT="5432";
FILES_DIR="/opt/EgoDBFiles";
LOG_DIR="/var/log/EgoDB";

echo "Adding postgresql and nodejs repo"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" |sudo tee  /etc/apt/sources.list.d/pgdg.list
sudo apt update

echo "Installing postgres and nodejs";
sudo apt -y install postgresql-13 nodejs libpq-dev

echo "Creating database, user and configuring access";
postgres_psql() {
    sudo -i -u postgres psql;
}
user_psql() {
    psql "postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME";
}
echo "CREATE DATABASE $DB_NAME" | postgres_psql;
echo "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS'" | postgres_psql;
echo "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER" | postgres_psql;

# test connection before continue
echo "SELECT 1" | user_psql 2>&1| sed "s/ //g" | grep "^[0-9]";
echo -e "User: $DB_USER\nPassword: $DB_PASS" > access.sec
chmod 600 access.sec
echo "psql postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME" > psql.sh
chmod 700 psql.sh

echo "Saving access credentials to ./server/dbConnect.js";
echo -e "const Pool = require('pg').Pool

const pool = new Pool({
    user: '$DB_USER',
    host: '$DB_HOST',
    database: '$DB_NAME',
    password: '$DB_PASS',
    port: $DB_PORT
});

module.exports = pool;
" > ./server/dbConnect.js;

echo "Creating tables"
TABLES=( $(ls ./instFiles/dbSchemas/) );
for CUR in "${TABLES[@]}";do
    user_psql < "./instFiles/dbSchemas/$CUR";
    echo "Created table $CUR"
done

echo "Inserting fixtures into database";
TABLES=( $(ls ./instFiles/dbFixtures/) );
for CUR in "${TABLES[@]}";do
    user_psql < "./instFiles/dbFixtures/$CUR";
    echo "$CUR inserted"
done

echo "Installing npm packages"
cd ./server/
npm install

echo "Creating dirs"
sudo mkdir -p "$FILES_DIR" "$LOG_DIR";
sudo chown "$APP_USER:$APP_USER" "$FILES_DIR" "$LOG_DIR";

echo "Granting 80 and 443 ports open priveleges to nodejs"
NODE=$(which node);
sudo setcap 'cap_net_bind_service=+ep' "$NODE"

trap ok_msg EXIT;
