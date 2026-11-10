# Definitief consolidatierapport — HarborVoice AI

Datum: 10 november 2026. Deze eerste vastlegging begeleidt de bronintegratie; de onafhankelijke merge-, CI- en releasebewijzen worden hieronder na publicatie aangevuld.

## 1. Samenvatting

De bestaande ontwikkellijnen zijn lokaal samengebracht zonder geschiedenis te herschrijven. De publieke demo, AgentProof en AgentOps zijn technisch gevalideerd. Productieacceptatie blijft beperkt: de bestaande operatorcode geeft HTTP 401. Er is geen productiedeployment, live migratie of herstelactie uitgevoerd. Een stabiele v2.2.0 is uitsluitend bedoeld voor de publieke demo en ontwikkelaarstools.

## 2. Git voor en na

Begin: remote main `1c6c17c416c42cd095006b8025adc33326e7b403`; lokale main `a5b7c20` liep 34 commits achter. Productie `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6` had 8 unieke commits en liep 17 achter. Elf remote branches en acht werkbomen zijn geïnventariseerd in [branch-inventory.md](branch-inventory.md) en [worktree-inventory.json](worktree-inventory.json). Er waren geen ongecommitteerde bronwijzigingen of ongepushte lokale commits; de tijdelijke detached werkboom had uitsluitend een dependency-symlink als untracked bestand.

Negen obsolete branches zijn opnieuw op ancestry, lokale/remote tipgelijkheid en open PR-afhankelijkheden gecontroleerd en lokaal én remote verwijderd. Exacte tips staan in [branch-cleanup.json](branch-cleanup.json). Zes oude werkbomen zijn verwijderd. Hun niet-reproduceerbare genegeerde bestanden zijn eerst privé gearchiveerd, elk bestand is via SHA-256 in het archief teruggelezen. [Herstelbewijs](worktree-cleanup.json). Archieven: `/Users/philippegodfroy/harborvoice-private-recovery/2026-11-10-consolidation`, maprechten 0700, archieven 0600. Dependency-links en builduitvoer zijn reproduceerbaar; credentials en runtimebestanden van de hoofd- en productiewerkboom blijven staan.

De productiebranch en productiewerkboom blijven nodig voor privéconfiguratie en operationele overdracht. De tijdelijke consolidatiebranch wordt na veilige bronintegratie verwijderd. Historische tags, rapporten, mislukkingen en providerprovenance blijven intact. Andere repositories zijn niet gewijzigd.

## 3. Productie-integratie

PR #1 wordt met de volledige huidige main gereconcilieerd via een normale merge, zonder force-push. PostgreSQL, migraties, duurzame sessies, logoutrevocatie, transcriptopslag, import/verwijdering, foutafhandeling, beveiligingsheaders en de native SDK blijven behouden. AgentProof, AgentOps, Community Studio, EPUB-correcties, publicaties en creditgovernor uit fasen 4–6 blijven eveneens behouden. De Pages-workflow behoudt de gate op een geslaagde Verify-run; gepinde Actions uit de productiebranch blijven behouden.

De actieve Vercel-alias `harborvoice-ai.vercel.app` wijst op `dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`, SHA `234281a806150a79b12220d182df3fc9e97534b9`. [Verse deploymentidentiteit](production-deployment.json) en [projecttargets](deployment-targets.json) zijn read-only opgehaald. Bestaande immutable deployment blijft het rollbackanker; rollback is niet uitgevoerd. `git.deploymentEnabled=false` blijft aan. Er is geen nieuw preview aangemaakt en geen productieconfiguratie gewijzigd.

Anonieme private routes geven 401 en no-store; status meldt productie/PostgreSQL. De bestaande privéoperatorcode wordt met 401 geweigerd: zowel browserlogin als gerichte HTTP-controle falen. Authenticated readiness, huidig sessiebeheer en transcriptinhoud zijn daarom niet operationeel herbevestigd. [Auth-bewijs](hosted-auth.json). Dit is geen bewijs van een nieuwe regressie: de productie-SHA is ongewijzigd. Geen credential is gepubliceerd, geroteerd of vervangen.

Migratie, transacties, parallelle updates, rollback, restart/persistentie, autorisatie, logoutrevocatie, import en verwijdering slagen tegen een tijdelijke PostgreSQL 17-container. Echte pg_dump/pg_restore slaagt naar een tweede tijdelijke database. Geen productieverbinding gebruikt voor deze tests. Dit bewijst technische herstelbaarheid in isolatie; live backupdekking, bewaartermijnen, herstelverantwoordelijkheid en een live oefening blijven eigenaarsacceptatie. Lokale productie-CSP gebruikt uitsluitend fixturecredentials en een aparte SQLite-fixturedatabase.

## 4. Tests

