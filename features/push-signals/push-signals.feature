@push_signals
Feature: Deposito segnali
  Tutti gli utenti autorizzati all'e-service deposito segnali possono depositare segnali.

  @push_signals1
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l’accesso all'e-service deposito segnali
    When l'utente deposita 1 segnale
    Then l'e-service deposito segnali riceve la richiesta e la prende in carico correttamente
    Then restituisce status code 200
