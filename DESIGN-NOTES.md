# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v12 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin ~1280vh; locked pin (exit scale via `--pin` only) |
| Hero wipe | Longer soft curtain feather + brighter wipe edge |
| Giant DISCOVER headline | Larger type; centered hold; delayed `--sp` split after early cards |
| Tilted cards crossing type | Wider high/low corridor; rotateY depth; prox shadow |
| Smooth scrub | Dual-stage exp lerp + coast + overshoot settle |

QA: `frame-hero|midwipe|wipe|peek|cards.html`
