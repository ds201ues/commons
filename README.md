# Commons — ChatGPT / WebMCP

> **OpenAI WebMCP Challenge.** Cut: [`SCOPE.md`](SCOPE.md) · Stack: [`DECISIONS.md`](DECISIONS.md) · Pivot: [`PIVOT-LOCK.md`](PIVOT-LOCK.md) · Full product: [`../commons/PRODUCT.md`](../commons/PRODUCT.md)  
> Deadline **3 Sep 2026, 1:00pm PT**.

A **link is a workspace**. Create a room, share one URL. **Owner** and **contributor** agents get different WebMCP tools. **Only a human can Decide.** Closed calls land on the **Decisions Wall**.

**Live:** [https://redress-desk.vercel.app](https://redress-desk.vercel.app) · **Licence:** MIT

---

## Product surface (shipped)

- Create room → unguessable `/r/<id>` + owner cookie
- Document (markdown textarea) + open decision packets + Decisions Wall + patch log
- Owner tools: `get_workspace`, `edit_doc`, `open_packet`, `propose_option`, `attach_evidence`
- Contributor tools: `get_workspace`, `comment`, `challenge`, `request_evidence`
- **Never** register `decide` — human button + nonce only
- Demo override: `?as=owner` / `?as=contributor` (legacy `/maker` `/decider` redirect here)
- Fixture: `/r/checkout-friday?as=owner`

---

## Run locally

```bash
cp .env.example .env.local   # Upstash required on Vercel; optional locally
npm install
npm test
npm run dev
```

- Home: http://localhost:3000 — **Create a room**
- Fixture owner: http://localhost:3000/r/checkout-friday?as=owner
- Fixture contributor: http://localhost:3000/r/checkout-friday?as=contributor

Production persist is **Upstash only**. Without `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, Vercel returns `persist_unavailable` (503) on writes.

---

## HTTP ops (same kernel as WebMCP)

```bash
curl -s https://redress-desk.vercel.app/api/rooms/checkout-friday

curl -s -X POST https://redress-desk.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"seat":"owner","as":"owner","op":"propose_option","input":{"packetId":"pkt-checkout","label":"Hold for Monday"}}'

# Decide without human token — must fail
curl -s -X POST https://redress-desk.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"seat":"contributor","as":"contributor","op":"decide","input":{"packetId":"pkt-checkout","optionId":"opt-ship"}}'
```

---

## WebMCP testing notes

- Personal ChatGPT + **Sol/Terra** + in-app browser (Work mode). **Enterprise** and **Luna** → `Capability is not available: webmcp`.
- Chrome backup: flag `chrome://flags/#enable-webmcp-testing` + [Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd).

---

## Related

- Full product idea: [`../commons/`](../commons/)
- micro1 (separate): [`../redress-eval/`](../redress-eval/) — **do not copy**
