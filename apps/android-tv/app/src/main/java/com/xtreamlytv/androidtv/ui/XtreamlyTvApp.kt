package com.xtreamlytv.androidtv.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil3.compose.AsyncImage
import com.xtreamlytv.androidtv.R
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.Category
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.Credentials
import com.xtreamlytv.androidtv.ui.theme.BrandTokens

@Composable
fun XtreamlyTvApp(viewModel: AppViewModel = viewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    MaterialTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFF0E5060), BrandTokens.Background),
                        radius = 1400f,
                    )
                )
        ) {
            when (val screen = state.screen) {
                AppScreen.Login -> LoginScreen(state, viewModel::connect)
                is AppScreen.Player -> PlayerScreen(
                    request = screen.request,
                    onBack = viewModel::back,
                    onPrevious = { viewModel.playAdjacent(-1) },
                    onNext = { viewModel.playAdjacent(1) },
                )
                else -> AppShell(state, viewModel)
            }
            if (state.loading && state.screen !is AppScreen.Player) LoadingOverlay()
        }
    }
    BackHandler(enabled = state.screen != AppScreen.Login && state.screen != AppScreen.Home) { viewModel.back() }
}

@Composable
private fun LoginScreen(state: AppUiState, onConnect: (Credentials) -> Unit) {
    var server by remember(state.credentials) { mutableStateOf(state.credentials?.server.orEmpty()) }
    var username by remember(state.credentials) { mutableStateOf(state.credentials?.username.orEmpty()) }
    var password by remember(state.credentials) { mutableStateOf(state.credentials?.password.orEmpty()) }
    val connectFocus = remember { FocusRequester() }
    LaunchedEffect(Unit) { connectFocus.requestFocus() }

    Row(Modifier.fillMaxSize().padding(72.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(20.dp)) {
            BrandLockup(size = 84.dp)
            Text("Live TV, movies and series on your Android TV.", color = BrandTokens.Muted, fontSize = 24.sp)
            Text("No subscriptions or channels are included.", color = BrandTokens.Muted, fontSize = 18.sp)
        }
        Column(
            Modifier
                .width(650.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Color(0xDD0D2230))
                .padding(36.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Text("Connect a provider", color = BrandTokens.Text, fontSize = 34.sp, fontWeight = FontWeight.SemiBold)
            TvTextField("Provider URL", server, { server = it })
            TvTextField("Username", username, { username = it })
            TvTextField("Password", password, { password = it }, password = true)
            state.error?.let { Text(it, color = BrandTokens.Danger, fontSize = 18.sp) }
            FocusButton(
                label = if (state.loading) "Connecting…" else "Connect",
                modifier = Modifier.focusRequester(connectFocus),
                enabled = !state.loading,
            ) {
                if (server.isNotBlank() && username.isNotBlank() && password.isNotBlank()) {
                    onConnect(Credentials(server, username, password))
                }
            }
        }
    }
}

@Composable
private fun AppShell(state: AppUiState, viewModel: AppViewModel) {
    Row(Modifier.fillMaxSize().padding(40.dp)) {
        Sidebar(state.screen, viewModel)
        Spacer(Modifier.width(28.dp))
        Box(Modifier.weight(1f).fillMaxHeight()) {
            when (val screen = state.screen) {
                AppScreen.Home -> HomeScreen(state, viewModel)
                is AppScreen.Catalog -> CatalogScreen(screen.type, state, viewModel)
                is AppScreen.Episodes -> EpisodesScreen(screen.series, state, viewModel)
                AppScreen.Settings -> SettingsScreen(state, viewModel)
                else -> Unit
            }
        }
    }
}

@Composable
private fun Sidebar(screen: AppScreen, viewModel: AppViewModel) {
    Column(
        Modifier
            .width(260.dp)
            .fillMaxHeight()
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xAA071014))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        BrandLockup(size = 42.dp)
        Spacer(Modifier.height(10.dp))
        SidebarButton("Home", screen == AppScreen.Home, viewModel::openHome)
        SidebarButton("Live TV", screen == AppScreen.Catalog(ContentType.LIVE)) { viewModel.openCatalog(ContentType.LIVE) }
        SidebarButton("Movies", screen == AppScreen.Catalog(ContentType.MOVIE)) { viewModel.openCatalog(ContentType.MOVIE) }
        SidebarButton("Series", screen == AppScreen.Catalog(ContentType.SERIES)) { viewModel.openCatalog(ContentType.SERIES) }
        SidebarButton("Settings", screen == AppScreen.Settings) { viewModel.openSettings() }
    }
}

