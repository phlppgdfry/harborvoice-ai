import { ArrowUpRight, Download } from "lucide-react";
import evaluation from "../docs/agent-evaluation.json";
import enterprise from "../docs/elite/evaluation.json";
import regression from "../docs/elite/remediation.json";
import { exportJson } from "./api";

export default function PortfolioEvidence() {
  return (
    <div className="two-column">
      <section className="panel padded">
        <h2>ElevenLabs Engineering &amp; Creative Automation Portfolio</h2>
        <p>
          Explore voice operations, recorded creative work, reusable tooling and
          developer education. Shipment records are fictional. Historical
          provider evaluations and offline contracts have separate evidence.
        </p>
        <a className="button primary" href="./agentproof/">
          Open AgentProof · offline evidence explorer <ArrowUpRight size={15} />
        </a>
        <p>
          Compare 110 scripted scenarios and inspect twelve multilingual
          contracts for tool arguments and structured facts. No API key,
          microphone or paid generation is used by AgentProof.
        </p>
        <p>
          <a href="https://github.com/phlppgdfry/harborvoice-ai/tree/main/packages/agentops-kit">
            AgentOps Kit source
          </a>{" "}
          ·{" "}
          <a href="https://github.com/phlppgdfry/harborvoice-ai/blob/main/docs/final-mastery/portfolio.md">
            Evidence portfolio
          </a>{" "}
          ·{" "}
          <a href="https://github.com/phlppgdfry/harborvoice-ai/blob/main/docs/final-mastery/publication-status.md">
            Publication status
          </a>
        </p>
      </section>
      <section className="panel padded">
        <h2>Nora Enterprise v2</h2>
        <p>
          The initial suite passed {enterprise.passed} /{" "}
          {enterprise.scenarioCount} provider text simulations. After correcting
          the two observed problems, {regression.passed} / {regression.total}{" "}
          targeted regression cases passed.
        </p>
        <p>
          The final prompt did not receive another complete 52-case run.
          Business tool responses are synthetic fixtures; these are not
          microphone tests or a certification.
        </p>
        <a
          className="button"
          href="https://github.com/phlppgdfry/harborvoice-ai/blob/main/docs/elite/evaluations.md"
          target="_blank"
          rel="noreferrer"
        >
          Inspect the complete evaluation conditions
          <ArrowUpRight size={15} />
        </a>
      </section>
      <section className="panel padded">
        <div className="studio-title">
          <h2>Real agent evaluation</h2>
          <span className="soft-tag">
            {evaluation.passed}/{evaluation.cases.length} passed
          </span>
        </div>
        <p>{evaluation.scope}</p>
        <p>
          Snapshot: {new Date(evaluation.checkedAt).toLocaleString()}. These are
          provider evaluations of a bounded suite, not a certification or a
          prediction of every future conversation.
        </p>
        {evaluation.cases.map((test) => (
          <div className="settings-row" key={test.id}>
            <strong>{test.name}</strong>
            <span>
              {test.status} · {test.language.toUpperCase()}
            </span>
          </div>
        ))}
        <button
          className="button"
          onClick={() =>
            exportJson(evaluation, "harborvoice-real-agent-evaluation.json")
          }
        >
          <Download size={15} />
          Download evaluation evidence
        </button>
      </section>
      <section className="panel padded">
        <h2>ElevenLabs × LinkedIn</h2>
        <p>
          A Connected App can display a partner-validated capability statement.
          LinkedIn allows partners to designate Top Users. A capability
          statement is separate from an exam certificate.
        </p>
        <p>
          Latest account check on 7 November 2026: the qualifying-activity
          message has disappeared and Connect is available. The owner will
          complete the LinkedIn sign-in and connection. No Top User award or
          public ElevenLabs usage threshold has been verified.
        </p>
        <a
          className="button primary"
          href="https://elevenlabs.io/app/settings/connected-apps"
          target="_blank"
          rel="noreferrer"
        >
          Check your Connected Apps
          <ArrowUpRight size={15} />
        </a>
        <p>
          <a
            href="https://www.linkedin.com/help/linkedin/answer/a9616064"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn's official explanation
          </a>
        </p>
        <p>
          <a
            href="https://github.com/phlppgdfry/harborvoice-ai/blob/main/docs/recognition-research.md"
            target="_blank"
            rel="noreferrer"
          >
            Read the recognition research and practical contribution plan
          </a>
        </p>
        <h3>Ambassador and Power User</h3>
        <p>
          ElevenLabs accepts applications for community and creator
          participation. Power User status is invitation-only and awarded at its
          discretion; it is separate from LinkedIn Top User.
        </p>
        <p>
          <a
            href="https://elevenlabs.io/ambassador"
            target="_blank"
            rel="noreferrer"
          >
            Ambassador program
          </a>{" "}
          ·{" "}
          <a
            href="https://elevenlabs.io/ambassador-terms"
            target="_blank"
            rel="noreferrer"
          >
            Official program terms
          </a>
        </p>
        <p>
          This project demonstrates integrations, knowledge retrieval,
          multilingual agent design and evaluation. It does not award a badge,
          submit applications or inflate usage.
        </p>
      </section>
    </div>
  );
}
