@push_signals
Feature: Deposito segnali
  Tutti gli utenti autorizzati all'e-service deposito segnali possono depositare segnali.
  Un utente, che ha un ruolo <ruolo>, di un ente aderente <ente>, come erogatore, pubblica un un e-service <e-service>.  L'utente, il cui ente aderente rispetta i requisiti, ha una richiesta di fruizione attiva per l'e-service deposito segnali. L'utente ha una finalità attiva per l'e-service deposito segnali.
  L'utente ha un client associato alla finalità. L’utente dell’ente aderente diventa produttore di segnali.

  @push_signals1
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale
    Then l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta

  @push_signals2
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale vuoto. La richiesta non va a buon fine. NB. verificare status code
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale vuoto
    Then la richiesta non va a buon fine con status code 400

  @push_signals3
  Scenario Outline: Un utente abilitato come produttore di segnali, ottiene un voucher valido per l'e-service deposito segnali. L'utente deposita un segnale con un SignalType presente nella lista. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale con tipologia "<signalType>"
    Then l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta

    Examples:
      | signalType |
      | CREATE     |
      | UPDATE     |
      | DELETE     |
      | SEEDUPDATE |    

  @push_signals4
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale con un signalType errato. La richiesta non va a buon fine. NB. verificare status code.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale di una tipologia non prevista
    Then la richiesta non va a buon fine con status code 400


  @push_signals5
  Scenario Outline: Un utente la cui propria organizzazione sia erogatrice di due e-service, che ha una richiesta di fruizione verso l'e-service deposito segnali, deposita un segnale per ciascun e-service. Entrambe le richieste vanno a buon fine. NB. Un'unica organizzazione che eroga più e-service può depositare segnali per tutti i propri e-service con la stessa richiesta di fruizione verso l'e-service deposito segnali.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service
    Then l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta

  @push_signals6
  Scenario Outline: Un utente la cui propria organizzazione sia erogatrice di due e-service, che ha una richiesta di fruizione verso l'e-service deposito segnali, deposita un segnale per ciascun e-service. Il signalId di entrambi i segnali è identico. Entrambe le richieste vanno a buon fine. NB. E' possibile inviare un segnale la cui coppia (signalId,eServiceId) sia univoca.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo
    Then l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta


  @push_signals7
  Scenario Outline: Un utente la cui organizzazione ha una richiesta di fruizione per l’e-service "deposito segnali", deposita un segnale per un e-service di cui non è erogatore La richiesta non va a buon fine. NB. Nonostante l'organizzazione abbia una richiesta di fruizione per deposito segnali, deposita un segnale per un e-service che apppartiene a un'altra organizzazione
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale per un e-service di cui non è erogatore
    Then la richiesta non va a buon fine con status code 403

  @push_signals8
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita due segnali con lo stesso signalId. La seconda richiesta non va a buon fine: viene rifiutata perché signalId duplicato. NB. Viene introdotto un timeout per consentire al sistema la prima scrittura, dato che avviene con un collaborazione tra processi asincroni.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale
    Given il segnale viene depositato
    When l'utente deposita un segnale con lo stesso signalId del primo
    Then la richiesta non va a buon fine con status code 400