package com.xtreamlytv.androidtv.ui

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.focusable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.PlayerRequest
import com.xtreamlytv.androidtv.ui.theme.BrandTokens
import kotlinx.coroutines.delay

@Composable
fun PlayerScreen(
    request: PlayerRequest,
    onBack: () -> Unit,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
) {
    val context = LocalContext.current
    var candidateIndex by remember(request.item.id) { mutableIntStateOf(0) }
    var controlsVisible by remember(request.item.id) { mutableStateOf(true) }
    var playing by remember(request.item.id) { mutableStateOf(true) }
    var position by remember(request.item.id) { mutableLongStateOf(0L) }
    var duration by remember(request.item.id) { mutableLongStateOf(0L) }
    var errorMessage by remember(request.item.id) { mutableStateOf<String?>(null) }

    val player = remember(request.item.id, candidateIndex) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(request.urlCandidates.getOrElse(candidateIndex) { request.urlCandidates.first() }))
            playWhenReady = true
            prepare()
        }
    }

    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                playing = isPlaying
                if (isPlaying) errorMessage = null
            }

            override fun onPlayerError(error: PlaybackException) {
                if (candidateIndex + 1 < request.urlCandidates.size) candidateIndex += 1
                else errorMessage = error.message ?: "Unable to play this stream."
            }
        }
        player.addListener(listener)
        onDispose {
            player.removeListener(listener)
            player.release()
        }
    }

    LaunchedEffect(player) {
        while (true) {
            position = player.currentPosition.coerceAtLeast(0L)
            duration = player.duration.takeIf { it > 0L } ?: 0L
            delay(500)
        }
    }

    LaunchedEffect(controlsVisible, playing) {
        if (controlsVisible && playing) {
            delay(4000)
            controlsVisible = false
        }
    }

    fun showControls() { controlsVisible = true }
    fun togglePlayback() {
        if (player.isPlaying) player.pause() else player.play()
        showControls()
    }

    BackHandler { onBack() }

    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black)
            .onPreviewKeyEvent { event ->
                if (event.type != KeyEventType.KeyDown) return@onPreviewKeyEvent false
                when (event.key) {
                    Key.DirectionCenter, Key.Enter, Key.MediaPlayPause -> { togglePlayback(); true }
                    Key.DirectionLeft -> { player.seekTo((player.currentPosition - 30_000L).coerceAtLeast(0L)); showControls(); true }
                    Key.DirectionRight -> { player.seekTo(player.currentPosition + 30_000L); showControls(); true }
                    Key.DirectionUp -> { onPrevious(); true }
                    Key.DirectionDown -> { onNext(); true }
                    Key.Back -> { onBack(); true }
                    else -> { showControls(); false }
                }
            }
            .focusable()
    ) {
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    useController = false
                    resizeMode = androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_FIT
                    layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                    this.player = player
                }
            },
            update = { it.player = player },
            modifier = Modifier.fillMaxSize(),
        )

        if (controlsVisible) {
            Column(
                Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(Color(0xAA071014))
                    .padding(horizontal = 54.dp, vertical = 28.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    BrandPlayerLockup()
                    Text(request.item.name, color = BrandTokens.Text, fontSize = 24.sp, modifier = Modifier.weight(1f))
                    Text(if (request.item.type == ContentType.LIVE) "LIVE" else formatTime(position), color = BrandTokens.Accent, fontSize = 18.sp)
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("◀ 30s", color = BrandTokens.Muted, fontSize = 18.sp)
                    Text(if (playing) "Pause" else "Play", color = BrandTokens.Text, fontSize = 20.sp)
                    Text("30s ▶", color = BrandTokens.Muted, fontSize = 18.sp)
                    if (request.item.type == ContentType.LIVE) Text("↑/↓ Change channel", color = BrandTokens.Muted, fontSize = 18.sp)
                    else Text("${formatTime(position)} / ${formatTime(duration)}", color = BrandTokens.Muted, fontSize = 18.sp)
                }
            }
        }

        errorMessage?.let { message ->
            Box(
                Modifier.align(Alignment.Center).background(Color(0xDD071014), RoundedCornerShape(18.dp)).padding(28.dp)
            ) { Text(message, color = BrandTokens.Text, fontSize = 20.sp) }
        }
    }
}

@Composable
private fun BrandPlayerLockup() {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(end = 18.dp)) {
        androidx.compose.foundation.Image(
            painter = androidx.compose.ui.res.painterResource(com.xtreamlytv.androidtv.R.drawable.xtreamlytv_icon),
            contentDescription = null,
            modifier = Modifier.size(38.dp),
        )
        Text("treamlyTV", color = BrandTokens.Text, fontSize = 20.sp)
    }
}

private fun formatTime(milliseconds: Long): String {
    if (milliseconds <= 0L) return "0:00"
    val totalSeconds = milliseconds / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return if (hours > 0) "%d:%02d:%02d".format(hours, minutes, seconds) else "%d:%02d".format(minutes, seconds)
}
