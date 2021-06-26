#!/bin/bash

sudo apt -y install postgresql nodejs
cd ../server/
npm install express pg express-basic-auth
