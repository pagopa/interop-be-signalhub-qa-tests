import { Given, Then, When } from "@cucumber/cucumber";
import assert from "assert";

Given("today is Sunday", function () {
  this.today = "Sunday";
});

When("I ask whether it's Friday yet", function () {
  this.actualAnswer = "Nope";
});

Then("I should be told {string}", function (expectedAnswer) {
  assert.strictEqual(this.actualAnswer, expectedAnswer);
});
