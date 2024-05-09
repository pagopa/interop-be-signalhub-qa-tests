import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";

BeforeAll(function () {
  // console.log("BEFORE ALL");
});
Before(function () {
  // console.log("BEFORE");
});

After(function () {
  // console.log("AFTER");
});

AfterAll(function () {
  // console.log("AFTER ALL");
});
