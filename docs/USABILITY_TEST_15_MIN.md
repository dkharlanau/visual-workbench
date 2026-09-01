# 15-minute external usability test

This kit measures whether a first-time user can model, render, and interpret one synthetic handoff. It does not claim that an external session has occurred or that the visual is suitable for every audience.

## Participant and privacy boundary

Suitable participant: a business/system analyst, architect, project practitioner, or technical writer unfamiliar with Visual Workbench.

Use only `examples/order-fulfillment-lanes.md`. Do not paste client processes, internal system names, screenshots, URLs, credentials, or proprietary diagrams into a public issue.

## Facilitator script

| Time | Participant task | Observe without coaching |
| --- | --- | --- |
| 0–2 min | Read the opening README and explain “model meaning, not pixels.” | Whether the abstraction boundary is clear. |
| 2–6 min | Run the [golden quickstart](GOLDEN_QUICKSTART.md) through SVG rendering. | Setup friction and command errors. |
| 6–9 min | Identify the normal flow, exception path, and ownership lanes. | Whether semantic emphasis survives rendering. |
| 9–12 min | Render the `executive` view and explain what was intentionally hidden. | Whether named-view projection is understandable. |
| 12–15 min | Change one synthetic label or status, rerender, and state what should remain stable. | Confusion between source semantics and renderer styling. |

Stop if installation consumes more than six minutes. Record the blocker rather than completing the workflow for the participant.

## Blank result record

```text
Release/tag tested:
Operating system and Node.js version:
Participant role (no employer/client name):
Completed within 15 minutes: yes / no
First blocker:
Normal flow identified: yes / no
Exception path identified: yes / no
Named-view behavior understood: yes / no / unclear
Meaning-vs-pixels boundary understood: yes / no / unclear
Most useful output:
Most confusing term or step:
Suggested improvement:
```

Submit privacy-safe results through the [external usability feedback form](https://github.com/dkharlanau/visual-workbench/issues/new?template=usability-feedback.yml). Planned sessions and empty forms are not adoption evidence.
