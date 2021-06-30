#!/bin/bash

sudo apt -y install postgresql nodejs npm
cd ../server/
npm install express pg express-basic-auth morgan multer
