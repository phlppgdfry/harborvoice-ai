# Eindrapport Creative & Community — HarborVoice AI

11 november 2026, Europe/Brussels. Dit rapport beschrijft alleen wat aantoonbaar is gebeurd. Een ingediende, een gepubliceerde en een goedgekeurde status zijn drie verschillende dingen en worden apart genoemd.

## A. Samenvatting

Van de drie resterende doelen is er één volledig gehaald en zijn er twee tot aan een externe of eigenaarsbeslissing gebracht.

- **Tutorials en community (doel C): afgerond.** Twee tutorials, één walkthrough en een volledige workshoppagina staan publiek online en zijn na deployment gecontroleerd. Alle commando's en uitvoer op de pagina's zijn echt uitgevoerd. Er is een feedbackroute. Er staan ook echte, stille schermopnames van de live demo online. Er zijn nog geen lezers, deelnemers of reacties, en dat wordt ook nergens beweerd.
- **Product Launch (doel A): oorzaak gevonden en Flow hersteld, maar niet ingediend bij Explore.** Het product blijft nu in beeld en er is een echte, gecontroleerde Engelse voice-over. Publiceren vereist nog één betaalde voorbeeldrun van ongeveer 5.550 credits via het template zelf. Die is bewust niet gestart.
- **Music Marketplace (doel B): geen listings.** De drie tracks zijn via de API gemaakt en bestaan niet als project in Music History, terwijl publiceren alleen vanuit History kan. Een supportvraag aan ElevenLabs staat klaar als concept en is niet verzonden.

Er is 5.617 credits besteed, volledig aan het herstel van Product Launch. Er is niets gekocht, geüpgraded of in overage gezet.

## B. Product Launch

**Oorzaak.** Beide gebreken zaten in de opbouw van de Flow, niet in toeval.

1. _Abstracte animatie in plaats van het product._ De productafbeelding hing alleen aan het eerste frame. Daarna schreef een LLM een lange scènebeschrijving als videoprompt voor een snel videomodel (LTX 2 Fast, 12 seconden). Het eerste frame is het product; na ongeveer één seconde is het weg. De modelgids van de aanbieder zegt zelf dat dit model afdwaalt bij lange prompts.
2. _Geen controleerbare voice-over._ Er bestond geen spraaknode. De gesproken zin stond als opdracht in de videoprompt en moest uit de audio van het videomodel komen.

**Herstel.** Vijf korte tekstinvoervelden en één productfoto. Een LLM schrijft alleen nog het script (drie zinnen, 15–17 woorden, uitsluitend feiten uit de beschrijving). Een aparte spraaknode (Eleven v4) spreekt het uit. Een muzieknode levert een instrumentaal bed. De productfoto hangt aan het eerste én het laatste frame van de video (Veo 3.1 Lite, 8 seconden), met een vaste prompt die alleen de camerabeweging beschrijft. Een compositienode mixt alles.

**Kwaliteit van het eindvoorbeeld.** Gemeten op de gedownloade bestanden:

- Het product blijft de volle 8 seconden in beeld. Gelijkenis met de aangeleverde afbeelding (SSIM): 0,93–0,96 gedurende ongeveer 5,5 seconden, 0,75–0,79 tussen ongeveer 1,5 en 3,5 seconden.
- In die twee seconden wordt het beeld zacht en iets donkerder; kleine tekst is dan niet leesbaar. Er wordt niets verzonnen of herschreven.
- Voice-over: 7,44 seconden. Lokale spraakherkenning op de einduitvoer geeft woordelijk het script terug: "Need trusted voice agents? HarborVoice AI is an open-source learning workbench. Explore the demo and the source."
- De eerste videorun is afgekeurd: mijn eigen prompt vroeg om een lichtglans, waarna het model een banner herkleurde en tekst herschreef. Na het schrappen van die zin verdween dat.

Mijn oordeel: een grote verbetering en bruikbaar als voorbeeld in de walkthrough, maar door de zachte passage niet zonder voorbehoud "professioneel". Er is geen menselijke kijk- of luistertest gedaan.

