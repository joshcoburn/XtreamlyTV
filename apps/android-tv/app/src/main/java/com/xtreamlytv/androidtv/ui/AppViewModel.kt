package com.xtreamlytv.androidtv.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.xtreamlytv.androidtv.data.CredentialsStore
import com.xtreamlytv.androidtv.data.XtreamClient
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.Category
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.Credentials
import com.xtreamlytv.androidtv.model.PlayerRequest
import com.xtreamlytv.androidtv.model.ProviderSummary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface AppScreen {
    data object Login : AppScreen
    data object Home : AppScreen
    data class Catalog(val type: ContentType) : AppScreen
    data class Episodes(val series: CatalogItem) : AppScreen
    data class Player(val request: PlayerRequest) : AppScreen
    data object Settings : AppScreen
}

data class AppUiState(
    val screen: AppScreen = AppScreen.Login,
    val loading: Boolean = false,
    val error: String? = null,
    val credentials: Credentials? = null,
    val provider: ProviderSummary? = null,
    val categories: Map<ContentType, List<Category>> = emptyMap(),
    val selectedCategory: Category? = null,
    val items: List<CatalogItem> = emptyList(),
    val favorites: Set<String> = emptySet(),
    val recent: List<CatalogItem> = emptyList(),
)

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val credentialsStore = CredentialsStore(application)
    private var client: XtreamClient? = null
    private val _state = MutableStateFlow(AppUiState())
    val state: StateFlow<AppUiState> = _state.asStateFlow()

    init {
        credentialsStore.load()?.let { connect(it, persist = false) }
    }

    fun connect(credentials: Credentials, persist: Boolean = true) {
        _state.update { it.copy(loading = true, error = null, credentials = credentials) }
        viewModelScope.launch {
            runCatching {
                val candidate = XtreamClient(credentials)
                val profile = candidate.authenticate()
                val categories = ContentType.entries
                    .filter { it != ContentType.EPISODE }
                    .associateWith { type -> runCatching { candidate.categories(type) }.getOrDefault(emptyList()) }
                Triple(candidate, profile, categories)
            }.onSuccess { (candidate, profile, categories) ->
                client = candidate
                if (persist) credentialsStore.save(credentials)
                _state.update {
                    it.copy(
                        screen = AppScreen.Home,
                        loading = false,
                        error = null,
                        provider = profile,
                        categories = categories,
                    )
                }
            }.onFailure { error ->
                _state.update {
                    it.copy(screen = AppScreen.Login, loading = false, error = error.message ?: "Unable to connect.")
                }
            }
        }
    }

    fun openHome() = _state.update { it.copy(screen = AppScreen.Home, error = null) }
    fun openSettings() = _state.update { it.copy(screen = AppScreen.Settings, error = null) }

    fun openCatalog(type: ContentType) {
        val categories = _state.value.categories[type].orEmpty()
        _state.update { it.copy(screen = AppScreen.Catalog(type), selectedCategory = null, items = emptyList(), error = null) }
        categories.firstOrNull()?.let { selectCategory(type, it) }
    }

    fun selectCategory(type: ContentType, category: Category) {
        val api = client ?: return
        _state.update { it.copy(loading = true, selectedCategory = category, error = null) }
        viewModelScope.launch {
            runCatching { api.items(type, category.id) }
                .onSuccess { items -> _state.update { it.copy(loading = false, items = items) } }
                .onFailure { error -> _state.update { it.copy(loading = false, error = error.message ?: "Unable to load category.") } }
        }
    }

    fun activate(item: CatalogItem) {
        when (item.type) {
            ContentType.SERIES -> openEpisodes(item)
            ContentType.LIVE, ContentType.MOVIE, ContentType.EPISODE -> play(item, _state.value.items)
        }
    }

    private fun openEpisodes(series: CatalogItem) {
        val api = client ?: return
        _state.update { it.copy(screen = AppScreen.Episodes(series), loading = true, items = emptyList(), error = null) }
        viewModelScope.launch {
            runCatching { api.seriesEpisodes(series) }
                .onSuccess { episodes -> _state.update { it.copy(loading = false, items = episodes) } }
                .onFailure { error -> _state.update { it.copy(loading = false, error = error.message ?: "Unable to load episodes.") } }
        }
    }

    private fun play(item: CatalogItem, queue: List<CatalogItem>) {
        val api = client ?: return
        val playableQueue = queue.filter { it.type == item.type && it.type != ContentType.SERIES }
        val request = PlayerRequest(item, playableQueue.ifEmpty { listOf(item) }, api.streamCandidates(item))
        addRecent(item)
        _state.update { it.copy(screen = AppScreen.Player(request), error = null) }
    }

    fun playAdjacent(delta: Int) {
        val screen = _state.value.screen as? AppScreen.Player ?: return
        val queue = screen.request.queue
        val currentIndex = queue.indexOfFirst { it.id == screen.request.item.id }
        if (currentIndex < 0 || queue.size < 2) return
        val next = queue[(currentIndex + delta + queue.size) % queue.size]
        play(next, queue)
    }

    fun toggleFavorite(item: CatalogItem) {
        val key = favoriteKey(item)
        _state.update { state ->
            val next = state.favorites.toMutableSet()
            if (!next.add(key)) next.remove(key)
            state.copy(favorites = next)
        }
    }

    fun isFavorite(item: CatalogItem): Boolean = favoriteKey(item) in _state.value.favorites

    private fun addRecent(item: CatalogItem) {
        _state.update { state ->
            state.copy(recent = (listOf(item) + state.recent.filterNot { it.type == item.type && it.id == item.id }).take(30))
        }
    }

    fun disconnect() {
        credentialsStore.clear()
        client = null
        _state.value = AppUiState(screen = AppScreen.Login)
    }

    fun back() {
        when (val screen = _state.value.screen) {
            AppScreen.Login, AppScreen.Home -> Unit
            is AppScreen.Player -> {
                val type = screen.request.item.type
                if (type == ContentType.EPISODE) {
                    _state.update { it.copy(screen = AppScreen.Episodes(CatalogItem("", ContentType.SERIES, "Series"))) }
                } else {
                    _state.update { it.copy(screen = AppScreen.Catalog(type)) }
                }
            }
            is AppScreen.Episodes -> _state.update { it.copy(screen = AppScreen.Catalog(ContentType.SERIES)) }
            is AppScreen.Catalog, AppScreen.Settings -> openHome()
        }
    }

    private fun favoriteKey(item: CatalogItem) = "${item.type}:${item.id}"
}
