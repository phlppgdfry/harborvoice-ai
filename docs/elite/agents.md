# Nora Enterprise v2

Nora remains the existing agent, with fictional shipment records, two client tools and four indexed knowledge documents. The Enterprise change was developed on a separate native branch, with a descriptive dynamic variable, explicit source attribution, untrusted caller/tool-text boundaries, reference consistency checks, multilingual refusals and a strict rule against escalating unknown shipments.

The first 52-case suite covered 13 behaviors in English, Dutch, French and German. **50/52 passed**. One unknown-reference scenario accepted an escalation and one French privacy refusal started in English. Review also found that the escalation fixture incorrectly returned an HV-2048 ticket even when a different reference was requested. The prompt was corrected and the missing-reference fixture was brought into agreement with the real business rule. A targeted ten-case regression passed **10/10**.

The final prompt did not receive another complete 52-case run; the initial full-suite and targeted results remain separate. No statistical A/B improvement, real production success rate or speech-latency improvement is claimed. The no-conflict branch merge preserved the main agent's existing identity, voices, knowledge and tools, and retained the source branch.

See [versioned cases](../../agent/elite-scenarios.ts), [managed settings](../../agent/enterprise-settings.ts), [first suite](evaluation.json), [correction evidence](remediation.json) and [resource inventory](../../config/resources.json). The visitor agent remains a separate read-only bounded trial and cannot execute operator escalation actions.