**Indieningsstatus: niet ingediend.** In het native publicatiescherm staat: "Selected generations don't match the current template. Create generations from the template as examples." De knop Publish blijft uitgeschakeld tot er een voorbeeld via het template is gegenereerd, en dat scherm rekent ongeveer 5.550 credits per run. Die run is niet gestart omdat (1) de uitgaven voor dit doel daarmee ongeveer zouden verdubbelen en boven de vooraf gestelde grens van 6.000 credits komen, (2) een nieuwe run een nieuwe video oplevert die slechter kan zijn dan het gecontroleerde voorbeeld, en (3) er op 11 november 3.013 credits van het account zijn verbruikt buiten deze taak om, zodat er een andere gebruiker actief is.

- Flow (alleen eigenaar): <https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k>
- Templateconcept: zes invoervelden met hulptekst en twee uitvoeren zijn in het native paneel ingevuld; er bestaat nog geen gepubliceerd template-ID.
- Publiek voorbeeld en methode: <https://phlppgdfry.github.io/harborvoice-ai/learn/narrated-product-film-flow.html>
- Credits: 5.617. Details: [product-launch-final.md](product-launch-final.md) en [credit-ledger.json](credit-ledger.json).

## C. Music Marketplace

**Herkomst.** Future Systems, Northern Lights en Human Intelligence zijn op 8 november 2026 op het eigen account via de officiële Music API gemaakt (`music_v2_5`, 60 seconden, instrumentaal, zonder externe audioreferentie). De hashes van de masters komen overeen met de vastgelegde waarden. Alle drie decoderen foutloos, zonder clipping.

**Compatibiliteit met native publiceren.** Op het account vastgesteld:

- De pagina Published is leeg en verwijst naar History → project openen → Publish.
- Een nummer dat in de Music-interface is gemaakt, heeft een Publish-actie.
- Het bronfilter in History kent alleen "Flows" en "Video to music". Er is geen API-bron.
- De drie API-tracks staan onder geen enkele bron in History.

De documentatie zegt nergens dat API-muziek is uitgesloten, maar beschrijft ook geen import of migratie. Er is dus geen ondersteunde route gevonden. Er is geen privé-endpoint gebruikt en nergens op Publish geklikt.

**Supportvraag.** Een Engelstalige vraag met de zeven punten en de drie referenties staat in [music-publication-final.md](music-publication-final.md) en als onverzonden concept in Gmail. Er is niets verzonden en er is geen antwoord van ElevenLabs.

**Listings: nul.** Er is niets opnieuw gegenereerd en er is geen vervangende track als origineel voorgesteld.

**Nieuw technisch gegeven.** Northern Lights begint met 1,43 seconde bijna-stilte. Alleen luisteren kan uitmaken of dat een bedoelde fade-in is.

**Open rechtenbeslissingen.** Het Music Marketplace Addendum, de licentietypes, monetisatie en uitbetaling zijn niet geopend of aanvaard. Dat blijft een persoonlijke beslissing van de eigenaar.

## D. Tutorials

| Titel                                                                          | URL                                                                                 |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Building Reliable ElevenLabs Voice Agents: Tools, Grounding and Human Approval | <https://phlppgdfry.github.io/harborvoice-ai/learn/reliable-voice-agents.html>      |
| Testing ElevenLabs Voice Agents with AgentProof and AgentOps Kit               | <https://phlppgdfry.github.io/harborvoice-ai/learn/testing-voice-agents.html>       |
| A narrated product film in ElevenCreative Flows (walkthrough)                  | <https://phlppgdfry.github.io/harborvoice-ai/learn/narrated-product-film-flow.html> |
| Overzichtspagina                                                               | <https://phlppgdfry.github.io/harborvoice-ai/learn/>                                |

