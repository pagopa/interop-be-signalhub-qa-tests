@pull_signals
Feature: Recupero segnali
Un utente, che ha un <ruolo>, di un <ente> aderente, come fruitore di un <e-service>
Un utente (applicativo), che ha un <ruolo>, di un <ente> aderente, come consumatore di segnali (fruitore e-service lettura segnali)

  @pull_signals1
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per un e-service diverso da lettura segnali.  L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: La richiesta non va a buon fine (status code: 401) poichè l’utente che vuole leggere il segnale non ha inviato un voucher che non è utile per dialogare con l’e-service lettura-segnali.
    Given Un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali
    When l'utente consumatore recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher scaduto. L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: La richiesta non va a buon fine
    Given Un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals3
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore non ha una richiesta di fruizione per un e-service sottoscritto all' e-service deposito segnali. L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: Nonostante il consumatore abbia una richiesta di fruizione verso l’e-service di lettura segnali, non ha una richiesta di fruizione per l’e-service per cui chiede il segnale.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale per un e-service con cui non ha una richiesta di fruizione
    Then la richiesta va in errore con status code 401

  @pull_signals4
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher valido per l’accesso all'e-service lettura segnali. L’utente consumatore ha una richiesta di fruizione in stato diverso da  ACTIVE per un e-service sottoscritto all'e-service deposito segnali.  L’utente consumatore recupera un segnale. La richiesta non va a buon fine. NB: Nonostante il consumatore abbia una richiesta di fruizione verso l’e-service di lettura segnali, ha una richiesta di fruizione non attiva verso l’e-service per cui chiede il segnale.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali
    When l'utente consumatore recupera un segnale per un e-service con cui ha una richiesta di fruizone in stato "<statoRichiestaFruizione>"
    Then la richiesta va in errore con status code 401

    Examples:
      | statoRichiestaFruizione      |
      | DRAFT                        |
      | ARCHIVED                     |
      | PENDING                      |
      | SUSPENDED                    |
      | REJECTED                     |
      | MISSING_CERTIFIED_ATTRIBUTES |
