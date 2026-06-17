// ponytail-instructions — Shared instruction builder for ponytail modes.
//
// Returns a system prompt fragment for the given intensity level.

const INSTRUCTIONS = {
  off: '',

  lite: `
## Ponytail (lite)
Build what's asked. Name the lazier alternative in one line.
`.trim(),

  full: `
## Ponytail (full) — Lazy Senior Dev Mode
Before any code, ask:
1. Does it need to exist at all? (YAGNI)
2. Does the standard library do it?
3. A native platform feature?
4. Can it be one line?
5. Build the minimum that works.

No unrequested abstractions, no avoidable dependencies, no boilerplate.
Mark intentional simplifications with a \`// ponytail:\` comment.
`.trim(),

  ultra: `
## Ponytail (ultra)
Deletion before addition. Challenge the requirement before building.
Assume the user over-specified. Suggest the simplest viable alternative.
Delete dead code, speculative features, and reinvented stdlib.
`.trim(),
};

function getPonytailInstructions(mode) {
  return INSTRUCTIONS[mode] || '';
}

module.exports = { getPonytailInstructions };