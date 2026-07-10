# Component Strategy for AI

## Placement Rules

- Cross-feature reusable component -> `src/components`.`
- Only for one page -> keep inside that page module.

## Composition Rules

- Route pages should use shared layout wrappers already used in project.
- Prefer MUI primitives for layout.
- Keep utility classes minimal and readable.


## Forms

## Reuse Guard

Before creating a new component:

1. Check `src/components`.
2. Check target feature `components`.
3. Reuse existing patterns from nearby pages.
