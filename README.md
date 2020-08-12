# GraphQL API Template (JWT)

GraphQL API Boilerplate Template featuring Full Auth System, written in Typescript.
I recommend installing and using Yarn prior to setting up this template.

Features Include:
* Register
    * Confirmation Email
    * With Facebook
    * With Google
* Login
    * With Email
    * With Username
    * With Facebook
    * With Google
* Forgot Password
* Upload Images (Profile Picture)
    * To Local Server
    * To Google Cloud Storage (Google Cloud Platform)
* Testing
    * Included Jest Testing for Resolvers

## Technology Overview
It utilizes the following technologies:
* Server
  * NodeJS
  * ExpressJS
  * Apollo Server Express
  * PostgreSQL
  * BcryptJS
  * Type GraphQL
  * TypeORM
  * Redis
  * PassportJS
  * Express Session
  * Nodemailer
  * UUID

All code is constructed using TypeScript.

## Prerequisites

### Technologies Used
* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](https://expressjs.com/)
* [Apollo Server Express](https://www.apollographql.com/docs/apollo-server/v1/servers/express/)
* [PostgreSQL](https://www.postgresql.org/)
* [BcryptJS](https://www.npmjs.com/package/bcryptjs)
* [Type GraphQL](https://typegraphql.com/)
* [TypeORM](https://typeorm.io/#/)
* [Redis](https://redis.io/)
* [PassportJS](http://www.passportjs.org/)
* [Express Session](https://github.com/expressjs/session)
* [Nodemailer](https://nodemailer.com/about/)
* [UUID](https://github.com/uuidjs/uuid)

### Commands

#### Install Dependencies
```
yarn install
```

#### Start Server
```
yarn start
```

#### Build Server
```
yarn build
```

#### Install PostgreSQL
```
brew install postgres
brew services start postgres
```

#### Setup PostgreSQL User
```
psql postgres
[postgres=#] CREATE ROLE postgres WITH LOGIN PASSWORD ‘postgres’;
[postgres=#] ALTER ROLE postgres CREATEDB;
```
NOTE: To Exit Postgres Terminal, Press CTRL + D

#### Create PostgreSQL Database
```
psql postgres -U postgres
[postgres=#] CREATE DATABASE <database_name>;
[postgres=#] \connect <database_name>
```
PostgreSQL runs on port 5432 by default. Change the database name in ormconfig.json and everything should work.

## Directory

* **src** - primary TS files
  * **entities** - TypeORM Entities
  * **modules** - Type GraphQL Resolvers and Modules
    * **middleware** - authentication middlewares
    * **user** - user-related resolvers
    * **utils** - utilities to handle emails
  * **oauth** - PassportJS OAuth strategies
  * **routes** - express routing for OAuth
  * **testing** - code required to run tests for resolvers
  * **utils** - utilities for building schemas
  * *index.ts* - main file for GraphQL API
  * *redis.ts* - initialization for Redis cache 
    
## What I Learned

### Backend
* GraphQL API Creation
* Type GraphQL Resolver Design
* ORM Operations
* PostgreSQL Database System
* Authentication via Sessions/Cookies
* Redis Cache Operations and Use Cases
* Creating Unique Limited Time URLs
* Sending Emails in NodeJS
* Cleaner routing with ExpressJS
* OAuth Flow with PassportJS
    * Facebook OAuth
    * Google OAuth
* Testing Resolvers for Better Code Practices

## Contributors

* **Advaith Nair** 
    * *Backend Developer*
    * [Website](https://advaithnair.com)

## Contact
For questions, feel free to contact me at [advaithnair2@gmail.com](mailto:advaithnair2@gmail.com).