- **Codevoorbeelden:** echte fragmenten uit `agent/settings.ts`, `scripts/provision-agent.ts`, `server/app.ts`, `src/domain.ts` en de workshopstarter, plus een uitvoerbaar evaluatievoorbeeld van 30 regels.
- **Schermafbeeldingen en media:** AgentProof, de aangeleverde productafbeelding, frames van de mislukte en de herstelde film, en de eindfilm zelf. Een schermafbeelding van het Flow-canvas ontbreekt; daarvoor staat er een getekend schema.
- **Validatie:** elk commando is uitgevoerd en de getoonde uitvoer is vergeleken met de echte. Daarbij zijn vier fouten in mijn eerste versie gevonden en hersteld (zie [tutorial-publication.md](tutorial-publication.md)). Geen horizontale overloop op 390 en 360 pixels. De pagina's laden geen externe lettertypes, scripts of analytics.
- **Niet gedaan:** Safari, Firefox, een fysieke telefoon, een schermlezer en een test door iemand anders dan de auteur.

De twee tutorials draaien offline met Node 24, zonder API-sleutel en zonder credits. De walkthrough kan niet gratis worden nagedaan.

## E. Community

- **Workshop:** <https://phlppgdfry.github.io/harborvoice-ai/learn/workshop.html> — leerdoelen, vereisten, setup, inleiding voor beginners met architectuurschema, agenda van 90 minuten, zes oefeningen met verwachte uitkomst, kostenveilige modus, begeleidersnotities, probleemoplossing en materialen.
- **Starter:** 8 tests, geen dependencies. Nieuw: een uitvoerbare antwoordsleutel (3 tests).
- **Demo:** <https://phlppgdfry.github.io/harborvoice-ai/> en <https://phlppgdfry.github.io/harborvoice-ai/agentproof/>. Voor de demovideo liggen een script van 3:30, een shotlijst en 70 seconden echte, stille schermopnames van de live demo klaar ([demo-video.md](demo-video.md), beeld op <https://phlppgdfry.github.io/harborvoice-ai/learn/media/demo-footage.mp4> zodra de documentatie-PR is gemerged). **De afgewerkte video met stem is niet gemaakt**: daarvoor is de eigen stem of een betaalde spraakrun nodig.
- **Feedback:** twee publieke GitHub-formulieren, gelinkt op elke pagina. Geen tracking.
- **Echte deelname:** nul feedbackissues, nul externe bijdragers, nul inschrijvingen, nul gegeven workshops. Er is geen datum of locatie.
- **Externe berichten:** concepten voor Discord, GitHub Discussions, LinkedIn en een meetuporganisator staan in [community-launch.md](community-launch.md). Er is niets gepost.

## F. Ambassador

De eigenaar heeft de aanvraag al ingediend. Er is geen tweede aanvraag gedaan en de bestaande is niet geopend of gewijzigd. Er is geen status bekend.

## G. GitHub

