import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { CreditGovernor } from "../../lib/credit-governor.js";
export const governor = new CreditGovernor(
  process.env.ELEVENLABS_GOVERNOR_PATH || "var/elite/credit-ledger.json",
  async () => {
    const s = await client().user.subscription.get();
    return {
      used: s.characterCount,
      limit: s.characterLimit,
      checkedAt: new Date().toISOString(),
    };
  },
);
