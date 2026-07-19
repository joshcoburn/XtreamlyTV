# Publish the initial GitHub repository

This source bundle is already initialized with a clean initial commit and an annotated `v0.4.0` tag. Replace the placeholder repository owner in documentation after creating the repository.

## Create the repository

Using GitHub CLI:

```bash
gh auth login
gh repo create XtreamlyTV --public --source=. --remote=origin
git push -u origin main
git push origin v0.4.0
```

Using the GitHub website:

1. Create a new empty public repository named `XtreamlyTV`.
2. Do not initialize it with a README, license, or `.gitignore` because they already exist.
3. Add the remote and push:

```bash
git remote add origin https://github.com/YOUR_ACCOUNT/XtreamlyTV.git
git push -u origin main
git push origin v0.4.0
```

Pushing the tag starts `.github/workflows/release.yml`, which builds the webOS IPK and Android TV debug APK and creates a GitHub release.

## Repository settings

Recommended settings after publishing:

- Enable **Private vulnerability reporting** under Security.
- Enable Dependabot alerts and security updates.
- Protect `main` and require the webOS and Android TV checks after the first successful workflow run.
- Disable force pushes and branch deletion on `main`.
- Add `docs/assets/github-social-preview.png` as the repository social preview.
- Add topics such as `webos`, `android-tv`, `google-tv`, `iptv-player`, `xtream`, and `media3`.

## Release notes

Use `docs/release-notes/0.4.0.md` as the release description if you prefer curated notes over automatically generated notes.

## Important

The Android artifact produced for `v0.4.0` is a debug/development APK. Do not publish it to Google Play. Production distribution requires a private signing key, release hardening, TV app quality review, and an Android App Bundle.
