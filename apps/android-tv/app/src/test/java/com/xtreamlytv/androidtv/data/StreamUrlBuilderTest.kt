package com.xtreamlytv.androidtv.data

import com.xtreamlytv.androidtv.model.CatalogItem
import com.xtreamlytv.androidtv.model.ContentType
import com.xtreamlytv.androidtv.model.Credentials
import org.junit.Assert.assertEquals
import org.junit.Test

class StreamUrlBuilderTest {
    private val credentials = Credentials("https://provider.example/", "user name", "p/1")

    @Test
    fun liveCandidatesPreferHlsThenTransportStream() {
        val item = CatalogItem("42", ContentType.LIVE, "Channel")
        assertEquals(
            listOf(
                "https://provider.example/live/user%20name/p%2F1/42.m3u8",
                "https://provider.example/live/user%20name/p%2F1/42.ts",
            ),
            StreamUrlBuilder.candidates(credentials, item),
        )
    }

    @Test
    fun movieExtensionIsSanitized() {
        val item = CatalogItem("7", ContentType.MOVIE, "Movie", containerExtension = "m.p4")
        assertEquals(
            "https://provider.example/movie/user%20name/p%2F1/7.mp4",
            StreamUrlBuilder.candidates(credentials, item).first(),
        )
    }
}
