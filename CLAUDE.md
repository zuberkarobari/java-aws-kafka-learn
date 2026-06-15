# CLAUDE.md — Local Agent rules and instructions

## Architecture Rules
1. **Defensive Object Access**: Always check if lookup keys exist in configuration objects before accessing their nested properties (e.g., `PATHWAYS[activePathway]?.categories` instead of `PATHWAYS[activePathway].categories`). Avoid assuming that fallback pathways or default dashboard states have matching configurations in `PATHWAYS`.
2. **Self-Healing Navigation & Pathways**: When loading page views directly (such as topic detail pages), verify if the current page/topic belongs to the currently active pathway. If it does not, automatically resolve the correct pathway from `PATHWAYS` by matching the category, and update `activePathway` and `localStorage` to keep the UI sidebar and header state synchronized and functional.
