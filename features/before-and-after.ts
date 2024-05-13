import pg from "pg";
import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(10 * 1000);

const { Client } = pg;

const client = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

BeforeAll(async function () {
  await client.connect();
});
Before(async function () {
  await client.query("truncate signal;");
});

After(function () {
  // console.log("AFTER");
});

AfterAll(async function () {
  await client.end();
});
