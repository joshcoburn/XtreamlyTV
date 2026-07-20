package com.xtreamlytv.androidtv.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class ProviderUrlTest {
    @Test
    fun addsHttpSchemeWhenProviderOmitsIt() {
        assertEquals(
            "http://provider.example:8080",
            ProviderUrl.normalize("provider.example:8080"),
        )
    }

    @Test
    fun preservesProviderSubdirectory() {
        assertEquals(
            "https://provider.example/xtream",
            ProviderUrl.normalize("https://provider.example/xtream/"),
        )
    }

    @Test
    fun acceptsPastedPlayerApiAddress() {
        assertEquals(
            "http://provider.example",
            ProviderUrl.normalize("http://provider.example/player_api.php?username=test"),
        )
    }

    @Test
    fun rejectsUnsupportedSchemes() {
        assertThrows(IllegalArgumentException::class.java) {
            ProviderUrl.normalize("ftp://provider.example")
        }
    }
}
