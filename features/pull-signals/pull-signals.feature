@pull_signals
Feature: Recupero segnali
Un utente, che ha un <ruolo>, di un <ente> aderente, come fruitore di un <e-service>
Un utente (applicativo), che ha un <ruolo>, di un <ente> aderente, come consumatore di segnali (fruitore e-service lettura segnali)

  @pull_signals1
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per un e-service diverso da lettura segnali. L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: La richiesta non va a buon fine (status code: 401) poichè l’utente che vuole leggere il segnale non ha inviato un voucher che non è valido per dialogare con l’e-service lettura-segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali
    When l'utente consumatore recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher scaduto. L’utente consumatore recupera un segnale. La richiesta non va a buon fine.
    Given un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals3
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore non ha una richiesta di fruizione per un e-service sottoscritto all' e-service deposito segnali. L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: Nonostante il consumatore abbia una richiesta di fruizione verso l’e-service di lettura segnali, non ha una richiesta di fruizione per l’e-service per cui si richiede il segnale.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale per un e-service con cui non ha una richiesta di fruizione
    Then la richiesta va in errore con status code 403

  @pull_signals4 @only_dev
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione in uno stato diverso da ACTIVE per un e-service sottoscritto all'e-service deposito segnali.  L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: Nonostante il consumatore abbia una richiesta di fruizione verso l’e-service di lettura segnali, ha una richiesta di fruizione non attiva verso l’e-service per cui si richiede il segnale.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale per un e-service con cui ha una richiesta di fruizone in stato diverso da ACTIVE
    Then la richiesta va in errore con status code 403

  @pull_signals5
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all'e-service deposito segnali. L’utente produttore deposita un segnale. L’utente consumatore recupera quel segnale. La richiesta va a buon fine.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    Given un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente produttore di segnali deposita 1 segnale
    Given il sistema deposita il segnale
    When l'utente consumatore recupera un segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals6
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all' e-service deposito segnali. L’utente produttore deposita 5 segnali.  La richiesta va a buon fine e restituisce un lista di 5 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    Given un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente produttore di segnali deposita 5 segnali
    Given il sistema deposita il segnale
    When l'utente consumatore recupera i segnali
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 5 segnali

  @pull_signals7
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all' e-service deposito segnali.L’utente produttore non deposita un segnale. L’utente consumatore recupera quel segnale. La richiesta va a buon fine e restituisce un lista vuota di segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali

  @pull_signals8
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all' e-service deposito segnali. L’utente produttore deposita 20 segnali. L’utente consumatore recupera la lista di segnali. La richiesta va a buon fine e restituisce un lista di 10 segnali con lastSignalId = 10.
 NB. Il limite per pagina per il recupero dei segnali è impostato a 100.

    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    Given un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente produttore di segnali deposita 105 segnali
    Given il sistema deposita i segnali
    When l'utente consumatore recupera i segnali
    Then la richiesta va a buon fine con status code 206 e restituisce una lista di 100 segnali e lastSignalId = 100

  @pull_signals9
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all'e-service deposito segnali. L’utente produttore deposita 3 segnali. L’utente consumatore recupera la lista di segnali mettendo un signalId superiore a 3. La richiesta va a buon fine e restituisce un lista di 0 segnali e lastSignalId = 10.
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    Given un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente produttore di segnali deposita 3 segnali
    Given il sistema deposita i segnali
    When l'utente consumatore recupera un segnale inserendo un signalId uguale a 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali e nessun lastSignalId

  @pull_signals10
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione per un e-service sottoscritto all'e-service deposito segnali. L’utente produttore deposita 5 segnali. L’utente consumatore recupera la lista di segnali con un lastSignalId = 3.  La richiesta va a buon fine e restituisce un lista di 2 segnali con lastSignalId = 5
    Given un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    Given un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente produttore di segnali deposita 5 segnali
    Given il sistema deposita i segnali
    When l'utente consumatore recupera un segnale inserendo un signalId uguale a 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 2 segnali e lastSignalId = 5

  @pull_signals11
  Scenario Outline: Un utente, verifica la salute del servizio di recupero segnali mediante l'API di healtcheck. La richiesta va a buon fine.
    When l'utente verifica lo stato del servizio di recupero segnali
    Then la richiesta va a buon fine con status code 200
