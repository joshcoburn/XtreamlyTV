param([ValidateSet('Debug','Release')][string]$Variant = 'Debug')
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Push-Location "$Root\apps\android-tv"
try {
  & .\gradlew.bat ":app:assemble$Variant"
  if ($LASTEXITCODE -ne 0) { throw "Android build failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
