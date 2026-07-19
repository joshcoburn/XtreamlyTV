package com.xtreamlytv.androidtv.data

import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.Credentials
import java.net.URLEncoder

object StreamUrlBuilder {
    fun candidates(credentials: Credentials, item: CatalogItem): List<String> {
        val server = credentials.server.trim().trimEnd('/')
        val user = credentials.username.encodePathSegment()
        val pass = credentials.password.encodePathSegment()
        return when (item.type) {
            ContentType.LIVE -> listOf(
                "$server/live/$user/$pass/${item.id}.m3u8",
                "$server/live/$user/$pass/${item.id}.ts",
            )
            ContentType.MOVIE -> listOf(
                "$server/movie/$user/$pass/${item.id}.${safeExtension(item.containerExtension, "mp4")}",
                "$server/movie/$user/$pass/${item.id}.mp4",
            ).distinct()
            ContentType.EPISODE -> listOf(
                "$server/series/$user/$pass/${item.id}.${safeExtension(item.containerExtension, "mp4")}",
                "$server/series/$user/$pass/${item.id}.mp4",
            ).distinct()
            ContentType.SERIES -> emptyList()
        }
    }

    private fun String.encodePathSegment(): String =
        URLEncoder.encode(this, Charsets.UTF_8.name()).replace("+", "%20")

    private fun safeExtension(value: String?, fallback: String): String =
        value.orEmpty().lowercase().filter { it.isLetterOrDigit() }.ifBlank { fallback }
}
