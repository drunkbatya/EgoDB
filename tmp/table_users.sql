CREATE TABLE users (
id serial PRIMARY KEY,
username VARCHAR ( 50 ) UNIQUE NOT NULL,
fullname VARCHAR(50) NOT NULL,
password VARCHAR ( 50 ) NOT NULL,
email VARCHAR ( 255 ) UNIQUE,
created_on TIMESTAMP NOT NULL,
last_login TIMESTAMP
ilovecookie VARCHAR (22)
);
