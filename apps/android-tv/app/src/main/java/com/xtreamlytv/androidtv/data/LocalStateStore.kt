package com.xtreamlytv.androidtv.data

import android.content.Context
import com.xtreamlytv.androidtv.model.AppSettings
import com.xtreamlytv.androidtv.model.AppTheme
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.FavoriteGroup
import com.xtreamlytv.androidtv.model.PlaybackProgress
import com.xtreamlytv.androidtv.model.StreamFormat
import org.json.JSONArray
import org.json.JSONObject

/**
 * Local, device-only application state. Provider credentials remain in
 * [CredentialsStore]; this store mirrors the webOS state model for settings,
 * favorites, favorite groups, recent items, and playback progress.
 */
class LocalStateStore(context: Context) {
    private val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    fun load(): LocalAppState = runCatching {
        LocalAppState(
            settings = AppSettings(
                theme = AppTheme.fromId(preferences.getString(KEY_THEME, null)),
                streamFormat = StreamFormat.fromId(preferences.getString(KEY_STREAM_FORMAT, null)),
                maxCachedCategories = preferences.getInt(KEY_CACHE_SIZE, DEFAULT_CACHE_SIZE).coerceIn(2, 5),
            ),
            favorites = parseItems(preferences.getString(KEY_FAVORITES, null)).distinctBy(::itemKey).take(250),
            favoriteGroups = parseGroups(preferences.getString(KEY_GROUPS, null)).take(24),
            recent = parseItems(preferences.getString(KEY_RECENT, null)).distinctBy(::itemKey).take(40),
            progress = parseProgress(preferences.getString(KEY_PROGRESS, null)),
        )
    }.getOrDefault(LocalAppState())

    fun saveSettings(settings: AppSettings) {
        preferences.edit()
            .putString(KEY_THEME, settings.theme.id)
            .putString(KEY_STREAM_FORMAT, settings.streamFormat.id)
            .putInt(KEY_CACHE_SIZE, settings.maxCachedCategories.coerceIn(2, 5))
            .apply()
    }

    fun saveFavorites(items: List<CatalogItem>) {
        preferences.edit().putString(KEY_FAVORITES, itemsToJson(items.take(250)).toString()).apply()
    }

    fun saveFavoriteGroups(groups: List<FavoriteGroup>) {
        val array = JSONArray()
        groups.take(24).forEach { group -> array.put(groupToJson(group)) }
        preferences.edit().putString(KEY_GROUPS, array.toString()).apply()
    }

    fun saveRecent(items: List<CatalogItem>) {
        preferences.edit().putString(KEY_RECENT, itemsToJson(items.take(40)).toString()).apply()
    }

    fun saveProgress(progress: Map<String, PlaybackProgress>) {
        val root = JSONObject()
        progress.forEach { (key, value) ->
            root.put(
                key,
                JSONObject()
                    .put("positionMs", value.positionMs)
                    .put("durationMs", value.durationMs)
                    .put("updatedAt", value.updatedAt),
            )
        }
        preferences.edit().putString(KEY_PROGRESS, root.toString()).apply()
    }

    fun clearHistory() {
        preferences.edit().remove(KEY_RECENT).remove(KEY_PROGRESS).apply()
    }

    fun clearAll() {
        preferences.edit().clear().apply()
    }

