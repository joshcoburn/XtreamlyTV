plugins {
    // Frozen v0.4.1 toolchain. Keep these versions aligned with
    // gradle-wrapper.properties and scripts/check-android-toolchain.mjs.
    id("com.android.application") version "8.10.1" apply false
    id("org.jetbrains.kotlin.android") version "2.2.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.2.21" apply false
}
