---
title: AI-Assisted Development
categories:
  - dev
---


Valaxy supports AI-assisted development workflows through [Claude Code](https://claude.com/code), making it easier to contribute to the project.


## Setup


The repository includes custom Claude Code commands in `.claude/commands/` to streamline common development tasks.


## Available Commands


### Fix GitHub Issues


Automatically analyze and fix GitHub issues:

```bash
/fix-github-issue 1234
```


This command will:

1. Fetch the issue details using GitHub CLI
2. Analyze the problem description
3. Search for relevant code files
4. Implement the necessary changes
5. Run tests to verify the fix
6. Ensure code quality (linting, type checking)
7. Create a descriptive commit
8. Push changes and create a pull request

**Example:**

```bash
/fix-github-issue 628
```

This will automatically fix issue #628 by:
- Reading the issue description
- Finding affected components
- Implementing the fix
- Running tests
- Creating a PR with proper description

## CLAUDE.md


The repository includes a `CLAUDE.md` file at the root that provides:

- Essential development commands
- Architecture overview
- Key patterns and conventions
- Project-specific notes

This file helps Claude Code understand the codebase structure and development workflow.


## Best Practices


When using AI-assisted development:

1. **Review Changes**: Always review the changes made by AI before committing
2. **Test Thoroughly**: Ensure tests pass and manually verify critical changes
3. **Understand the Code**: Don't just accept changes - understand what was changed and why
4. **Iterative Refinement**: Work with the AI iteratively to refine solutions
5. **Follow Conventions**: The AI will follow existing code patterns, but verify consistency


## Creating Custom Commands


You can create custom commands for common tasks:

1. Create a new file in `.claude/commands/`
2. Name it descriptively (e.g., `add-feature.md`)
3. Write instructions for Claude Code to follow

**Example command structure:**

```markdown
Please implement a new feature: $ARGUMENTS.

Follow these steps:
1. Analyze requirements
2. Design the solution
3. Implement the code
4. Write tests
5. Update documentation
```


## Tips


- Use `/help` to see all available commands
- The AI has access to the full codebase context
- Commands can accept arguments via `$ARGUMENTS`
- AI will follow patterns from `CLAUDE.md` and existing code
- GitHub CLI (`gh`) is available for GitHub operations


## Limitations


- AI suggestions should be reviewed by humans
- Complex architectural decisions may need manual planning
- Security-sensitive changes require extra scrutiny
- Always test in a local environment before deploying

---


**Note**: AI-assisted development is a tool to enhance productivity, not replace human judgment. Always review and understand the changes made.
