# Official Showcase submission

**PENDING REVIEW — real PR [elevenlabs/showcase #113](https://github.com/elevenlabs/showcase/pull/113), opened 2026-11-09T17:05Z.** Open, non-draft, not merged or featured. No duplicate existing user PR was found before creation; the result was reopened afterward.

- Fork: https://github.com/phlppgdfry/showcase .
- Branch: `add/harborvoice-final-mastery` (the newer prepared branch, not the historical add/harborvoice-ai).
- Commit: `70303407af6656fc178700e4b2c043cfba0cff43`.
- Upstream base audited: `870ee29c311eaccd33425f326e72e14a120c69e2`.
- Exactly three changed files: author YAML, project MDX, project cover. No generated public image, dependencies or unrelated code included.

Current guide, workflow and actual schema read; no repository PR template found. Original project-generated cover/provenance reviewed, MIT source confirmed, isFeatured=false and independent-project disclosures retained. Demo points to unrestricted Pages; protected voice runtime is accurately distinguished. Current live/demo/source/video URLs all return HTTP 200. No new current browser rendering test is claimed because the browser transport failed.

## Validation

- Frontmatter/author/categories/description length and image contract: PASS.
- Upstream image-sync: PASS; 1280×720 original cover visually inspected.
- Actual prerendered `/projects/p/harborvoice-ai` page includes the project, AgentOps and correct links: PASS.
- `pnpm lint`, `pnpm format:check`: PASS.
- Production build with required `NEXT_PUBLIC_APP_URL=http://localhost:4000`: PASS.
- Standalone typecheck: **FAIL, 143 errors**. The identical 143 errors occur on clean upstream with the same dependencies. [Baseline comparison](showcase-baseline.json). Upstream build skips type validation; build pass does not mean typecheck pass. No broad upstream repair was added to this focused content PR.
- Contribution-range Gitleaks and diff whitespace: PASS.

## Actual CI and review

At first post-submission inspection:

| Check                                                                                          | Actual state                           | Action                                                                                                         |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [Validate Project Submission](https://github.com/elevenlabs/showcase/actions/runs/42661215538) | completed / startup_failure; zero jobs | Upstream workflow owner must inspect startup configuration; no job log exists to repair submitted content from |
| [Code check](https://github.com/elevenlabs/showcase/actions/runs/42661213341)                  | completed / action_required            | Maintainer must authorize the external contribution run                                                        |
| Vercel preview                                                                                 | FAILURE; team authorization required   | ElevenLabs team member must authorize; contributor cannot grant team access                                    |
| Human review                                                                                   | No reviews; no requested code changes  | Await maintainer review                                                                                        |

CI has **not passed**. Existing unrelated recent PRs show the same workflow startup/action-required pattern; this does not prove the exact cause. No upstream settings changed or controls bypassed. Recheck after maintainers enable runs; standalone typecheck may still expose the documented baseline errors. [Sanitized PR receipt](showcase-pr.json).

The connected GitHub app could not create an upstream PR (403), so the existing authenticated gh login was used successfully. No new authentication scopes were granted. No merge, maintainer ping or extra issue was created.
