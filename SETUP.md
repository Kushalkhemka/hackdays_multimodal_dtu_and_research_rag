# Quick Setup Guide

## Prerequisites

- Android Studio (latest version recommended)
- JDK 8 or higher
- Android SDK (API 24 or higher)

## Configuration Steps

### Step 1: Configure n8n Webhook

1. Open `android/app/src/main/java/com/dtu/ragchatbot/AppConfig.kt`
2. Update the following constants:

```kotlin
const val N8N_BASE_URL = "https://your-n8n-instance.com/"
const val N8N_WEBHOOK_PATH = "webhook/your-webhook-id"
```

**Example:**
```kotlin
const val N8N_BASE_URL = "https://n8n.example.com/"
const val N8N_WEBHOOK_PATH = "webhook/abc123def456"
```

### Step 2: n8n Webhook Response Format

Your n8n webhook should return a JSON response with one of these formats:

**Option 1:**
```json
{
  "response": "# Markdown Content\n\n![Image](https://example.com/image.png)"
}
```

**Option 2:**
```json
{
  "answer": "# Markdown Content\n\n![Image](https://example.com/image.png)"
}
```

**Option 3:**
```json
{
  "text": "# Markdown Content\n\n![Image](https://example.com/image.png)"
}
```

**Option 4:**
```json
{
  "message": "# Markdown Content\n\n![Image](https://example.com/image.png)"
}
```

The app will automatically detect and use any of these fields.

### Step 3: Build and Run

1. Open the project in Android Studio
2. Sync Gradle files
3. Connect an Android device or start an emulator
4. Click "Run" or use `./gradlew installDebug`

## Testing

1. Launch the app
2. Type a query in the input field
3. Tap "Send"
4. The app will:
   - Display your message
   - Show a loading indicator
   - Display the bot's response with markdown rendering
   - Render images if included in the markdown

## Troubleshooting

### Network Issues
- Ensure the device/emulator has internet connectivity
- Check that the n8n URL is correct
- Verify the webhook path is correct
- Check n8n webhook logs for errors

### Image Loading Issues
- Ensure image URLs in markdown are accessible
- Check network permissions in AndroidManifest.xml
- Verify Glide is properly configured (should be automatic)

### Build Errors
- Sync Gradle files: `File > Sync Project with Gradle Files`
- Clean and rebuild: `Build > Clean Project`, then `Build > Rebuild Project`
- Invalidate caches: `File > Invalidate Caches / Restart`

## Features

- ✅ Chat interface with user and bot messages
- ✅ Markdown rendering (headers, lists, links, etc.)
- ✅ Image rendering from markdown
- ✅ Loading indicators
- ✅ Error handling
- ✅ Auto-scroll to latest message
- ✅ Clean, modern UI


