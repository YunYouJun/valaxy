# Publishing packages

The workflow filename and environment are part of npm's trusted publisher identity. Keep them aligned with the package's settings when changing a release workflow.

## Select the release entry point

These routes have been verified by successful releases:

| Package | GitHub Actions workflow | Trusted workflow file | Environment |
| --- | --- | --- | --- |
| `valaxy-addon-meting` | Release Addon | `release-addon.yml` | None |
| `valaxy-theme-yun` | Release | `release.yml` | `npm` |
| Coordinated core release | Release, triggered by a version tag | `release.yml` | `npm` |

For other addons, check their npm package settings before selecting an entry point. Both workflows accept addon names; that alone does not establish npm trust.

## Publish an addon or a standalone theme update

1. Bump the package's version and merge the change into `main`. Use a Conventional Commit such as `chore(meting): release v0.2.2`.
2. Open Actions, select the correct workflow, and choose **Run workflow** on `main`. Enter the short name, such as `meting` or `theme-yun`.
3. Verify the publishing step, its job summary, and npm's version and dist-tag.

Equivalent commands for the known routes:

```bash
gh workflow run release-addon.yml --ref main -f addon=meting
gh workflow run release.yml --ref main -f addon=theme-yun
```

These commands publish the version already committed in the package. A published npm version cannot be overwritten; use a new version for additional changes.

Normal Conventional Commits do not automatically publish addons. `release.yml` retains a historical push trigger for `release(addon-*)` messages; use manual dispatch for new addon releases.

## Diagnose a failed release

The run name shows the selected package and workflow. The publishing step's summary includes the package version, workflow filename, and environment.

If GitHub issues an OIDC token but npm rejects the token exchange, compare the package's **Settings → Trusted publishing** with the repository, workflow filename, and environment shown in the failure message. Also verify `id-token: write`. npm requires these fields to match its trusted publisher configuration. See [npm trusted publishing troubleshooting](https://docs.npmjs.com/trusted-publishers/#troubleshooting).

For Meting, selecting Release fails before dependency installation and points to Release Addon. Other publish failures retain the command's exit status and original log so registry or package errors can be distinguished from authentication errors.

An old failed run stays in the history after a successful release. Re-running it uses its original commit; dispatch a new run on the updated `main` to use a workflow fix.
