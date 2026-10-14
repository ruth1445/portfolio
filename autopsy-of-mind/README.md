# autopsy of mind — landing hero

Plain HTML/CSS/JS, no build step.

- `index.html` — page, styles and all the MRI animation code
- `assets/scan-*.png` — the scan in each of the 9 palettes
- `assets/grain-soft.png` — title grain, `assets/grain-light.png` — blurb-box grain
- `assets/Marlboro.ttf` — the font

Run it from a local server (the canvas reads image pixels, which browsers block on `file://`):

    cd scrutiny-landing
    python3 -m http.server 8000
    # open http://localhost:8000

Tweaks:
- starting palette: `mri.props = { scheme: 'spectral' }` near the bottom of `index.html`
- palettes: the `MRI_SCHEMES` list (name, image, glow colour, swatch colours)
- how far / how fast the pieces ooze: `mag` values in `MRI_CELLS`, and the `0.022` / `0.05` spring numbers in `tick()`
