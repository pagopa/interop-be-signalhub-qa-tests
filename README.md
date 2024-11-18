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

`export NODE_ENV=some_environment` (ex: `dev`, `qa`, ...).

Eventually check environment whith: `pnpm run show:env`.

If you are in a local environment, run all services needed to simulate all the collaborators (queque system, database, caching, ...).

### AWS credentials and authenticated session

Authenticated AWS session (+ export profile)

```
# file ~/.aws.config
[PROFILE <YOUR_AWS_PROFILE>]
sso_role_name
sso_account_id
... and other informations
```

`export AWS_PROFILE=<YOUR_AWS_PROFILE>` 
`aws sso login`

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
- .env[YOUR_ENVIRONMENT].voucher

For examples if you have only `dev` your files will be

- .env.dev
- .env.dev.voucher

To configure take a leaf from `.env.example` , `.env.example.voucher` available on the repo.

`export NODE_ENV=uat` will load env variables from `file .env.uat`


## Pre-commit hooks

See [Husky](https://typicode.github.io/husky/how-to.html).

To avoid pre-commit hooks:

`git commit -m "..." -n # Skips Git hooks`
