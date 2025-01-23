@pull_signals_delegations
Feature: Incaricato
Un utente che ha un ruolo <ruolo> di un ente aderente <ente delegante> delega un ente <ente delegato> alla gestione di un e-service e  al recupero di segnali. 

  Background:
    Given l'ente "Agid", aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali
    Given l'ente erogatore ha pubblicato un e-service denominato "domicili digitali" abilitato a Signal Hub
    Given l'erogatore abilita la possibilità di accesso operativo per quell'e-service
    Given l'ente erogatore ha depositato un segnale per l'e-service
    Given il sistema ha depositato i segnali

  @pull_signals_delegations1
  Scenario Outline: L'utente come ente delegato, recupera un segnale per conto dell'ente delegante. La richiesta va a buon fine.
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    When l'utente dell'ente delegato recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals_delegations2
  Scenario Outline: L'utente come ente delegato recupera un segnale per conto dell'ente delegante. E' presente un agreement con uno stato diverso da ACTIVE.
   E' presente una finalità in delega in stato ACTIVE. La richiesta va in errore.

    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "<statoAgreement>" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    When l'utente dell'ente delegato recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

    Examples:
      | statoAgreement |
      | DRAFT          |
      | ARCHIVED       |

  @pull_signals_delegations3
  Scenario Outline: L'utente come ente delegato recupera un segnale per conto dell'ente delegante. E' presente un agreement in stato ACTIVE ma non è stata presentata nessuna finalità in delega. La richiesta va in errore.
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

  @pull_signals_delegations4
  Scenario Outline: L'utente come ente delegato recupera un segnale per conto dell'ente delegante. La delega è in uno stato diverso da ACTIVE. La richiesta va in errore.
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "<statoDelega>" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    When l'utente dell'ente delegato recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

    Examples:
      | statoDelega |
      | REVOKED     |
      | REJECTED    |

  @pull_signals_delegations5
  Scenario Outline: L'utente come ente delegato recupera un segnale per conto dell'ente delegante. La delega passa da ACTIVE a REVOKED. La richiesta va in errore.
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "<statoDelega>" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    Given l'ente delegante revoca la delega assegnata all'ente delegato
    When l'utente dell'ente delegato recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403

  @pull_signals_delegations6
  Scenario Outline: L'utente possiede più di una delega in stato ACTIVE. Le deleghe sono state concesse da enti diversi. Per ciascuna di esse,l'utente, possiede una richiesta di fruizione in stato ACTIVE e rispettivamente una finalità in delega in stato ACTIVE. L'utente recupera un segnale. La richiesta va a buon fine.
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Castelfranco" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va a buon fine con status code 200 e restituisce una lista di 1 segnale

  @pull_signals_delegations7
  Scenario Outline: L'utente come ente delegato recupera un segnale per conto dell'ente delegante. L'erogatore disabilita la possibilità di accesso in delega (recupero dei segnali) per l'e-service
  La richiesta va in errore.

    Given l'ente delegato "Provincia di Ferrara" ha già una delega in stato "ACTIVE" concessa dal "Comune di Copparo" per l'e-service "domicili digitali"
    Given l'utente dell'ente delegato ha ottenuto un voucher api
    Given l'utente dell'ente delegato ha già una richiesta di fruizione in stato "ACTIVE" per conto dell'ente delegante per quell'e-service
    Given l'utente dell'ente delegato ha già una finalità in delega in stato "ACTIVE" per quell'e-service
    Given l'erogatore disabilita la possibilità di accesso operativo per quell'e-service
    When l'utente recupera un segnale di quell'e-service
    Then la richiesta va in errore con status code 403
# Delegato che ha due deleghe una active ed una revoked
