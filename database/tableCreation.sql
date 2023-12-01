-- Queries used to create the necessary tables for the application in Microsoft SQL

CREATE TABLE Accounts ( 
	id INT PRIMARY KEY NOT NULL IDENTITY(1,1),
	role VARCHAR(16) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password_hash VARCHAR(128) NOT NULL,
	organization VARCHAR(64),
	address VARCHAR(255),
	city VARCHAR(32),
	state VARCHAR(2),
	zip_code VARCHAR(16),
	phone VARCHAR(16),
	poc_name VARCHAR(64),
	poc_phone VARCHAR(16),
	active BIT NOT NULL
);

CREATE TABLE Donations ( 
	id INT PRIMARY KEY NOT NULL IDENTITY(1,1),
	item VARCHAR(64) NOT NULL,
	quantity INT NOT NULL,
	value MONEY NOT NULL,
	donor VARCHAR(64) NOT NULL,
	address VARCHAR(255),
	city VARCHAR(32),
	state VARCHAR(2),
	zip_code VARCHAR(16),
	poc_name VARCHAR(64),
	poc_phone VARCHAR(16),
	notes VARCHAR(255),
	from_date DATETIME NOT NULL,
	to_date DATETIME NOT NULL,
	distributor VARCHAR(64),
	status VARCHAR(16) NOT NULL
);