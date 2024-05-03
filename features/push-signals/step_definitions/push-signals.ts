import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";

Given(
  "Un utente, come produttore di segnali, ottiene un voucher valido per l’accesso all'e-service deposito segnali",
  () => {
    // Write code here that turns the phrase above into concrete actions
  }
);

When("l'utente deposita {int} segnale", (_howManySignals: number) => {
  // Write code here that turns the phrase above into concrete actions
});

Then(
  "l'e-service deposito segnali riceve la richiesta e la prende in carico correttamente",
  () => {
    // Write code here that turns the phrase above into concrete actions
    assert.strictEqual(true, true);
  }
);
Then("restituisce status code {int}", (_statusCode: number) => {
  // Write code here that turns the phrase above into concrete actions
  assert.strictEqual(true, true);
});
