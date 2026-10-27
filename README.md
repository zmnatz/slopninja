# Fruit Ninja

Slice the fruit, avoid the bombs. One or two players on one iPad.

## Develop

```sh
npm install
npm run dev      # dev server
npm test         # unit tests
npm run lint
npm run build    # production build into dist/
```

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which tests, builds, and publishes to GitHub Pages at `/slopninja/`. In the repo settings, set Pages → Source to "GitHub Actions".

## Install on iPad

Open the Pages URL in Safari, tap Share, then "Add to Home Screen". The game runs full screen from the home screen and works offline after the first visit.
