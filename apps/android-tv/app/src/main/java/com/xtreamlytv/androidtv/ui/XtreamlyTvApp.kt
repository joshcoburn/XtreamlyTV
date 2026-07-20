package com.xtreamlytv.androidtv.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.ui.theme.LocalTvPalette
import com.xtreamlytv.androidtv.ui.theme.palette
import com.xtreamlytv.androidtv.ui.theme.paletteFor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay

@Composable
fun XtreamlyTvApp(
    viewModel: AppViewModel = viewModel(),
    onContentReady: () -> Unit = {},
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    SideEffect { onContentReady() }

    CompositionLocalProvider(LocalTvPalette provides paletteFor(state.settings.theme)) {
        MaterialTheme {
            AppBackground {
                if (state.initializing) {
                    AppLoadingScreen()
                } else {
                    when (val screen = state.screen) {
                        AppScreen.Login -> LoginScreen(state, viewModel::connect)
                        is AppScreen.Player -> PlayerScreen(
                            request = screen.request,
                            favorite = viewModel.isFavorite(screen.request.item),
                            onBack = viewModel::back,
                            onPrevious = { viewModel.playAdjacent(-1) },
                            onNext = { viewModel.playAdjacent(1) },
                            onToggleFavorite = { viewModel.toggleFavorite(screen.request.item) },
                            onProgress = { position, duration ->
                                viewModel.savePlaybackProgress(screen.request.item, position, duration)
                            },
                            onEnded = { viewModel.clearPlaybackProgress(screen.request.item) },
                        )
                        else -> AppShell(state, viewModel)
                    }
                    if (state.loading && state.screen != AppScreen.Login && state.screen !is AppScreen.Player) {
                        LoadingOverlay()
                    }
                }
            }
        }
    }

    BackHandler(
        enabled = !state.initializing && state.screen != AppScreen.Login && state.screen != AppScreen.Home,
    ) { viewModel.back() }
}

@Composable
private fun AppShell(state: AppUiState, viewModel: AppViewModel) {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val sidebarWidth = (maxWidth * 0.162f).coerceIn(154.dp, 188.dp)
        val mainHorizontalPadding = if (maxWidth <= 1000.dp) 24.dp else 32.dp
        val mainVerticalPadding = if (maxHeight <= 600.dp) 17.dp else 25.dp

        Row(Modifier.fillMaxSize()) {
            Sidebar(
                modifier = Modifier.width(sidebarWidth).fillMaxHeight(),
                screen = state.screen,
                viewModel = viewModel,
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .padding(
                        start = mainHorizontalPadding,
                        end = mainHorizontalPadding,
                        top = mainVerticalPadding,
                        bottom = mainVerticalPadding,
                    ),
            ) {
                Topbar(title = screenTitle(state.screen), state = state)
                Spacer(Modifier.height(11.dp))
                state.error?.let {
                    ErrorBanner(it, viewModel::clearError)
                    Spacer(Modifier.height(8.dp))
                }
                Box(Modifier.fillMaxWidth().weight(1f)) {
                    when (val screen = state.screen) {
                        AppScreen.Home -> HomeScreen(state, viewModel)
                        is AppScreen.Catalog -> CatalogScreen(screen.type, state, viewModel)
                        is AppScreen.Detail -> DetailScreen(screen.item, state, viewModel)
                        AppScreen.Favorites -> FavoritesHomeScreen(state, viewModel)
                        is AppScreen.FavoriteGroupBrowser -> FavoriteGroupBrowserScreen(screen.groupId, state, viewModel)
                        is AppScreen.FavoriteGroupEditor -> FavoriteGroupEditorScreen(screen.groupId, state, viewModel)
                        AppScreen.Settings -> SettingsScreen(state, viewModel)
                        else -> Unit
                    }
                }
            }
        }
    }
}

