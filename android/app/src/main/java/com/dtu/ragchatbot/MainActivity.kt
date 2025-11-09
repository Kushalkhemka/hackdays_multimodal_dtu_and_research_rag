package com.dtu.ragchatbot

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.dtu.ragchatbot.databinding.ActivityMainBinding
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        loadChatUrl()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webViewChat.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                loadWithOverviewMode = true
                useWideViewPort = true
                builtInZoomControls = false
                displayZoomControls = false
                setSupportZoom(false)
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                blockNetworkLoads = false
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    binding.progressBar.visibility = View.VISIBLE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                    
                    // Inject JavaScript to handle image loading with CORS
                    view?.evaluateJavascript("""
                        (function() {
                            // Fix images that failed to load due to CORS/ORB
                            const images = document.querySelectorAll('img');
                            images.forEach(function(img) {
                                if (img.complete && img.naturalHeight === 0) {
                                    // Image failed to load, try to reload with CORS proxy
                                    const originalSrc = img.src;
                                    if (originalSrc && !originalSrc.startsWith('data:')) {
                                        // Create a new image with CORS handling
                                        const newImg = new Image();
                                        newImg.crossOrigin = 'anonymous';
                                        newImg.onload = function() {
                                            img.src = newImg.src;
                                        };
                                        newImg.onerror = function() {
                                            console.log('Failed to load image: ' + originalSrc);
                                        };
                                        newImg.src = originalSrc;
                                    }
                                }
                            });
                            
                            // Monitor for new images added dynamically
                            const observer = new MutationObserver(function(mutations) {
                                mutations.forEach(function(mutation) {
                                    mutation.addedNodes.forEach(function(node) {
                                        if (node.nodeType === 1) { // Element node
                                            const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
                                            imgs.forEach(function(img) {
                                                img.crossOrigin = 'anonymous';
                                            });
                                            if (node.tagName === 'IMG') {
                                                node.crossOrigin = 'anonymous';
                                            }
                                        }
                                    });
                                });
                            });
                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                        })();
                    """.trimIndent(), null)
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    // Don't show toast for image loading errors (ORB errors)
                    if (error != null && request != null) {
                        val isImage = request.url?.toString()?.let { url ->
                            url.contains("image", ignoreCase = true) ||
                            url.endsWith(".jpg", ignoreCase = true) ||
                            url.endsWith(".jpeg", ignoreCase = true) ||
                            url.endsWith(".png", ignoreCase = true) ||
                            url.endsWith(".gif", ignoreCase = true) ||
                            url.endsWith(".webp", ignoreCase = true)
                        } ?: false
                        
                        if (!isImage) {
                            binding.progressBar.visibility = View.GONE
                            Toast.makeText(
                                this@MainActivity,
                                "Error loading chat: ${error.description}",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                }

                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    // Allow all URLs to load within the WebView
                    return false
                }

                // Removed shouldInterceptRequest to avoid main thread network operations
                // ORB issue is handled via JavaScript injection and mixed content settings
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    if (newProgress < 100) {
                        binding.progressBar.visibility = View.VISIBLE
                    } else {
                        binding.progressBar.visibility = View.GONE
                    }
                }
            }
        }
    }

    private fun loadChatUrl() {
        binding.webViewChat.loadUrl(AppConfig.N8N_CHAT_URL)
    }

    override fun onBackPressed() {
        if (binding.webViewChat.canGoBack()) {
            binding.webViewChat.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        binding.webViewChat.destroy()
        super.onDestroy()
    }
}

