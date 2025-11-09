package com.dtu.ragchatbot

enum class MessageType {
    USER,
    BOT
}

data class ChatMessage(
    val content: String,
    val type: MessageType,
    val isLoading: Boolean = false
)


