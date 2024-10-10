@pull_signals
Feature: Recupero segnali

  @pull_signals1
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher scaduto. L’utente consumatore recupera un segnale. La richiesta non va a buon fine con status code 401.
    Given un utente consumatore di segnali, ottiene un voucher API scaduto
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline:
  Un utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato. La richiesta non va a buon fine con status code 401.

    Given un utente, come consumatore di segnali, ottiene un voucher API
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals3
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (agreement diverso da ACTIVE). La richiesta non va a buon fine con status code 401.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato "<statoAgreement>"
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

    Examples:
      | statoAgreement |
      | DRAFT          |
      | ARCHIVED       |

  @pull_signals4
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (finalità diversa da ACTIVE). La richiesta non va a buon fine con status code 401.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione in stato per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato "<statoFinalità>" per quell'eservice
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

    Examples:
      | statoFinalità |
      | DRAFT         |
      | ARCHIVED      |

  @pull_signals5
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service. La richiesta va a buon fine.
    Given un utente produttore di segnali deposita 1 segnale
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato ACTIVE per quell'eservice
    When l'utente recupera un segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals6
  Scenario Outline: Un utente consumatore di segnali, recupera una lista di 10 segnali per un e-service. La richiesta va a buon fine.
    Given un utente produttore di segnali deposita 10 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato ACTIVE per quell'eservice
    When l'utente recupera 10 segnali
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

  @pull_signals7
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service che però non ha mai depositato un segnale. La richiesta va a buon fine.
    Given un utente produttore di segnali deposita 0 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato ACTIVE per quell'eservice
    When l'utente recupera 1 segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali

  @pull_signals8
  Scenario Outline: Un utente consumatore di segnali, recupera una lista di segnali per un e-service superiore al limite di paginazione imposto dal sistema. La richiesta va a buon fine. NB: Il limite per pagina per il recupero dei segnali è impostato a 10.
    Given l'utente produttore di segnali deposita 20 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato ACTIVE per quell'eservice
    When l'utente recupera 20 segnali
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

  @pull_signals9
  Scenario Outline: Un utente consumatore di segnali, recupera una lista di segnali per un e-service con un lastSignalId maggiore rispetto all'ultimo segnale presente. La richiesta va a buon fine.
    Given un utente produttore di segnali deposita 3 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato ACTIVE
    Given l'utente ha già una finalità in stato ACTIVE per quell'eservice
    When l'utente recupera un segnale inserendo un signalId maggiore di 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali e lastSignalId = 3
