# Phase 3 budget report

Identity: `harborvoice-ecosystem-phase3`. Ceiling: 20,000 additional credits. Internal buffer: 3,000. Preservation floor: at least 25,000 unless starting balance was already lower. No purchase or plan change.

Fresh read-only subscription observation on 8 November 2026: character limit 128,715; used 63,393; remaining **65,322**. Extension allowances zero; extension disabled; current overage zero. This is an observation, not a lasting reservation.

Phase 3 credit-consuming calls: **0**. Provider receipts: none. Reservations: none. Account-wide changes after this snapshot cannot be attributed to Phase 3 without receipts. A final read-only snapshot is recorded separately in budget-snapshot.json if available. Read calls do not establish all workspace scopes or the absence of other generation jobs.

Phase 2 public ledger: 21,756 commitments versus 9,162 account-wide observed usage; retain at least 12,594 uncertain exposure. Older execution retains 9,134.04 exposure, with 5,000 older and 3,000 Phase 2 buffers. Conservative other exposure/buffers: 29,728.04 credits. These figures may overlap or change; do not release holds based solely on subtraction. They are deliberately not reconciled away by this session.

Available routine Phase 3 authorization is **0 now** because other session activity and account-wide reservation coordination are unverified. The static budget calculator can reduce available headroom for other commitments, fresh balances and the floor, but it is not a persisted reservation system. Existing Credit Governor remains untouched. Neither local mutex provides account-wide protection unless every spender participates through a reliable common reservation service.

Before any deferred live call: verify current account and overage settings, permissions, all active jobs, both sessions' pending and failed reservations, fresh quota counters, preservation floor, distributed/account-wide coordination and conservative authorization. Reserve before calling. Persist provider request IDs. Pending and failed calls retain liability until provider reconciliation. Stop on counter reset, unexpected cost, permissions failure or unavailable receipts. Never retry automatically.

Final read-only observation, immediately followed by timestamp 8 November 2026 23:22:06 UTC: used 89,939 / 128,715, **38,776 remaining**, extension disabled and current overage zero. Account-wide observed decrease since the Phase 3 starting read: **26,546**. Phase 3 has zero paid operations/reservations/receipts; the decrease remains unattributed to this phase. This demonstrates active or delayed account consumption and is not evidence that Phase 2 spent exactly that amount. With preserved uncertain commitments, nominal remaining balance cannot authorize new spending. See `budget-snapshot.json` for the sanitized observations. No private account IDs, invoices or credentials are published.
