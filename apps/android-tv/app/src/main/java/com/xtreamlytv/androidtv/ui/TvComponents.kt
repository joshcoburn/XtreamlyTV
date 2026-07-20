package com.xtreamlytv.androidtv.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.xtreamlytv.androidtv.R
import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.ui.theme.palette
import kotlinx.coroutines.delay

@Composable
fun AppBackground(content: @Composable () -> Unit) {
    val colors = palette()
    Box(
        Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    listOf(colors.background, colors.background2, colors.background3),
                ),
            ),
    ) {
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(colors.accent.copy(alpha = 0.14f), Color.Transparent),
                        radius = 1050f,
                        center = androidx.compose.ui.geometry.Offset(1550f, 120f),
                    ),
                ),
        )
        content()
    }
}

@Composable
fun BrandLockup(iconSize: Dp = 34.dp, wordmarkSize: Int = 18) {
    val colors = palette()
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(
            painter = painterResource(R.drawable.xtreamlytv_mark),
            contentDescription = null,
            modifier = Modifier.size(iconSize),
            contentScale = ContentScale.Fit,
        )
        Spacer(Modifier.width(2.dp))
        Text(
            text = "treamlyTV",
            color = colors.text,
            fontSize = wordmarkSize.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1,
        )
    }
}

@Composable
fun TvSurface(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    enabled: Boolean = true,
    active: Boolean = false,
    radius: Dp = 12.dp,
    background: Color? = null,
    focusRequester: FocusRequester? = null,
    content: @Composable () -> Unit,
) {
    val colors = palette()
    var focused by remember { mutableStateOf(false) }
    val border by animateColorAsState(
        if (focused) colors.accent else Color.White.copy(alpha = 0.07f),
        label = "tvFocusBorder",
    )
    val fill by animateColorAsState(
        targetValue = background ?: if (active) colors.accent.copy(alpha = 0.15f) else colors.panel.copy(alpha = 0.92f),
        label = "tvSurfaceFill",
    )
    val requesterModifier = if (focusRequester != null) Modifier.focusRequester(focusRequester) else Modifier
    Box(
        modifier
            .then(requesterModifier)
            .clip(RoundedCornerShape(radius))
            .background(fill)
            .border(if (focused) 2.dp else 1.dp, border, RoundedCornerShape(radius))
            .onFocusChanged { focused = it.isFocused }
            .clickable(enabled = enabled, onClick = onClick)
            .focusable(enabled),
    ) { content() }
}

@Composable
fun TvButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: TvButtonStyle = TvButtonStyle.Primary,
    enabled: Boolean = true,
    leading: String? = null,
    focusRequester: FocusRequester? = null,
) {
    val colors = palette()
    val background = when (style) {
        TvButtonStyle.Primary -> Brush.horizontalGradient(listOf(colors.accent, colors.accentSecondary))
        TvButtonStyle.Secondary -> Brush.horizontalGradient(listOf(colors.panelStrong, colors.panelStrong))
        TvButtonStyle.Danger -> Brush.horizontalGradient(listOf(colors.danger.copy(alpha = 0.22f), colors.danger.copy(alpha = 0.22f)))
    }
    val textColor = when (style) {
        TvButtonStyle.Primary -> colors.accentInk
        TvButtonStyle.Secondary -> colors.text
        TvButtonStyle.Danger -> Color(0xFFFFA0AA)
    }
    TvSurface(
        modifier = modifier.height(42.dp),
        onClick = onClick,
        enabled = enabled,
        background = Color.Transparent,
        radius = 11.dp,
        focusRequester = focusRequester,
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .background(background)
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (!leading.isNullOrBlank()) {
                Text(leading, color = textColor, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(7.dp))
            }
            Text(
                text = label,
                color = textColor.copy(alpha = if (enabled) 1f else 0.55f),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
            )
        }
    }
}

enum class TvButtonStyle { Primary, Secondary, Danger }

