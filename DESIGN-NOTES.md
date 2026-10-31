# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v8 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~980vh scrub |
| Hero wipe | Soft mask wipe + luminous edge + media parallax |
| Giant DISCOVER headline | 「探索 / 新面料」 rises centered, holds, then splits as cards scrub |
| Tilted cards crossing type | 10 solid polaroids, wider gaps so type peeks between; center scale |
| Smooth scrub | Always-on RAF + delta-time exponential lerp + velocity spin |

QA: `frame-hero|midwipe|wipe|cards.html`
