# Overtone — dashboard

Next.js 15 (App Router) + React 19 + TypeScript (strict).

Where the extension is for the live call, the dashboard is for everything after:
the archive of captured calls, the memos drafted from them, usage against plan,
and the pricing ladder.

## Commands

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
npm run typecheck
```

## Notes

**Sessions use `sessionStorage`, not `localStorage`.** A fund's research session should
not survive the tab closing on a shared or borrowed machine.

**The shell renders nothing until the session check resolves**, so a signed-in user never
sees the login screen flash on a hard refresh.

**Security headers are set in `next.config.ts`** for every route: `X-Frame-Options: DENY`,
`nosniff`, and a strict referrer policy. The dashboard renders customer research and must
not be framable.
