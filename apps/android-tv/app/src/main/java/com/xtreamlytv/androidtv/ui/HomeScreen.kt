package com.xtreamlytv.androidtv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.data.itemKey
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.ui.theme.palette

@Composable
fun HomeScreen(state: AppUiState, viewModel: AppViewModel) {
    val recent = state.recent.distinctBy(::itemKey)
    val featured = recent.firstOrNull()
    val livePreview = recent.filter { it.type == ContentType.LIVE }.take(7)
    val moviePreview = recent.filter { it.type == ContentType.MOVIE }.take(7)
    val seriesPreview = recent
        .map { item ->
            if (
                item.type == ContentType.EPISODE &&
                !item.parentSeriesId.isNullOrBlank() &&
                !item.parentSeriesName.isNullOrBlank()
            ) {
                CatalogItem(
                    id = item.parentSeriesId,
                    type = ContentType.SERIES,
                    name = item.parentSeriesName,
                    imageUrl = item.parentSeriesImageUrl ?: item.imageUrl,
                )
            } else item
        }
        .filter { it.type == ContentType.SERIES }
        .distinctBy(::itemKey)
        .take(7)

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 2.dp, end = 10.dp, top = 3.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item { HomeHero(featured, viewModel) }
        item {
            SectionHeader("Browse your provider")
            Spacer(Modifier.height(9.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ProviderShortcut(
                    type = ContentType.LIVE,
                    count = state.categories[ContentType.LIVE].orEmpty().size,
                    catalogsLoading = state.catalogsLoading,
                    modifier = Modifier.weight(1f),
                ) { viewModel.openCatalog(ContentType.LIVE) }
                ProviderShortcut(
                    type = ContentType.MOVIE,
                    count = state.categories[ContentType.MOVIE].orEmpty().size,
                    catalogsLoading = state.catalogsLoading,
                    modifier = Modifier.weight(1f),
                ) { viewModel.openCatalog(ContentType.MOVIE) }
                ProviderShortcut(
                    type = ContentType.SERIES,
                    count = state.categories[ContentType.SERIES].orEmpty().size,
                    catalogsLoading = state.catalogsLoading,
                    modifier = Modifier.weight(1f),
                ) { viewModel.openCatalog(ContentType.SERIES) }
            }
        }
        if (recent.isNotEmpty()) {
            item {
                ContentRail(
                    title = "Continue watching",
                    items = recent.take(8),
                    state = state,
                    onClick = viewModel::activate,
                )
            }
        }
        if (livePreview.isNotEmpty()) {
            item {
                ContentRail(
                    title = "Recently watched channels",
                    items = livePreview,
                    state = state,
                    onClick = viewModel::activate,
                    meta = "${livePreview.size} ${if (livePreview.size == 1) "channel" else "channels"}",
                )
            }
        }
        if (moviePreview.isNotEmpty()) {
            item {
                ContentRail(
                    title = "Recently watched movies",
                    items = moviePreview,
                    state = state,
                    onClick = viewModel::activate,
                    meta = "${moviePreview.size} ${if (moviePreview.size == 1) "title" else "titles"}",
                )
            }
        }
        if (seriesPreview.isNotEmpty()) {
            item {
                ContentRail(
                    title = "Recently watched series",
                    items = seriesPreview,
                    state = state,
                    onClick = viewModel::activate,
                    meta = "${seriesPreview.size} ${if (seriesPreview.size == 1) "title" else "titles"}",
                )
            }
        }
    }
}

@Composable
private fun HomeHero(featured: CatalogItem?, viewModel: AppViewModel) {
    val colors = palette()
    val primaryFocus = remember(featured?.id) { FocusRequester() }

    LaunchedEffect(featured?.id) {
        primaryFocus.requestFocus()
    }

    Box(
        Modifier
            .fillMaxWidth()
            .height(158.dp)
            .background(
                Brush.horizontalGradient(
                    listOf(colors.panelStrong, colors.accent.copy(alpha = 0.20f), colors.panel.copy(alpha = 0.88f)),
                ),
                RoundedCornerShape(18.dp),
            )
            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp)),
    ) {
        Box(
            Modifier
                .align(Alignment.CenterEnd)
                .fillMaxSize(0.62f)
                .background(Brush.radialGradient(listOf(colors.accent.copy(alpha = 0.30f), Color.Transparent))),
        )
        Column(Modifier.fillMaxSize().padding(horizontal = 26.dp, vertical = 20.dp)) {
            Text(
                featured?.name ?: "Live TV, movies, and series without the lag",
                color = colors.text,
                fontSize = 24.sp,
                lineHeight = 27.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
            )
            Spacer(Modifier.height(7.dp))
            Text(
                if (featured != null) "Jump back into recently watched content or browse Live TV."
                else "Browse Live TV, movies, and series from your provider.",
                color = colors.muted,
                fontSize = 11.sp,
                lineHeight = 15.sp,
                modifier = Modifier.fillMaxWidth(0.60f),
                maxLines = 2,
            )
            Spacer(Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (featured != null) {
                    TvButton(
                        label = if (featured.type == ContentType.LIVE) "Watch now" else "Open details",
                        leading = "▶",
                        onClick = { viewModel.activate(featured) },
                        modifier = Modifier.width(116.dp),
                        focusRequester = primaryFocus,
                    )
                }
                TvButton(
                    label = "Browse Live TV",
                    onClick = { viewModel.openCatalog(ContentType.LIVE) },
                    style = TvButtonStyle.Secondary,
                    modifier = Modifier.width(122.dp),
                    focusRequester = if (featured == null) primaryFocus else null,
                )
            }
        }
    }
}

@Composable
private fun ProviderShortcut(
    type: ContentType,
    count: Int,
    catalogsLoading: Boolean,
    modifier: Modifier,
    onClick: () -> Unit,
) {
    val colors = palette()
    TvSurface(modifier.height(62.dp), onClick = onClick) {
        Row(Modifier.fillMaxSize().padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(32.dp).background(colors.accent.copy(alpha = 0.18f), RoundedCornerShape(9.dp)),
                contentAlignment = Alignment.Center,
            ) {
                TvIcon(type.iconName(), colors.accent, Modifier.size(18.dp))
            }
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(type.title(), color = colors.text, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text(
                    if (catalogsLoading && count == 0) "Loading categories…" else "$count categories",
                    color = colors.muted,
                    fontSize = 9.sp,
                )
            }
            Text("›", color = colors.accent, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ContentRail(
    title: String,
    items: List<CatalogItem>,
    state: AppUiState,
    onClick: (CatalogItem) -> Unit,
    meta: String = "${items.size} ${if (items.size == 1) "item" else "items"}",
) {
    SectionHeader(title, meta)
    Spacer(Modifier.height(9.dp))
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(9.dp),
        contentPadding = PaddingValues(start = 2.dp, end = 12.dp, bottom = 4.dp),
    ) {
        items(items, key = { itemKey(it) }) { item ->
            val favorite = state.favorites.any { it.type == item.type && it.id == item.id }
            if (item.type == ContentType.LIVE) {
                LiveItemCard(item, favorite, { onClick(item) }, Modifier.width(154.dp))
            } else {
                PosterItemCard(item, favorite, { onClick(item) }, Modifier.width(104.dp))
            }
        }
    }
}
