package com.xtreamlytv.androidtv.ui

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
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.xtreamlytv.androidtv.model.Credentials
import com.xtreamlytv.androidtv.ui.theme.palette

@Composable
fun LoginScreen(state: AppUiState, onConnect: (Credentials) -> Unit) {
    var server by remember(state.credentials) { mutableStateOf(state.credentials?.server.orEmpty()) }
    var username by remember(state.credentials) { mutableStateOf(state.credentials?.username.orEmpty()) }
    var password by remember(state.credentials) { mutableStateOf(state.credentials?.password.orEmpty()) }
    var localError by remember { mutableStateOf<String?>(null) }
    val serverFocus = remember { FocusRequester() }
    val usernameFocus = remember { FocusRequester() }
    val passwordFocus = remember { FocusRequester() }
    val connectFocus = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        when {
            server.isBlank() -> serverFocus.requestFocus()
            username.isBlank() -> usernameFocus.requestFocus()
            password.isBlank() -> passwordFocus.requestFocus()
            else -> connectFocus.requestFocus()
        }
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth <= 1000.dp || maxHeight <= 600.dp
        Row(
            Modifier.fillMaxSize().padding(
                horizontal = if (compact) 34.dp else 70.dp,
                vertical = if (compact) 28.dp else 60.dp,
            ),
            horizontalArrangement = Arrangement.spacedBy(if (compact) 30.dp else 56.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            LoginBrandPanel(Modifier.weight(1.08f), compact)
            ProviderLoginCard(
                modifier = Modifier.weight(0.92f).fillMaxHeight(),
                compact = compact,
                server = server,
                username = username,
                password = password,
                loading = state.loading,
                message = localError ?: state.error,
                serverFocus = serverFocus,
                usernameFocus = usernameFocus,
                passwordFocus = passwordFocus,
                connectFocus = connectFocus,
                onServerChange = { server = it; localError = null },
                onUsernameChange = { username = it; localError = null },
                onPasswordChange = { password = it; localError = null },
                onConnect = {
                    when {
                        server.isBlank() -> { localError = "Enter your provider URL."; serverFocus.requestFocus() }
                        username.isBlank() -> { localError = "Enter your provider username."; usernameFocus.requestFocus() }
                        password.isBlank() -> { localError = "Enter your provider password."; passwordFocus.requestFocus() }
                        else -> { localError = null; onConnect(Credentials(server, username, password)) }
                    }
                },
            )
        }
    }
}

@Composable
private fun LoginBrandPanel(modifier: Modifier, compact: Boolean) {
    val colors = palette()
    Column(modifier, verticalArrangement = Arrangement.Center) {
        BrandLockup(iconSize = if (compact) 72.dp else 104.dp, wordmarkSize = if (compact) 35 else 48)
        Spacer(Modifier.height(if (compact) 18.dp else 28.dp))
        Text(
            "Your provider. Your screen. Your way.",
            color = colors.text,
            fontSize = if (compact) 22.sp else 31.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = if (compact) 27.sp else 37.sp,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            "A focused living-room client for large Xtream-compatible libraries, designed for remote navigation and local privacy.",
            color = colors.muted,
            fontSize = if (compact) 13.sp else 17.sp,
            lineHeight = if (compact) 18.sp else 23.sp,
            modifier = Modifier.fillMaxWidth(0.9f),
        )
        Spacer(Modifier.height(if (compact) 16.dp else 24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            listOf("Live TV", "Movies", "Series", "Favorites", "No tracking").forEach { label ->
                Box(
                    Modifier
                        .background(Color.White.copy(alpha = 0.055f), RoundedCornerShape(50))
                        .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(50))
                        .padding(horizontal = 11.dp, vertical = 6.dp),
                ) {
                    Text(label, color = colors.text.copy(alpha = 0.86f), fontSize = 10.sp)
                }
            }
        }
    }
}

@Composable
private fun ProviderLoginCard(
    modifier: Modifier,
    compact: Boolean,
    server: String,
    username: String,
    password: String,
    loading: Boolean,
    message: String?,
    serverFocus: FocusRequester,
    usernameFocus: FocusRequester,
    passwordFocus: FocusRequester,
    connectFocus: FocusRequester,
    onServerChange: (String) -> Unit,
    onUsernameChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onConnect: () -> Unit,
) {
    val colors = palette()
    val cleartext = server.trim().startsWith("http://", ignoreCase = true)
    val statusText = message ?: if (cleartext) {
        "HTTP providers are supported, but credentials are not protected in transit."
    } else {
        "Use the base address supplied by your provider."
    }
    val statusColor = when {
        message != null -> Color(0xFFFF9CA5)
        cleartext -> Color(0xFFFFC66D)
        else -> colors.muted
    }

    Column(
        modifier
            .background(colors.panel.copy(alpha = 0.95f), RoundedCornerShape(if (compact) 20.dp else 28.dp))
            .border(1.dp, Color.White.copy(alpha = 0.09f), RoundedCornerShape(if (compact) 20.dp else 28.dp))
            .padding(if (compact) 22.dp else 34.dp),
    ) {
        Text("Connect a provider", color = colors.text, fontSize = if (compact) 22.sp else 29.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(3.dp))
        Text("Enter your Xtream-compatible account details.", color = colors.muted, fontSize = if (compact) 11.sp else 14.sp)
        Spacer(Modifier.height(if (compact) 14.dp else 22.dp))

        TvTextField("Server URL", server, onServerChange, placeholder = "http://provider.example:port", focusRequester = serverFocus)
        Spacer(Modifier.height(if (compact) 9.dp else 14.dp))
        TvTextField("Username", username, onUsernameChange, placeholder = "Provider username", focusRequester = usernameFocus)
        Spacer(Modifier.height(if (compact) 9.dp else 14.dp))
        TvTextField("Password", password, onPasswordChange, placeholder = "Provider password", password = true, focusRequester = passwordFocus)
        Spacer(Modifier.height(if (compact) 8.dp else 12.dp))
        Box(Modifier.fillMaxWidth().height(if (compact) 34.dp else 42.dp), contentAlignment = Alignment.CenterStart) {
            Text(statusText, color = statusColor, fontSize = if (compact) 9.sp else 11.sp, lineHeight = if (compact) 12.sp else 15.sp, maxLines = 2)
        }
        Spacer(Modifier.height(8.dp))
        TvButton(
            label = when {
                loading -> "Connecting…"
                message != null -> "Try again"
                else -> "Connect"
            },
            onClick = onConnect,
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading,
            leading = if (loading) "◌" else null,
            focusRequester = connectFocus,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            "XtreamlyTV does not provide channels or subscriptions. Credentials remain on this TV.",
            color = colors.muted.copy(alpha = 0.72f),
            fontSize = 8.sp,
            lineHeight = 11.sp,
        )
    }
}
