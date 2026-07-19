# Security policy

## Supported versions

Security fixes are applied to the latest tagged release and the current `main` branch.

## Reporting a vulnerability

Do not open a public issue containing provider credentials, authenticated stream URLs, encryption keys, or a reproducible exploit affecting user data.

Use GitHub private vulnerability reporting after the repository is published. Until then, contact the repository owner privately.

Include:

- Affected platform and version
- Device/OS version
- Reproduction steps
- Impact assessment
- Suggested mitigation, if known

## Secrets

The repository must never contain:

- Real provider usernames/passwords
- Authenticated stream URLs
- Android signing keys
- LG Seller Lounge keys
- Personal access tokens

Android release signing should use GitHub Actions secrets or a secure external signing process.
