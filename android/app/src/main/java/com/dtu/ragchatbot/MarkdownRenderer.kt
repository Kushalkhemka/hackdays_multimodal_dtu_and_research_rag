package com.dtu.ragchatbot

import android.content.Context
import com.bumptech.glide.Glide
import io.noties.markwon.Markwon
import io.noties.markwon.image.glide.GlideImagesPlugin

object MarkdownRenderer {
    fun createMarkwon(context: Context): Markwon {
        return Markwon.builder(context)
            .usePlugin(GlideImagesPlugin.create(Glide.with(context)))
            .build()
    }
}


