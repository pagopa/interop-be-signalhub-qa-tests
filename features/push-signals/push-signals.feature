@push_signals
Feature: Deposito segnali
  Un utente, che ha un ruolo <ruolo>, di un ente aderente <ente>, come erogatore, pubblica un un e-service <e-service> e abilita l'opzione "utilizzo Signal Hub".
  L'utente dell'ente aderente diventa produttore di segnali.

  @push_signals1
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale. La richiesta va a buon fine.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals2
  Scenario Outline: L’utente, come produttore di segnali, non deposita nessun segnale. La richiesta va in errore.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale vuoto
    Then la richiesta va in errore con status code 400

  @push_signals3
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale con un SignalType presente nella lista. La richiesta va a buon fine.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale con tipologia "<signalType>"
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

    Examples:
      | signalType |
      | CREATE     |
      | UPDATE     |
      | DELETE     |
      | SEEDUPDATE |

  @push_signals4
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale con un signalType errato. La richiesta va in errore.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale di una tipologia non prevista
    Then la richiesta va in errore con status code 400

  @push_signals5
  Scenario Outline: L’utente, come produttore di segnali, deposita due segnali, uno per ciascun e-service di cui è erogatore. La richiesta va a buon fine. Entrambe le richieste vanno a buon fine.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente pubblica un altro e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    Given l'utente deposita un segnale per il primo e-service
    Given la richiesta va a buon fine con status code 200 e il segnale viene preso in carico
    When l'utente deposita un segnale per il secondo e-service
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals6
  Scenario Outline: Un utente, come produttore di segnali, deposita due segnali, uno per ciascun e-service di cui è erogatore. Il signalId è lo stesso. Entrambe le richieste vanno a buon fine.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente pubblica un altro e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals7
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale per un e-service di cui non è erogatore. La richiesta va in errore.
    Given Un utente, appartenente a un'altra organizzazione, come erogatore pubblica un e-service con il flag utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale per un e-service di cui non è erogatore
    Then la richiesta va in errore con status code 403

  @push_signals8a
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale per un e-service non esistente. La richiesta va in errore
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale per un e-service che non esiste
    Then la richiesta va in errore con status code 403

  @push_signals8b
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale per un e-service non pubblicato. La richiesta va in errore
    Given Un utente crea in stato DRAFT un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente deposita un segnale per un e-service che non è stato pubblicato
    Then la richiesta va in errore con status code 403

  @push_signals9
  Scenario Outline: Un utente, come produttore di segnali, deposita due segnali con lo stesso signalId. La seconda richiesta va in errore: viene rifiutata perché signalId duplicato. NB. Viene introdotto un timeout per consentire al sistema la prima scrittura, dato che avviene con un collaborazione tra processi asincroni.
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    Given l'utente deposita un segnale
    When l'utente deposita un segnale con lo stesso signalId del primo
    Then la richiesta va in errore con status code 400

  @push_signals10
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale per un e-service non abilitato a Signal Hub. La richiesta va a in errore.
    Given Un utente pubblica un e-service senza l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    Given l'utente deposita un segnale
    Then la richiesta va in errore con status code 400

  @push_signals11
  Scenario Outline: L'utente, come produttore di segnali, prima deposita un segnale per un e-service abilitato a Signal Hub, poi deposita un segnale per lo stesso e-service non più abilitato a Signal Hub. La richiesta va a in errore
    Given Un utente pubblica un e-service con l'opzione utilizzo SH
    Given Un utente, come produttore di segnali, ottiene un voucher api
    Given l'utente deposita un segnale
    Given la richiesta va a buon fine con status code 200 e il segnale viene preso in carico
    Given Un utente modifica l'e-service eliminando l'opzione utilizzo SH
    Given l'utente deposita un segnale
    Then la richiesta va in errore con status code 403

  @push_signals12
  Scenario Outline: Un utente verifica la salute del servizio di deposito segnali mediante l'API di healtcheck. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher api
    When l'utente verifica lo stato del servizio di deposito segnali
    Then la richiesta va a buon fine con status code 200
