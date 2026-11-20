# Eindrapport — HarborVoice AI, definitieve afronding

> **Bijgewerkt op 20 november 2026:** zie [STATUS-UPDATE-2026-11-20-NL.md](STATUS-UPDATE-2026-11-20-NL.md). De SDK-PR is gemerged, het ElevenReader-boek staat klaar om opnieuw in te dienen en er draait nu monitoring.

16–17 november 2026. Alles hieronder is gecontroleerd tegen echte bronnen: GitHub, de ElevenLabs-app en -API, Vercel-metadata, de productiedatabase (alleen-lezen), Gmail en de gebouwde site. Waar iets niet geverifieerd is, staat dat erbij.

## Samenvatting

- **Afgerond:** nieuwe publieke showcase-site met echte opnames, een afgewerkte vertelde demovideo (2:54), een verse agentregressie op de actuele versie (6/6), branch-opruiming, repository-beveiliging, correcte README en een onderhoudsrelease v2.2.1.
- **Oorzaak gevonden, niet hersteld:** de productielogin. De lokaal bewaarde code is de preview-code; de productiecode van 7 november is nergens bewaard en is bij Vercel niet terug te lezen.
- **Niet gehaald:** Product Launch op Explore. Het verplichte template-voorbeeld herschreef de boektitel en is daarom niet gepubliceerd.
- **Wacht op derden:** muzieksupport (verzonden), Explore-beoordeling, Showcase- en SDK-PR.
- **Nieuw ontdekt:** het ElevenReader-boek is op 11 november **afgewezen** wegens de auteursnaam “HarborVoice Project”.

## Antwoorden op de 30 vragen

