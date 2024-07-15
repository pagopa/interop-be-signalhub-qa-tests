# Interop-be-signalhub-qa-tests

Goal of this project is create a suites of Acceptance test for signal-hub's services in order to test if everything works fine. It's written with [Cucumber](https://cucumber.io/) and Typescript.

## Getting started

To get started, you need:

- node
- pnpm

Install dependecies with `pnpm install`.

## Execute test suite

To execute test suite you have to do some steps.

### Environment

Choose an [enviroment](#enviroment): writing coherent environment files (`.env.some_environment`, ...) and set env variable:

`export NODE_ENV=some_environment` (ex: `development`, `qa`, ...).

Eventually check environment whith: `pnpm run show:env`.

If you are in a local environment, run all services needed to simulate all the collaborators (queque system, database, caching, ...).

### Data preparation

Execute data preparation if your environment need this:

`pnpm run data-preparation`


### AWS credentials and authenticated session



### Test suite

Run whole tests suite:

`pnpm test`

Run all push tests:

`pnpm test:push`

Run all pull tests:

`pnpm test:pull`

If you want execute just specific test you can use `pnpm test:tags "@some_useful_tag"`.


## <a name="enviroment"></a>Environment and enviroment variables

If you don't set NODE_ENV , it will be `development` by default.
For each enviroment you have to set:

- .env[YOUR_ENVIRONMENT]
- .env[YOUR_ENVIRONMENT].voucher.consumer
- .env[YOUR_ENVIRONMENT].voucher.producer

For examples if you have only `development` your files will be

- .env.development
- .env.development.voucher.consumer
- .env.development.voucher.producer

To configure take a leaf from `.env.example` , `.env.example.voucher.consumer` , `.env.example.voucher.consumer` available on the repo.

`export NODE_ENV=uat` will load env variables from `file .env.uat`


## Pre-commit hooks

See [Husky](https://typicode.github.io/husky/how-to.html).

To avoid pre-commit hooks:

`git commit -m "..." -n # Skips Git hooks`
