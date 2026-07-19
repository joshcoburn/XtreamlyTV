package com.xtreamlytv.androidtv.data

import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.Category
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.Credentials
import com.xtreamlytv.androidtv.model.ProviderSummary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

class XtreamClient(
    private val credentials: Credentials,
    private val http: OkHttpClient = defaultHttpClient(),
) {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true; coerceInputValues = true }
    private val server = credentials.server.trim().trimEnd('/')

    suspend fun authenticate(): ProviderSummary = withContext(Dispatchers.IO) {
        val root = requestJson(null)
        val info = root.obj("user_info") ?: error("Provider returned an invalid authentication response.")
        if (info.string("auth") != "1") {
            error(info.string("message").ifBlank { "Login was rejected by the provider." })
        }
        ProviderSummary(
            username = info.string("username").ifBlank { credentials.username },
            status = info.string("status").ifBlank { "Active" },
            expiration = info.string("exp_date").nullIfBlank(),
        )
    }

    suspend fun categories(type: ContentType): List<Category> = withContext(Dispatchers.IO) {
        val action = when (type) {
            ContentType.LIVE -> "get_live_categories"
            ContentType.MOVIE -> "get_vod_categories"
            ContentType.SERIES -> "get_series_categories"
            ContentType.EPISODE -> error("Episodes do not have top-level categories")
        }
        normalizeCollection(requestJson(action), preferredCategoryKeys(type)).mapNotNull { element ->
            val obj = element as? JsonObject ?: return@mapNotNull null
            val id = obj.string("category_id").ifBlank { obj.string("id") }
            if (id.isBlank()) null else Category(id, obj.string("category_name").ifBlank { "Category $id" })
        }
    }

    suspend fun items(type: ContentType, categoryId: String): List<CatalogItem> = withContext(Dispatchers.IO) {
        val action = when (type) {
            ContentType.LIVE -> "get_live_streams"
            ContentType.MOVIE -> "get_vod_streams"
            ContentType.SERIES -> "get_series"
            ContentType.EPISODE -> error("Use seriesEpisodes")
        }
        val response = runCatching { requestJson(action, mapOf("category_id" to categoryId)) }
            .recoverCatching {
                if (type == ContentType.SERIES) requestJson("get_series_streams", mapOf("category_id" to categoryId))
                else throw it
            }.getOrThrow()
        normalizeCollection(response, preferredItemKeys(type)).mapNotNull { parseItem(it, type) }
    }

    suspend fun seriesEpisodes(series: CatalogItem): List<CatalogItem> = withContext(Dispatchers.IO) {
        val root = requestJson("get_series_info", mapOf("series_id" to series.id))
        val episodes = root.obj("episodes") ?: return@withContext emptyList()
        episodes.entries
            .sortedBy { it.key.toIntOrNull() ?: Int.MAX_VALUE }
            .flatMap { (seasonKey, value) ->
                val season = seasonKey.toIntOrNull()
                normalizeCollection(value).mapNotNull { element ->
                    val item = parseItem(element, ContentType.EPISODE) ?: return@mapNotNull null
                    item.copy(season = item.season ?: season, imageUrl = item.imageUrl ?: series.imageUrl)
                }
            }
    }

    fun streamCandidates(item: CatalogItem): List<String> = StreamUrlBuilder.candidates(credentials, item)

    private fun requestJson(action: String?, extras: Map<String, String> = emptyMap()): JsonObject {
        val base = "$server/player_api.php".toHttpUrlOrNull() ?: error("Provider URL is invalid.")
        val builder = base.newBuilder()
            .addQueryParameter("username", credentials.username)
            .addQueryParameter("password", credentials.password)
        if (!action.isNullOrBlank()) builder.addQueryParameter("action", action)
        extras.forEach { (key, value) -> builder.addQueryParameter(key, value) }
        val request = Request.Builder().url(builder.build()).get().build()
        http.newCall(request).execute().use { response ->
            if (!response.isSuccessful) error("Provider returned HTTP ${response.code}.")
            val body = response.body?.string().orEmpty()
            val element = runCatching { json.parseToJsonElement(body) }
                .getOrElse { error("Provider returned invalid JSON.") }
            return element as? JsonObject ?: JsonObject(mapOf("data" to element))
        }
    }

    private fun parseItem(element: JsonElement, type: ContentType): CatalogItem? {
        val obj = element as? JsonObject ?: return null
        val id = when (type) {
            ContentType.SERIES -> obj.string("series_id").ifBlank { obj.string("id") }
            ContentType.EPISODE -> obj.string("id").ifBlank { obj.string("episode_id").ifBlank { obj.string("stream_id") } }
            else -> obj.string("stream_id").ifBlank { obj.string("id") }
        }
        if (id.isBlank()) return null
        val name = obj.string("name").ifBlank { obj.string("title").ifBlank { "Untitled" } }
        val image = when (type) {
            ContentType.LIVE -> obj.string("stream_icon")
            ContentType.MOVIE -> obj.string("stream_icon").ifBlank { obj.string("cover") }
            ContentType.SERIES -> obj.string("cover").ifBlank { obj.string("stream_icon") }
            ContentType.EPISODE -> obj.obj("info")?.string("movie_image").orEmpty().ifBlank { obj.string("cover") }
        }.nullIfBlank()
        val rating = obj.primitive("rating")?.doubleOrNull
            ?: obj.primitive("rating_5based")?.doubleOrNull
        return CatalogItem(
            id = id,
            type = type,
            name = name,
            categoryId = obj.string("category_id").nullIfBlank(),
            imageUrl = image,
            containerExtension = obj.string("container_extension").nullIfBlank(),
            rating = rating,
            plot = obj.string("plot").ifBlank { obj.string("description") }.nullIfBlank(),
            season = obj.primitive("season")?.intOrNull,
            episode = obj.primitive("episode_num")?.intOrNull,
        )
    }

    private fun normalizeCollection(element: JsonElement, preferredKeys: List<String> = emptyList()): List<JsonElement> {
        if (element is JsonArray) return element
        if (element !is JsonObject) return emptyList()
        val keys = preferredKeys + listOf("data", "results", "items", "streams", "channels", "movies", "series", "categories")
        keys.forEach { key -> (element[key] as? JsonArray)?.let { return it } }
        return element.values.filterIsInstance<JsonObject>()
    }

    private fun preferredCategoryKeys(type: ContentType) = when (type) {
        ContentType.LIVE -> listOf("live_categories")
        ContentType.MOVIE -> listOf("vod_categories")
        ContentType.SERIES -> listOf("series_categories")
        ContentType.EPISODE -> emptyList()
    }

    private fun preferredItemKeys(type: ContentType) = when (type) {
        ContentType.LIVE -> listOf("live_streams")
        ContentType.MOVIE -> listOf("vod_streams")
        ContentType.SERIES -> listOf("series")
        ContentType.EPISODE -> listOf("episodes")
    }

    companion object {
        private fun defaultHttpClient() = OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }
}

private fun JsonObject.obj(key: String): JsonObject? = this[key] as? JsonObject
private fun JsonObject.primitive(key: String): JsonPrimitive? = this[key] as? JsonPrimitive
private fun JsonObject.string(key: String): String = primitive(key)?.contentOrNull.orEmpty()
private fun String.nullIfBlank(): String? = takeIf { it.isNotBlank() }
