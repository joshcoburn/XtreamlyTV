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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusProperties
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.Category
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.ui.theme.palette
import kotlinx.coroutines.delay

@Composable
fun CatalogScreen(type: ContentType, state: AppUiState, viewModel: AppViewModel) {
    val selected = state.selectedCategories[type]
    val query = state.searchQuery.trim()
    val filtered = if (query.isBlank()) state.items else state.items.filter { it.name.contains(query, ignoreCase = true) }
    val firstCardFocus = remember(type, selected?.id, query) { FocusRequester() }
    val selectedCategoryFocus = remember(type, selected?.id) { FocusRequester() }

    Row(Modifier.fillMaxSize()) {
        CategoryRail(
            categories = state.categories[type].orEmpty(),
            selected = selected,
            loading = state.catalogsLoading,
            onSelect = { viewModel.selectCategory(type, it) },
            rightFocusRequester = firstCardFocus,
            selectedFocusRequester = selectedCategoryFocus,
            hasCards = filtered.isNotEmpty(),
            modifier = Modifier.width(174.dp).fillMaxHeight(),
        )
        Spacer(Modifier.width(16.dp))
        Column(Modifier.weight(1f).fillMaxHeight()) {
            Row(
                Modifier.fillMaxWidth().height(42.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                SearchField(
                    value = state.searchQuery,
                    onValueChange = viewModel::setSearchQuery,
                    placeholder = "Search loaded ${type.title().lowercase()}",
                    modifier = Modifier.weight(1f),
                )
                Spacer(Modifier.width(12.dp))
                Text(
                    "${filtered.size} ${if (filtered.size == 1) "item" else "items"}",
                    color = palette().muted,
                    fontSize = 10.sp,
                    modifier = Modifier.width(82.dp),
                )
            }
            Spacer(Modifier.height(10.dp))
            when {
                state.catalogsLoading && state.categories[type].isNullOrEmpty() ->
                    EmptyState("Loading categories…", "Your provider library will appear here in a moment.")
                selected == null ->
                    EmptyState("No categories", "This provider did not return any ${type.title().lowercase()} categories.")
                filtered.isEmpty() && query.isNotBlank() ->
                    EmptyState("No matches", "Try a different search term.")
                filtered.isEmpty() ->
                    EmptyState("Nothing loaded", "Choose another category or try again later.")
                else -> CatalogGrid(
                    type = type,
                    catalogItems = filtered,
                    state = state,
                    viewModel = viewModel,
                    firstCardFocus = firstCardFocus,
                    selectedCategoryFocus = selectedCategoryFocus,
                )
            }
        }
    }
}

@Composable
private fun CategoryRail(
    categories: List<Category>,
    selected: Category?,
    loading: Boolean,
    onSelect: (Category) -> Unit,
    rightFocusRequester: FocusRequester,
    selectedFocusRequester: FocusRequester,
    hasCards: Boolean,
    modifier: Modifier = Modifier,
) {
    val colors = palette()
    val listState = rememberLazyListState()
    val selectedIndex = categories.indexOfFirst { it.id == selected?.id }

    LaunchedEffect(selected?.id, categories.size) {
        if (selectedIndex >= 0) {
            listState.scrollToItem(selectedIndex)
            delay(32L)
            runCatching { selectedFocusRequester.requestFocus() }
        }
    }

    Column(
        modifier
            .background(colors.panel.copy(alpha = 0.78f), RoundedCornerShape(14.dp))
            .padding(8.dp),
    ) {
        Box(Modifier.fillMaxWidth().height(42.dp), contentAlignment = Alignment.CenterStart) {
            Text(
                "Categories",
                color = colors.text,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp),
            )
        }
        Spacer(Modifier.height(10.dp))
        if (categories.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    if (loading) "Loading…" else "No categories",
                    color = colors.muted,
                    fontSize = 10.sp,
                )
            }
        } else {
            BoxWithConstraints(Modifier.fillMaxSize()) {
                val visibleRows = 10
                val gap = 4.dp
                val rowHeight = (maxHeight - gap * (visibleRows - 1).toFloat()) / visibleRows.toFloat()
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(0.dp),
                    verticalArrangement = Arrangement.spacedBy(gap),
                ) {
                    items(categories, key = { it.id }) { category ->
                        val active = category.id == selected?.id
                        val direction = if (hasCards) {
                            Modifier.focusProperties { right = rightFocusRequester }
                        } else {
                            Modifier
                        }
                        TvSurface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(rowHeight)
                                .then(direction),
                            onClick = { onSelect(category) },
                            active = active,
                            background = if (active) colors.accent.copy(alpha = 0.16f) else Color.Transparent,
                            radius = 9.dp,
                            focusRequester = if (active) selectedFocusRequester else null,
                        ) {
                            Box(
                                Modifier.fillMaxSize().padding(horizontal = 10.dp),
                                contentAlignment = Alignment.CenterStart,
                            ) {
                                Text(
                                    category.name,
                                    color = if (active) colors.accent else colors.muted,
                                    fontSize = 10.sp,
                                    fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CatalogGrid(
    type: ContentType,
    catalogItems: List<CatalogItem>,
    state: AppUiState,
    viewModel: AppViewModel,
    firstCardFocus: FocusRequester,
    selectedCategoryFocus: FocusRequester,
) {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val columns = if (type == ContentType.LIVE) 4 else 5
        val visibleRows = if (type == ContentType.LIVE) 4 else 2
        val gap = 8.dp
        val cardHeight = (maxHeight - gap * (visibleRows - 1).toFloat()) / visibleRows.toFloat()

        LazyVerticalGrid(
            columns = GridCells.Fixed(columns),
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(0.dp),
            horizontalArrangement = Arrangement.spacedBy(gap),
            verticalArrangement = Arrangement.spacedBy(gap),
        ) {
            itemsIndexed(catalogItems, key = { _, item -> "${item.type}:${item.id}" }) { index, item ->
                val favorite = state.favorites.any { it.type == item.type && it.id == item.id }
                val cardModifier = Modifier
                    .fillMaxWidth()
                    .then(
                        if (index % columns == 0) Modifier.focusProperties { left = selectedCategoryFocus }
                        else Modifier,
                    )
                if (type == ContentType.LIVE) {
                    LiveItemCard(
                        item = item,
                        favorite = favorite,
                        onClick = { viewModel.activate(item) },
                        modifier = cardModifier,
                        cardHeight = cardHeight,
                        focusRequester = if (index == 0) firstCardFocus else null,
                    )
                } else {
                    PosterItemCard(
                        item = item,
                        favorite = favorite,
                        onClick = { viewModel.activate(item) },
                        modifier = cardModifier,
                        cardHeight = cardHeight,
                        focusRequester = if (index == 0) firstCardFocus else null,
                    )
                }
            }
        }
    }
}
