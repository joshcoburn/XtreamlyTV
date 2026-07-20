package com.xtreamlytv.androidtv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.data.itemKey
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.ui.theme.palette

@Composable
fun DetailScreen(item: CatalogItem, state: AppUiState, viewModel: AppViewModel) {
    val colors = palette()
    val progress = state.progress[itemKey(item)]
    val favorite = state.favorites.any { it.type == item.type && it.id == item.id }
    val episodes = state.detailEpisodes
    val primaryActionFocus = remember(item.id) { FocusRequester() }
    var selectedSeason by remember(item.id, episodes) {
        mutableStateOf(episodes.mapNotNull { it.season }.distinct().sorted().firstOrNull())
    }
    val visibleEpisodes = if (selectedSeason == null) episodes else episodes.filter { it.season == selectedSeason }

    LaunchedEffect(item.id) {
        primaryActionFocus.requestFocus()
    }

    Column(Modifier.fillMaxSize()) {
        Box(
            Modifier
                .fillMaxWidth()
                .height(if (item.type == ContentType.SERIES) 184.dp else 244.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(colors.panelStrong, colors.accent.copy(alpha = 0.18f), colors.panel.copy(alpha = 0.94f)),
                    ),
                    RoundedCornerShape(18.dp),
                )
                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp)),
        ) {
            Box(
                Modifier
                    .align(Alignment.CenterEnd)
                    .fillMaxWidth(0.55f)
                    .fillMaxHeight()
                    .background(Brush.radialGradient(listOf(colors.accent.copy(alpha = 0.24f), Color.Transparent))),
            )
            Row(Modifier.fillMaxSize().padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Artwork(
                    item = item,
                    modifier = if (item.type == ContentType.LIVE) Modifier.width(104.dp).height(104.dp)
                    else Modifier.width(106.dp).fillMaxHeight(),
                    live = item.type == ContentType.LIVE,
                )
                Spacer(Modifier.width(20.dp))
                Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.Center) {
                    Text(item.type.title().uppercase(), color = colors.accent, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(Modifier.height(5.dp))
                    Text(
                        item.name,
                        color = colors.text,
                        fontSize = if (item.type == ContentType.LIVE) 24.sp else 22.sp,
                        lineHeight = 26.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Spacer(Modifier.height(7.dp))
                    MetadataRow(item)
                    Spacer(Modifier.height(7.dp))
                    Text(
                        item.plot ?: if (item.type == ContentType.LIVE) "Live programming from your connected provider." else "No description supplied by this provider.",
                        color = colors.muted,
                        fontSize = 10.sp,
                        lineHeight = 14.sp,
                        maxLines = if (item.type == ContentType.SERIES) 3 else 5,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.fillMaxWidth(0.88f),
                    )
                    Spacer(Modifier.weight(1f))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (item.type != ContentType.SERIES) {
                            TvButton(
                                label = if (progress != null && progress.positionMs > 30_000L) "Resume ${formatDuration(progress.positionMs)}" else if (item.type == ContentType.LIVE) "Watch now" else "Play",
                                leading = "▶",
                                onClick = { viewModel.play(item) },
                                modifier = Modifier.width(if (progress != null) 154.dp else 100.dp),
                                focusRequester = primaryActionFocus,
                            )
                        }
                        TvButton(
                            label = if (favorite) "Remove favorite" else "Add favorite",
                            leading = if (favorite) "♥" else "♡",
                            onClick = { viewModel.toggleFavorite(item) },
                            modifier = Modifier.width(142.dp),
                            style = TvButtonStyle.Secondary,
                            focusRequester = if (item.type == ContentType.SERIES) primaryActionFocus else null,
                        )
                        TvButton(
                            label = "Back",
                            onClick = viewModel::back,
                            modifier = Modifier.width(76.dp),
                            style = TvButtonStyle.Secondary,
                        )
                    }
                }
            }
        }

        if (item.type == ContentType.SERIES) {
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                SectionHeader("Episodes", "${episodes.size} episodes", Modifier.weight(1f))
                Spacer(Modifier.width(12.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(episodes.mapNotNull { it.season }.distinct().sorted()) { season ->
                        TvChip("Season $season", selectedSeason == season, { selectedSeason = season })
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            if (visibleEpisodes.isEmpty()) {
                EmptyState("No episodes", "This provider did not return episode data for this series.", Modifier.weight(1f))
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(170.dp),
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    contentPadding = PaddingValues(bottom = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(visibleEpisodes, key = { "episode:${it.id}" }) { episode ->
                        EpisodeCard(episode, state, viewModel)
                    }
                }
            }
        }
    }
}

@Composable
private fun MetadataRow(item: CatalogItem) {
    val colors = palette()
    Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) {
        item.channelNumber?.let { MetadataChip("CH $it") }
        item.releaseDate?.take(4)?.takeIf { it.all(Char::isDigit) }?.let { MetadataChip(it) }
        item.genre?.takeIf { it.isNotBlank() }?.let { MetadataChip(it.take(24)) }
        item.rating?.let { MetadataChip("★ ${"%.1f".format(it)}") }
        if (item.type == ContentType.LIVE) Text("LIVE", color = colors.accent, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun MetadataChip(label: String) {
    val colors = palette()
    Text(
        label,
        color = colors.text.copy(alpha = 0.86f),
        fontSize = 8.sp,
        modifier = Modifier
            .background(Color.White.copy(alpha = 0.07f), RoundedCornerShape(50))
            .padding(horizontal = 7.dp, vertical = 3.dp),
    )
}

@Composable
private fun EpisodeCard(episode: CatalogItem, state: AppUiState, viewModel: AppViewModel) {
    val colors = palette()
    val progress = state.progress[itemKey(episode)]
    TvSurface(Modifier.fillMaxWidth().height(68.dp), onClick = { viewModel.play(episode, state.detailEpisodes) }) {
        Row(Modifier.fillMaxSize().padding(9.dp), verticalAlignment = Alignment.CenterVertically) {
            Artwork(episode, Modifier.width(76.dp).fillMaxHeight(), live = false)
            Spacer(Modifier.width(9.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    "S${episode.season ?: 0} E${episode.episode ?: 0}",
                    color = colors.accent,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                )
                Text(episode.name, color = colors.text, fontSize = 10.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                if (progress != null) Text("Resume ${formatDuration(progress.positionMs)}", color = colors.muted, fontSize = 8.sp)
            }
            Text("▶", color = colors.accent, fontSize = 12.sp)
        }
    }
}
