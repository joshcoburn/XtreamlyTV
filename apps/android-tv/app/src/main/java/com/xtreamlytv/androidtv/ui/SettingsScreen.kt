package com.xtreamlytv.androidtv.ui

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.BuildConfig
import com.xtreamlytv.androidtv.model.AppSettings
import com.xtreamlytv.androidtv.model.AppTheme
import com.xtreamlytv.androidtv.model.StreamFormat
import com.xtreamlytv.androidtv.ui.theme.palette
import com.xtreamlytv.androidtv.ui.theme.paletteFor

@Composable
fun SettingsScreen(state: AppUiState, viewModel: AppViewModel) {
    var editingProvider by remember { mutableStateOf(false) }
    var server by remember(state.credentials) { mutableStateOf(state.credentials?.server.orEmpty()) }
    var username by remember(state.credentials) { mutableStateOf(state.credentials?.username.orEmpty()) }
    var password by remember(state.credentials) { mutableStateOf(state.credentials?.password.orEmpty()) }

    LazyColumn(
        contentPadding = PaddingValues(bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            SettingsCard("Provider", "Your saved Xtream connection. Edit only when you want to reconnect with different details.") {
                if (!editingProvider) {
                    ProviderSummaryRow("Server", state.credentials?.server ?: "Not configured")
                    ProviderSummaryRow("Username", state.credentials?.username ?: "Not configured")
                    ProviderSummaryRow("Password", if (state.credentials == null) "Not configured" else "••••••••")
                    Spacer(Modifier.height(9.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        TvButton("Edit provider", { editingProvider = true }, Modifier.width(112.dp))
                        TvButton("Disconnect provider", viewModel::disconnect, Modifier.width(142.dp), TvButtonStyle.Danger)
                    }
                } else {
                    TvTextField("Server URL", server, { server = it }, placeholder = "http://provider.example:port")
                    Spacer(Modifier.height(7.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TvTextField("Username", username, { username = it }, Modifier.weight(1f))
                        TvTextField("Password", password, { password = it }, Modifier.weight(1f), password = true)
                    }
                    Spacer(Modifier.height(9.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        TvButton(
                            "Save and reconnect",
                            { viewModel.updateProvider(com.xtreamlytv.androidtv.model.Credentials(server, username, password)); editingProvider = false },
                            Modifier.width(142.dp),
                        )
                        TvButton("Cancel", { editingProvider = false }, Modifier.width(76.dp), TvButtonStyle.Secondary)
                    }
                }
            }
        }

        item {
            SettingsCard("Appearance", "Choose a skin. The layout remains identical while the background, panels, focus ring, and highlights change hue.") {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                    AppTheme.entries.forEach { theme ->
                        ThemeChoice(
                            theme = theme,
                            selected = state.settings.theme == theme,
                            onClick = { viewModel.updateSettings(state.settings.copy(theme = theme)) },
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SettingsCard(
                    title = "Playback compatibility",
                    description = "Automatic mode tries HLS and MPEG-TS. VOD and episodes use their provider container.",
                    modifier = Modifier.weight(1f),
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        StreamFormat.entries.forEach { format ->
                            SettingChoice(
                                label = format.label,
                                selected = state.settings.streamFormat == format,
                                onClick = { viewModel.updateSettings(state.settings.copy(streamFormat = format)) },
                            )
                        }
                    }
                }
                SettingsCard(
                    title = "Performance",
                    description = "Only visible cards are rendered. Category data is cached temporarily for quick revisits.",
                    modifier = Modifier.weight(1f),
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(2, 3, 5).forEach { count ->
                            TvChip(
                                label = when (count) { 2 -> "2 · Low"; 3 -> "3 · Balanced"; else -> "5 · Fast" },
                                selected = state.settings.maxCachedCategories == count,
                                onClick = { viewModel.updateSettings(state.settings.copy(maxCachedCategories = count)) },
                            )
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    TvButton("Clear catalog cache", viewModel::clearCatalogCache, Modifier.width(138.dp), TvButtonStyle.Secondary)
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SettingsCard(
                    title = "Native networking",
                    description = "Android TV connects directly to your provider. The optional webOS CORS bridge is not required on this platform.",
                    modifier = Modifier.weight(1f),
                ) {
                    DiagnosticPill("Direct provider access")
                    DiagnosticPill("HTTP and HTTPS supported")
                    DiagnosticPill("Automatic container fallback")
                }
                SettingsCard(
                    title = "Catalog diagnostics",
                    description = "Provider catalogs remain category-scoped so the full library is never loaded into TV memory at once.",
                    modifier = Modifier.weight(1f),
                ) {
                    DiagnosticPill("${state.loadedItems.values.sumOf { it.size }} items currently indexed")
                    DiagnosticPill("${state.categories.values.sumOf { it.size }} provider categories")
                    DiagnosticPill("Adaptive lazy rendering active")
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SettingsCard(
                    title = "About XtreamlyTV",
                    description = "Open-source living-room IPTV client. No channels or subscriptions are included.",
                    modifier = Modifier.weight(1f),
                ) {
                    ProviderSummaryRow("Version", BuildConfig.VERSION_NAME)
                    ProviderSummaryRow("Application ID", "com.github.xtreamlytv.androidtv")
                    ProviderSummaryRow("Platform", "Android TV ${Build.VERSION.RELEASE} · API ${Build.VERSION.SDK_INT}")
                    ProviderSummaryRow("Device", "${Build.MANUFACTURER} ${Build.MODEL}")
                    ProviderSummaryRow("Playback", "AndroidX Media3 ExoPlayer")
                }
                SettingsCard(
                    title = "Privacy & history",
                    description = "No analytics, advertising, or tracking. Credentials, favorites, groups, recent items, and resume positions remain on this TV.",
                    modifier = Modifier.weight(1f),
                ) {
                    Text("${state.recent.size} recent items · ${state.progress.size} resume positions", color = palette().muted, fontSize = 9.sp)
                    Spacer(Modifier.height(9.dp))
                    TvButton("Clear watch history", viewModel::clearHistory, Modifier.width(132.dp), TvButtonStyle.Secondary)
                }
            }
        }
    }
}

@Composable
private fun SettingsCard(
    title: String,
    description: String,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = palette()
    Column(
        modifier
            .background(colors.panel.copy(alpha = 0.86f), RoundedCornerShape(14.dp))
            .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(14.dp))
            .padding(14.dp),
    ) {
        Text(title, color = colors.text, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(3.dp))
        Text(description, color = colors.muted, fontSize = 9.sp, lineHeight = 12.sp)
        Spacer(Modifier.height(10.dp))
        content()
    }
}

@Composable
private fun ProviderSummaryRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
        Text(label, color = palette().muted, fontSize = 9.sp, modifier = Modifier.width(78.dp))
        Text(value, color = palette().text, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun ThemeChoice(theme: AppTheme, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val preview = paletteFor(theme)
    TvSurface(modifier.height(54.dp), onClick = onClick, active = selected) {
        Row(Modifier.fillMaxWidth().height(54.dp).padding(horizontal = 9.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            androidx.compose.foundation.layout.Box(
                Modifier
                    .width(27.dp)
                    .height(27.dp)
                    .background(Brush.linearGradient(listOf(preview.accent, preview.accentSecondary)), RoundedCornerShape(8.dp)),
            )
            Spacer(Modifier.width(8.dp))
            Text(theme.label, color = palette().text, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            if (selected) Text("✓", color = palette().accent, fontSize = 11.sp)
        }
    }
}

@Composable
private fun SettingChoice(label: String, selected: Boolean, onClick: () -> Unit) {
    TvSurface(Modifier.fillMaxWidth().height(34.dp), onClick = onClick, active = selected) {
        Row(Modifier.fillMaxWidth().height(34.dp).padding(horizontal = 10.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Text(label, color = if (selected) palette().accent else palette().text, fontSize = 10.sp, modifier = Modifier.weight(1f))
            Text(if (selected) "✓" else "", color = palette().accent, fontSize = 10.sp)
        }
    }
}

@Composable
private fun DiagnosticPill(label: String) {
    Text(
        label,
        color = palette().text.copy(alpha = 0.88f),
        fontSize = 8.sp,
        modifier = Modifier
            .padding(bottom = 5.dp)
            .background(Color.White.copy(alpha = 0.06f), RoundedCornerShape(50))
            .padding(horizontal = 8.dp, vertical = 4.dp),
    )
}
