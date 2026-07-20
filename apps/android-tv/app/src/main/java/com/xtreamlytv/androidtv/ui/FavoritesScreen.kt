package com.xtreamlytv.androidtv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.data.itemKey
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.FavoriteGroup
import com.xtreamlytv.androidtv.ui.theme.palette

@Composable
fun FavoritesHomeScreen(state: AppUiState, viewModel: AppViewModel) {
    var filter by remember { mutableStateOf<ContentType?>(null) }
    val filtered = filterItems(state.favorites, filter)
    val recentKeys = state.recent.map(::itemKey).toSet()
    val recentlyWatched = filtered.filter { itemKey(it) in recentKeys }.take(12)
    val groups = systemGroups(state) + state.favoriteGroups.map { it.toDisplayGroup(state) }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Your favorite content, organized your way.",
                color = palette().muted,
                fontSize = 11.sp,
                modifier = Modifier.weight(1f),
            )
            TvButton("Browse all", { viewModel.openFavoriteGroup("all") }, Modifier.width(90.dp), TvButtonStyle.Secondary)
            Spacer(Modifier.width(7.dp))
            TvButton("New group", { viewModel.openFavoriteEditor() }, Modifier.width(96.dp), leading = "+")
        }
        Spacer(Modifier.height(8.dp))
        FilterRow(filter) { filter = it }
        Spacer(Modifier.height(11.dp))

        if (state.favorites.isEmpty()) {
            EmptyState("No favorites yet", "Open a channel, movie, or series and choose Add favorite.")
            return
        }

        if (recentlyWatched.isNotEmpty()) {
            SectionHeader("Recently watched favorites", itemCountLabel(recentlyWatched.size))
            Spacer(Modifier.height(8.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(start = 2.dp, end = 10.dp, bottom = 4.dp),
            ) {
                items(recentlyWatched, key = { itemKey(it) }) { item ->
                    FavoriteMixedCard(item, true, { viewModel.activate(item) }, Modifier.width(164.dp))
                }
            }
            Spacer(Modifier.height(18.dp))
        }

        SectionHeader("My Groups", "Create collections for sports, kids, news, or anything else")
        Spacer(Modifier.height(8.dp))
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(start = 2.dp, end = 10.dp, bottom = 8.dp),
        ) {
            items(groups, key = { it.id }) { group ->
                FavoriteGroupCard(group, { viewModel.openFavoriteGroup(group.id) }, Modifier.width(136.dp))
            }
            item {
                TvSurface(Modifier.width(136.dp).height(84.dp), onClick = { viewModel.openFavoriteEditor() }) {
                    Row(
                        Modifier.fillMaxSize().padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        TvIcon("plus", palette().accent, Modifier.size(22.dp))
                        Spacer(Modifier.width(9.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                            Text("Add Group", color = palette().text, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text("Custom collection", color = palette().muted, fontSize = 8.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FavoriteGroupBrowserScreen(groupId: String, state: AppUiState, viewModel: AppViewModel) {
    var filter by remember(groupId) { mutableStateOf<ContentType?>(null) }
    val groups = systemGroups(state) + state.favoriteGroups.map { it.toDisplayGroup(state) }
    val selected = groups.firstOrNull { it.id == groupId } ?: groups.first()
    val custom = state.favoriteGroups.firstOrNull { it.id == selected.id }
    val filtered = filterItems(selected.items, filter)

    Row(Modifier.fillMaxSize()) {
        Column(
            Modifier
                .width(174.dp)
                .fillMaxHeight()
                .background(palette().panel.copy(alpha = 0.78f), RoundedCornerShape(14.dp))
                .padding(8.dp),
        ) {
            Box(Modifier.fillMaxWidth().height(42.dp), contentAlignment = Alignment.CenterStart) {
                Column(Modifier.padding(horizontal = 8.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Groups", color = palette().text, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(itemCountLabel(state.favorites.size), color = palette().muted, fontSize = 8.sp)
                }
            }
            Spacer(Modifier.height(6.dp))
            LazyColumn(
                Modifier.weight(1f),
                contentPadding = PaddingValues(bottom = 6.dp),
                verticalArrangement = Arrangement.spacedBy(5.dp),
            ) {
                items(groups, key = { it.id }) { group ->
                    FavoriteRailGroup(
                        group = group,
                        active = group.id == selected.id,
                        onClick = { viewModel.openFavoriteGroup(group.id) },
                    )
                }
            }
            TvButton("New group", { viewModel.openFavoriteEditor() }, Modifier.fillMaxWidth(), leading = "+")
        }
        Spacer(Modifier.width(16.dp))
        Column(Modifier.weight(1f).fillMaxHeight()) {
            Row(Modifier.fillMaxWidth().height(52.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text(
                        selected.name,
                        color = palette().text,
                        fontSize = 20.sp,
                        lineHeight = 21.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(itemCountLabel(selected.items.size), color = palette().muted, fontSize = 9.sp, lineHeight = 10.sp)
                }
                if (custom != null) {
                    TvButton("Edit group", { viewModel.openFavoriteEditor(custom.id) }, Modifier.width(94.dp), TvButtonStyle.Secondary)
                    Spacer(Modifier.width(7.dp))
                }
                TvButton("New group", { viewModel.openFavoriteEditor() }, Modifier.width(96.dp), leading = "+")
            }
            Spacer(Modifier.height(7.dp))
            FilterRow(filter) { filter = it }
            Spacer(Modifier.height(9.dp))
            if (filtered.isEmpty()) {
                EmptyState("No items in this group", "Edit the group to add favorites, or choose another filter.")
            } else {
                FavoriteGrid(filtered, viewModel)
            }
        }
    }
}

@Composable
private fun FavoriteRailGroup(group: DisplayGroup, active: Boolean, onClick: () -> Unit) {
    val colors = palette()
    TvSurface(
        modifier = Modifier.fillMaxWidth().height(50.dp),
        onClick = onClick,
        active = active,
        background = if (active) colors.accent.copy(alpha = 0.15f) else Color.Transparent,
        radius = 9.dp,
    ) {
        Row(
            Modifier.fillMaxSize().padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TvIcon(
                name = group.icon,
                color = if (active) colors.accent else group.color.groupColor(),
                modifier = Modifier.size(20.dp),
            )
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    group.name,
                    color = if (active) colors.accent else colors.text,
                    fontSize = 10.sp,
                    lineHeight = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    itemCountLabel(group.items.size),
                    color = colors.muted,
                    fontSize = 8.sp,
                    lineHeight = 9.sp,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
private fun FavoriteGrid(items: List<CatalogItem>, viewModel: AppViewModel) {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val columns = 4
        val visibleRows = 4
        val gap = 8.dp
        val cardHeight = (maxHeight - gap * (visibleRows - 1).toFloat()) / visibleRows.toFloat()
        LazyVerticalGrid(
            columns = GridCells.Fixed(columns),
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(0.dp),
            horizontalArrangement = Arrangement.spacedBy(gap),
            verticalArrangement = Arrangement.spacedBy(gap),
        ) {
            itemsIndexed(items, key = { _, item -> itemKey(item) }) { _, item ->
                FavoriteMixedCard(
                    item = item,
                    favorite = true,
                    onClick = { viewModel.activate(item) },
                    modifier = Modifier.fillMaxWidth(),
                    cardHeight = cardHeight,
                )
            }
        }
    }
}

@Composable
fun FavoriteGroupEditorScreen(groupId: String?, state: AppUiState, viewModel: AppViewModel) {
    val existing = state.favoriteGroups.firstOrNull { it.id == groupId }
    var name by remember(groupId) { mutableStateOf(existing?.name.orEmpty()) }
    var icon by remember(groupId) { mutableStateOf(existing?.icon ?: "folder") }
    var color by remember(groupId) { mutableStateOf(existing?.color ?: "purple") }
    var selectedKeys by remember(groupId) { mutableStateOf(existing?.itemKeys ?: emptySet()) }
    var filter by remember(groupId) { mutableStateOf<ContentType?>(null) }
    val visible = filterItems(state.favorites, filter)

    Row(Modifier.fillMaxSize()) {
        Column(
            Modifier
                .width(230.dp)
                .fillMaxHeight()
                .background(palette().panel.copy(alpha = 0.86f), RoundedCornerShape(14.dp))
                .padding(14.dp),
        ) {
            Text(if (existing == null) "Add Group" else "Edit Group", color = palette().text, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            Text("Choose a name, icon, color, and favorites.", color = palette().muted, fontSize = 9.sp, lineHeight = 12.sp)
            Spacer(Modifier.height(10.dp))
            TvTextField("Group name", name, { name = it.take(36) }, placeholder = "Weekend Movies")
            Spacer(Modifier.height(10.dp))
            Text("Group icon", color = palette().muted, fontSize = 9.sp)
            Spacer(Modifier.height(4.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                items(GROUP_ICONS) { option ->
                    TvSurface(
                        modifier = Modifier.size(34.dp),
                        onClick = { icon = option },
                        active = icon == option,
                        radius = 9.dp,
                    ) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            TvIcon(option, if (icon == option) palette().accent else palette().muted, Modifier.size(18.dp))
                        }
                    }
                }
            }
            Spacer(Modifier.height(9.dp))
            Text("Group color", color = palette().muted, fontSize = 9.sp)
            Spacer(Modifier.height(4.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                items(GROUP_COLORS) { option ->
                    TvSurface(
                        Modifier.size(30.dp),
                        onClick = { color = option },
                        active = color == option,
                        background = option.groupColor(),
                        radius = 15.dp,
                    ) {}
                }
            }
            Spacer(Modifier.height(10.dp))
            Text("${selectedKeys.size} selected favorites", color = palette().accent, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            TvButton(
                "Save group",
                { viewModel.saveFavoriteGroup(groupId, name, icon, color, selectedKeys) },
                Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(6.dp))
            TvButton("Cancel", viewModel::back, Modifier.fillMaxWidth(), TvButtonStyle.Secondary)
            if (existing != null) {
                Spacer(Modifier.height(6.dp))
                TvButton("Delete group", { viewModel.deleteFavoriteGroup(existing.id) }, Modifier.fillMaxWidth(), TvButtonStyle.Danger)
            }
        }
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f).fillMaxHeight()) {
            Text("Choose favorites", color = palette().text, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Text("Press OK to add or remove an item from this group.", color = palette().muted, fontSize = 9.sp)
            Spacer(Modifier.height(7.dp))
            FilterRow(filter) { filter = it }
            Spacer(Modifier.height(8.dp))
            if (visible.isEmpty()) {
                EmptyState("No favorites match this filter", "Add favorites from the catalog first.")
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(4),
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(visible, key = { itemKey(it) }) { item ->
                        val selected = itemKey(item) in selectedKeys
                        SelectableFavoriteCard(
                            item = item,
                            selected = selected,
                            onClick = {
                                selectedKeys = if (selected) selectedKeys - itemKey(item) else selectedKeys + itemKey(item)
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FilterRow(selected: ContentType?, onSelect: (ContentType?) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        TvChip("All", selected == null, { onSelect(null) })
        TvChip("Live TV", selected == ContentType.LIVE, { onSelect(ContentType.LIVE) })
        TvChip("Movies", selected == ContentType.MOVIE, { onSelect(ContentType.MOVIE) })
        TvChip("Series", selected == ContentType.SERIES, { onSelect(ContentType.SERIES) })
    }
}

@Composable
private fun FavoriteMixedCard(
    item: CatalogItem,
    favorite: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    cardHeight: Dp = 82.dp,
) {
    val colors = palette()
    TvSurface(modifier.height(cardHeight), onClick = onClick) {
        Row(Modifier.fillMaxSize().padding(9.dp), verticalAlignment = Alignment.CenterVertically) {
            Artwork(item, Modifier.width(48.dp).height((cardHeight - 18.dp).coerceAtMost(58.dp)), live = item.type == ContentType.LIVE)
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(
                    item.name,
                    color = colors.text,
                    fontSize = 10.sp,
                    lineHeight = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(item.type.title(), color = colors.muted, fontSize = 8.sp, lineHeight = 9.sp)
            }
            if (favorite) TvIcon("heart", colors.danger, Modifier.size(14.dp))
        }
    }
}

@Composable
private fun SelectableFavoriteCard(item: CatalogItem, selected: Boolean, onClick: () -> Unit) {
    TvSurface(Modifier.fillMaxWidth().height(78.dp), onClick = onClick, active = selected) {
        Row(Modifier.fillMaxSize().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Artwork(item, Modifier.width(44.dp).height(52.dp), live = item.type == ContentType.LIVE)
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(item.name, color = palette().text, fontSize = 9.sp, lineHeight = 11.sp, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text(item.type.title(), color = palette().muted, fontSize = 7.sp, lineHeight = 8.sp)
            }
            Text(if (selected) "✓" else "+", color = if (selected) palette().accent else palette().muted, fontSize = 14.sp)
        }
    }
}

@Composable
private fun FavoriteGroupCard(group: DisplayGroup, onClick: () -> Unit, modifier: Modifier = Modifier) {
    TvSurface(modifier.height(84.dp), onClick = onClick, background = group.color.groupColor().copy(alpha = 0.72f)) {
        Row(Modifier.fillMaxSize().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            TvIcon(group.icon, Color.White, Modifier.size(23.dp))
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(
                    group.name,
                    color = Color.White,
                    fontSize = 11.sp,
                    lineHeight = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(itemCountLabel(group.items.size), color = Color.White.copy(alpha = 0.78f), fontSize = 8.sp, lineHeight = 9.sp)
            }
        }
    }
}

private data class DisplayGroup(
    val id: String,
    val name: String,
    val icon: String,
    val color: String,
    val items: List<CatalogItem>,
)

private fun systemGroups(state: AppUiState): List<DisplayGroup> = listOf(
    DisplayGroup("all", "All Favorites", "heart", "purple", state.favorites),
    DisplayGroup("live", "Live TV", "tv", "blue", state.favorites.filter { it.type == ContentType.LIVE }),
    DisplayGroup("movie", "Movies", "popcorn", "teal", state.favorites.filter { it.type == ContentType.MOVIE }),
    DisplayGroup("series", "Series", "play", "orange", state.favorites.filter { it.type == ContentType.SERIES }),
)

private fun FavoriteGroup.toDisplayGroup(state: AppUiState): DisplayGroup = DisplayGroup(
    id = id,
    name = name,
    icon = icon,
    color = color,
    items = state.favorites.filter { itemKey(it) in itemKeys },
)

private fun filterItems(items: List<CatalogItem>, type: ContentType?): List<CatalogItem> =
    if (type == null) items else items.filter { it.type == type }

private fun itemCountLabel(count: Int): String = "$count ${if (count == 1) "item" else "items"}"

private fun String.groupColor(): Color = when (this) {
    "blue" -> Color(0xFF2E78B7)
    "teal" -> Color(0xFF2E8B78)
    "orange" -> Color(0xFFB76524)
    "rose" -> Color(0xFFA64764)
    "lime" -> Color(0xFF708B2C)
    "slate" -> Color(0xFF475569)
    else -> Color(0xFF7244C7)
}

private val GROUP_ICONS = listOf("heart", "tv", "popcorn", "play", "smile", "trophy", "folder", "star")
private val GROUP_COLORS = listOf("purple", "blue", "teal", "orange", "rose", "lime", "slate")
