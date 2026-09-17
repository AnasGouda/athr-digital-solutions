# Verification notes

The live public preview renders the existing ATHR Arabic-first visual system unchanged. The floating ATHR Assistant button is visible in the lower end corner, opens a responsive chat panel, shows the assistant identity, suggested prompts, human support escalation email, and loading dots. A suggested public services question successfully created a user message and displayed the typing state, confirming the frontend calls the real tRPC AI mutation rather than a hardcoded response.

Automated checks completed after the extension: TypeScript passed, Vitest passed with 5 tests, and the production build completed successfully.
