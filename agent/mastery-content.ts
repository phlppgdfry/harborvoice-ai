export type MasteryCategory =
  "Architecture" | "Agents" | "Creative" | "Operations";
export type MasteryModule = {
  id: string;
  title: string;
  category: MasteryCategory;
  objective: string;
  explanation: string[];
  example: string;
  process: string[];
  code: string;
  codeLabel: string;
  exercise: string;
  criteria: string[];
  references: { label: string; url: string }[];
  limitation: string;
  evidence: string;
  audio?: string;
  transcript?: string;
};
const repo = "https://github.com/phlppgdfry/harborvoice-ai/blob/main/";
const source = (path: string) => ({
  label: "Project source: " + path,
  url: repo + path,
});
const agents = {
  label: "Official ElevenAgents documentation",
  url: "https://elevenlabs.io/docs/eleven-agents/overview",
};
const overview = {
  label: "Official ElevenLabs documentation",
  url: "https://elevenlabs.io/docs/overview",
};
export const masteryModules: MasteryModule[] = [
  {
    id: "architecture",
    title: "Voice AI architecture",
    category: "Architecture",
    objective:
      "Trace a spoken request through the trust boundaries of a voice system.",
    explanation: [
      "A voice interface contains more than a language model. The browser captures speech, a conversation service interprets it, a tool retrieves facts, and speech synthesis returns the response. Each boundary has its own authentication, timeout and failure mode. A fluent response does not prove that a business operation succeeded.",
      "HarborVoice separates the public synthetic-data workbench, the authenticated operator gateway and the constrained visitor agent. The provider runs the conversation; the application owns its business rules. Production design starts by deciding which component is allowed to know or change each fact.",
    ],
    example:
      "A caller asks where HV-2048 is. The shipment lookup supplies the recorded customs hold. Nora can explain it, but neither the model nor the visitor browser can remove that hold.",
    process: [
      "Caller audio",
      "Authenticated session",
      "Nora",
      "Validated lookup",
      "Recorded result",
      "Spoken response",
    ],
    codeLabel: "Boundary contract, expressed as project pseudocode",
    code: "question → exact shipment reference\nlookup(reference) → recorded result | not found | unavailable\nresponse → explain the result, never infer a release\nconsequential action → authorised human review",
    exercise:
      "Draw the browser, gateway, provider and business-data boundaries. Put every credential and mutable record in exactly one owner. Trace an unavailable lookup through the complete journey.",
    criteria: [
      "The API key never enters the browser.",
      "Every business fact has an identified source.",
      "An unavailable tool produces an honest limitation, not a guessed status.",
    ],
    references: [
      agents,
      source("server/gateway.ts"),
      source("src/VoiceAgent.tsx"),
    ],
    limitation:
      "The terminal and TMS records are fictional. The architecture is a portfolio case study, not a production terminal integration.",
    evidence: "docs/visitor-voice-verification.json",
    audio: "academy/en-grounding.mp3",
    transcript: "academy/en-grounding.txt",
  },
  {
    id: "cli",
    title: "A reproducible CLI workflow",
    category: "Operations",
    objective:
      "Use explicit, reviewable operations instead of treating a CLI login as proof of deployment.",
    explanation: [
      "An installed command, a valid login and a successful operation are three different checks. Use the installed CLI help and current official documentation before unfamiliar commands. Keep account choice explicit, inspect exit codes and store safe resource identifiers rather than authentication material.",
      "HarborVoice wraps meaningful tasks in npm scripts. Read-only verification is separate from provisioning and paid evaluation. For agents-as-code, first pull into an isolated directory, compare the remote configuration, and review a dry run before publishing. Do not overwrite a remote edit simply because a local file exists.",
    ],
    example:
      "The project can verify a configured agent and indexed sources without starting a call. A failed login must stop provisioning rather than produce a false success receipt.",
    process: [
      "Inspect help",
      "Verify account",
      "Read remote",
      "Review diff",
      "Apply approved change",
      "Read back",
    ],
    codeLabel: "Existing project commands; inspect each script before running",
    code: "npm run verify:live      # read-only account/agent check\nnpm run sync:dry-run     # inspect managed-source drift first\nnpm run elite:evaluate -- report # poll recorded results; no new suite",
    exercise:
      "Read verify-live.ts and sync-agent.ts. Classify their effects, identify the rollback information you would preserve, and write the exact success evidence expected after a settings change.",
    criteria: [
      "Read-only and mutating commands are distinguished.",
      "A dry run is reviewed before publishing configuration.",
      "No token or signed URL enters logs or Git.",
    ],
    references: [
      overview,
      source("scripts/verify-live.ts"),
      source("scripts/sync-agent.ts"),
    ],
    limitation:
      "CLI commands and authentication depend on the installed version and host. This lesson does not run them or grant account access.",
    evidence: "docs/live-verification.json",
  },
  {
    id: "mcp",
    title: "MCP with explicit permissions",
    category: "Operations",
    objective:
      "Choose MCP for supported native workflows while preserving ownership and cost controls.",
    explanation: [
      "MCP exposes tools to an AI client; it does not make every account capability available or automatically authorised. The hosted connector can create native creative resources, while reproducible application integrations use the supported SDK or API. OAuth sessions remain separate from the project API key.",
      "Inspect the tool schema, read the relevant resource, reserve the operation's budget, and call a generation once. Poll its returned run identifier rather than generating again because a response is slow. Keep temporary asset URLs private and publish only stable references or project-owned copies.",
    ],
    example:
      "The Academy canvas contains generated covers and video plus uploaded finished courses. A canvas node is a native resource; a local explanatory diagram is not a native execution.",
    process: [
      "Read tool schema",
      "Check permission",
      "Reserve budget",
      "Run once",
      "Poll run",
      "Verify native asset",
    ],
    codeLabel: "Orchestration contract; not an executable MCP client",
    code: "read(flowId)\nreserve(operationId, estimatedCost)\nstartOnce(operationId) → runId\npoll(runId) → completed | failed | pending\nrecord(stableResourceReference, verifiedOutput)",
    exercise:
      "Find the Academy flow's provenance report. Identify which fields can be public, which links would expire, and how you would resume a generation after a network interruption.",
    criteria: [
      "OAuth credentials are never copied into project settings.",
      "Pending generation is polled instead of blindly retried.",
      "A native resource is verified separately from a local file.",
    ],
    references: [overview, source("docs/academy-creative-evidence.json")],
    limitation:
      "Available tools and permissions depend on the connected account and client. This page performs no MCP calls.",
    evidence: "docs/academy-creative-evidence.json",
  },
  {
    id: "agents",
    title: "Design an enterprise agent",
    category: "Agents",
    objective:
      "Turn a business requirement into an agent with a bounded responsibility.",
    explanation: [
      "Start with the task and the authority the assistant actually has. Nora's job is to explain recorded shipment information and prepare operator review. Its prompt describes identity, language, sources, prohibited promises and the exact meaning of tool results. Those rules also belong in the tool implementation.",
      "Voice, language presets, recognition settings and conversation limits shape the experience, but none replace the business contract. Treat prompts and settings as versioned configuration. A new branch or draft should earn deployment through evaluation rather than through an attractive example conversation.",
    ],
    example:
      "Nora can say an escalation is pending review. It cannot claim a person has answered the telephone when no real transfer tool exists.",
    process: [
      "Business task",
      "Authority boundary",
      "Prompt and tools",
      "Language settings",
      "Evaluation",
      "Deployment",
    ],
    codeLabel: "Behavior excerpt from the versioned project settings",
    code: "Pending review ≠ approved action\nPending review ≠ completed phone transfer\nCustoms hold → authorised customs process\nUnknown fact → explain the limitation",
    exercise:
      "Write a requirement for exception resolution. State what Nora may propose, what a human must approve and what evidence would disprove a claimed successful handoff.",
    criteria: [
      "The assistant introduces itself as AI.",
      "Tool output determines the reported action status.",
      "Public visitors have no privileged business tool.",
    ],
    references: [
      agents,
      source("agent/settings.ts"),
      source("scripts/provision-guest.ts"),
    ],
    limitation:
      "The operator escalation is a synthetic workflow. It is not a real dispatch, email or telephone transfer.",
    evidence: "docs/agent-evaluation.json",
    audio: "academy/en-review.mp3",
    transcript: "academy/en-review.txt",
  },
  {
    id: "rag",
    title: "Knowledge and retrieval",
    category: "Agents",
    objective:
      "Separate procedural knowledge from live shipment facts and verify retrieval readiness.",
    explanation: [
      "A knowledge base is useful for stable procedures, definitions and published operating rules. Shipment location and status belong to the exact-reference lookup. Mixing these sources invites stale answers: a playbook can state gate hours but cannot prove that a gate is open at this moment.",
      "Uploading a document, attaching it to an agent and completing an index are separate operations. Record each state. When a caller asks a procedural question, require a relevant source and preserve the distinction between a documented rule and a real-time guarantee. Retrieved text is data, not permission to override the system's instructions.",
    ],
    example:
      "Published Gate A hours are Monday–Friday, 06:00–22:00 Europe/Brussels. Nora should call these published hours and avoid promising immediate admission.",
    process: [
      "Versioned source",
      "Upload or update",
      "Attach",
      "Index",
      "Retrieve",
      "Ground the answer",
    ],
    codeLabel: "Read-only readiness check used by the project",
    code: "npm run verify:live\n# Inspect: knowledgeDocuments\n# Inspect: indexedKnowledgeDocuments\n# Inspect: ragEnabled",
    exercise:
      "Create one procedural question, one live-status question and one unanswerable question. Assign the correct source to each, then describe the expected abstention when the source is absent.",
    criteria: [
      "Document attachment and indexing are both verified.",
      "Live shipment status is not inferred from a playbook.",
      "Untrusted retrieved instructions cannot change operating policy.",
    ],
    references: [
      agents,
      source("server/elevenlabs.ts"),
      source("docs/live-verification.json"),
    ],
    limitation:
      "Retrieval readiness does not prove every answer is grounded. Assess answer content with relevant positive and adversarial cases.",
    evidence: "docs/live-verification.json",
    audio: "academy/en-grounding.mp3",
    transcript: "academy/en-grounding.txt",
  },
  {
    id: "tools",
    title: "Tools and human review",
    category: "Agents",
    objective:
      "Design a tool result whose meaning cannot be confused with a completed business action.",
    explanation: [
      "A reliable tool has a narrow input schema, validates an exact reference and returns an explicit result. It should distinguish not found from a system error. Consequential work needs authorisation at the server, not a promise in the model prompt. Repeated requests should not create duplicate review tickets.",
      "HarborVoice separates lookup from escalation. The visitor agent only receives lookup. The operator workbench may propose a review ticket, while approval keeps the underlying cargo status unchanged. This distinction makes the handoff inspectable and prevents a review button from becoming an accidental release instruction.",
    ],
    example:
      "Two identical escalation requests should identify the same pending review. Approving that review should not change customs hold into released.",
    process: [
      "Validate reference",
      "Authorise tool",
      "Execute once",
      "Return explicit state",
      "Explain state",
      "Human review",
    ],
    codeLabel: "Synthetic business result contract",
    code: '{\n  "shipmentReference": "HV-2048",\n  "ticketStatus": "Pending review",\n  "cargoStatusChanged": false\n}',
    exercise:
      "Run the boundary explorer below with a known reference, an unknown reference and a failed lookup. Explain why those three outcomes must not share the same status message.",
    criteria: [
      "Invalid input cannot mutate a record.",
      "Duplicate proposals are idempotent.",
      "Operator approval does not silently alter shipment status.",
    ],
    references: [agents, source("src/domain.ts"), source("tests/api.test.ts")],
    limitation:
      "The explorer is deterministic business logic for teaching. It does not call ElevenLabs or a real TMS.",
    evidence: "docs/browser-verification.json",
    audio: "academy/review-dialogue.mp3",
    transcript: "academy/review-dialogue.json",
  },
  {
    id: "testing",
    title: "Evaluate behavior, not fluency",
    category: "Agents",
    objective:
      "Build scenarios that can expose hallucination, tool errors and unsafe success claims.",
    explanation: [
      "A test should specify a caller situation, a controlled business-tool response and observable criteria. Include success, unknown reference, unavailable tools, pressure to bypass policy and multilingual requests. A fluent reply can still be wrong if it invents an ETA or claims a transfer happened.",
      "Keep local deterministic tests, provider text simulations and real voice sessions separate. They exercise different layers. Measure latency under stated conditions and report the sample size. Passing a bounded suite is evidence about those cases, not proof that every future conversation will succeed.",
    ],
    example:
      "A French caller asks for HV-9999 while the tool returns not found. Success requires French abstention without an invented shipment, ETA or location.",
    process: [
      "Version scenario",
      "Control tool result",
      "Execute selected suite",
      "Inspect criteria",
      "Record failures",
      "Review change",
    ],
    codeLabel: "Existing checks have different scopes and costs",
    code: "npm test                 # local contracts and business rules\nnpm run test:browser     # browser interactions with fixtures\nnpm run elite:evaluate -- report # poll recorded results; no new suite",
    exercise:
      "Write four cases for one requirement: expected behavior, missing data, tool failure and an adversarial caller. State one concrete failure condition for each before running anything.",
    criteria: [
      "Criteria can fail for a specific observable reason.",
      "Synthetic tool fixtures are disclosed.",
      "Audio, text simulation and production outcomes are not conflated.",
    ],
    references: [
      agents,
      source("agent/scenarios.ts"),
      source("docs/agent-evaluation.json"),
    ],
    limitation:
      "Automated model judgments need review. Historical receipts do not establish the state of a newly changed configuration.",
    evidence: "docs/agent-evaluation.json",
    audio: "academy/en-evaluation.mp3",
    transcript: "academy/en-evaluation.txt",
  },
  {
    id: "multilingual",
    title: "Consistent multilingual behavior",
    category: "Agents",
    objective:
      "Evaluate language behavior without mistaking translation for equivalent task performance.",
    explanation: [
      "Language support includes recognition, response language, domain pronunciation and the meaning of business rules. A translated greeting alone does not demonstrate a multilingual service. Ask equivalent questions in English, Dutch, French and German and verify the same source, restrictions and uncertainty are preserved.",
      "Localisation also changes timing and sentence length. Listen for shipment references, acronyms and timezones. A transcript can help spot an expanded abbreviation, but it is another model's output rather than an independent pronunciation score. Use native-speaker review before making strong quality claims.",
    ],
    example:
      "The Dutch and French versions must both preserve that an ETA is an estimate and a customs hold requires an authorised process.",
    process: [
      "Shared requirement",
      "Language-specific prompt",
      "Same tool fixture",
      "Listen and transcribe",
      "Compare meaning",
      "Review limitations",
    ],
    codeLabel: "Configured project language contract",
    code: 'supportedLanguages = ["en", "nl", "fr", "de"]\nrequiredMeaning = ["recorded status", "estimated ETA", "human authority"]\n# Compare semantics, not only vocabulary overlap.',
    exercise:
      "Compare the Dutch Academy source with the French equivalent. Identify the sentence that protects the ETA from becoming a guarantee, then test the same requirement in a caller scenario.",
    criteria: [
      "The requested language is maintained.",
      "Restrictions have the same meaning in every version.",
      "Pronunciation and translation limitations are disclosed.",
    ],
    references: [
      agents,
      source("agent/academy-content.ts"),
      source("docs/academy-pronunciation-evidence.json"),
    ],
    limitation:
      "Four generated course languages do not constitute native-speaker validation or universal language coverage.",
    evidence: "docs/academy-audio-evidence.json",
    audio: "academy/nl-grounding.mp3",
    transcript: "academy/nl-grounding.txt",
  },
  {
    id: "speech",
    title: "Speech engineering and terminology",
    category: "Creative",
    objective:
      "Choose voice and pronunciation behavior through controlled comparisons.",
    explanation: [
      "A voice model, voice identity and pronunciation dictionary are distinct choices. Compare a fixed script before changing several settings at once. Preserve source text, model, voice, language and output format so another developer can understand the result. More expressive delivery does not automatically improve a short operational answer.",
      "The Academy terminology experiment generated the same fictional script with and without aliases. Scribe observed ETA and TMS expanded to their full phrases. That is useful evidence of the transformation, while subjective naturalness and exact acoustic correctness still require listening and appropriate review.",
    ],
    example:
      "TMS becomes transport management system, making a technical phrase easier to understand without changing the underlying shipment claim.",
    process: [
      "Fixed source script",
      "Baseline voice",
      "Apply aliases",
      "Generate once",
      "Listen and transcribe",
      "Record provenance",
    ],
    codeLabel: "Alias concept used in the project dictionary",
    code: "ETA → estimated time of arrival\nTMS → transport management system\nHV-2048 → H V two zero four eight\n# Confirm model support and listen to the actual output.",
    exercise:
      "Listen to the terminology sample, then its original version in Academy. Propose one additional alias, explain its intended audience and design a sentence that could reveal an unwanted replacement.",
    criteria: [
      "Only the intended variable changes in the comparison.",
      "Original audio and source text remain available.",
      "Transcription output is not presented as an independent quality score.",
    ],
    references: [
      overview,
      source("scripts/academy-pronunciation.ts"),
      source("docs/academy-pronunciation-evidence.json"),
    ],
    limitation:
      "Pronunciation support varies by model and language. A successful short sample does not guarantee all contexts.",
    evidence: "docs/academy-pronunciation-evidence.json",
    audio: "academy/pronunciation-aliases.mp3",
  },
  {
    id: "flows",
    title: "Reusable ElevenCreative Flows",
    category: "Creative",
    objective:
      "Describe a reusable pipeline with explicit inputs, outputs and restart boundaries.",
    explanation: [
      "A useful flow is a dependency graph, not merely a folder of generated media. Each node should have an input contract, model settings, output type and verification rule. When an output feeds another node, preserve the exact selected asset and keep the native resource reference.",
      "Separate creation from execution. Reserve before running nodes, keep accepted outputs, and regenerate only the changed dependency. Native Flows may support capabilities that are not available through a project's API key. Document that interface boundary instead of portraying local composition as native execution.",
    ],
    example:
      "A learning-content pipeline accepts a reviewed lesson, produces narration, retains its transcript and publishes quiz metadata. The existing twelve lessons are reusable inputs, not a reason to generate them again.",
    process: [
      "Reviewed input",
      "Narration node",
      "Transcript",
      "Learning media",
      "Quiz metadata",
      "Verified export",
    ],
    codeLabel: "Reusable flow input contract",
    code: '{\n  "lessonId": "grounding",\n  "language": "en",\n  "scriptVersion": "reviewed-source",\n  "output": ["audio", "transcript", "quiz"]\n}',
    exercise:
      "Draw the pipeline above with one failed narration node. Describe which outputs can be reused, which must wait and what identifier prevents an accidental paid rerun.",
    criteria: [
      "Every node has an input and output contract.",
      "Stable resource references are recorded.",
      "Local explanations are distinguished from native executed nodes.",
    ],
    references: [
      overview,
      source("docs/academy-creative-evidence.json"),
      source("scripts/build-academy.ts"),
    ],
    limitation:
      "A diagram on this page is educational. Native execution must be proven by the corresponding flow resource and generation receipt.",
    evidence: "docs/academy-creative-evidence.json",
  },
  {
    id: "studio",
    title: "Studio production and revision",
    category: "Creative",
    objective:
      "Preserve an editable native project and verify its exported media separately.",
    explanation: [
      "A production workflow moves from approved script to voice assignment, pronunciation, chapter or timeline structure, review and export. Keep the editable project so a correction can be made at the right source. An export job being accepted does not prove that the file is ready or decodable.",
      "The Academy's English EPUB was imported into the normal Audiobooks editor with Sarah narration and pronunciation aliases. Its finished native export is distinct from MP3 lessons compiled into course bundles locally. The Studio API account restriction does not mean that the normal editor was simulated.",
    ],
    example:
      "The native English audiobook has three chapters. A name correction belongs in the editable project; changing only a public MP3 would lose the source of truth.",
    process: [
      "Reviewed EPUB",
      "Native import",
      "Voice and pronunciation",
      "Edit and review",
      "Render",
      "Decode export",
    ],
    codeLabel: "Existing production artifacts",
    code: "public/academy/harborvoice-training-en.epub\npublic/academy/native-audiobook-en.mp3\ndocs/academy-native-evidence.json\n# Local course-*.m4b bundles are separate exports.",
    exercise:
      "Inspect the native export evidence, play the audiobook and identify its chapter structure. Write a revision plan that preserves the original project and records the replacement export's hash.",
    criteria: [
      "Native editing and local packaging are labelled separately.",
      "Export duration and integrity are checked.",
      "Revision provenance identifies the source and resulting asset.",
    ],
    references: [
      overview,
      source("docs/academy-native-evidence.json"),
      source("scripts/package-academy.ts"),
    ],
    limitation:
      "Studio API availability depends on account access. This lesson does not claim every Studio timeline or Agent capability was exercised.",
    evidence: "docs/academy-native-evidence.json",
    audio: "academy/native-audiobook-en.mp3",
  },
  {
    id: "automation",
    title: "Creative automation that can resume",
    category: "Architecture",
    objective:
      "Build a production job that survives interruption without duplicating billable work.",
    explanation: [
      "Automation needs durable state. Record an operation before sending it, store the provider's generation or project identifier as soon as it exists, and distinguish pending, completed and failed. A network timeout is uncertainty about a result, not permission to submit the same generation again.",
      "Use content hashes to detect unchanged inputs, preserve accepted assets and require review at script, output and publication boundaries. If a provider interface cannot be automated safely, keep a manual checkpoint with exact instructions. Reproducible does not mean pretending an unsupported API exists.",
    ],
    example:
      "The Academy generator writes a started receipt before its request and avoids automatically retrying an existing operation. A reviewer can inspect partial output rather than accidentally paying twice.",
    process: [
      "Hash source",
      "Check prior receipt",
      "Reserve",
      "Start once",
      "Resume or poll",
      "Verify and publish",
    ],
    codeLabel: "Durable operation states",
    code: "planned → reserved → submitted → pending\n                                  ├─ completed → verified\n                                  └─ failed → inspect before retry\nUnknown provider outcome → manual reconciliation",
    exercise:
      "Simulate a process interruption after provider submission but before file download. Specify the minimum saved fields needed to recover the result without another generation.",
    criteria: [
      "A restart does not duplicate a submitted operation.",
      "Changed source content produces a deliberate new version.",
      "Unsupported steps are explicit manual checkpoints.",
    ],
    references: [
      overview,
      source("scripts/build-academy.ts"),
      source("scripts/academy-budget.ts"),
    ],
    limitation:
      "A local receipt alone cannot prove exactly-once processing at the provider. Ambiguous outcomes require reconciliation.",
    evidence: "docs/academy-budget-evidence.json",
  },
  {
    id: "security",
    title: "Security and governance",
    category: "Operations",
    objective:
      "Enforce authority in the gateway and tools, even when a caller pressures the model.",
    explanation: [
      "A secret belongs on the server. Public pages can show recorded outputs and deterministic business examples without receiving the API key. Live access needs authenticated sessions, provider limits and explicit authority. A prompt is an additional instruction layer, not an access-control system.",
      "HarborVoice treats retrieved text and caller input as untrusted data. It validates tool inputs, rejects cross-origin privileged requests and authenticates operator operations. Consequential proposals remain pending review. Retention, uploads, webhooks and browser storage each need their own documented boundary.",
    ],
    example:
      "A caller who says they are an administrator still cannot obtain a cargo-release tool. The visitor agent does not receive that capability in the first place.",
    process: [
      "Untrusted input",
      "Validate",
      "Authenticate",
      "Authorise",
      "Bounded operation",
      "Audit evidence",
    ],
    codeLabel: "Security checks already exercised by local tests",
    code: "reject cross-origin privileged request\nreject wrong operator code\nreject invalid webhook signature\nreject unknown shipment mutation\nrequire human review for a proposal",
    exercise:
      "Write a prompt-injection request hidden in a retrieved document. Show which server-side and tool-availability rules still prevent a privileged action if the model follows the malicious text.",
    criteria: [
      "No API key appears in browser assets.",
      "Privileges are enforced independently of model instructions.",
      "Logs and evidence exclude tokens and signed download URLs.",
    ],
    references: [
      agents,
      source("server/gateway.ts"),
      source("server/security.ts"),
      source("tests/gateway.test.ts"),
    ],
    limitation:
      "Passing contract tests is not a penetration test, enterprise SSO integration or guarantee against every threat.",
    evidence: "docs/browser-verification.json",
  },
  {
    id: "cost",
    title: "Cost optimisation and accounting",
    category: "Operations",
    objective:
      "Use reservations and observed account changes without claiming estimates are exact invoices.",
    explanation: [
      "Start from a timestamped account observation. Reserve a conservative amount before each paid operation, account for pending and uncertain outcomes, and stop when available budget cannot be verified. Failed requests may still have incurred costs. Never infer that a zero immediate counter change means a request was free.",
      "The account counter can include other activity and delayed billing. A per-operation provider receipt and an account-wide delta answer different questions. Reusing a reviewed narration or an unchanged visual often offers more value than another generation. Cost optimisation should preserve task quality, not simply choose the cheapest model.",
    ],
    example:
      "The first Academy expansion reserved conservative allowances and published the account delta with explicit billing limitations. The allowance was a ceiling rather than a spending target.",
    process: [
      "Observe balance",
      "Reserve",
      "Submit",
      "Track pending",
      "Record provider usage",
      "Reconcile account",
    ],
    codeLabel: "Budget decision contract",
    code: "effectiveExposure = observedUsage + unresolvedReservations\nif balanceIsStale or effectiveExposure + estimate > limit:\n    stopBeforeGeneration()\n# Provider usage and estimates remain separate fields.",
    exercise:
      "A generation times out and the balance has not changed. Decide whether its reservation can be released, and state what provider evidence would be needed before a retry.",
    criteria: [
      "Pending and failed-uncertain costs stay reserved.",
      "Account delta and itemized usage are not conflated.",
      "A hard limit stops work before an unaffordable request.",
    ],
    references: [
      overview,
      source("scripts/academy-budget.ts"),
      source("docs/academy-budget-evidence.json"),
    ],
    limitation:
      "Account-wide deltas are affected by concurrent use and billing delay. This educational calculation does not itself meter or charge the account.",
    evidence: "docs/academy-budget-evidence.json",
  },
  {
    id: "deployment",
    title: "Deployment and monitoring",
    category: "Operations",
    objective:
      "Verify the public application and native agent after a tested release.",
    explanation: [
      "A successful local build proves that code compiles; it does not prove that production has the expected environment, routes, assets or native agent version. Gate a release on tests, read its deployment status and exercise the public journey in a real browser. Verify both recorded media and authenticated API boundaries.",
      "The hosted workbench stores its synthetic workspace in the visitor's browser, while the local server supports SQLite. Those are different persistence models. A resource registry and drift report help detect a remote edit without overwriting it. Monitoring should remain read-only by default and should never generate paid media on every commit.",
    ],
    example:
      "The status endpoint can report configured API and agent readiness without exposing a secret. A public Academy check then proves files decode and practice progress survives a reload.",
    process: [
      "Review commit",
      "Run checks",
      "Build",
      "Deploy",
      "Read status",
      "Verify public journey",
    ],
    codeLabel: "Existing release verification commands",
    code: "npm run check\nnpm run format:check\nnpm run test:browser\nnpm run test:academy\n# Separately verify the deployed URL and native resource state.",
    exercise:
      "Create a release checklist with code, hosted API, browser and native-resource checks. Add one deliberate environment-variable failure and describe how the public interface should expose it clearly.",
    criteria: [
      "Production commit and CI result are identified.",
      "Desktop and mobile journeys are checked after deployment.",
      "Configuration drift is reported before any overwrite.",
    ],
    references: [
      overview,
      source(".github/workflows/verify.yml"),
      source("docs/hosting.md"),
      source("scripts/verify-academy.ts"),
    ],
    limitation:
      "Browser QA covers selected journeys and viewports. It is not load testing, continuous uptime evidence or a service-level agreement.",
    evidence: "docs/academy-browser-verification.json",
  },
];
