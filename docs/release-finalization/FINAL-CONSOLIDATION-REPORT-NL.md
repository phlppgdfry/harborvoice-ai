# Definitief consolidatierapport — HarborVoice AI

Datum: 10 november 2026. Definitieve bron- en releaseverificatie; de afsluitende documentatiecommit verandert uitsluitend rapportage en receipts.

## 1. Samenvatting

De bestaande ontwikkellijnen zijn via PR #1 op main samengebracht zonder geschiedenis te herschrijven. De publieke demo, AgentProof en AgentOps zijn technisch gevalideerd. Productieacceptatie blijft beperkt: de bestaande operatorcode geeft HTTP 401. Er is geen productiedeployment, live migratie of herstelactie uitgevoerd. v2.2.0 is gepubliceerd als stabiele release uitsluitend voor de publieke demo en ontwikkelaarstools.

## 2. Git voor en na

Begin: remote main `1c6c17c416c42cd095006b8025adc33326e7b403`; lokale main `a5b7c20` liep 34 commits achter. Productie `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6` had 8 unieke commits en liep 17 achter. Elf remote branches en acht werkbomen zijn geïnventariseerd in [branch-inventory.md](branch-inventory.md) en [worktree-inventory.json](worktree-inventory.json). Er waren geen ongecommitteerde bronwijzigingen of ongepushte lokale commits; de tijdelijke detached werkboom had uitsluitend een dependency-symlink als untracked bestand.

Negen obsolete branches zijn opnieuw op ancestry, lokale/remote tipgelijkheid en open PR-afhankelijkheden gecontroleerd en lokaal én remote verwijderd. Exacte tips staan in [branch-cleanup.json](branch-cleanup.json). Zes oude werkbomen zijn verwijderd. Hun niet-reproduceerbare genegeerde bestanden zijn eerst privé gearchiveerd, elk bestand is via SHA-256 in het archief teruggelezen. [Herstelbewijs](worktree-cleanup.json). Archieven: `/Users/philippegodfroy/harborvoice-private-recovery/2026-11-10-consolidation`, maprechten 0700, archieven 0600. Dependency-links en builduitvoer zijn reproduceerbaar; credentials en runtimebestanden van de hoofd- en productiewerkboom blijven staan.

De productiebranch en productiewerkboom blijven nodig voor privéconfiguratie en operationele overdracht. De tijdelijke consolidatiebranch wordt na veilige bronintegratie verwijderd. Historische tags, rapporten, mislukkingen en providerprovenance blijven intact. Andere repositories zijn niet gewijzigd.

## 3. Productie-integratie

PR #1 is op 10 november 2026 om 03:48:50 UTC gemerged via een normale merge, zonder force-push. Exacte main-/releasebron: `b26d4010af417b2a770bb7a9395b12272500988f`; PR-head: `cd946b90c0676ce328c1ce1972a4449861149049`. De drie actuele PR-/pushgates waren groen vóór merge. PostgreSQL, migraties, duurzame sessies, logoutrevocatie, transcriptopslag, import/verwijdering, foutafhandeling, beveiligingsheaders en de native SDK blijven behouden. AgentProof, AgentOps, Community Studio, EPUB-correcties, publicaties en creditgovernor uit fasen 4–6 blijven eveneens behouden. De Pages-workflow behoudt de gate op een geslaagde Verify-run; gepinde Actions uit de productiebranch blijven behouden.

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

