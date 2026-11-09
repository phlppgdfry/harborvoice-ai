# Operational threat model

Assets: API credentials, shared credits, agent configuration, private transcripts and integrity of published evidence. Trust boundaries: local input files → toolkit; SDK client → provider; sanitized generated JSON → static browser; source branch → future deployment.

| Threat                                          | Present mitigation                                                         | Remaining condition                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Browser credential exposure / public paid calls | Static app has no key inputs, SDK, provider routes or generation           | Future live backend needs separate authentication, authorization, quotas and request-size limits       |
| Concurrent spend                                | No paid execution; calculator fails closed without fresh coordination      | Distributed reservations and atomic provider-dispatch fencing not implemented                          |
| Secret leakage in config/export                 | Recursive key redaction, query/userinfo removal, private error suppression | Secrets/PII in arbitrary prose need human review; heuristic scan is not proof                          |
| Malicious transcript markup                     | HTML escaped in reporters/UI; Markdown fences neutralized                  | Never enable raw Markdown/HTML rendering without a sanitizer                                           |
| Misleading results                              | Explicit evidence types, source commit, conditions, historical separation  | Corpus and category-conditioned policies are not model validation                                      |
| Unauthorized tool side effects                  | Synthetic fixture transport, no actual external business tools             | Live mock tools must not access production data                                                        |
| Dependency / supply chain                       | Existing locked tooling, runtime package uses Node built-ins               | Audit installed dependencies; upstream changes can introduce risk                                      |
| Local file abuse                                | CLI accepts local JSON, 2 MB bounded reads                                 | Not a hardened public file parser; nested adversarial JSON and arbitrary file access are outside scope |

Retention: committed synthetic fixtures stay in Git history until explicitly removed; deletion from Git working tree does not erase clones/history. No private audio added. Browser feedback stays in memory and optional local download; no collection endpoint. Genuine participant records, if later collected, should remain private, minimal and removable by the organizer on request; set a 30-day raw-note retention policy before recruitment. No public pilot or analytics enabled.

Future live API gate: server-only least-privilege SDK, authenticated project membership, validated test IDs/allowlisted tools, bounded bodies/timeouts, no automatic retries, per-user and account-wide caps, safe response errors, structured redacted logs and deletion access. Review hosting CSP/security headers at integration; no claim these are configured on the existing production deployment by this branch.
