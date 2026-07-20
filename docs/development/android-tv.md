# Android TV and Google TV development

The Android target is a native Kotlin application using Jetpack Compose and AndroidX Media3 ExoPlayer.

## Supported development targets

The same debug APK can be installed on compatible Android TV / Google TV devices, including supported TCL and Sony televisions, Chromecast with Google TV, NVIDIA Shield, and similar devices.

The Android target follows the polished webOS application as the shared product baseline. It includes the same sidebar structure, Home experience, category-scoped catalogs, details, persistent favorites and custom groups, recent items, resume positions, skins, editable provider settings, playback preferences, and local privacy controls. Platform-specific behavior remains native: Android uses Media3 and connects directly to providers without the optional webOS CORS bridge.

## Requirements

- JDK 17
- Android SDK Platform 36 and Build Tools 36.0.0
- Android SDK Platform Tools (`adb`)
- Android Studio is optional; command-line builds use the committed Gradle wrapper.
- A TV/emulator running Android 6.0 / API 23 or later

Open `apps/android-tv` as an Android Studio project, or build from the command line.

## Build a debug APK

macOS/Linux:

```bash
cd apps/android-tv
./gradlew :app:assembleDebug
```

Windows:

```powershell
cd apps\android-tv
.\gradlew.bat :app:assembleDebug
```

The committed wrapper downloads Gradle 8.14.3 on first use. The Android toolchain is intentionally frozen to:

- Android Gradle Plugin 8.10.1
- Kotlin and Compose compiler plugin 2.2.21
- Gradle 8.14.3
- JDK 17
- compileSdk and targetSdk 36

Run `node scripts/check-android-toolchain.mjs` from the repository root before changing those versions. Upgrade the set as one tested unit rather than updating individual versions.

Output:

```text
apps/android-tv/app/build/outputs/apk/debug/app-debug.apk
```

## Create an emulator

In Android Studio:

1. Open **Device Manager**.
2. Create a virtual device.
3. Select an Android TV or Google TV hardware profile.
4. Choose an API 36 or compatible TV system image.
5. Start the emulator and run the `app` configuration.

Physical devices are preferred for codec and performance validation.

## Enable developer options on TCL or Sony

Menu names vary slightly by vendor and Android version.

1. Open **Settings**.
2. Open **System** or **Device Preferences** → **About**.
3. Select **Android TV OS build** or **Build** seven times.
4. Return to Settings and open **Developer options**.
5. Enable **USB debugging** or **Wireless debugging**.

## Connect over the network

### Modern Wireless Debugging

If the TV exposes **Wireless debugging** with a pairing code:

```bash
adb pair TV_IP:PAIRING_PORT
```

Enter the displayed pairing code, then:

```bash
adb connect TV_IP:DEBUG_PORT
adb devices
```

### Legacy TCP debugging

Some TVs expose network debugging directly on port 5555:

```bash
adb connect TV_IP:5555
adb devices
```

Accept the RSA authorization prompt on the television.

## Install and launch

```bash
adb install -r apps/android-tv/app/build/outputs/apk/debug/app-debug.apk
```

The `-r` flag updates the existing package while preserving app data.

Launch from the TV launcher, or run:

```bash
adb shell monkey -p com.github.xtreamlytv.androidtv 1
```

Uninstall and clear all data:

```bash
adb uninstall com.github.xtreamlytv.androidtv
```

PowerShell helper:

```powershell
.\scripts\install-android.ps1 -Device 192.168.1.50:5555
```

## Logs

```bash
adb logcat --pid=$(adb shell pidof -s com.github.xtreamlytv.androidtv)
```

Windows PowerShell:

```powershell
$pidOnTv = adb shell pidof -s com.github.xtreamlytv.androidtv
adb logcat --pid=$pidOnTv
```

Filter Media3 messages:

```bash
adb logcat | grep -E "XtreamlyTV|ExoPlayer|MediaCodec"
```

Do not publish logs containing provider passwords or authenticated stream URLs.

## Cleartext HTTP providers

Many Xtream providers use HTTP rather than HTTPS. The application permits cleartext provider traffic for compatibility and warns during provider setup when credentials will not be protected in transit. Authenticated stream URLs and provider passwords must never be included in logs or bug reports.

## TV launcher artwork and UI resolution

XtreamlyTV does not override the TV's display size or density. Android TV chooses the logical UI surface and the resource system selects the closest matching artwork.

The Android target includes:

- Launcher icons in `mipmap-mdpi` through `mipmap-xxxhdpi` (80–320 px).
- TV banners in `mipmap-mdpi` through `mipmap-xxxhdpi` (160×90–640×360 px).
- An adaptive launcher icon for API 26 and newer.
- A 1024 px `drawable-nodpi` brand mark for Compose onboarding and loading screens.

This keeps artwork sharp on high-density 4K televisions without forcing a nonstandard application resolution.
