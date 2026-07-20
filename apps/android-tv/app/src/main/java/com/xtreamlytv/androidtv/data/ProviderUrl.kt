package com.xtreamlytv.androidtv.data

import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

internal object ProviderUrl {
    fun normalize(input: String): String {
        val trimmed = input.trim()
        require(trimmed.isNotBlank()) { "Enter a provider URL." }

        val candidate = if (trimmed.contains("://")) trimmed else "http://$trimmed"
        val parsed = candidate.toHttpUrlOrNull()
            ?: throw IllegalArgumentException("Enter a valid provider URL, including the host and optional port.")

        require(parsed.scheme == "http" || parsed.scheme == "https") {
            "Provider URLs must use HTTP or HTTPS."
        }

        var normalizedPath = parsed.encodedPath.trimEnd('/')
        val apiSuffix = "/player_api.php"
        if (normalizedPath.endsWith(apiSuffix, ignoreCase = true)) {
            normalizedPath = normalizedPath.dropLast(apiSuffix.length)
        }

        return parsed.newBuilder()
            .encodedPath(normalizedPath.ifBlank { "/" })
            .query(null)
            .fragment(null)
            .build()
            .toString()
            .trimEnd('/')
    }
}
