@push_signals
Feature: Deposito segnali
  Un utente, che ha un ruolo <ruolo>, di un ente aderente <ente>, come erogatore, pubblica un un e-service <e-service> e abilita l'opzione "utilizzo Signal Hub".
  l'utente dell'ente aderente diventa produttore di segnali.

  Background:
    Given l'ente "Agid", aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali
    Given l'ente erogatore ha pubblicato un e-service denominato "domicili digitali" abilitato a Signal Hub

  @push_signals1
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale. La richiesta va a buon fine.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals2
  Scenario Outline: L'utente, come produttore di segnali, non deposita nessun segnale. La richiesta va in errore.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale vuoto per quell'e-service
    Then la richiesta va in errore con status code 400

  @push_signals3
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale con un SignalType presente nella lista. La richiesta va a buon fine.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per quell'e-service con tipologia "<signalType>"
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

    Examples:
      | signalType |
      | CREATE     |
      | UPDATE     |
      | DELETE     |
      | SEEDUPDATE |

  @push_signals4
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale con un signalType errato. La richiesta va in errore.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per quell'e-service con una tipologia non prevista
    Then la richiesta va in errore con status code 400

  @push_signals5
  Scenario Outline: L'utente, come produttore di segnali, deposita due segnali, uno per ciascun e-service di cui è erogatore. Entrambe le richieste vanno a buon fine.
    Given l'utente ha pubblicato un secondo e-service denominato "domicili fiscali" con l'opzione utilizzo SH
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente deposita un segnale per il primo e-service
    Given la richiesta va a buon fine con status code 200 e il segnale viene preso in carico
    When l'utente deposita un segnale per il secondo e-service
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals6
  Scenario Outline: Un utente, come produttore di segnali, deposita due segnali, uno per ciascun e-service di cui è erogatore. Il signalId è lo stesso. Entrambe le richieste vanno a buon fine.
    Given l'utente ha pubblicato un secondo e-service denominato "domicili fiscali" con l'opzione utilizzo SH
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals7
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale per un e-service di cui non è erogatore. La richiesta va in errore.
    Given Un utente, appartenente a un'altra organizzazione denominata "INPS", come erogatore ha pubblicato un e-service denominato "cassetto fiscale" con il flag utilizzo SH
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per un e-service di cui non è erogatore
    Then la richiesta va in errore con status code 403

  @push_signals8a
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale per un e-service non esistente. La richiesta va in errore
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per un e-service che non esiste
    Then la richiesta va in errore con status code 403

  @push_signals8b
  Scenario Outline: Un utente, come produttore di segnali, deposita un segnale per un e-service non pubblicato. La richiesta va in errore
    Given l'utente ha creato un e-service denominato "domicili fiscali" in stato "DRAFT" con l'opzione utilizzo SH
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente deposita un segnale per un e-service che non è stato pubblicato
    Then la richiesta va in errore con status code 403

  @push_signals9
  Scenario Outline: L'utente, come produttore di segnali, deposita due segnali con lo stesso signalId. La seconda richiesta va in errore: viene rifiutata perché signalId duplicato. NB. Viene introdotto un timeout per consentire al sistema la prima scrittura, dato che avviene con un collaborazione tra processi asincroni.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente deposita un segnale per quell'e-service
    When l'utente deposita un segnale per quell'e-service con lo stesso signalId del primo
    Then la richiesta va in errore con status code 400

  @push_signals10
  Scenario Outline: L'utente, come produttore di segnali, deposita un segnale per un e-service non abilitato a Signal Hub. La richiesta va a in errore.
    Given l'utente ha pubblicato un e-service denominato "domicili legali" senza l'opzione utilizzo SH
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente deposita un segnale per quell'e-service
    Then la richiesta va in errore con status code 403

  @push_signals11
  Scenario Outline: L'utente, come produttore di segnali, prima deposita un segnale per un e-service abilitato a Signal Hub, poi deposita un segnale per lo stesso e-service non più abilitato a Signal Hub. La richiesta va a in errore
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente deposita un segnale per quell'e-service
    Given la richiesta va a buon fine con status code 200 e il segnale viene preso in carico
    Given l'utente, come erogatore, aggiorna l'e-service disabilitando l'opzione utilizzo SH
    Given l'utente deposita un segnale per quell'e-service
    Then la richiesta va in errore con status code 403

  @push_signals12
  Scenario Outline: L'utente verifica la salute del servizio di deposito segnali mediante l'API di healthcheck. La richiesta va a buon fine.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    When l'utente verifica lo stato del servizio di deposito segnali
    Then la richiesta va a buon fine con status code 200

  @push_signals13
  Scenario Outline: L'utente come produttore di segnali crea un nuovo descrittore per un e-service già abilitato a Signal Hub (la prima versione di e-service passa in stato DEPRECATED, dato che esistono dei fruitori attivi). La richiesta va a buon fine
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "DEPRECATED"
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va a buon fine con status code 200

  @push_signals14
  Scenario Outline: L'utente come produttore di segnali crea una nuovo descrittore per un e-service già abilitato a Signal Hub (la prima versione di e-service passa in stato ARCHIVED, dato che non esistono fruitori attivi). La richiesta va a buon fine
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "ARCHIVED"
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va a buon fine con status code 200

  @push_signals15
  Scenario Outline: L'utente come produttore di segnali crea una nuovo descrittore per un e-service già abilitato a Signal Hub (la prima versione di e-service passa in stato DEPRECATED, dato che esistono dei fruitori attivi). Successivamente la seconda versione dell'e-service passa in stato SUSPENDED. La richiesta va a buon fine.
    Given l'utente produttore di segnali ha ottenuto un voucher api
    Given l'utente pubblica una nuova versione dell e-service
    Given la prima versione dell' e-service è già in stato "DEPRECATED"
    Given la seconda versione dell' e-service è già in stato "SUSPENDED"
    When l'utente deposita un segnale per quell'e-service
    Then la richiesta va a buon fine con status code 200
