# Privacy

XtreamlyTV contains no advertising, analytics, or behavioral tracking.

## Data stored on the device

Depending on platform and enabled features, the app may store:

- Provider server URL, username, and password
- Appearance and playback settings
- Favorites
- Recently watched content
- Movie and episode resume positions

webOS stores app state in local application storage. Android TV stores provider credentials using Android encrypted preferences in the developer preview.

## Data transmitted

XtreamlyTV sends requests to the provider configured by the user. The optional LAN API bridge receives provider credentials only to proxy metadata requests to that provider. Video streams are requested directly from the provider.

The project does not operate a central XtreamlyTV service and does not receive user credentials or viewing history.

## Security note

Some providers use unencrypted HTTP. In that case, credentials and stream URLs may be visible to parties able to observe the network path. Prefer HTTPS-enabled providers where available.
