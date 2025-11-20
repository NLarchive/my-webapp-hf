# Development Process: dev repo & staging HF Space

This repo contains the recommended steps and scripts to create a safe development workflow by using a separate `dev` GitHub repository and a Hugging Face Space called `my-webapp-hf-dev`.

Why use separate dev repo & staging HF space?
- Isolates LLM-driven changes and auto-modify actions from `main` (the canonical repository).
- Allows automated testing and human review before merging into `main`.
- Lets you safely assign tokens and access to a staging HF space.

## Recommended flow
1. Create a dev GitHub repository (e.g., `NLarchive/my-webapp-hf-dev`).
2. Use `scripts/clone-to-dev.sh` or `scripts/clone-to-dev.ps1` to copy code and push to the dev repo and to the HF space `my-webapp-hf-dev`.
3. Add GitHub Secrets to the dev repo (HF_TOKEN, GEMINI_API_KEY, GITHUB_TOKEN or GitHub App credentials). Do not add them to the canonical repo unless required.
4. Change dev repo `.github/workflows/sync-to-hf.yml` to use `.hf-config-dev` instead of `.hf-config` if you prefer.
5. Enable `ENABLE_AUTO_MODIFY=true` on the dev repo for iterative improvements; require PR review before merging to `main`.
6. Add branch protection rules to the `main` repo requiring tests and approvals.

## Scripts
- `scripts/clone-to-dev.sh`: Bash script to create a GitHub repo (uses `gh`), create `.hf-config-dev`, and optionally push to Hugging Face Space dev.
- `scripts/clone-to-dev.ps1`: PowerShell equivalent.

## Example: Create dev repo with CLI
Bash usage:
```bash
# Use GitHub CLI to create dev repo and push
./scripts/clone-to-dev.sh -r NLarchive/my-webapp-hf-dev -s my-webapp-hf-dev -u NLarchive
```

PowerShell usage:
```powershell
pwsh -File .\scripts\clone-to-dev.ps1 -GHRepo "NLarchive/my-webapp-hf-dev" -HFSpace "my-webapp-hf-dev" -HFUser "NLarchive"
```

## Env/Secrets to store in dev repo
- `HF_TOKEN` (Hugging Face write token)
- `GEMINI_API_KEY` (if using Gemini in dev)
- `GITHUB_TOKEN` or `GH_APP_*` credentials for GitHub App
- `ENABLE_AUTO_MODIFY=true` for dev if you want to experiment

## Good practices
- Always create PRs from dev into main, never push auto-modifications directly to `main`.
- Use `CODEOWNERS` to protect critical code paths.
- Keep `ENABLE_AUTO_MODIFY=false` in `main`.
- Add end-to-end acceptance tests and GitHub Actions checks for PRs.

---

If you want I can also:
- Add a `sync-to-hf-dev.yml` workflow for the dev repo.
- Update `scripts/clone-to-dev.sh` to pass additional flags and create a `CODEOWNERS` automatically.
- Add a helper to copy GH Actions templates with `sync-to-hf.yml` updated to `.hf-config-dev`.

What do you want next?