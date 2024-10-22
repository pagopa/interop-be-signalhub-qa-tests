@pull_signals
Feature: Recupero segnali

  Background:
    Given l'ente "Agid", aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali
    Given l'ente erogatore ha pubblicato un e-service denominato "domicili digitali" abilitato a Signal Hub
    Given l'ente "Comune di Milano", aderente a PDND Interop, è fruitore e consumatore dei segnali

  @pull_signals1
  Scenario Outline: L'utente consumatore di segnali ottiene un voucher scaduto. L'utente consumatore recupera un segnale. La richiesta non va a buon fine con status code 403.
    Given l'utente consumatore di segnali ha ottenuto un voucher api scaduto
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline:
  L'utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato. La richiesta non va a buon fine con status code 403.

    Given l'utente consumatore di segnali ha ottenuto un voucher api
    When l'utente recupera un segnale dell'e-service "domicili legali"
    Then la richiesta va in errore con status code 403

  @pull_signals3
  Scenario Outline: L'utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (agreement diverso da "ACTIVE"). La richiesta non va a buon fine con status code 403.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "<statoAgreement>" per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

    Examples:
      | statoAgreement |
      | DRAFT          |
      | ARCHIVED       |

  @pull_signals4
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato (finalità diversa da "ACTIVE"). La richiesta non va a buon fine con status code 403.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "<statoFinalità>" per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

    Examples:
      | statoFinalità |
      | DRAFT         |
      | ARCHIVED      |

  @pull_signals5
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals6
  Scenario Outline: L'utente consumatore di segnali recupera una lista di 10 segnali per un e-service. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 10 segnali per quell'e-service
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera i segnali di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

  @pull_signals7
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service per il quale non sono stati depositati segnali. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 0 segnali per quell'e-service
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali

  @pull_signals8
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali superiore al limite di paginazione imposto dal sistema. La richiesta va a buon fine. NB: Il limite per pagina per il recupero dei segnali è impostato a 10.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 20 segnali per quell'e-service
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera i segnali di quell'e-service
    Then la richiesta va a buon fine con status code 206 e restituisce una lista di 10 segnali

  @pull_signals9
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali con un lastSignalId uguale (o maggiore) al signalId dell'ultimo segnale presente. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 3 segnali per quell'e-service
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera un segnale di quell'e-service con un signalId uguale a 4
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali e nessun lastSignalId

  @pull_signals10
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali con un lastSignalId minore rispetto al signalId dell'ultimo segnale presente. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 5 segnali per quell'e-service
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    When l'utente recupera un segnale di quell'e-service con un signalId uguale a 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 2 segnali e lastSignalId = 5

  @pull_signals11
  Scenario Outline: Un utente, verifica la salute del servizio di recupero segnali mediante l'API di healtcheck. La richiesta va a buon fine.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    When l'utente verifica lo stato del servizio di recupero segnali
    Then la richiesta va a buon fine con status code 200

  @pull_signals12a
  Scenario Outline: L'utente consumatore di segnali ha due finalità: la prima in stato ACTIVE, la seconda in stato SUSPENDED per l' e-service per la quale vuole recuperare il segnale. La richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    Given l'utente crea una nuova finalità in stato "SUSPENDED" per quell' e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals12b
  Scenario Outline: L'utente consumatore di segnali ha due finalità: la prima in stato ARCHIVED, la seconda in uno stato diverso da active per l' e-service per la quale vuole recuperare il segnale. La richiesta va in errore
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ARCHIVED" per quell'e-service
    Given l'utente crea una nuova finalità in stato "<statoFinalità>" per quell' e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

    Examples:
      | statoFinalità         |
      | DRAFT                 |
      | WAITING FOR APPROVAL  |
      | REJECTED              |
      | REJECTED              |
      | SUSPENDED BY CONSUMER |
      | SUSPENDED BY PRODUCER |
      | ARCHIVED              |

  @pull_signals13a
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service che presenta due versioni: (la prima versione di e-service passa in stato DEPRECATED, dato che esistono dei fruitori attivi) la seconda in stato ACTIVE. la richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    Given l'utente produttore di segnali pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "DEPRECATED"
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals13b
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service che presenta due versioni: (la prima versione di e-service passa in stato ARCHIVED, dato che non esistono dei fruitori attivi) la seconda in stato ACTIVE. la richiesta va a buon fine.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    Given la prima versione dell' e-service è già in stato "ARCHIVED"
    Given l'utente produttore di segnali pubblica una nuova versione dell e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals14
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service che presenta due versioni: (la prima versione di e-service passa in stato ARCHIVED, dato che non esistono dei fruitori attivi) la seconda in stato SUSPENDED.  La richiesta non va a buon fine con status code 403.
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    Given l'utente produttore di segnali pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "ARCHIVED"
    Given la seconda versione dell' e-service è già in stato "SUSPENDED"
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

  @pull_signals15
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service che presenta due versioni: (la prima versione di e-service passa in stato DEPRECATED, dato che esistono dei fruitori attivi) la seconda in stato SUSPENDED.  La richiesta va a buon fine
    Given l'utente produttore di segnali, già in possesso di voucher api, ha depositato 1 segnale per quell'e-service
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per quell'e-service
    Given l'utente ha già una finalità in stato "ACTIVE" per quell'e-service
    Given l'utente produttore di segnali pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "DEPRECATED"
    Given la seconda versione dell' e-service è già in stato "SUSPENDED"
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale
