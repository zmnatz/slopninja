# Fruit Ninja

Slice the fruit, avoid the bombs. One or two players on one iPad.

## Develop

`vp` ([Vite+](https://viteplus.dev)) is the only command. Run everything through it, not through `bun`, `npm`, or `npx`.

```sh
vp install
vp dev          # dev server
vp test run     # unit and Storybook tests
vp lint
vp run build    # production build into dist/
vp run storybook
```

## Stack

- **Vite+ (`vp`)** runs the dev server, build, tests, lint, git hooks, and package-manager commands (`vp install`, `vp add -D <pkg>`, `vp exec <bin>`).
- **Bun** is the package manager underneath (`bun.lock`, `devEngines`); `vp` picks it up automatically.
- **React + TypeScript**, with the latest versions that Vite+ and Storybook support.
- **Storybook** with the Vitest addon: every story runs as a browser test (Playwright Chromium) alongside the unit tests. First run needs `vp exec playwright install chromium`.
- **Tests** import from `vite-plus/test`, not `vitest`, to satisfy the `prefer-vite-plus-imports` lint rule.
- **Pre-commit hook** (`.vite-hooks/pre-commit`) runs `vp lint`, `vp run build`, and `vp test run`.

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which tests, builds, and publishes to the `gh-pages` branch, served at `/slopninja/`. Pull requests get a preview under `pr-preview/pr-<number>/`, removed when the PR closes. In the repo settings, set Pages → Source to "Deploy from a branch" → `gh-pages` / `(root)`. CI uses `voidzero-dev/setup-vp`, which installs Vite+, Node, and Bun and runs `vp install`.

## Setup and updates (scaffold-kids-app skill)

This project is the reference for the `scaffold-kids-app` agent skill (`~/Work/agents/skills/scaffold-kids-app/SKILL.md`). Use it:

- **To start a new kids app:** run `/scaffold-kids-app <name> <description>` in Claude Code. It scaffolds a project with this same stack.
- **To update this setup:** when the tooling changes (Vite+, Storybook, CI, hooks), change it here first, then update the skill so new apps get the same setup. Existing apps can be brought up to date by following the skill's steps.

## Install on iPad

Open the Pages URL in Safari, tap Share, then "Add to Home Screen". The game runs full screen from the home screen and works offline after the first visit.
