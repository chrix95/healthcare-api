<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Fabric Healthcare API built on [Nest](https://github.com/nestjs/nest) framework TypeScript.

## Pre-requisites
- Node.js 18.x
- Docker


## Setting up and Running the app

Copy the `.env.example` file to `.env` and set the environment variables.
```bash
MONGODB_URI=YOUR_MONGODB_URI
```

To start the application using docker, ensure you docker application is running and then run the following commands:
```bash
# development
$ docker compose up
````
To start the application without docker, run the following commands:
```bash
# development
$ yarn install
$ yarn start:dev
```
To start the application in production mode, run the following commands:
```bash
# production
$ yarn install
$ yarn build
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn run test (This will run all tests) - included in this project

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## API Documentation
The API documentation is generated using [Swagger](https://swagger.io/) and can be accessed at `http://localhost:3000/api` after starting the application.

### Patient API Endpoints
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get a single patient
- `POST /patients` - Create a new patient
```json
{
  "name": "Mike Doe",
  "age": 19,
  "gender": "male",
  "contact": "+2348183780410"
}
```

### Appointment API Endpoints
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get a single appointment
- `POST /appointments` - Create a new appointment (using form-data)
```json
{
  "filepath": `select the appointment file`,
}
```
Request body should be in form-data format with the key `filepath` and the value as the file to be uploaded.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