1. **Is GitHub schoon?** Ja. Geen ongecommitte broncode. Overgebleven bestanden in werkbomen zijn genegeerde dependencies en build-output.
2. **Alles gecommit en gepusht?** Ja. PR #10 gemerged als `7acf4b2`; Dependabot-PR #11 (Pillow-beveiligingsupdate, getest) gemerged als `703bfb6`; dit rapport volgt via een kleine documentatie-PR.
3. **Welke branches blijven?** `main` en `production/persistent-runtime`. De laatste blijft omdat de bijbehorende werkboom de private productieconfiguratie bevat die nodig is voor de loginfix. `feat/creative-community-finalization`, `docs/creative-community-closeout`, `feat/final-closeout` en de Dependabot-branch zijn verwijderd na controle (telkens 0 niet-gemergede commits).
4. **PR's verzoend?** Ja. PR's #1–#11 zijn gemerged; alleen de documentatie-PR van dit rapport staat open tot CI groen is.
5. **Werkt de publieke demo?** Ja: op `/app.html`, ongewijzigde functionaliteit; oude `/#…`-links worden doorgestuurd. Getest in Chrome en WebKit.
6. **Werkt AgentProof?** Ja, live op `/agentproof/`, opgenomen in de producttour.
7. **Werkt AgentOps?** Ja: 40/40 tests; `diff` en `validate` (exitcode 2 bij risicovolle config) live opgenomen.
8. **Is de productielogin hersteld?** **Nee.** Oorzaak bewezen: dezelfde code geeft 401 op productie en 200 op de preview-deployment. Herstel vraagt jouw beslissing ([production-auth.md](production-auth.md)).
9. **Backup/recovery geaccepteerd?** **Nee.** Productiedatabase alleen-lezen gecontroleerd: migratie 1 = repo, geen drift, 4 zendingen / 1 sessie / 0 tickets. Neon-backupvenster en een herstel-oefening zijn niet geverifieerd ([production-recovery.md](production-recovery.md)).
10. **Privacy en retentie begrepen?** Ja, gedocumenteerd. Provider bewaart gesprekken onbeperkt met spraakopname aan; lokale verwijdering verwijdert niets bij ElevenLabs. Aanbevolen instelling voorbereid, niet doorgevoerd ([privacy-security.md](privacy-security.md)).
11. **Actuele spraakfunctionaliteit getest?** Deels. 6/6 native simulatietests (EN/NL/FR) op versie `agtvrsn_9601m6xjw36beketcgn7tzzze8zb`, 17 november, eenmalig. Dat zijn tekstsimulaties, geen microfoon- of audiotest.
12. **Exacte live-SHA?** Vercel-productie: `234281a806150a79b12220d182df3fc9e97534b9` (`dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`), ongewijzigd. Pages: `7acf4b2ada9450dd80cb41b6b8d86e537e522a2e` (live `build-info.json`, versie 2.2.1).
13. **Product Launch ingediend?** **Nee.** Voorbeeldrun (5.550 credits) faalde: titel werd “Enterprise Voice **Voice** AI”, kleine tekst verminkt, verzonnen element. Niet gepubliceerd ([product-launch.md](product-launch.md)).
14. **Status muziek?** Drie tracks intact (hashes kloppen), niet op Marketplace, geen ondersteunde route gevonden ([music-marketplace.md](music-marketplace.md)).
15. **Supportverzoek verzonden?** **Ja**, 17 november vanaf het accountadres naar `support@elevenlabs.io`, Gmail-bericht `1a1e73e1470ef8ed`. Nog geen antwoord of ticketnummer.
16. **ElevenReader en Explore?** Explore: twee templates ingediend, niet zichtbaar, geen besluit. ElevenReader: **afgewezen**, aanpassing van auteursnaam vereist.
17. **Hebben Showcase/SDK-maintainers gereageerd?** Nee. Geen reviews; laatste activiteit 9 november.
18. **Website visueel verbeterd en getest?** Ja. Nieuwe landingspagina; 46 controles in Chrome en WebKit op vier viewports zonder problemen; Firefox kon niet starten in deze omgeving ([website-visual-audit.md](website-visual-audit.md)).
19. **Originele clips gemaakt?** Ja: drie producttour-clips plus filmfragment, allemaal echte opnames ([visual-assets.md](visual-assets.md)). Bewust MP4 in plaats van GIF (5–10× kleiner).
20. **Volledige vertelde demovideo af?** **Ja**: 2:54, 1920×1080, ondertiteld, transcript, preview van 46 s, reproduceerbaar script. Nog niet door een mens met geluid beluisterd.
21. **Tutorials en workshop werken nog?** Ja: validator en 8 + 3 workshoptests slagen; links aangepast aan de nieuwe indeling.
22. **Sociale berichten alleen concepten?** **Ja.** Niets gepost, verstuurd of ingepland ([outreach-drafts/](outreach-drafts/)).
23. **Huidig saldo?** **1.847 credits** (126.868 van 128.715 gebruikt).
24. **Credits gebruikt door deze taak?** **9.549**: 5.550 template-voorbeeld, 2.274 vertelling, 1.725 agenttests.
25. **Onverwachte kosten?** Nee. Bonnen = tellerverschil. De eerdere 3.013 credits horen vermoedelijk bij het nummer “Summer Never Gets Old”, gemaakt in de Music-interface door een ingelogde sessie die niets met HarborVoice-tooling te maken heeft. Wie dat was, is niet vastgesteld.
26. **Nieuwe release gepubliceerd en geverifieerd?** **Ja.** [v2.2.1](https://github.com/phlppgdfry/harborvoice-ai/releases/tag/v2.2.1) op de geteste mergecommit `7acf4b2`, acht assets; alle checksums kloppen na anonieme download. Live: 27 URL's HTTP 200 en 45 browsercontroles zonder problemen ([final-release-evidence.md](final-release-evidence.md)).
27. **Wat vraagt nog jouw goedkeuring?** Loginfix, auteursnaam boek, retentie-instelling, database-herstel-oefening, muziekbeslissingen na supportantwoord, publicatie van berichten ([owner-actions.md](owner-actions.md)).
28. **Geblokkeerd door ElevenLabs of derden?** Muzieksupport, Explore-beoordeling, Showcase-PR (Vercel-autorisatie door maintainers) en SDK-PR-review.
29. **Wat moet de eigenaar nu doen?** In deze volgorde: loginfix, boek opnieuw indienen, video met geluid bekijken, de 3.013 credits nagaan ([owner-actions.md](owner-actions.md)).
30. **Klaar voor publieke promotie?** **Ja, als open-source demo, ontwikkelaarstoolkit en leermateriaal.** **Nee, als geaccepteerd productieplatform**: login, herstel en retentie zijn niet afgerond.

## Scorecard

| Domein               | Status                              | Bewijs                                      | Blokkade                | Volgende stap                          |
| -------------------- | ----------------------------------- | ------------------------------------------- | ----------------------- | -------------------------------------- |
| GitHub               | VOLTOOID EN GEVERIFIEERD            | schone werkbomen, PR #10 en #11 gemerged    | —                       | —                                      |
| Bronintegratie       | VOLTOOID EN GEVERIFIEERD            | merge in main                               | —                       | —                                      |
| Branch-opruiming     | VOLTOOID EN GEVERIFIEERD            | alleen `main` + productiebranch over        | —                       | —                                      |
| CI                   | VOLTOOID EN GEVERIFIEERD            | Verify + Phase 3 groen                      | —                       | —                                      |
| Productielogin       | TECHNISCH KLAAR — WACHT OP EIGENAAR | 401 vs 200, env-metadata                    | productiecode onbekend  | code vinden of rotatie goedkeuren      |
| Database             | VOLTOOID MET BEPERKINGEN            | alleen-lezen check, geen drift              | —                       | —                                      |
| Backup/recovery      | NIET VOLTOOID                       | alleen geïsoleerde test                     | Neon-account            | herstel-oefening                       |
| Security             | VOLTOOID MET BEPERKINGEN            | audit 0, gitleaks schoon, branchbescherming | geen pentest            | —                                      |
| Privacy              | TECHNISCH KLAAR — WACHT OP EIGENAAR | providerinstellingen gelezen                | retentiebeslissing      | instelling kiezen                      |
| Voice agents         | VOLTOOID MET BEPERKINGEN            | 6/6 op actuele versie                       | geen audiotest          | fysieke microfoontest                  |
| AgentOps             | VOLTOOID EN GEVERIFIEERD            | 40/40                                       | —                       | —                                      |
| AgentProof           | VOLTOOID EN GEVERIFIEERD            | live, opgenomen                             | —                       | —                                      |
| Product Launch       | NIET VOLTOOID                       | kwaliteitspoort gefaald                     | model herschrijft tekst | product zonder tekst, volgende periode |
| Music Marketplace    | GEBLOKKEERD DOOR PROVIDER           | geen route, support verzonden               | ElevenLabs-antwoord     | antwoord afwachten                     |
| Explore              | INGEDIEND — WACHT OP EXTERNE REVIEW | niet zichtbaar                              | ElevenLabs              | —                                      |
| ElevenReader         | TECHNISCH KLAAR — WACHT OP EIGENAAR | afwijzingsmail 11 nov                       | auteursnaam             | opnieuw indienen                       |
| Officiële Showcase   | INGEDIEND — WACHT OP EXTERNE REVIEW | PR #113 open                                | maintainers             | —                                      |
| SDK-bijdrage         | INGEDIEND — WACHT OP EXTERNE REVIEW | PR #484 open                                | maintainers             | —                                      |
| Ambassador           | INGEDIEND — WACHT OP EXTERNE REVIEW | eerder ingediend, niet aangeraakt           | ElevenLabs              | —                                      |
| Publieke showcase-UX | VOLTOOID MET BEPERKINGEN            | QA Chrome + WebKit                          | Firefox niet getest     | —                                      |
| Geanimeerde media    | VOLTOOID EN GEVERIFIEERD            | 3 clips + filmfragment                      | —                       | —                                      |
| Volledige demovideo  | VOLTOOID MET BEPERKINGEN            | 2:54, ondertiteld                           | menselijke luistercheck | met geluid bekijken                    |
| Learn                | VOLTOOID EN GEVERIFIEERD            | validator, live                             | —                       | —                                      |
| Workshop             | VOLTOOID EN GEVERIFIEERD            | 8 + 3 tests                                 | nog nooit gegeven       | —                                      |
| Outreach-concepten   | TECHNISCH KLAAR — WACHT OP EIGENAAR | 7 concepten                                 | jouw goedkeuring        | posten wanneer gewenst                 |
| Credits              | VOLTOOID EN GEVERIFIEERD            | bonnen = teller                             | —                       | geen betaald werk meer deze periode    |
| Release              | VOLTOOID EN GEVERIFIEERD            | v2.2.1, checksums OK, live build = tag      | —                       | —                                      |

## Conclusie

HarborVoice is nu een samenhangend, eerlijk en visueel professioneel open-sourceproject: één duidelijke voorpagina, een werkende demo, twee herbruikbare tools, leermateriaal, een afgewerkte video en een verse meting op de actuele agentversie. Wat ontbreekt, ligt bij jou (login, boek, retentie, herstel) of bij ElevenLabs (support, reviews). Niets daarvan wordt in de site of documentatie als afgerond voorgesteld.
