package com.xtreamlytv.androidtv.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.xtreamlytv.androidtv.model.Credentials

class CredentialsStore(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val preferences = EncryptedSharedPreferences.create(
        context,
        "xtreamlytv.credentials",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun load(): Credentials? {
        val server = preferences.getString("server", null)?.trim().orEmpty()
        val username = preferences.getString("username", null)?.trim().orEmpty()
        val password = preferences.getString("password", null).orEmpty()
        return if (server.isBlank() || username.isBlank() || password.isBlank()) null
        else Credentials(server, username, password)
    }

    fun save(credentials: Credentials) {
        preferences.edit()
            .putString("server", credentials.server.trimEnd('/'))
            .putString("username", credentials.username.trim())
            .putString("password", credentials.password)
            .apply()
    }

    fun clear() {
        preferences.edit().clear().apply()
    }
}
