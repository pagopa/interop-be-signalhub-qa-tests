@push_signals
Feature: Deposito segnali
  Tutti gli utenti autorizzati all'e-service deposito segnali possono depositare segnali.

  Un utente, che ha un ruolo <ruolo>, di un ente aderente <ente>, come erogatore, pubblica un un e-service <e-service>.  L'utente, il cui ente aderente rispetta i requisiti, ha una richiesta di fruizione attiva per l'e-service deposito segnali. L'utente ha una finalità attiva per l'e-service deposito segnali.
  L'utente ha un client associato alla finalità. L’utente dell’ente aderente diventa produttore di segnali.


  @push_signals1
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l’accesso all'e-service deposito segnali
    When l'utente deposita 1 segnale
    Then l'e-service deposito segnali riceve la richiesta e la prende in carico correttamente
    Then restituisce status code 200
