# Statusupdate — 20 november 2026

> **Historisch overzicht.** Statussen hieronder gelden voor de datum van dit rapport. De actuele stand staat in [MASTER-COMPLETION-TRACKER.md](MASTER-COMPLETION-TRACKER.md). Sindsdien o.a.: productielogin hersteld (23 nov), Neon-hersteltest geslaagd, SDK-PR #484 gemerged, Next Reply/Tool Call-tests 40/40 (24 nov).

Vervolg op het [eindrapport](ULTIMATE-COMPLETION-REPORT-NL.md). Alles hieronder is vandaag gecontroleerd in GitHub, de ElevenLabs-app, Gmail en op de live site.

## Wat er sinds 17 november veranderd is

| Onderwerp                                                                               | Status                                                                     | Bewijs                                                                                                                                                |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDK-bijdrage [elevenlabs-js #484](https://github.com/elevenlabs/elevenlabs-js/pull/484) | **Gemerged** op 18 november, na goedkeuring door een ElevenLabs-maintainer | merge-commit `4e88c8a`                                                                                                                                |
| ElevenReader-boek                                                                       | **Auteursnaam overal naar “Philippe Godfroy”**, opgeslagen als concept     | auteursprofiel, boekauteur, copyrightregel en openingszin van het manuscript aangepast; 0 credits                                                     |
| Monitoring en waarschuwingen                                                            | **Nieuw**: `Live monitor`-workflow, elke 6 uur                             | 27 publieke URL's + 5 productiechecks (health 200, database bereikbaar, privéroutes 401); een mislukte run stuurt jou automatisch een mail van GitHub |
| Muzieksupport                                                                           | Automatisch antwoord ontvangen, vraag doorgegeven aan een medewerker       | Gmail, 17 nov 03:06; geen planbeperking, max. 5 publicaties per dag                                                                                   |
| Explore-templates                                                                       | Nog niet publiek                                                           | _My templates_ → filter _Community_: leeg                                                                                                             |
| Showcase-PR [#113](https://github.com/elevenlabs/showcase/pull/113)                     | Open, geen review                                                          | laatste activiteit 9 nov                                                                                                                              |
| Productie                                                                               | Draait, database bereikbaar, privéroutes gesloten                          | anonieme controle 20 nov                                                                                                                              |

## Jouw beslissingen van vandaag (vastgelegd)

- Demovideo met geluid bekeken: goed.
- 3.013 credits (“Summer Never Gets Old”): in orde.
- Bewaartermijn bij ElevenLabs: blijft zoals hij is.
- Muziek beluisterd: goed.
- Outreach-berichten: worden niet gepost.

## Wat nog openstaat

| #   | Wat                                                                           | Wie                                                               | Waarom niet door mij gedaan                                                                                                            |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Productielogin**: nieuwe code instellen en dezelfde versie opnieuw deployen | jij (5 min, 3 commando's in [owner-actions.md](owner-actions.md)) | Je gaf toestemming, maar het permissiesysteem van deze sessie weigerde het vervangen van een productiegeheim. Ik heb dat niet omzeild. |
| 2   | **ElevenReader**: op _Submit_ drukken                                         | jij (2 min)                                                       | De laatste stap bevestigt onder jouw naam dat jij de auteursrechten bezit. Dat is een juridische verklaring.                           |
| 3   | **Echte spraaktest** met microfoon (EN/NL/FR)                                 | jij (15 min)                                                      | Daar is een mens met een microfoon voor nodig.                                                                                         |
| 4   | Neon-hersteltest (optioneel)                                                  | jij                                                               | Neon vraagt jouw login. De gezondheid van de database wordt nu wel elke 6 uur gecontroleerd.                                           |
| 5   | Agentregressie (~1.700 credits)                                               | volgende maand                                                    | Bewaartermijn blijft gelijk, dus niet dringend; nu maar 1.847 credits over.                                                            |
| 6   | Product Launch-template (~5.550 credits)                                      | volgende maand, optioneel                                         | Te weinig credits deze maand. Alleen met een productfoto zonder tekst.                                                                 |
| 7   | Webhooklevering na gesprekken testen                                          | na punt 1                                                         | Heeft een werkende productielogin en een deployment nodig.                                                                             |
| 8   | Pilot met echte gebruikers en de workshop geven                               | jij                                                               | Daar zijn mensen voor nodig.                                                                                                           |
| —   | Muzieksupport, Explore, Showcase-PR                                           | ElevenLabs                                                        | Niets te doen; geen tweede ticket openen.                                                                                              |

## Credits

Vandaag niets uitgegeven. Saldo: **1.847** credits deze maand.
