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
    Then la richiesta non va a buon fine

  @push_signals3
  Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita un segnale con un signalType errato. La richiesta non va a buon fine. NB. verificare status code.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    When l'utente deposita un segnale di una tipologia non prevista
    Then la richiesta non va a buon fine

  @push_signals4
  Scenario Outline: Un utente la cui organizzazione non ha una richiesta di fruizione per deposito segnali ma per un altro e-service, deposita un segnale. La richiesta non va a buon fine NB. Non è possibile depositare un segnale senza una richiesta di fruizione attiva verso l'e-service di deposito segnali. Il processo di autenticazione dell'e-service deposito segnali considera il voucher non valido a causa dell'audience non corrispondente a quello dell'e-service deposito segnali. Il claim "aud" è impostato dell'authentication server in base alla purposeId presente nella client assertion.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di deposito segnali
    When l'utente deposita un segnale
    Then l'e-service deposito segnali restituisce status code 403

  @push_signals5
  Scenario Outline: Un utente la cui propria organizzazione sia erogatrice di due e-service deposita un segnale per ciascun e-service. Il signalId di entrambi i segnali è identico. Entrambe le richieste vanno a buon fine. NB. E' possibile inviare un segnale la cui coppia (signalId,eServiceId) sia univoca.
    Given Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali
    Given L'utente deposita un segnale per il primo e-service
    When l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo
    Then l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta


  # @push_signalsX
  # Scenario Outline: Un utente abilitato all'e-service deposito segnali deposita due segnali. La richieste vanno entrambe a buon fine.
  #   Given Un utente, come produttore di segnali, ottiene un voucher valido per l’accesso all'e-service deposito segnali
  #   When l'utente deposita 2 segnali
  #   Then le richieste vanno entrambe a buon fine