- **Branch:** `feat/creative-community-finalization`, in een aparte werkboom (`~/harborvoice-creative-community`), vanaf main `ceb4dae`.
- **Commits:** `8a2ff01` Learn-pagina's en validator; `1d4030b` antwoordsleutel, feedbackformulieren, opnamescript; `d928fb8` links vanuit app en README, validator in CI; `c3644c6` Product Launch-, credit- en muziekdocumenten.
- **PR:** [#8](https://github.com/phlppgdfry/harborvoice-ai/pull/8), op 11 november om 19:14 UTC gemerged als `4ab3e7a` (normale merge, geen force-push).
- **CI:** de eerste run faalde in beide jobs tijdens `apt` bij het installeren van Playwright-systeempakketten op de GitHub-runner, nadat alle projecttests al geslaagd waren. Na een herhaling zonder codewijziging: Verify en Phase 3 groen op de PR, en opnieuw groen op main (`4ab3e7a`).
- **Deployment:** GitHub Pages-run [43085616895](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/43085616895) geslaagd. Op 12 november 02:57 UTC gaven alle 15 gecontroleerde URL's HTTP 200 en meldde `build-info.json` exact commit `4ab3e7a`. Bewijs: [live-verification.json](live-verification.json).
- **Niet aangeraakt:** de productiebranch en -werkboom, Vercel (deploymentfreeze blijft), productiegeheimen, de operatorlogin. Geen nieuwe release-tag.
- **Labels:** `feedback`, `learn` en `workshop` aangemaakt, omdat de feedbackformulieren ze gebruiken.
- **Afsluitende documenten** (dit rapport, communitypakket, publicatieverslag, demovideopakket, live-receipt) volgen in een aparte documentatie-PR.

## H. Budget

| Moment                                       | Verbruikt | Resterend |
| -------------------------------------------- | --------- | --------- |
| Start van deze taak (10 november, 05:02 UTC) | 108.689   | 20.026    |
| Na de laatste bewerking van deze taak        | 114.306   | 14.409    |
| Controle op 11 november                      | 117.319   | 11.396    |

- **Eerdere verplichtingen.** De vorige fasen hielden de uitgavenlimiet op 0 omdat oude reserveringen niet per opdracht waren afgewikkeld. Ik heb dat anders beoordeeld, op deze gronden: de teller stond bij vier metingen over ongeveer zes uur stil, alle lokale ledgers en alle Flows hadden nul openstaande bewerkingen, en overage staat uit, zodat de blootstelling nooit groter kan zijn dan het saldo en geen geld kost. De oude reserveringen zijn niet gewist; ze gaan over verbruik dat al in de teller zit. Op die basis is een werkgrens van 6.000 credits gesteld.
- **Nieuwe uitgaven van deze taak:** 5.617 volgens de teller, 5.621 volgens de bonnen. Daarvan 4.848 voor twee videoruns en 131 voor één voice-over die verloren ging doordat ik hem tegelijk met de scriptnode startte.
- **Verbruik buiten deze taak:** 3.013 credits tussen 10 en 11 november. In Music History staat een nummer van 3:04 ("Summer Never Gets Old") dat niet uit deze taak komt.
- **Resterende veilige ruimte:** door mij op 0 gezet zolang er een tweede gebruiker actief is.
- **Geblokkeerde betaalde bewerking:** de voorbeeldrun van het template, ongeveer 5.550 credits.

## I. Acties voor de eigenaar

1. **Product Launch — beslissen.** Kies: (a) één voorbeeldrun van ongeveer 5.550 credits goedkeuren en alleen indienen als het resultaat minstens zo goed is als het gecontroleerde voorbeeld; (b) eerst een productfoto met grote, eenvoudige vormen testen; of (c) de Flow privé houden. Mijn advies is (c) nu, en (b) na de volgende creditreset als Explore nog belangrijk is. Dit kan ik niet zelf beslissen: het is bijna de helft van het resterende saldo voor een onzekere uitkomst.
2. **Muziek — de supportvraag verzenden.** Het concept staat in Gmail. Alleen ElevenLabs kan zeggen of API-tracks gepubliceerd kunnen worden.
3. **Muziek — luisteren.** Gebruik de checklist in het muziekdocument, vooral voor het begin van Northern Lights.
4. **Muziek — rechten.** Lees het Addendum en beslis zelf over licentie en uitbetaling vóór enige listing.
5. **Berichten.** Beslis welke concepten je post. Dat gebeurt onder je eigen naam.
6. **Demovideo.** Spreek het script in, of keur na de creditreset een betaalde spraakrun goed.
7. **Bevestigen wie het account gebruikt.** Het onverklaarde verbruik van 3.013 credits wijst op een tweede gebruiker of sessie.

## J. Conclusie

**Zijn de drie resterende doelen afgerond?** Eén wel, twee niet.

- **Tutorials en community: ja.** Publiek, reproduceerbaar en gecontroleerd. Echte deelname is een toekomstige uitkomst.
- **Product Launch: nee.** Technisch hersteld en gemeten, maar niet ingediend. Afhankelijkheid: een eigenaarsbeslissing over ongeveer 5.550 credits, en daarna de review van ElevenLabs.
- **Music Marketplace: nee.** Afhankelijkheid: een antwoord van ElevenLabs op de supportvraag die de eigenaar nog moet verzenden, daarna een luistertest en een rechtenbeslissing.

Er is geen Explore-inzending en geen Marketplace-listing, en geen van beide wordt hier gepubliceerd genoemd.
