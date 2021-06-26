#!/bin/bash

set -euo pipefail;

postgres_psql() {
    sudo -i -u postgres psql;
}
USER="egouser";
DB_NAME="egodb";
#PASS=$(openssl rand -base64 15);
PASS="9XbMW3flIO0B0FYr8R5y";
HOST="localhost";
PORT="5432";

#echo "CREATE DATABASE $DB_NAME" | postgres_psql;
#echo "CREATE USER $USER WITH ENCRYPTED PASSWORD '$PASS'" | postgres_psql;
#echo "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $USER" | postgres_psql;

TEST=$(echo "SELECT 1" | psql "postgresql://$USER:$PASS@$HOST:$PORT/$DB_NAME" 2>&1| sed "s/ //g" | grep "^[0-9]" || true);
if [[ -z $TEST ]];then
    echo "Some error!";
else
    echo "All done!";
fi
echo -e "User: egouser\nPassword: $PASS" > access.sec
