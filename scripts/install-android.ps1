param(
  [string]$Device = '',
  [string]$Apk = ''
)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
if ($Device) { adb connect $Device | Out-Host }
if (-not $Apk) { $Apk = "$Root\apps\android-tv\app\build\outputs\apk\debug\app-debug.apk" }
if (-not (Test-Path $Apk)) { throw "APK not found at $Apk. Run scripts/build-android.ps1 first." }
adb install -r $Apk
if ($LASTEXITCODE -ne 0) { throw "adb install failed with exit code $LASTEXITCODE" }
adb shell monkey -p com.github.xtreamlytv.androidtv 1
