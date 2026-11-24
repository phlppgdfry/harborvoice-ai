"""Read-only ElevenLabs Python SDK example for HarborVoice AI.

Prints the agent's current version and the pass/fail summary of a test
invocation. It only reads (GET requests); it never runs tests, calls or
generations, so it spends no credits.

Usage:
    pip install "elevenlabs>=2.79"
    export ELEVENLABS_API_KEY=...            # never commit this
    python examples/python/agent_test_report.py <test_invocation_id>
"""

from __future__ import annotations

import os
import sys
from collections import Counter

from elevenlabs.client import ElevenLabs

AGENT_ID = os.environ.get("HARBORVOICE_AGENT_ID", "agent_6901m6t6k3tpfnk9n2z3q2h1et7a")


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("Set ELEVENLABS_API_KEY first.", file=sys.stderr)
        return 2

    client = ElevenLabs(api_key=api_key)
    agent = client.conversational_ai.agents.get(AGENT_ID)
    invocation = client.conversational_ai.tests.invocations.get(sys.argv[1])

    runs = invocation.test_runs or []
    status = Counter(str(getattr(r.status, "value", r.status)) for r in runs)
    per_test: dict[str, Counter] = {}
    for run in runs:
        name = (run.metadata.test_name if run.metadata else None) or run.test_id
        per_test.setdefault(name, Counter())[str(getattr(run.status, "value", run.status))] += 1

    print(f"Agent:   {agent.name}  version {getattr(agent, 'version_id', None) or 'n/a'}")
    print(f"Run:     {invocation.id}  repeats {getattr(invocation, 'repeat_count', 1)}")
    print(f"Result:  {status.get('passed', 0)}/{len(runs)} passed, {status.get('failed', 0)} failed")
    for name, counts in sorted(per_test.items()):
        print(f"  {counts.get('passed', 0)}/{sum(counts.values())}  {name}")
    return 0 if status.get("failed", 0) == 0 and status.get("passed", 0) == len(runs) else 1


if __name__ == "__main__":
    raise SystemExit(main())
