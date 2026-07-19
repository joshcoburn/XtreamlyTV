param(
  [string]$Device = 'tv1',
  [string]$Package = ''
)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
if (-not $Package) {
  $Package = Get-ChildItem "$Root\dist\webos\*.ipk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $Package) { throw 'No webOS IPK found. Run scripts/build-webos.ps1 first.' }
& ares-launch --device $Device --close com.github.xtreamlytv.webos
& ares-install --device $Device $Package
if ($LASTEXITCODE -ne 0) { throw "ares-install failed with exit code $LASTEXITCODE" }
& ares-launch --device $Device com.github.xtreamlytv.webos
