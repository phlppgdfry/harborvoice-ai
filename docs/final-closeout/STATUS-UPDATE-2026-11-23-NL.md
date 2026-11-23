# Statusupdate — 23 november 2026

Vervolg op [20 november](STATUS-UPDATE-2026-11-20-NL.md). Alles is vandaag nagekeken in Vercel, Neon, de ElevenLabs-app, GitHub en Gmail.

## Vandaag afgerond

| Onderwerp               | Resultaat                                      | Bewijs                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Productielogin          | **Hersteld**                                   | Inloggen 200, werkruimte 200, gesprekken 200, uitloggen 200, oud cookie daarna 401. Nieuwe deployment `dpl_Aye4R6…`, zelfde code (`234281a`). De deploymentstop (`git.deploymentEnabled=false`) staat nog aan. |
| ElevenReader-boek       | **Opnieuw ingediend**, status _Pending review_ | Auteur overal “Philippe Godfroy”, gratis, wereldwijd, 0 credits                                                                                                                                                |
| Database (Neon)         | **Hersteltest geslaagd**                       | Kopie van 19:30 gemaakt en vergeleken met productie: alleen de ene uitlogregel van 20:02 verschilt. Herstelvenster: 6 uur (gratis plan). De kopie verdwijnt vanzelf op 24 november.                            |
| Agenttests              | **6/6 geslaagd** op de actuele versie          | suite `suite_7701m84wyfwyerha1bjyw6znt50h`, 1.829 credits                                                                                                                                                      |
| Muzieksupport + Explore | **Opvolgmail verstuurd** in hetzelfde ticket   | Gmail, 23 november; geen nieuw ticket                                                                                                                                                                          |
| Showcase-PR #113        | **Update gevraagd** met één beleefde reactie   | Let op: die repo heeft zijn laatste tien externe PR's allemaal gesloten zonder ze te mergen, dus de kans op een merge is klein.                                                                                |

## Credits

Er zijn **18 credits** over. Het tegoed wordt aangevuld op **7 december 2026**. Je account kan niet in het rood gaan: er wordt niets extra aangerekend.

## Wat nog openstaat

| #   | Wat                                                                                            | Wanneer                                  | Wie                      |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------ |
| 1   | Echte spraaktest met microfoon (EN/NL/FR); stappenplan in [owner-actions.md](owner-actions.md) | na 7 december (een gesprek kost credits) | jij                      |
| 2   | Product Launch-template opnieuw proberen (~5.550 credits)                                      | na 7 december, dus niet volgende week    | jij beslist, ik voer uit |
| 3   | Webhooklevering na een gesprek controleren                                                     | samen met punt 1                         | ik, na jouw testgesprek  |
| 4   | Pilot met echte gebruikers en de workshop geven                                                | wanneer je wilt                          | jij                      |
| —   | ElevenReader-beslissing, antwoord van support, Explore, Showcase-PR                            | —                                        | ElevenLabs               |

Al het andere is af en staat in de repo.