@Composable
fun TvTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    password: Boolean = false,
    focusRequester: FocusRequester? = null,
) {
    val colors = palette()
    var focused by remember { mutableStateOf(false) }
    val requesterModifier = if (focusRequester != null) Modifier.focusRequester(focusRequester) else Modifier
    Column(modifier) {
        if (label.isNotBlank()) {
            Text(label, color = colors.muted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(4.dp))
        }
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .then(requesterModifier)
                .fillMaxWidth()
                .height(42.dp)
                .onFocusChanged { focused = it.isFocused },
            singleLine = true,
            textStyle = TextStyle(color = colors.text, fontSize = 14.sp),
            cursorBrush = SolidColor(colors.accent),
            visualTransformation = if (password) PasswordVisualTransformation() else VisualTransformation.None,
            decorationBox = { inner ->
                Box(
                    Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(10.dp))
                        .background(colors.background.copy(alpha = 0.72f))
                        .border(
                            if (focused) 2.dp else 1.dp,
                            if (focused) colors.accent else Color.White.copy(alpha = 0.10f),
                            RoundedCornerShape(10.dp),
                        )
                        .padding(horizontal = 12.dp),
                    contentAlignment = Alignment.CenterStart,
                ) {
                    if (value.isBlank() && placeholder.isNotBlank()) {
                        Text(placeholder, color = colors.muted.copy(alpha = 0.72f), fontSize = 14.sp)
                    }
                    inner()
                }
            },
        )
    }
}

@Composable
fun SearchField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    focusRequester: FocusRequester? = null,
) {
    val colors = palette()
    var focused by remember { mutableStateOf(false) }
    val requesterModifier = if (focusRequester != null) Modifier.focusRequester(focusRequester) else Modifier
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .then(requesterModifier)
            .height(42.dp)
            .onFocusChanged { focused = it.isFocused },
        singleLine = true,
        textStyle = TextStyle(color = colors.text, fontSize = 14.sp),
        cursorBrush = SolidColor(colors.accent),
        decorationBox = { inner ->
            Row(
                Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(10.dp))
                    .background(colors.background.copy(alpha = 0.72f))
                    .border(
                        if (focused) 2.dp else 1.dp,
                        if (focused) colors.accent else Color.White.copy(alpha = 0.10f),
                        RoundedCornerShape(10.dp),
                    )
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TvIcon("search", colors.muted, Modifier.size(17.dp))
                Spacer(Modifier.width(10.dp))
                Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                    if (value.isBlank()) Text(placeholder, color = colors.muted.copy(alpha = 0.82f), fontSize = 14.sp)
                    inner()
                }
            }
        },
    )
}

