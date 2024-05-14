# Interop-be-signalhub-qa-tests

Goal of this project is create a suites of Acceptance test for signal-hub's services in order to test if everything works fine. It's written with [Cucumber](https://cucumber.io/) and Typescript.

## Getting started

To get started, you need:

- node
- pnpm

Optional you can use [Bun](https://bun.sh/) to run test.

Before running tests suites you have to install dependecies with

`pnpm install`

You can run suites with [Bun](https://bun.sh/) with following command:

`pnpm bun:test`

or with node with:

`pnpm test`

Run only tagged test:

`pnpm test:tags "@some_useful_tag"`


### Environment and enviroment variables

`export NODE_ENV=development` will load env variables from `file .env.development`

`export NODE_ENV=uat` will load env variables from `file .env.uat`

Default value is `development`.


### Pre-commit hooks

See [Husky](https://typicode.github.io/husky/how-to.html).

To avoid pre-commit hooks:

`git commit -m "..." -n # Skips Git hooks`