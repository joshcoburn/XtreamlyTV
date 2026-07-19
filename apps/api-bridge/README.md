# Optional Xtream metadata bridge

Some webOS providers reject browser-origin API calls because they do not return CORS headers. This small LAN service proxies Xtream metadata requests; playback remains direct from the television to the provider.

```bash
docker compose up -d --build
```

Configure the bridge in webOS Settings as:

```text
http://YOUR_LAN_HOST:8787
```

Do not expose this service directly to the public internet. Android TV normally does not need the bridge because it uses native HTTP networking.
