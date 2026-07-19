param([switch]$Release)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Push-Location $Root
try {
  npm run prepare:apps
  npm run check:webos
  New-Item -ItemType Directory -Force "$Root\dist\webos" | Out-Null
  $args = @('-o', "$Root\dist\webos", "$Root\apps\webos\app")
  if (-not $Release) { $args = @('--no-minify') + $args }
  & ares-package @args
  if ($LASTEXITCODE -ne 0) { throw "ares-package failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
