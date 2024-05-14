import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(10 * 1000);

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
