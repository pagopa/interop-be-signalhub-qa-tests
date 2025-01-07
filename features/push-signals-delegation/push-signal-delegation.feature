@push_signals_delegations
Feature: Capofila
Un utente, che ha un <ruolo> di un ente aderente <ente> come erogatore pubblica un e-service <e-service>
e abilita l'opzione "utilizzo Signal Hub".
Lo stesso utente assegna una delega amministrativa ad un altro ente <ente-delegato>. L'ente che ha delegato per quell' e-service diventa <ente-delegante>.

  Background:
    Given l'ente "Agid", aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali
    Given l'ente erogatore ha pubblicato un e-service denominato "domicili digitali" abilitato a Signal Hub
    Given l'ente erogatore ha delegato l'ente "Comune di Milano" alla gestione amministrativa

  @push_signals_delegations1
  Scenario Outline: L'utente, come ente delegante deposita un segnale. La richiesta va a buon fine.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals_delegations2
  Scenario Outline: L'utente, come ente delegato deposita un segnale. La richiesta va in errore. NB: la delega è solo amministrativa, l'ente delegante non può depositare segnali.
    Given l'utente come ente delegato ha ottenuto un voucher api
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va in errore con status code 403
