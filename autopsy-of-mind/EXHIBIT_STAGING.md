# Thought-opsy exhibit preview

**No real research data is included in this branch.** The existing MRI landing page is unchanged.

Open `autopsy-of-mind/explore.html` through a local static web server, e.g. from the repository root:

```sh
python3 -m http.server 8000
```

Preview at `http://localhost:8000/autopsy-of-mind/explore.html`. In the staged build, every year says **withheld**. That is intentional.

The page uses no analytics, external JavaScript, browser storage or third-party APIs. It uses the existing local Marlboro font asset only. It is keyboard navigable and supports reduced-motion preferences. The existing `autopsy-of-mind/index.html` animated MRI landing is unchanged, and no link to the exhibit was added to `main`.

## Future numeric data handoff (approval required)

The page may read `public-aggregate-v1.json` in the same directory, but **this file is intentionally absent**. It will only appear after a separate, explicit review of the exact payload by the research owner, following the private Step 12 release validator contract on `pds-journal`. It is never fetched from the private repo.

Do **not** copy `pds-journal` into `portie`. The research repository's raw source exports remain in private Git history.

Do not treat a successful schema check as publication consent. Any real explanatory narrative or belief evidence requires a separate review, not a shortcut through the numeric bundle.

## Review tasks before promoting from staging

1. User approves the site visual direction and copy, including the prominent uncertainty wording.
2. Approve the exact sanitized public aggregate separately before committing any real data.
3. Check mobile and keyboard behavior, reduced motion, network requests, and accessibility.
4. Only then consider a separate PR into the published `main` branch.

The five named accounts are competing hypothetical explanations. The page does **not** claim one is true, quantify psychological growth or show historical forecast outcomes.
