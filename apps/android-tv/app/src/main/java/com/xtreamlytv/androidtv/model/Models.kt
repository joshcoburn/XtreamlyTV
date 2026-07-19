package com.xtreamlytv.androidtv.model

enum class ContentType { LIVE, MOVIE, SERIES, EPISODE }

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
)

data class PlayerRequest(
    val item: CatalogItem,
    val queue: List<CatalogItem>,
    val urlCandidates: List<String>,
)

data class ProviderSummary(
    val username: String,
    val status: String,
    val expiration: String?,
)
