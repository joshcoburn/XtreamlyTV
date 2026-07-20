package com.xtreamlytv.androidtv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.xtreamlytv.androidtv.ui.XtreamlyTvApp

class MainActivity : ComponentActivity() {
    @Volatile
    private var composeReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { !composeReady }
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            XtreamlyTvApp(onContentReady = { composeReady = true })
        }
    }
}