| Controle                             | Actueel resultaat                                        | Reikwijdte                                                                                 |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| npm ci                               | geslaagd                                                 | lockfile-installatie                                                                       |
| npm run check                        | 65 tests: 64 geslaagd, 0 gefaald, 1 PostgreSQL-overslag  | TypeScript, workbench en AgentProof-build, domein/API/SDK-fixtures                         |
| npm run test:postgres                | 2 geslaagd, 0 overgeslagen; dump/restore geslaagd        | geïsoleerde echte PostgreSQL                                                               |
| phase3:verify                        | 40 AgentOps + 13 workshop/contributietests geslaagd      | offline adapters, parsing, redactie, budgetten, rapporten                                  |
| Benchmark                            | 110 scenarios; 12 afzonderlijke contractcases            | synthetisch; 9 bedoelde fouten, 3 controles                                                |
| recognition:validate                 | validator + 5 tests geslaagd                             | showcasevorm en workshop                                                                   |
| elite:validate                       | geslaagd                                                 | publicatievereisten en assethashes                                                         |
| Root/Academy/Elite/Community-browser | alle journeys geslaagd, geen pageerrors                  | desktop Chrome + mobiele viewport, acht audioforms gemockt                                 |
| Productie-SDK-browser                | 7 controles geslaagd; ook onder productie-CSP            | gemockte WebSocket/API, synthetische microfoon; geen providerkosten                        |
| Publieke browser                     | 6 controleresultaten geslaagd                            | Pages, AgentProof, filters, vergelijking, exports, toetsenbord, 390/360px, EPUB/audio-HTTP |
| Media                                | 67/67 probe en volledige decode geslaagd                 | geregistreerde MP3/MP4/M4B, geen subjectieve luistersessie                                 |
| EPUBCheck 5.4.0                      | 0 fatal, 0 fouten, 0 waarschuwingen, 0 infos             | huidige technische boek-EPUB                                                               |
| npm audit                            | 0 kwetsbaarheden                                         | 235 dependencyvermeldingen op auditmoment; geen pentest                                    |
| Gitleaks                             | 0 in 44 historische commits; 0 huidige tracked bestanden | genegeerde private operationele bestanden buiten publieke broncontrole                     |

Exacte uitvoer staat in [verification/](verification/). Eerste sandboxpogingen werden door socket-/DNS-beperkingen geweigerd; relevante controles zijn buiten de sandbox opnieuw uitgevoerd. Geen test is stilzwijgend overgeslagen om groen te krijgen. De enige standaardoverslag heeft een afzonderlijke echte PostgreSQL-run. Gegenereerde benchmarktimestamps zijn na controles teruggezet naar de bestaande historische bewijsbestanden; verse contractvalidatie staat apart.

## 5. Applicaties

Publieke workbench: journeys, navigatie, synthetische chat, escalatie, exports, opnames en mobiele weergave slagen. AgentProof: scenariozoekopdracht, falenfilter, lege toestand, policyvergelijking, contractlab, toetsenbord en JSON-download slagen. AgentOps: build en declarations, CLI/package-smoke, budget/redactie/adapters/receiptparsing en rapporten slagen. Het packaging-script bevatte nog een hard-coded 0.1.0 bestandsnaam; het gebruikt nu het echte npm-packmanifest. Het 0.2.0 pakket blijft inhoudelijk ongewijzigd.

Beschermde productie: publiek bereikbaar en private routes afgeschermd; bestaande operatorcode onbruikbaar. Huidige volledige operatorflow is ONBEVESTIGD. Geen betaalde call gestart. Historische 14-seconden-smoke blijft historische evidence, geen actuele microfoonacceptatie. Browseremulatie is geen fysiek mobiel apparaat, Safari, screenreader of menselijke audiobeoordeling.

## 6. Pakket en release

Voorbereid: v2.2.0 Stable — publieke demo/SDK-scope. AgentOps 0.2.0 wordt waar hashgelijkheid dit bevestigt uit rc.2 hergebruikt. AgentProof-distributie wordt alleen vernieuwd wanneer nieuwe buildprovenance dat vereist. Vite levert voortaan publiek `build-info.json` met exacte commit en projectversie; geen secrets of omgevingswaarden. Tags, CI, downloads en hashes moeten vóór definitieve publicatie onafhankelijk worden gecontroleerd. Definitieve bewijzen volgen in de closeoutsectie. Geen npm-publicatie.

## 7. Credits en resources

Verse subscription GET: Creator/active, 108.689 gebruikt van 128.715, **20.026 resterend**. Maandelijkse periode, volgende resetwaarde `1796610620`; overage USD 0, extension 0, geen open facturen. [Accountbewijs](provider-readonly.json). Geen upgrade, overage of aankoop.

