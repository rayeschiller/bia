# Bia (بیا)

Mobile-first web app for learning conversational Farsi (Next.js App Router, TypeScript, Tailwind v4).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

- Shared content/progress contract: `src/lib/types.ts` (do not edit without agreement)
- Design tokens and components: see [DESIGN.md](./DESIGN.md)
- Mock data for screen shells: `src/lib/mock.ts` (search for `TODO(wiring)`)

Note: `next/font/google` downloads Vazirmatn and Nunito at build time, so the build needs access to fonts.googleapis.com.
