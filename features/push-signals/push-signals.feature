@push_signals
Feature: Deposito segnali
  Tutti gli utenti autorizzati all'e-service deposito segnali possono depositare segnali.
  Un utente, che ha un ruolo <ruolo>, di un ente aderente <ente>, come erogatore, pubblica un un e-service <e-service>.  L'utente, il cui ente aderente rispetta i requisiti, ha una richiesta di fruizione attiva per l'e-service deposito segnali. L'utente ha una finalità attiva per l'e-service deposito segnali.
  L'utente ha un client associato alla finalità. L’utente dell’ente aderente diventa produttore di segnali.

  @push_signals1
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l'e-service deposito segnali, deposita un segnale. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals2
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l'e-service deposito segnali, deposita un segnale vuoto. La richiesta va in errore. NB. verificare status code
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale vuoto
    Then la richiesta va in errore con status code 400

  @push_signals3
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l'e-service deposito segnali, deposita un segnale con un SignalType presente nella lista. La richiesta va a buon fine.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale con tipologia "<signalType>"
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

    Examples:
      | signalType |
      | CREATE     |
      | UPDATE     |
      | DELETE     |
      | SEEDUPDATE |

  @push_signals4
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l'e-service deposito segnali, deposita un segnale con un signalType errato. La richiesta va in errore. NB. verificare status code.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale di una tipologia non prevista
    Then la richiesta va in errore con status code 400

  @push_signals5
  Scenario Outline: Un utente la cui organizzazione sia erogatrice di due e-service, che ha una richiesta di fruizione verso l'e-service deposito segnali, deposita un segnale per ciascun e-service. Entrambe le richieste vanno a buon fine. NB. Un'unica organizzazione che eroga più e-service può depositare segnali per tutti i propri e-service con la stessa richiesta di fruizione verso l'e-service deposito segnali.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals6
  Scenario Outline: Un utente la cui organizzazione sia erogatrice di due e-service, che ha una richiesta di fruizione verso l'e-service deposito segnali, deposita un segnale per ciascun e-service. Il signalId di entrambi i segnali è identico. Entrambe le richieste vanno a buon fine. NB. E' possibile inviare un segnale la cui coppia (signalId,eServiceId) sia univoca.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo
    Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico

  @push_signals7
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l'e-service deposito segnali, deposita un segnale per un e-service di cui non è erogatore. La richiesta va in errore. NB. Nonostante l'organizzazione abbia una richiesta di fruizione per deposito segnali, deposita un segnale per un e-service che apppartiene a un'altra organizzazione
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale per un e-service di cui non è erogatore
    Then la richiesta va in errore con status code 403

  @push_signals8a
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l’e-service deposito segnali, deposita un segnale per un e-service non esistente. La richiesta va in errore
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale per un e-service che non esiste
    Then la richiesta va in errore con status code 403

  @push_signals8b
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l’e-service deposito segnali, deposita un segnale per un e-service non pubblicato. La richiesta va in errore
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale per un e-service che non è stato pubblicato
    Then la richiesta va in errore con status code 403

  @push_signals9
  Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l’e-service deposito segnali, deposita due segnali con lo stesso signalId. La seconda richiesta va in errore: viene rifiutata perché signalId duplicato. NB. Viene introdotto un timeout per consentire al sistema la prima scrittura, dato che avviene con un collaborazione tra processi asincroni.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given l'utente deposita un segnale
    When l'utente deposita un segnale con lo stesso signalId del primo
    Then la richiesta va in errore con status code 400

  @push_signals10
  Scenario Outline: Un utente, la cui organizzazione non abbia una richiesta di fruizione per deposito segnali ma per un altro e-service, deposita un segnale. La richiesta va in errore. NB. Non è possibile depositare un segnale senza una richiesta di fruizione attiva verso l'e-service di deposito segnali. Il processo di autenticazione dell'e-service deposito segnali considera il voucher non valido a causa dell'audience non corrispondente a quello dell'e-service deposito segnali. Il claim "aud" è impostato dell'authentication server in base alla purposeId presente nella client assertion
    Given Un utente, come produttore di segnali, ma come fruitore di un altro e-service, ottiene un voucher valido per un e-service diverso dall'e-service di deposito segnali
    When l'utente deposita un segnale
    Then la richiesta va in errore con status code 401
  # @push_signals11 @wait_for_fix
  # Scenario Outline: Un utente, la cui organizzazione abbia una richiesta di fruizione per l’e-service deposito segnali, deposita un segnale per un consumer specifico. La richiesta va a buon fine. NB: endpoint /signals-by-consumers
  #   Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
  #   When l'utente deposita un segnale specifico per un consumer
  #   Then la richiesta va a buon fine con status code 200 e il segnale viene preso in carico
  # @push_signals_healthcheck
  # Scenario Outline: Un utente, verifica la salute del servizio mediante l'API di healtcheck. La richiesta va a buon fine.
  #   Given Un utente non autenticato
  #   When l'utente verifica lo stato del servizio
  #   Then a richiesta va a buon fine con status code 200