Gepubliceerd: [v2.2.0 Stable — publieke demo/SDK-scope](https://github.com/phlppgdfry/harborvoice-ai/releases/tag/v2.2.0), 10 november 2026 03:53:56 UTC, geen draft en geen prerelease. AgentOps 0.2.0 is byte-identiek uit rc.2 hergebruikt: SHA-256 `483d1f2ce4b46e4e90fb2acee1a6db29940fab7e4506e461f9614ddb42e6d371`. Het pakket installeert in een leeg tijdelijk project met npm offline; CLI help/inspect en declarations slagen. AgentProof is opnieuw verpakt voor exacte mergebuild-/benchmarkprovenance: SHA-256 `df158499e4042f654b7eb5e48167bacf23ec3f8500b1805cdf40c19ac7ad3e67`. Bestaande applicatielogica/media zijn niet opnieuw gegenereerd. Vite levert voortaan publiek `build-info.json` met exacte commit en projectversie; geen secrets of omgevingswaarden. De tag is onafhankelijk via Git gecontroleerd op de exacte mergecommit. Anonieme downloads van pakket en AgentProof geven HTTP 200 en dezelfde lokaal berekende SHA-256 als GitHub Release-digests. [Onafhankelijk releasebewijs](release-verification.json). Release bevat SHA256SUMS en release-provenance.json; definitieve documentatie en closeoutreceipts worden aanvullend meegeleverd. Geen npm-publicatie.

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

**Ja, als onderhoudbaar en professioneel openbaar demo-/ontwikkelaarstoolsproject; nee, als onvoorwaardelijk operationeel geaccepteerd productieplatform.** Bronintegratie en stabiele publicatie zijn afgerond met groene actuele CI op de exacte broncommit en onafhankelijk releasebewijs. De afsluitende metadata-update behoudt die implementatie.

| Domein                 | Status                                   | Bewijs                                     | Resterend werk                              |
| ---------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| Git schoon             | bron schoon na afsluitende commit        | eindstatusreceipt op release               | genegeerde privédata bewust behouden        |
| Branchopruiming        | 9 oude branches, 6 werkbomen verwijderd  | branch-cleanup.json, worktree-cleanup.json | productiebranch bewust behouden             |
| Commits gepusht        | bronmerge op main; metadata afzonderlijk | b26d401; eindstatusreceipt                 | geen ongepushte implementatie               |
| Pull requests verzoend | PR #1 MERGED; geen eigen PR open         | GitHub PR #1                               | upstream PRs blijven open                   |
| Main geïntegreerd      | bevestigd                                | b26d401 bevat beide lijnen                 | geen bronblokkade                           |
| CI groen               | exacte releasebron groen                 | Verify 42751845741; phase3 42751846044     | metadata-CI in release-closeout             |
| AgentProof werkt       | bevestigd                                | browser-verification.json                  | geen blokkerend werk                        |
| AgentOps werkt         | bevestigd                                | 40 tests, package-install.json             | geen blokkerend werk                        |
| Media geldig           | technisch bevestigd                      | 67 decodes, EPUBCheck foutloos             | menselijke kwaliteit apart                  |
| Productieruntime       | gedeeltelijk bevestigd                   | PostgreSQL-status, auth 401                | geldige operatorcode en authenticated check |
| Databaseveiligheid     | geïsoleerd bevestigd                     | postgres.log, pg_dump/restore              | live backup- en recoveryacceptatie          |
| Deployment             | productie ongewijzigd; Pages groen       | deployment-SHA en build-info               | rollout vereist aparte goedkeuring          |
| Documentatie           | actuele README en Nederlands rapport     | nul ontbrekende lokale README-doelen       | historische URLs blijven tijdgebonden       |
| Security               | gerichte controles groen                 | npm audit, tracked/history Gitleaks        | geen pentest/certificering geclaimd         |
| Release                | stabiele demo/toolrelease gepubliceerd   | v2.2.0, HTTP 200, beide hashes gelijk      | productieacceptatie apart                   |
| ElevenLabs-credits     | 20.026 bevestigd; nul nieuwe dispatch    | provider-readonly.json                     | liabilitysettlement/accountcoördinatie      |
| Externe publicaties    | ingediend; geen approval geclaimd        | open upstream PRs en native receipts       | reviewers; native status herlezen           |

## Onafhankelijke closeout

PR #1 is gemerged. Verify [42751845741](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42751845741), Phase 3 [42751846044](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42751846044) en Pages [42752040924](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42752040924) zijn geslaagd voor `b26d4010af417b2a770bb7a9395b12272500988f`. Publiek build-info.json meldde exact deze SHA en versie 2.2.0; de nieuwe publieke build doorliep opnieuw de zes browsercontrolegroepen zonder pageerrors. De beschermde alias bleef onafhankelijk op dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ / 234281a806150a79b12220d182df3fc9e97534b9.

De afsluitende commit bevat uitsluitend deze rapportage en receipts. De release-tag blijft onveranderd op de geteste implementatiemerge; definitieve main-/werkboom-/CI-identiteiten worden na die commit als afzonderlijke release-assets vastgelegd om een circulaire zelfreferentie in Git te vermijden. De hoofdwerkboom wordt op main gezet; de tijdelijke consolidatiebranch wordt veilig verwijderd. De productiebranch bevat geen unieke broncommits meer, maar blijft bewust staan zolang operator-, backup-/recovery- en privacyacceptatie niet zijn afgerond.

Statusonderscheid: **SOURCE COMPLETE** voor de geconsolideerde implementatie; **DEMO COMPLETE** binnen de geautomatiseerde testscope; **PRODUCTION ACCEPTED: NEE**; **PUBLICATION SUBMITTED: JA** voor de vastgelegde inzendingen; **EXTERNALLY APPROVED: NIET VASTGESTELD**. Het project is overdraagbaar zonder deze grenzen te verhullen.

De lokale browserjourneys voegden synthetische demoactiviteiten toe aan de bestaande genegeerde lokale SQLite-workspace. Die werkboom/data zijn niet verwijderd; productie- en archiefdatabases zijn niet door deze browserjourneys gebruikt. Voor een volledig verse lokale demo kan een eigenaar bewust een nieuw SQLITE_PATH kiezen; bestaande data worden niet automatisch gewist.

GitHub main heeft op het auditmoment geen branch protection (API 404 Branch not protected). Geen administratieve instelling is gewijzigd. Een beschermde PR-workflow kan de eigenaar later afzonderlijk activeren na beoordeling van het effect op CI en hersteltoegang.

Privéarchieven herstellen: controleer eerst de SHA-256 uit worktree-cleanup.json en lees de inhoud met `tar -tzf`. Pak uitsluitend uit naar een nieuwe lege privémap, vergelijk de private manifesthashes en selecteer daarna bewust benodigde bestanden. Herstel geen database over productie; volg daarvoor afzonderlijk de deployment-/recoveryprocedure en vraag eigenaarsgoedkeuring.
