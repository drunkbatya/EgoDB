CREATE TABLE data (
id serial PRIMARY KEY,
comp_name TEXT,
comp_inn TEXT,
comp_ogrn TEXT,
comp_addr TEXT,
comp_kpp TEXT,
dog_number TEXT,
dog_date DATE,
dog_state TEXT,
dog_comment TEXT,
files TEXT[]
);
