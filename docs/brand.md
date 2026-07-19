# Brand assets

The canonical logo source is stored in:

```text
packages/brand/assets/xtreamlytv-logo.png
```

Generated distribution assets are in `docs/assets/`:

- 128, 256, 512, and 1024 pixel app icons
- Dark and light wordmarks
- GitHub social preview image

The icon is the `X` in the XtreamlyTV wordmark. When text is displayed alongside it, use `treamlyTV` rather than repeating the X.

## Core palette

| Token | Value |
|---|---|
| Accent | `#20E7C4` |
| Secondary accent | `#2AA7FF` |
| Background | `#071014` |
| Surface | `#0D2230` |
| Text | `#F4F8FF` |
| Muted text | `#A9BCC8` |
| Danger/favorite | `#FF5A7D` |

Edit `packages/design-tokens/tokens.json` and run `npm run tokens` to update generated platform colors.
