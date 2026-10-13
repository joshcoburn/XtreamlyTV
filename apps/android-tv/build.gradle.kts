plugins {
    // Frozen Android toolchain. Keep these versions aligned with
    // gradle-wrapper.properties and scripts/check-android-toolchain.mjs.
    id("com.android.application") version "9.4.1" apply false
    id("org.jetbrains.kotlin.android") version "2.4.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.4.21" apply false
}
