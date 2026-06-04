# Maintainer Guide

This document records how the project is maintained. It is useful for future contributors and for proving real maintainer work.

## Regular responsibilities

- Review new issues and label them.
- Ask for reproduction details when bug reports are incomplete.
- Review pull requests for scope, tests, docs, and privacy risk.
- Run `npm test` before merging.
- Update README, roadmap, and changelog before releases.
- Tag stable releases.

## Release workflow

1. Confirm `npm test` passes.
2. Update `CHANGELOG.md`.
3. Commit release notes.
4. Tag the release.
5. Push branch and tags.
6. Create a GitHub release using the matching changelog section.

Example:

```bash
git tag v0.2.0
git push origin main --tags
```

## PR review checklist

- Does this solve a real learning workflow problem?
- Is the change small enough to review?
- Are RAG or agent behavior changes covered by tests?
- Are screenshots included for UI changes?
- Does documentation mention new commands or workflows?
- Is there any private student data or unauthorized course material?

## Maintainer evidence to keep

- Links to merged PRs.
- Links to issues you triaged or closed.
- Release links.
- Screenshots of demo usage.
- Short notes from real users or classmates who tried the app.
- Changelog entries showing continued maintenance.
