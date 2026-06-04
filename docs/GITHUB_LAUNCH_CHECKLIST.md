# GitHub Launch Checklist

The local repository is prepared. Complete these steps after signing in to GitHub.

## Create repository

Recommended repository name:

```text
ai-learning-agent-system
```

Recommended description:

```text
个性化资源生成与学习多智能体系统原型，支持本地课程资料 RAG、七智能体协作和学习路径生成。
```

## Push local history

```bash
git remote add origin https://github.com/condidatefounder/ai-learning-agent-system.git
git push -u origin main --tags
```

## Suggested launch issues

Create these as real GitHub issues after the repository is public.

### 1. Improve low-relevance RAG result handling

Labels: `enhancement`, `good first issue`

Body:

```markdown
When the retrieved chunks have low relevance, the UI should explain that the answer may be incomplete and suggest uploading more course material.

Acceptance criteria:

- Add a low-relevance threshold in the RAG result flow.
- Show a readable empty or weak-result state.
- Cover the behavior with tests.
```

### 2. Add English README

Labels: `documentation`, `good first issue`

Body:

```markdown
The project currently has Chinese-first documentation. Add an English README or README.en.md so more contributors can understand the project.

Acceptance criteria:

- Explain project purpose, quick start, demo flow, and contribution steps.
- Link screenshots and roadmap.
- Keep commands consistent with the Chinese README.
```

### 3. Add PDF/PPT/Word parsing design

Labels: `enhancement`

Body:

```markdown
The current RAG prototype supports text files only. Draft a design for server-side PDF, PPT, and Word parsing before implementation.

Acceptance criteria:

- Document parser options and privacy boundaries.
- Define the normalized text chunk interface.
- Explain how parsed documents reuse the existing RAG index.
```

## Suggested PR workflow

After creating the issues, use a real branch and PR for the first issue:

```bash
git switch -c docs/add-english-readme
# create README.en.md
git add README.en.md README.md
git commit -m "docs: add English README"
git push -u origin docs/add-english-readme
```

Then open a pull request on GitHub and link it to the documentation issue.

## Suggested releases

Create GitHub releases for:

- `v0.1.0`: initial runnable prototype.
- `v0.2.0`: open source maintenance foundation.

Use `CHANGELOG.md` as the release notes source.
