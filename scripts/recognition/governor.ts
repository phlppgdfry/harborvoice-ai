import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { CreditGovernor } from "../../lib/credit-governor.js";
export const governor = new CreditGovernor(
  "var/recognition/credit-ledger.json",
  async () => {
    const s = await client().user.subscription.get();
    return {
      used: s.characterCount,
      limit: s.characterLimit,
      checkedAt: new Date().toISOString(),
    };
  },
  {
    minimumBillingBuffer: 3000,
    minimumBalanceFloor: 0,
    maximumAdditional: 25000,
  },
);