@Composable
fun TvChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = palette()
    TvSurface(
        modifier = modifier.height(34.dp),
        onClick = onClick,
        active = selected,
        radius = 17.dp,
    ) {
        Box(Modifier.fillMaxSize().padding(horizontal = 14.dp), contentAlignment = Alignment.Center) {
            Text(
                label,
                color = if (selected) colors.accent else colors.text,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
fun SectionHeader(title: String, meta: String? = null, modifier: Modifier = Modifier) {
    val colors = palette()
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
        Text(title, color = colors.text, fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        if (!meta.isNullOrBlank()) Text(meta, color = colors.muted, fontSize = 10.sp)
    }
}

@Composable
fun LiveItemCard(
    item: CatalogItem,
    favorite: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    cardHeight: Dp = 76.dp,
    focusRequester: FocusRequester? = null,
) {
    val colors = palette()
    TvSurface(modifier = modifier.height(cardHeight), onClick = onClick, focusRequester = focusRequester) {
        Row(
            Modifier.fillMaxSize().padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Artwork(item = item, modifier = Modifier.size(38.dp), live = true)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.Center) {
                Text(
                    item.name,
                    color = colors.text,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    item.channelNumber?.let { "CH $it" } ?: "Live programming",
                    color = colors.muted,
                    fontSize = 9.sp,
                    maxLines = 1,
                )
            }
            if (favorite) TvIcon("heart", colors.danger, Modifier.size(14.dp))
        }
    }
}

@Composable
fun PosterItemCard(
    item: CatalogItem,
    favorite: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    cardHeight: Dp = 188.dp,
    focusRequester: FocusRequester? = null,
) {
    val colors = palette()
    TvSurface(modifier = modifier.height(cardHeight), onClick = onClick, focusRequester = focusRequester) {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.fillMaxWidth().weight(1f)) {
                Artwork(item = item, modifier = Modifier.fillMaxSize(), live = false)
                if (favorite) {
                    Box(
                        modifier = Modifier.align(Alignment.TopEnd).padding(8.dp),
                    ) {
                        TvIcon("heart", colors.danger, Modifier.size(14.dp))
                    }
                }
            }
            Column(Modifier.fillMaxWidth().padding(horizontal = 9.dp, vertical = 7.dp)) {
                Text(
                    item.name,
                    color = colors.text,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    item.rating?.let { "★ ${"%.1f".format(it)}" } ?: item.type.title(),
                    color = colors.muted,
                    fontSize = 9.sp,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
fun Artwork(item: CatalogItem, modifier: Modifier, live: Boolean) {
    val colors = palette()
    val shape = RoundedCornerShape(if (live) 9.dp else 0.dp)
    Box(
        modifier
            .clip(shape)
            .background(
                Brush.linearGradient(
                    listOf(colors.panelStrong, colors.accent.copy(alpha = 0.20f), colors.panelStrong),
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        if (!item.imageUrl.isNullOrBlank()) {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.name,
                modifier = Modifier.fillMaxSize().padding(if (live) 4.dp else 0.dp),
                contentScale = if (live) ContentScale.Fit else ContentScale.Crop,
            )
        } else {
            Text(
                initials(item.name),
                color = colors.accent,
                fontSize = if (live) 12.sp else 24.sp,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
fun EmptyState(title: String, description: String, modifier: Modifier = Modifier) {
    val colors = palette()
    Column(
        modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        TvIcon("heart", colors.accent, Modifier.size(34.dp))
        Spacer(Modifier.height(8.dp))
        Text(title, color = colors.text, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(description, color = colors.muted, fontSize = 11.sp)
    }
}

@Composable
fun ErrorBanner(message: String, onDismiss: (() -> Unit)? = null, modifier: Modifier = Modifier) {
    val colors = palette()
    TvSurface(
        modifier = modifier.fillMaxWidth().height(48.dp),
        onClick = { onDismiss?.invoke() },
        enabled = onDismiss != null,
        background = colors.danger.copy(alpha = 0.16f),
    ) {
        Row(
            Modifier.fillMaxSize().padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(message, color = Color(0xFFFFB3BB), fontSize = 11.sp, modifier = Modifier.weight(1f), maxLines = 2)
            if (onDismiss != null) Text("Dismiss", color = colors.text, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun LoadingOverlay(label: String = "Loading…") {
    val colors = palette()
    Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.48f)), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(modifier = Modifier.size(34.dp), color = colors.accent, strokeWidth = 3.dp)
            Spacer(Modifier.height(10.dp))
            Text(label, color = colors.text, fontSize = 12.sp)
        }
    }
}

@Composable
fun AppLoadingScreen() {
    val colors = palette()
    var message by remember { mutableStateOf("Starting your TV experience…") }
    LaunchedEffect(Unit) {
        delay(900)
        message = "Connecting to your provider…"
    }
    Box(
        Modifier.fillMaxSize().background(colors.background),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            BrandLockup(iconSize = 68.dp, wordmarkSize = 27)
            Spacer(Modifier.height(18.dp))
            CircularProgressIndicator(modifier = Modifier.size(30.dp), color = colors.accent, strokeWidth = 3.dp)
            Spacer(Modifier.height(10.dp))
            Text(message, color = colors.muted, fontSize = 11.sp)
        }
    }
}

fun ContentType.title(): String = when (this) {
    ContentType.LIVE -> "Live TV"
    ContentType.MOVIE -> "Movies"
    ContentType.SERIES -> "Series"
    ContentType.EPISODE -> "Episode"
}

fun ContentType.iconName(): String = when (this) {
    ContentType.LIVE -> "tv"
    ContentType.MOVIE -> "popcorn"
    ContentType.SERIES, ContentType.EPISODE -> "play"
}

@Composable
fun TvIcon(name: String, color: Color, modifier: Modifier = Modifier) {
    Image(
        painter = painterResource(iconResource(name)),
        contentDescription = null,
        modifier = modifier,
        colorFilter = ColorFilter.tint(color),
        contentScale = ContentScale.Fit,
    )
}

private fun iconResource(name: String): Int = when (name) {
    "home" -> R.drawable.ic_home
    "tv" -> R.drawable.ic_tv
    "popcorn" -> R.drawable.ic_popcorn
    "play" -> R.drawable.ic_play_box
    "heart" -> R.drawable.ic_heart
    "settings" -> R.drawable.ic_settings
    "plus" -> R.drawable.ic_plus
    "folder" -> R.drawable.ic_folder
    "star" -> R.drawable.ic_star
    "trophy" -> R.drawable.ic_trophy
    "smile" -> R.drawable.ic_smile
    "search" -> R.drawable.ic_search
    else -> R.drawable.ic_folder
}

fun formatDuration(milliseconds: Long): String {
    if (milliseconds <= 0L) return "0:00"
    val totalSeconds = milliseconds / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return if (hours > 0) "%d:%02d:%02d".format(hours, minutes, seconds) else "%d:%02d".format(minutes, seconds)
}

private fun initials(name: String): String = name
    .split(Regex("\\s+"))
    .filter { it.isNotBlank() }
    .take(2)
    .joinToString("") { it.take(1).uppercase() }
    .ifBlank { "TV" }