@Composable
private fun HomeScreen(state: AppUiState, viewModel: AppViewModel) {
    LazyColumn(
        contentPadding = PaddingValues(bottom = 48.dp),
        verticalArrangement = Arrangement.spacedBy(28.dp),
    ) {
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Brush.horizontalGradient(listOf(Color(0xFF0D4260), Color(0xFF14A5A2))))
                    .padding(34.dp)
            ) {
                Text("Welcome back", color = BrandTokens.Text, fontSize = 42.sp, fontWeight = FontWeight.Bold)
                Text("Jump back into recently watched content or browse Live TV.", color = BrandTokens.Text, fontSize = 22.sp)
            }
        }
        item {
            Text("Browse your provider", color = BrandTokens.Text, fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                ProviderCard("Live TV", state.categories[ContentType.LIVE].orEmpty().size) { viewModel.openCatalog(ContentType.LIVE) }
                ProviderCard("Movies", state.categories[ContentType.MOVIE].orEmpty().size) { viewModel.openCatalog(ContentType.MOVIE) }
                ProviderCard("Series", state.categories[ContentType.SERIES].orEmpty().size) { viewModel.openCatalog(ContentType.SERIES) }
            }
        }
        if (state.recent.isNotEmpty()) item {
            Text("Recently watched", color = BrandTokens.Text, fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(14.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                items(state.recent, key = { "${it.type}:${it.id}" }) { item ->
                    CatalogCard(item, compact = true, favorite = viewModel.isFavorite(item), onClick = { viewModel.activate(item) })
                }
            }
        }
    }
}

@Composable
private fun CatalogScreen(type: ContentType, state: AppUiState, viewModel: AppViewModel) {
    Column(Modifier.fillMaxSize()) {
        Text(type.title(), color = BrandTokens.Text, fontSize = 38.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(22.dp))
        Row(Modifier.weight(1f)) {
            CategoryRail(type, state.categories[type].orEmpty(), state.selectedCategory, viewModel)
            Spacer(Modifier.width(24.dp))
            CatalogGrid(type, state.items, viewModel)
        }
    }
}