@Composable
private fun Sidebar(
    modifier: Modifier,
    screen: AppScreen,
    viewModel: AppViewModel,
) {
    Column(
        modifier
            .background(Color(0xA6020508))
            .border(width = 1.dp, color = Color.White.copy(alpha = 0.055f))
            .padding(start = 17.dp, end = 13.dp, top = 17.dp, bottom = 20.dp),
    ) {
        BrandLockup(iconSize = 24.dp, wordmarkSize = 16)
        Spacer(Modifier.height(20.dp))
        Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
            SidebarItem("home", "Home", screen.section() == AppSection.Home, viewModel::openHome)
            SidebarItem("tv", "Live TV", screen.section() == AppSection.Live) { viewModel.openCatalog(ContentType.LIVE) }
            SidebarItem("popcorn", "Movies", screen.section() == AppSection.Movies) { viewModel.openCatalog(ContentType.MOVIE) }
            SidebarItem("play", "Series", screen.section() == AppSection.Series) { viewModel.openCatalog(ContentType.SERIES) }
            SidebarItem("heart", "Favorites", screen.section() == AppSection.Favorites, viewModel::openFavorites)
            SidebarItem("settings", "Settings", screen.section() == AppSection.Settings, viewModel::openSettings)
        }
        Spacer(Modifier.weight(1f))
    }
}

@Composable
private fun SidebarItem(icon: String, label: String, active: Boolean, onClick: () -> Unit) {
    val colors = palette()
    TvSurface(
        modifier = Modifier.fillMaxWidth().height(43.dp),
        onClick = onClick,
        active = active,
        background = if (active) colors.accent.copy(alpha = 0.14f) else Color.Transparent,
        radius = 11.dp,
    ) {
        Row(
            Modifier.fillMaxSize().padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TvIcon(
                name = icon,
                color = if (active) colors.accent else colors.muted,
                modifier = Modifier.size(20.dp),
            )
            Spacer(Modifier.width(11.dp))
            Text(
                label,
                color = if (active) colors.accent else colors.muted,
                fontSize = 12.sp,
                fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal,
                maxLines = 1,
            )
        }
    }
}

@Composable
private fun Topbar(title: String, state: AppUiState) {
    val colors = palette()
    Row(Modifier.fillMaxWidth().height(37.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(
            title,
            color = colors.text,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.weight(1f),
        )
        state.provider?.let { provider ->
            Box(Modifier.size(7.dp).background(colors.accent, CircleShape))
            Spacer(Modifier.width(8.dp))
            Text(provider.status.ifBlank { "Connected" }, color = colors.muted, fontSize = 10.sp, maxLines = 1)
            Spacer(Modifier.width(17.dp))
            ClockText()
        }
    }
}

@Composable
private fun ClockText() {
    val colors = palette()
    var clock by remember { mutableStateOf(formatClock()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(30_000L)
            clock = formatClock()
        }
    }
    Text(clock, color = colors.text, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
}

private fun formatClock(): String = SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())

private enum class AppSection { Home, Live, Movies, Series, Favorites, Settings }

private fun AppScreen.section(): AppSection = when (this) {
    AppScreen.Home -> AppSection.Home
    is AppScreen.Catalog -> when (type) {
        ContentType.LIVE -> AppSection.Live
        ContentType.MOVIE -> AppSection.Movies
        ContentType.SERIES, ContentType.EPISODE -> AppSection.Series
    }
    is AppScreen.Detail -> origin.section()
    AppScreen.Favorites, is AppScreen.FavoriteGroupBrowser, is AppScreen.FavoriteGroupEditor -> AppSection.Favorites
    AppScreen.Settings -> AppSection.Settings
    is AppScreen.Player -> origin.section()
    AppScreen.Login -> AppSection.Home
}

private fun screenTitle(screen: AppScreen): String = when (screen) {
    AppScreen.Home -> "Home"
    is AppScreen.Catalog -> screen.type.title()
    is AppScreen.Detail -> when (screen.item.type) {
        ContentType.LIVE -> "Live TV"
        ContentType.MOVIE -> "Movie Details"
        ContentType.SERIES -> "Series Details"
        ContentType.EPISODE -> "Episode Details"
    }
    AppScreen.Favorites -> "Favorites"
    is AppScreen.FavoriteGroupBrowser -> "Favorites"
    is AppScreen.FavoriteGroupEditor -> if (screen.groupId == null) "Add Group" else "Edit Group"
    AppScreen.Settings -> "Settings"
    is AppScreen.Player -> screen.request.item.name
    AppScreen.Login -> "XtreamlyTV"
}
