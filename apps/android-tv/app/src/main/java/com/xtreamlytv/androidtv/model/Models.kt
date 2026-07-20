package com.xtreamlytv.androidtv.model

enum class ContentType { LIVE, MOVIE, SERIES, EPISODE }

enum class AppTheme(val id: String, val label: String) {
    TEAL("teal", "Teal"),
    GRAPHITE("graphite", "Graphite"),
    PURPLE("purple", "Purple"),
    PINK("pink", "Pink"),
    BLUE("blue", "Blue");

    companion object {
        fun fromId(value: String?): AppTheme = entries.firstOrNull { it.id == value } ?: TEAL
    }
}

enum class StreamFormat(val id: String, val label: String) {
    AUTO("auto", "Automatic fallback"),
    HLS("m3u8", "HLS first"),
    MPEG_TS("ts", "MPEG-TS first");

    companion object {
        fun fromId(value: String?): StreamFormat = entries.firstOrNull { it.id == value } ?: AUTO
    }
}

data class AppSettings(
    val theme: AppTheme = AppTheme.TEAL,
    val streamFormat: StreamFormat = StreamFormat.AUTO,
    val maxCachedCategories: Int = 3,
)

data class Credentials(
    val server: String,
    val username: String,
    val password: String,
)

data class Category(
    val id: String,
    val name: String,
)

data class CatalogItem(
    val id: String,
    val type: ContentType,
    val name: String,
    val categoryId: String? = null,
    val imageUrl: String? = null,
    val containerExtension: String? = null,
    val rating: Double? = null,
    val plot: String? = null,
    val season: Int? = null,
    val episode: Int? = null,
    val channelNumber: String? = null,
    val genre: String? = null,
    val releaseDate: String? = null,
    val parentSeriesId: String? = null,
    val parentSeriesName: String? = null,
    val parentSeriesImageUrl: String? = null,
)

data class FavoriteGroup(
    val id: String,
    val name: String,
    val icon: String = "folder",
    val color: String = "purple",
    val itemKeys: Set<String> = emptySet(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)

data class PlaybackProgress(
    val positionMs: Long,
    val durationMs: Long,
    val updatedAt: Long = System.currentTimeMillis(),
)

data class PlayerRequest(
    val item: CatalogItem,
    val queue: List<CatalogItem>,
    val urlCandidates: List<String>,
    val startPositionMs: Long = 0L,
)

data class ProviderSummary(
    val username: String,
    val status: String,
    val expiration: String?,
)
