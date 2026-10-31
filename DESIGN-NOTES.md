# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v10 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin inside ~1100vh scrub |
| Hero wipe | Soft mask wipe → giant type (no second-hero fight); type blur→sharp |
| Giant DISCOVER headline | 「探索 / 新面料」 rises centered, holds, splits with cards |
| Tilted cards crossing type | High/low mid-band; position tilt; enter scale; soft early peek |
| Smooth scrub | Delta-time exp lerp + light overshoot/settle |

QA: `frame-hero|midwipe|wipe|cards.html`
