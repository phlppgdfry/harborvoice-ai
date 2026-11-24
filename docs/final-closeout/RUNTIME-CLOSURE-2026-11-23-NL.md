# HarborVoice — afsluiting runtime, 23–24 november 2026

Dit rapport vult de [algemene status](STATUS-UPDATE-2026-11-23-NL.md) aan. Bestaande resultaten en historische beperkingen blijven bewaard.

## Afgewerkt en geverifieerd

- **Productietoegang:** dezelfde bronversie `234281a806150a79b12220d182df3fc9e97534b9` opnieuw gebouwd met de bestaande productieconfiguratie en expliciet gepromoveerd. Deployment na webhookactivering `dpl_34QBk15Q1t3y5nXckoY6jedzKnFL`; eerdere loginreparatie `dpl_Aye4R6dFvuh8ankzgmx4oHi8EC3U`; geen nieuwe sleutelrotatie, infrastructuur of betaald abonnement.
- **Werkelijke browserflow:** aanmelden via HTTPS, Secure/HttpOnly/Strict-cookie, afgeschermde gegevens, PostgreSQL/providerstatus, agentselectie, mobiele weergave en afmelden geslaagd. [Geredigeerd resultaat](hosted-runtime-2026-11-23.json). Deze controle startte geen gesprek.
- **Herstelbaarheid:** consistente read-only export van live PostgreSQL 18.7, AES-256-GCM-versleuteling, teruglezen/ontsleutelen en herstel in een geïsoleerde lokale PostgreSQL 18-container. Rijtotalen, inhoudsdigest en werkruimteschema komen overeen; geen productiewrites. [Resultaat](live-recovery-2026-11-23.json) en [procedure/grenzen](production-recovery.md).
- **Veiliger verificatie:** expliciet bestand voor de productiecode; geen automatische verwarring met de previewcode. Drie negatieve/positieve tests controleren dit zonder geheimen af te drukken.

## Uitgevoerde controles

| Controle                            | Resultaat                                                | Reikwijdte                                                    |
| ----------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `npm run check`                     | PASS: build, 67 tests geslaagd, 1 expliciet overgeslagen | Geen modelkwaliteitsclaim                                     |
| `npm run test:postgres`             | PASS: 2 tests, geen skips                                | Tijdelijke PostgreSQL, echte dump/restore                     |
| `npm run format:check`              | PASS                                                     | Opmaak                                                        |
| `npm audit --audit-level=high`      | PASS: 0 kwetsbaarheden                                   | Registry-resultaat op 23 november                             |
| `gitleaks git --redact --no-banner` | PASS: 59 commits, geen meldingen                         | Historie tot huidige basis; nieuwe diff apart nagekeken       |
| `npm run verify:production`         | PASS, geen voice-call                                    | Werkelijke gehoste browserflow                                |
| Live read-only herstelproef         | PASS, 32 seconden                                        | Geen restore over productie, geen automatische offsiteback-up |

De standaardsuite slaat PostgreSQL bewust over; de aparte geslaagde run is dus essentieel. CI-resultaten van de afsluitbranch worden in de bijbehorende pull request gerapporteerd; een lokale PASS is geen hosted CI-resultaat.

## Expliciet open

- **Fysieke acceptatie:** op verzoek van de eigenaar open gelaten. Microfoontoestemming op diens toestel, hoorbaarheid, onderbreken en subjectieve EN/NL/FR-kwaliteit zijn hiermee niet goedgekeurd.
- **Provider-webhook:** HMAC-eindpunt aangemaakt en alleen aan Nora gekoppeld, met `excludeTranscript=true` en `sendAudio=false`; werkruimtestandaard staat uit. Een ongetekend leeg verzoek naar productie werd met HTTP 401 geweigerd; dit bewijst geen succesvolle providerlevering. Nieuw productiegeheim uitsluitend in Vercel Secret opgeslagen. [Read-only providerbevestiging](webhook-configuration-2026-11-24.json). Analysevelden worden nog meegestuurd: het uitsluiten van transcript maakt de payload niet automatisch vrij van persoonsgegevens. Werkelijke aflevering na een gesprek blijft niet geverifieerd; geen nieuwe call of fixture als echte providerlevering gepresenteerd. De gepubliceerde agentversie is gewijzigd door deze configuratie; eerdere 6/6 tekstsimulaties gelden voor de eerdere versie, geen nieuwe kwaliteitstest uitgevoerd.
- **Budget:** de laatste parallel gepubliceerde accountcontrole meldt 18 resterende credits. Geen nieuwe betaalde call of generatie in deze afronding. Geen limiet verlaagd om een test toch te laten draaien.
- **Productiegrenzen:** één gedeelde operatoridentiteit, synthetische logistieke gegevens, geen echte cargo-release of klantintegratie. Lokale versleutelde back-up en sleutel op dezelfde Mac zijn geen rampbestendige offsitebewaring. Providerretentie blijft volgens de eerdere eigenaarsbeslissing ongewijzigd.

## Afsluitadvies

De bestaande visuele showcase, film en leeromgeving behoeven geen nieuwe ontwikkelcyclus. Het project kan als eerlijk gedocumenteerde portfolio-/operatorworkbench worden getoond. Claim geen volledig fysiek geaccepteerde klantenproductie zolang bovenstaande grenzen openstaan. Externe marketplace- en communitybeoordelingen zijn geen voorwaarde om de showcase af te ronden.
