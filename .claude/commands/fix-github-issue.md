Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

## 1. Analyze the Issue

- Use `gh issue view <number>` to get the issue details (title, body, labels, assignees)
- Use `gh issue view <number> --comments` to check for additional context in comments
- Check if there are already related PRs: `gh pr list --search "<issue number>"`
- Understand the problem, expected behavior, and reproduction steps

## 2. Create an Isolated Worktree

Create a git worktree to work in isolation without affecting the current branch:

```
git worktree add .claude/worktrees/fix-<number> -b fix/<number> main
cd .claude/worktrees/fix-<number>
```

All subsequent work should happen inside this worktree directory.
If the worktree or branch already exists, reuse it.

## 3. Search and Understand the Codebase

- Search the codebase for relevant files related to the issue
- Read and understand the existing code before making changes
- Identify the root cause of the issue

## 4. Implement the Fix

- Make the necessary changes to fix the issue
- Keep changes minimal and focused on the issue
- Follow existing code patterns and conventions

## 5. Verify the Fix

- Write and run tests to verify the fix: `pnpm test`
- Ensure code passes linting: `pnpm lint`
- Ensure type checking passes: `pnpm typecheck`
- Build to verify no build errors: `pnpm run build`

## 6. Commit and Create a PR

- Stage only the relevant files (avoid `git add -A`)
- Create a descriptive commit message referencing the issue (e.g., `fix: resolve <description> (close #<number>)`)
- Push the branch and create a PR with `gh pr create`, linking to the issue

## 7. Cleanup Reminder

After the PR is merged, the worktree can be cleaned up:
```
git worktree remove .claude/worktrees/fix-<number>
git branch -d fix/<number>
```

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
