# Note session

This session ran in its own worktree.

## Steps

1. From the repo root, start a second isolated session:

```bash
cd /Users/uyenho/Desktop/TRAINING/ai-training
claude --worktree day6-note
```

2. In a third terminal, watch both sessions:

```bash
claude agents
```

3. The worktree had started on an old commit. Update it to `feat/claude-training` before editing.
4. Create this file with one sentence: `This session ran in its own worktree.`
5. Commit only this file on its own branch:

```bash
git checkout -b feat/claude-training-note
git add claude-training/day-6/parallel.md
git commit -m "docs: add parallel worktree note"
git push -u origin feat/claude-training-note
```

6. Open a merge request into `feat/claude-training`. Title: `docs: add parallel worktree note`.
7. Merge it. The merge commit on `feat/claude-training` is `ffa4d42`.
