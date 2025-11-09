package com.dtu.ragchatbot

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.dtu.ragchatbot.databinding.ItemMessageBotBinding
import com.dtu.ragchatbot.databinding.ItemMessageUserBinding
import io.noties.markwon.Markwon
import io.noties.markwon.image.glide.GlideImagesPlugin

class MessageAdapter : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    private val messages = mutableListOf<ChatMessage>()
    private var markwon: Markwon? = null

    fun setMarkwon(markwon: Markwon) {
        this.markwon = markwon
    }

    fun addMessage(message: ChatMessage): Int {
        val position = messages.size
        messages.add(message)
        notifyItemInserted(position)
        return position
    }

    fun removeMessage(position: Int) {
        if (position in messages.indices) {
            messages.removeAt(position)
            notifyItemRemoved(position)
        }
    }

    override fun getItemViewType(position: Int): Int {
        return when (messages[position].type) {
            MessageType.USER -> VIEW_TYPE_USER
            MessageType.BOT -> VIEW_TYPE_BOT
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            VIEW_TYPE_USER -> {
                val binding = ItemMessageUserBinding.inflate(
                    LayoutInflater.from(parent.context),
                    parent,
                    false
                )
                UserMessageViewHolder(binding)
            }
            VIEW_TYPE_BOT -> {
                val binding = ItemMessageBotBinding.inflate(
                    LayoutInflater.from(parent.context),
                    parent,
                    false
                )
                BotMessageViewHolder(binding, markwon)
            }
            else -> throw IllegalArgumentException("Unknown view type")
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val message = messages[position]) {
            is ChatMessage -> {
                when (holder) {
                    is UserMessageViewHolder -> holder.bind(message)
                    is BotMessageViewHolder -> holder.bind(message)
                }
            }
        }
    }

    override fun getItemCount(): Int = messages.size

    companion object {
        private const val VIEW_TYPE_USER = 1
        private const val VIEW_TYPE_BOT = 2
    }
}

class UserMessageViewHolder(
    private val binding: ItemMessageUserBinding
) : RecyclerView.ViewHolder(binding.root) {
    fun bind(message: ChatMessage) {
        binding.textViewMessage.text = message.content
    }
}

class BotMessageViewHolder(
    private val binding: ItemMessageBotBinding,
    private val markwon: Markwon?
) : RecyclerView.ViewHolder(binding.root) {
    fun bind(message: ChatMessage) {
        if (message.isLoading) {
            binding.textViewMessage.visibility = View.GONE
            binding.progressBar.visibility = View.VISIBLE
        } else {
            binding.progressBar.visibility = View.GONE
            binding.textViewMessage.visibility = View.VISIBLE

            // Render markdown if available
            if (markwon != null) {
                markwon.setMarkdown(binding.textViewMessage, message.content)
            } else {
                binding.textViewMessage.text = message.content
            }
        }
    }
}