Alle negen Flows read-only gelezen: uitsluitend completed/static_asset/not_run, geen pending node. Twee bestaande conversaties, beide done, pagination uitgeput. [Flows](flow-states.json), [conversaties](conversation-states.json), [ledgeraudit](ledger-audit.json). Studio API 403 en template-API 402 zijn toegangsbeperkingen; ze zijn niet omzeild. Overige productjobs en externe accountgebruikers zijn niet uitputtend uitgesloten. Historische holds overlappen geboekt gebruik, settlement per operatie ontbreekt. Daarom is een positief accountbreed veilig budget niet vastgesteld: nieuwe betaalde dispatchlimiet **0**, betaalde operaties **0**, aan deze taak toegerekende nieuwe generatiespend **0 credits**. Geen reserveringen vrijgegeven en governor niet omzeild.

## 8. Externe publicaties

Showcase #113: open, niet gemerged. SDK #484: open, niet gemerged. [Verse GitHub-statussen](external-prs.json). Twee Explore-submissies en ElevenReader Pending review zijn met native historische receipts aanwezig; actuele externe goedkeuring kon niet opnieuw worden gelezen door de niet-werkende browserinterface (`timeoutMs`-toolfout). Geen goedkeuring of publieke Readerlisting geclaimd. Muziekmasters privé behouden; geen bewezen Marketplacelisting. Product Launch blijft bewust niet ingediend na de mislukte fidelitygate. Geen inzending, native resource, agentversie of upstream PR gewijzigd, verwijderd of gedupliceerd.

## 9. Resterende acties

Kritieke operationele blokkade: eigenaar moet de geldige bestaande operatorcode identificeren/herstellen via de bedoelde credentialprocedure; deze consolidatie roteert geen credentials. Daarna kosteloze authenticated readiness/login/logout herhalen vóór productieacceptatie.

Eigenaar: fysieke microfoon en interruptions beoordelen; NL/FR-uitspraak beluisteren; retention/privacy en provider-side deletion vastleggen; live backupdekking en verantwoordelijke controleren; aparte goedkeuring voor rollout, live migratie, herstel of aliaspromotie. Een geïsoleerd preview met apart databasecontract en configvergelijking is vóór toekomstige rollout nodig. Live databasecompatibiliteit en echte recovery zijn niet door een lokale test vervangen.

Niet-kritiek: grote lazy voicebundle geeft een Vite chunkwaarschuwing; geen blind dependency-upgrade uitgevoerd. Branchbescherming is niet administratief aangepast. Externe reviewers beslissen over Showcase/SDK/Explore/Reader; hun reactietijd blokkeert brononderhoud niet.

## 10. Aanbeveling en scorecard

**Ja, als onderhoudbaar en professioneel openbaar demo-/ontwikkelaarstoolsproject; nee, als onvoorwaardelijk operationeel geaccepteerd productieplatform.** Bronintegratie en stabiele publicatie worden alleen afgerond na groene actuele CI en onafhankelijk releasebewijs.

| Domein                 | Status                                | Bewijs                                        | Resterend werk                             |
| ---------------------- | ------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Git schoon             | closeout volgt                        | inventaris + eindstatus                       | definitieve commit                         |
| Branchopruiming        | 9 oude branches verwijderd            | branch-cleanup.json                           | productie bewust behouden                  |
| Commits gepusht        | closeout volgt                        | remote SHA                                    | definitieve push                           |
| Pull requests verzoend | PR #1 geïntegreerde kandidaat         | originele reviews en gezamenlijke bron        | CI + merge                                 |
| Main geïntegreerd      | closeout volgt                        | merge-SHA                                     | CI + merge                                 |
| CI groen               | lokale tests groen                    | verification/                                 | exacte remote SHA controleren              |
| AgentProof werkt       | bevestigd                             | browser-verification.json                     | geen blokkerend werk                       |
| AgentOps werkt         | bevestigd                             | 40 tests + package-smoke                      | geen blokkerend werk                       |
| Media geldig           | technisch bevestigd                   | media-audit.json, EPUBCheck                   | menselijke kwaliteitsacceptatie apart      |
| Productieruntime       | gedeeltelijk bevestigd                | status PostgreSQL, auth 401                   | geldige operatorcode + authenticated check |
| Databaseveiligheid     | geïsoleerd bevestigd                  | postgres.log + dump/restore                   | live backup/recovery-eigenaar              |
| Deployment             | productie behouden                    | production-deployment.json                    | rollout vereist aparte goedkeuring         |
| Documentatie           | actuele README hersteld               | huidige overview + historische reports intact | closeout                                   |
| Security               | gerichte controles groen              | audit + tracked/history Gitleaks              | geen pentest/certificering geclaimd        |
| Release                | demo/SDK stabiel voorbereid           | versie 2.2.0                                  | onafhankelijke publicatiecontrole          |
| ElevenLabs-credits     | saldo bevestigd; spending geblokkeerd | 20.026, nul dispatch                          | liabilitysettlement/accountcoördinatie     |
| Externe publicaties    | submitted; niet approved              | open upstream PRs, bestaande native receipts  | reviewers; native status herlezen          |

## Onafhankelijke closeout

Wordt na merge, actuele CI en releaseverificatie aangevuld.
