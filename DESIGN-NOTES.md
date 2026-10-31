# Effect fidelity notes (Henglong vs Etro Textiles)

Reference: https://etrotextiles.etro.com/ (public pages only).
Original CSS/JS + licensed fabric photos. No Etro assets/logos/fonts/code.

| Etro effect | Henglong polish (v11 stage) |
|---|---|
| Pinned full-screen stage | Sticky 100dvh pin ~1160vh; overscroll contain; touch-action |
| Hero wipe | Soft mask wipe + longer feather; type blur→sharp |
| Giant DISCOVER headline | 「探索 / 新面料」 centered hold with breath, then split |
| Tilted cards crossing type | High/low mid-band; early peek; prox shadow; quieter bob |
| Smooth scrub | Delta-time exp lerp + overshoot settle |

QA: `frame-hero|midwipe|wipe|peek|cards.html`
