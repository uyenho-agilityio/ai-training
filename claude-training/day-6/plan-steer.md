# Plan session

This note was written in an isolated worktree.

## Steps

1. From the repo root, start an isolated session:

```bash
cd /Users/uyenho/Desktop/TRAINING/ai-training
claude --worktree day6-plan
```

2. The worktree had started on an old commit. Update it to `feat/claude-training` before editing.
3. Create this file with one sentence: `This note was written in an isolated worktree.`
4. Commit only this file on its own branch:

```bash
git checkout -b feat/claude-training-plan
git add claude-training/day-6/plan-steer.md
git commit -m "docs: add plan-mode worktree note"
git push -u origin feat/claude-training-plan
```

5. Open a merge request into `feat/claude-training`. Title: `docs: add plan-mode worktree note`.
6. Merge it. The merge commit on `feat/claude-training` is `eff004c`.
