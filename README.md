# Interop-be-signalhub-qa-tests

Goal of this project is create a suites of Acceptance test for signal-hub's services in order to test if everything works fine. It's written with [Cucumber](https://cucumber.io/) and Typescript.

## Getting started

To get started, you need:

- node
- pnpm

Before running tests suites you have to install dependecies with `pnpm install`

To run test all test suites write on terminal:

`pnpm test`

or if you want execute just specific test you can use `pnpm test:tags "@some_useful_tag"`

### Environment and enviroment variables

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

Default value is `development`.

### Pre-commit hooks

See [Husky](https://typicode.github.io/husky/how-to.html).

To avoid pre-commit hooks:

`git commit -m "..." -n # Skips Git hooks`
