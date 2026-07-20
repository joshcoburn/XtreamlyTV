package com.xtreamlytv.androidtv.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.xtreamlytv.androidtv.model.AppTheme

@Immutable
data class TvPalette(
    val background: Color,
    val background2: Color,
    val background3: Color,
    val panel: Color,
    val panelStrong: Color,
    val text: Color,
    val muted: Color,
    val accent: Color,
    val accentSecondary: Color,
    val accentInk: Color,
    val danger: Color = Color(0xFFFF6F7D),
)

val LocalTvPalette = staticCompositionLocalOf { paletteFor(AppTheme.TEAL) }

@Composable
fun palette(): TvPalette = LocalTvPalette.current

fun paletteFor(theme: AppTheme): TvPalette = when (theme) {
    AppTheme.TEAL -> TvPalette(
        background = Color(0xFF071014),
        background2 = Color(0xFF08171D),
        background3 = Color(0xFF061014),
        panel = Color(0xFF0E1D23),
        panelStrong = Color(0xFF10252C),
        text = Color(0xFFF2F7F8),
        muted = Color(0xFF8EA4AA),
        accent = Color(0xFF42E8C5),
        accentSecondary = Color(0xFF55AAFF),
        accentInk = Color(0xFF05211D),
    )
    AppTheme.GRAPHITE -> TvPalette(
        background = Color(0xFF101113),
        background2 = Color(0xFF181A1E),
        background3 = Color(0xFF0B0C0E),
        panel = Color(0xFF202226),
        panelStrong = Color(0xFF2A2D32),
        text = Color(0xFFF7F7F8),
        muted = Color(0xFFA1A5AD),
        accent = Color(0xFFE5E7EB),
        accentSecondary = Color(0xFF9097A2),
        accentInk = Color(0xFF17181A),
    )
    AppTheme.PURPLE -> TvPalette(
        background = Color(0xFF10091B),
        background2 = Color(0xFF1A0D2A),
        background3 = Color(0xFF0B0712),
        panel = Color(0xFF21142F),
        panelStrong = Color(0xFF2B193E),
        text = Color(0xFFFAF6FF),
        muted = Color(0xFFAE9CBE),
        accent = Color(0xFFB778FF),
        accentSecondary = Color(0xFF6F8CFF),
        accentInk = Color(0xFF1B092D),
    )
    AppTheme.PINK -> TvPalette(
        background = Color(0xFF170A13),
        background2 = Color(0xFF250D1C),
        background3 = Color(0xFF0E070C),
        panel = Color(0xFF2D1625),
        panelStrong = Color(0xFF3B1B30),
        text = Color(0xFFFFF7FB),
        muted = Color(0xFFC2A1B2),
        accent = Color(0xFFFF76BA),
        accentSecondary = Color(0xFFD66CFF),
        accentInk = Color(0xFF2E071B),
    )
    AppTheme.BLUE -> TvPalette(
        background = Color(0xFF07101D),
        background2 = Color(0xFF0A1930),
        background3 = Color(0xFF050B13),
        panel = Color(0xFF10243B),
        panelStrong = Color(0xFF142E4B),
        text = Color(0xFFF4F8FF),
        muted = Color(0xFF91A8C2),
        accent = Color(0xFF54B8FF),
        accentSecondary = Color(0xFF6380FF),
        accentInk = Color(0xFF061A2A),
    )
}
