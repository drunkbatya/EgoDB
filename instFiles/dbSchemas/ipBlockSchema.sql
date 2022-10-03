CREATE TABLE expire_table (
    timestamp timestamp NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL
);
