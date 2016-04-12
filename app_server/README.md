[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

## Setting up the Database
As WorldScope relies on MySQL, it is required to set up a MySQL database. Download a copy from http://dev.mysql.com/downloads/ based on your Operating System. It will be good to keep MySQL version at least v5.5

* Note the MySQL username and password 
* Create database named `'worldscope_db'` or other names but do update the `name` field in the next step
```
mysql> CREATE DATABASE worldscope_db CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```
* Edit the `name`, `username` and `password` fields accordingly in configuration file located in [config/DatabaseConfig.js](config/DatabaseConfig.js)

## Deployment
To install dependencies, run `npm install`

To start the database, run 
```
## on Linux
shell> service mysql start 
## on Windows
shell> "path/to/mysql" -u root -p start
```

To start the application server, run `npm start`.

## Contributing 
To start the tests suit, run `npm test`. Test reports will be generated int he `report` directory.

To execute code analyzer and code style checker, run `npm run linter`.

To generate documentation, run `npm run doc`. Documentations will be generated in the `doc` directory.

[travis-image]: https://travis-ci.org/nus-mtp/worldscope.svg?branch=master
[travis-url]: https://travis-ci.org/nus-mtp/worldscope

[coveralls-image]: https://coveralls.io/repos/nus-mtp/worldscope/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/nus-mtp/worldscope?branch=master