    private fun parseItems(raw: String?): List<CatalogItem> {
        if (raw.isNullOrBlank()) return emptyList()
        val array = JSONArray(raw)
        return buildList {
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index)?.toCatalogItem() ?: continue
                add(item)
            }
        }
    }

    private fun parseGroups(raw: String?): List<FavoriteGroup> {
        if (raw.isNullOrBlank()) return emptyList()
        val array = JSONArray(raw)
        return buildList {
            for (index in 0 until array.length()) {
                val value = array.optJSONObject(index) ?: continue
                val id = value.optString("id").trim()
                if (id.isBlank()) continue
                val keysArray = value.optJSONArray("itemKeys") ?: JSONArray()
                val keys = buildSet {
                    for (keyIndex in 0 until keysArray.length()) {
                        val key = keysArray.optString(keyIndex)
                        if (key.matches(FAVORITE_KEY_PATTERN)) add(key)
                    }
                }
                add(
                    FavoriteGroup(
                        id = id,
                        name = value.optString("name", "Untitled group").trim().take(36).ifBlank { "Untitled group" },
                        icon = value.optString("icon", "folder").takeIf { it in ALLOWED_ICONS } ?: "folder",
                        color = value.optString("color", "purple").takeIf { it in ALLOWED_COLORS } ?: "purple",
                        itemKeys = keys.take(250).toSet(),
                        createdAt = value.optLong("createdAt", System.currentTimeMillis()),
                        updatedAt = value.optLong("updatedAt", System.currentTimeMillis()),
                    ),
                )
            }
        }.distinctBy { it.id }
    }

    private fun parseProgress(raw: String?): Map<String, PlaybackProgress> {
        if (raw.isNullOrBlank()) return emptyMap()
        val root = JSONObject(raw)
        return buildMap {
            val keys = root.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = root.optJSONObject(key) ?: continue
                val position = value.optLong("positionMs", -1L)
                if (position < 0L) continue
                put(
                    key,
                    PlaybackProgress(
                        positionMs = position,
                        durationMs = value.optLong("durationMs", 0L).coerceAtLeast(0L),
                        updatedAt = value.optLong("updatedAt", System.currentTimeMillis()),
                    ),
                )
            }
        }
    }

    private fun itemsToJson(items: List<CatalogItem>): JSONArray = JSONArray().also { array ->
        items.forEach { item -> array.put(itemToJson(item)) }
    }

    private fun itemToJson(item: CatalogItem): JSONObject = JSONObject()
        .put("id", item.id)
        .put("type", item.type.name)
        .put("name", item.name)
        .putNullable("categoryId", item.categoryId)
        .putNullable("imageUrl", item.imageUrl)
        .putNullable("containerExtension", item.containerExtension)
        .putNullable("rating", item.rating)
        .putNullable("plot", item.plot)
        .putNullable("season", item.season)
        .putNullable("episode", item.episode)
        .putNullable("channelNumber", item.channelNumber)
        .putNullable("genre", item.genre)
        .putNullable("releaseDate", item.releaseDate)
        .putNullable("parentSeriesId", item.parentSeriesId)
        .putNullable("parentSeriesName", item.parentSeriesName)
        .putNullable("parentSeriesImageUrl", item.parentSeriesImageUrl)

    private fun groupToJson(group: FavoriteGroup): JSONObject {
        val keys = JSONArray()
        group.itemKeys.take(250).forEach { key -> keys.put(key) }
        return JSONObject()
            .put("id", group.id)
            .put("name", group.name.take(36))
            .put("icon", group.icon)
            .put("color", group.color)
            .put("itemKeys", keys)
            .put("createdAt", group.createdAt)
            .put("updatedAt", group.updatedAt)
    }

    private fun JSONObject.toCatalogItem(): CatalogItem? {
        val id = optString("id").trim()
        val name = optString("name").trim()
        val type = runCatching { ContentType.valueOf(optString("type")) }.getOrNull()
        if (id.isBlank() || name.isBlank() || type == null) return null
        return CatalogItem(
            id = id,
            type = type,
            name = name,
            categoryId = nullableString("categoryId"),
            imageUrl = nullableString("imageUrl"),
            containerExtension = nullableString("containerExtension"),
            rating = nullableDouble("rating"),
            plot = nullableString("plot"),
            season = nullableInt("season"),
            episode = nullableInt("episode"),
            channelNumber = nullableString("channelNumber"),
            genre = nullableString("genre"),
            releaseDate = nullableString("releaseDate"),
            parentSeriesId = nullableString("parentSeriesId"),
            parentSeriesName = nullableString("parentSeriesName"),
            parentSeriesImageUrl = nullableString("parentSeriesImageUrl"),
        )
    }

    private fun JSONObject.putNullable(key: String, value: Any?): JSONObject = apply {
        if (value == null) put(key, JSONObject.NULL) else put(key, value)
    }

    private fun JSONObject.nullableString(key: String): String? =
        if (!has(key) || isNull(key)) null else optString(key).takeIf { it.isNotBlank() }

    private fun JSONObject.nullableInt(key: String): Int? =
        if (!has(key) || isNull(key)) null else optInt(key)

    private fun JSONObject.nullableDouble(key: String): Double? =
        if (!has(key) || isNull(key)) null else optDouble(key).takeIf { !it.isNaN() }

    private companion object {
        const val PREFERENCES_NAME = "xtreamlytv.state.v1"
        const val KEY_THEME = "settings.theme"
        const val KEY_STREAM_FORMAT = "settings.streamFormat"
        const val KEY_CACHE_SIZE = "settings.maxCachedCategories"
        const val KEY_FAVORITES = "favorites"
        const val KEY_GROUPS = "favoriteGroups"
        const val KEY_RECENT = "recent"
        const val KEY_PROGRESS = "progress"
        const val DEFAULT_CACHE_SIZE = 3
        val FAVORITE_KEY_PATTERN = Regex("^(LIVE|MOVIE|SERIES|EPISODE):.+$")
        val ALLOWED_ICONS = setOf("heart", "tv", "popcorn", "play", "smile", "trophy", "folder", "star")
        val ALLOWED_COLORS = setOf("purple", "blue", "teal", "orange", "rose", "lime", "slate")
    }
}

data class LocalAppState(
    val settings: AppSettings = AppSettings(),
    val favorites: List<CatalogItem> = emptyList(),
    val favoriteGroups: List<FavoriteGroup> = emptyList(),
    val recent: List<CatalogItem> = emptyList(),
    val progress: Map<String, PlaybackProgress> = emptyMap(),
)

fun itemKey(item: CatalogItem): String = "${item.type}:${item.id}"
