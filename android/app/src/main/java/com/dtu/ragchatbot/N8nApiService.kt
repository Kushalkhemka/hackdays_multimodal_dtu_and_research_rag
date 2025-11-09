package com.dtu.ragchatbot

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

data class ChatRequest(
    val query: String
)

data class ChatResponse(
    val response: String? = null,
    val answer: String? = null,
    val text: String? = null,
    val message: String? = null
) {
    fun getResponseText(): String {
        return response ?: answer ?: text ?: message ?: "No response received"
    }
}

interface N8nApi {
    @POST(AppConfig.N8N_WEBHOOK_PATH)
    suspend fun sendQuery(@Body request: ChatRequest): ChatResponse
}

class N8nApiService private constructor(context: Context) {
    private val api: N8nApi

    init {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(AppConfig.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(AppConfig.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(AppConfig.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(AppConfig.N8N_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(N8nApi::class.java)
    }

    suspend fun sendMessage(query: String): String {
        val request = ChatRequest(query = query)
        val response = api.sendQuery(request)
        return response.getResponseText()
    }

    companion object {
        @Volatile
        private var INSTANCE: N8nApiService? = null

        fun getInstance(context: Context): N8nApiService {
            return INSTANCE ?: synchronized(this) {
                val instance = N8nApiService(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}