@Composable
private fun CategoryRail(type: ContentType, categories: List<Category>, selected: Category?, viewModel: AppViewModel) {
    LazyColumn(
        modifier = Modifier.width(300.dp).fillMaxHeight().clip(RoundedCornerShape(24.dp)).background(Color(0x990D2230)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(categories, key = { it.id }) { category ->
            SidebarButton(category.name, category.id == selected?.id) { viewModel.selectCategory(type, category) }
        }
    }
}

@Composable
private fun CatalogGrid(type: ContentType, items: List<CatalogItem>, viewModel: AppViewModel) {
    val columns = if (type == ContentType.LIVE) 4 else 5
    LazyVerticalGrid(
        columns = GridCells.Fixed(columns),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(end = 20.dp, bottom = 40.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        items(items, key = { "${it.type}:${it.id}" }) { item ->
            CatalogCard(item, compact = type == ContentType.LIVE, favorite = viewModel.isFavorite(item)) { viewModel.activate(item) }
        }
    }
}

@Composable
private fun EpisodesScreen(series: CatalogItem, state: AppUiState, viewModel: AppViewModel) {
    Column(Modifier.fillMaxSize()) {
        Text(series.name, color = BrandTokens.Text, fontSize = 38.sp, fontWeight = FontWeight.Bold)
        Text("Episodes", color = BrandTokens.Muted, fontSize = 22.sp)
        Spacer(Modifier.height(20.dp))
        CatalogGrid(ContentType.LIVE, state.items, viewModel)
    }
}

@Composable
private fun SettingsScreen(state: AppUiState, viewModel: AppViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(24.dp)) {
        Text("Settings", color = BrandTokens.Text, fontSize = 38.sp, fontWeight = FontWeight.Bold)
        Column(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color(0xAA0D2230)).padding(28.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("Provider", color = BrandTokens.Text, fontSize = 28.sp, fontWeight = FontWeight.SemiBold)
            Text(state.credentials?.server.orEmpty(), color = BrandTokens.Muted, fontSize = 19.sp)
            Text(state.credentials?.username.orEmpty(), color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Password: ••••••••", color = BrandTokens.Muted, fontSize = 19.sp)
        }
        Column(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color(0xAA0D2230)).padding(28.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("About", color = BrandTokens.Text, fontSize = 28.sp, fontWeight = FontWeight.SemiBold)
            Text("Version 0.4.1 · Android TV preview", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Application ID: com.github.xtreamlytv.androidtv", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Device: ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Android ${android.os.Build.VERSION.RELEASE} · API ${android.os.Build.VERSION.SDK_INT}", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Playback engine: AndroidX Media3 ExoPlayer", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("Categories: ${state.categories.values.sumOf { it.size }} indexed", color = BrandTokens.Muted, fontSize = 19.sp)
            Text("No channels or subscriptions are included.", color = BrandTokens.Muted, fontSize = 19.sp)
        }
        FocusButton("Disconnect provider") { viewModel.disconnect() }
    }
}

@Composable
private fun ProviderCard(title: String, count: Int, onClick: () -> Unit) {
    FocusSurface(Modifier.width(280.dp).height(150.dp), onClick) {
        Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Text(title, color = BrandTokens.Text, fontSize = 27.sp, fontWeight = FontWeight.SemiBold)
            Text("$count categories", color = BrandTokens.Muted, fontSize = 18.sp)
        }
    }
}

@Composable
private fun CatalogCard(item: CatalogItem, compact: Boolean, favorite: Boolean, onClick: () -> Unit) {
    val height = if (compact) 190.dp else 430.dp
    FocusSurface(Modifier.fillMaxWidth().height(height), onClick) {
        if (compact) {
            Row(Modifier.fillMaxSize().padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    modifier = Modifier.size(74.dp).clip(RoundedCornerShape(14.dp)).background(Color.White),
                    contentScale = ContentScale.Fit,
                )
                Spacer(Modifier.width(18.dp))
                Column(Modifier.weight(1f)) {
                    Text(item.name, color = BrandTokens.Text, fontSize = 20.sp, maxLines = 3)
                    Text(item.type.title(), color = BrandTokens.Muted, fontSize = 15.sp)
                }
                if (favorite) Text("♥", color = BrandTokens.Danger, fontSize = 22.sp)
            }
        } else {
            Column(Modifier.fillMaxSize()) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp)),
                    contentScale = ContentScale.Crop,
                )
                Column(Modifier.padding(12.dp)) {
                    Text(item.name, color = BrandTokens.Text, fontSize = 17.sp, maxLines = 2)
                    Text(item.rating?.let { "★ $it" } ?: item.type.title(), color = BrandTokens.Muted, fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
private fun TvTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    password: Boolean = false,
) {
    var focused by remember { mutableStateOf(false) }
    Box(
        Modifier.fillMaxWidth().height(70.dp).clip(RoundedCornerShape(16.dp))
            .background(Color(0xCC071014))
            .border(if (focused) 3.dp else 1.dp, if (focused) BrandTokens.Accent else Color(0xFF365364), RoundedCornerShape(16.dp))
            .onFocusChanged { focused = it.isFocused }
            .padding(horizontal = 18.dp),
        contentAlignment = Alignment.CenterStart,
    ) {
        if (value.isEmpty()) Text(label, color = BrandTokens.Muted, fontSize = 19.sp)
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            textStyle = TextStyle(color = BrandTokens.Text, fontSize = 20.sp),
            cursorBrush = SolidColor(BrandTokens.Accent),
            visualTransformation = if (password) PasswordVisualTransformation() else VisualTransformation.None,
        )
    }
}

@Composable
private fun FocusButton(label: String, modifier: Modifier = Modifier, enabled: Boolean = true, onClick: () -> Unit) {
    FocusSurface(modifier.height(64.dp), onClick, enabled) {
        Box(Modifier.fillMaxSize().padding(horizontal = 28.dp), contentAlignment = Alignment.Center) {
            Text(label, color = BrandTokens.Text, fontSize = 21.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun SidebarButton(label: String, active: Boolean, onClick: () -> Unit) {
    FocusSurface(Modifier.fillMaxWidth().height(58.dp), onClick, activeFill = active) {
        Box(Modifier.fillMaxSize().padding(horizontal = 18.dp), contentAlignment = Alignment.CenterStart) {
            Text(label, color = if (active) BrandTokens.Accent else BrandTokens.Text, fontSize = 20.sp, maxLines = 1)
        }
    }
}

@Composable
private fun FocusSurface(
    modifier: Modifier,
    onClick: () -> Unit,
    enabled: Boolean = true,
    activeFill: Boolean = false,
    content: @Composable () -> Unit,
) {
    var focused by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (focused) 1.035f else 1f, label = "focusScale")
    val border by animateColorAsState(if (focused) BrandTokens.Accent else Color(0x443F7087), label = "focusBorder")
    val background by animateColorAsState(
        if (activeFill) Color(0xAA0D7D74) else Color(0xCC0D2230),
        label = "focusBackground",
    )
    Box(
        modifier
            .scale(scale)
            .clip(RoundedCornerShape(18.dp))
            .background(background)
            .border(if (focused) 4.dp else 1.dp, border, RoundedCornerShape(18.dp))
            .onFocusChanged { focused = it.isFocused }
            .clickable(enabled = enabled, onClick = onClick)
            .focusable(enabled),
    ) { content() }
}

@Composable
private fun BrandLockup(size: androidx.compose.ui.unit.Dp) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(painterResource(R.drawable.xtreamlytv_icon), contentDescription = null, modifier = Modifier.size(size))
        Text("treamlyTV", color = BrandTokens.Text, fontSize = (size.value * 0.52f).sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun LoadingOverlay() {
    Box(Modifier.fillMaxSize().background(Color(0x66000000)), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = BrandTokens.Accent)
    }
}

private fun ContentType.title() = when (this) {
    ContentType.LIVE -> "Live TV"
    ContentType.MOVIE -> "Movies"
    ContentType.SERIES -> "Series"
    ContentType.EPISODE -> "Episode"
}
