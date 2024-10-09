@pull_signals
Feature: Recupero segnali

  @pull_signals1
  Scenario Outline: Un utente consumatore di segnali, ottiene un voucher scaduto. L’utente consumatore recupera un segnale. La richiesta non va a buon fine.
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m scaduto
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline:
  Un utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato.  La richiesta non va a buon fine.

    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

  @pull_signals3
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (agreement diverso da ACTIVE). La richiesta non va a buon fine.
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali in stato "<statoAgreement>"
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

    Examples:
      | statoAgreement |
      | DRAFT          |
      | ARCHIVED       |

  @pull_signals4
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (finalità diverso da ACTIVE). La richiesta non va a buon fine.
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali
    Given l'utente ha già una finalità in stato  "<statoFinalità>" per quell'eservice
    When l'utente recupera un segnale
    Then la richiesta va in errore con status code 401

    Examples:
      | statoFinalità |
      | DRAFT         |
      | ARCHIVED      |

  @pull_signals5
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service. La richiesta va a buon fine.
    Given l'utente produttore di segnali deposita 1 segnale
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali
    Given l'utente ha già una finalità in stato "<statoFinalità>" per quell'eservice
    When l'utente recupera un segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

    Examples:
      | statoFinalità |
      | ACTIVE        |

  @pull_signals6
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service. La richiesta va a buon fine.
    Given l'utente produttore di segnali deposita 10 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali
    Given l'utente ha già una finalità in stato "<statoFinalità>" per quell'eservice
    When l'utente recupera 10 segnali
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

    Examples:
      | statoFinalità |
      | ACTIVE        |

  @pull_signals7
  Scenario Outline: Un utente consumatore di segnali, recupera un segnale per un e-service. La richiesta va a buon fine.
    Given l'utente produttore di segnali deposita 0 segnali.
    Given un utente, come consumatore di segnali, ottiene un voucher API/m2m
    Given l'utente ha già una richiesta di fruizione per l'eservice produttore di segnali
    Given l'utente ha già una finalità in stato "<statoFinalità>" per quell'eservice
    When l'utente recupera 1 segnale
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali

    Examples:
      | statoFinalità |
      | ACTIVE        |
