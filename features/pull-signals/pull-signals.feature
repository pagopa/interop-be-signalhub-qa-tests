@pull_signals
Feature: Recupero segnali

  Background:
    Given un ente aderente a PDND Interop che riveste il ruolo di erogatore chiamato "Agid"
    And un ente aderente a PDND Interop che riveste ruolo di fruitore chiamato "Comune di Milano"
    And un e-service pubblicato dall'ente erogatore chiamato "domicili digitali"
    And l'ente erogatore chiamato "Agid" è denominato produttore di segnali
    And l'ente fruitore chiamato "Comune di Milano" è denominato consumatore di segnali

  @pull_signals1
  Scenario Outline: L'utente consumatore di segnali ottiene un voucher scaduto. L'utente consumatore recupera un segnale. La richiesta non va a buon fine con status code 401.
    Given l'utente consumatore di segnali ha ottenuto un voucher api scaduto
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va in errore con status code 401

  @pull_signals2
  Scenario Outline:
  L'utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato. La richiesta non va a buon fine con status code 401.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va in errore con status code 401

  @pull_signals3
  Scenario Outline: L'utente consumatore di segnali, recupera un segnale per un e-service per cui non è autorizzato (agreement diverso da "ACTIVE"). La richiesta non va a buon fine con status code 401.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "<statoAgreement>" per l'e-service "<eserviceName>"
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va in errore con status code 401

    Examples:
      | statoAgreement | eserviceName      |
      | DRAFT          | domicili digitali |
      | ARCHIVED       | domicili digitali |

  @pull_signals4
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service per cui non è autorizzato (finalità diversa da "ACTIVE"). La richiesta non va a buon fine con status code 401.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "<eserviceName>" 
    Given l'utente ha già una finalità in stato "<statoFinalità>" per l'e-service "<eserviceName>"
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va in errore con status code 401

    Examples:
      | statoFinalità | eserviceName      |
      | DRAFT         | domicili digitali |
      | ARCHIVED      | domicili digitali |

  @pull_signals5
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service. La richiesta va a buon fine.
    Given un utente produttore di segnali ha depositato 1 segnale
    Given il sistema ha depositato il segnale
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals6
  Scenario Outline: L'utente consumatore di segnali recupera una lista di 10 segnali per un e-service. La richiesta va a buon fine.
    Given un utente produttore di segnali ha depositato 10 segnali
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera i segnali dell'e-service "domicili digitali"
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

  @pull_signals7
  Scenario Outline: L'utente consumatore di segnali recupera un segnale per un e-service per il quale non sono stati depositati segnali. La richiesta va a buon fine.
    Given un utente produttore di segnali ha depositato 0 segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera un segnale dell'e-service "domicili digitali"
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali

  @pull_signals8
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali superiore al limite di paginazione imposto dal sistema. La richiesta va a buon fine. NB: Il limite per pagina per il recupero dei segnali è impostato a 10.
    Given un utente produttore di segnali ha depositato 20 segnali
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera i segnali dell'e-service "domicili digitali"
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 10 segnali

  @pull_signals9
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali con un lastSignalId uguale (o maggiore) al signalId dell'ultimo segnale presente. La richiesta va a buon fine.
    Given un utente produttore di segnali ha depositato 3 segnali
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera un segnale dell'e-service "domicili digitali" con un signalId uguale a 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 0 segnali e lastSignalId = 3

  @pull_signals10
  Scenario Outline: L'utente consumatore di segnali recupera una lista di segnali con un lastSignalId minore rispetto al signalId dell'ultimo segnale presente. La richiesta va a buon fine.
    Given un utente produttore di segnali ha depositato 5 segnali
    Given il sistema ha depositato i segnali
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    Given l'utente ha già una richiesta di fruizione in stato "ACTIVE" per l'e-service "domicili digitali"
    Given l'utente ha già una finalità in stato "ACTIVE" per l'e-service "domicili digitali"
    When l'utente recupera un segnale dell'e-service "domicili digitali" con un signalId uguale a 3
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 2 segnali e lastSignalId = 5  

  @pull_signals11
  Scenario Outline: Un utente, verifica la salute del servizio di recupero segnali mediante l'API di healtcheck. La richiesta va a buon fine.
    Given l'utente consumatore di segnali ha ottenuto un voucher api
    When l'utente verifica lo stato del servizio di recupero segnali
    Then la richiesta va a buon fine con status code 200