# DTU Saathi - Multimodal RAG Agent for Academic Research

A research-oriented multimodal Retrieval-Augmented Generation (RAG) system inspired by Google NotebookLM, designed to provide intelligent assistance for Delhi Technological University (DTU) students and researchers. The system combines real-time document monitoring, multimodal understanding, and conversational AI to help users interact with academic papers, research documents, circulars, policies, and notices.

## Overview

DTU Saathi is an advanced multimodal RAG agent that enables natural language interactions with a comprehensive knowledge base of DTU's academic and administrative documents. Similar to Google NotebookLM, it can extract and display images from research papers, understand context across multiple document types, and provide real-time updates on institutional information.

### Key Research Features

- **Multimodal Understanding**: Extracts and displays images, diagrams, and figures from research papers and PDF documents
- **Real-time Knowledge Updates**: Automatically monitors and indexes new circulars, policies, and notices as they are published
- **Contextual Retrieval**: Understands queries in context of multiple document types (research papers, notices, policies)
- **Conversational Interface**: Natural language interactions with the knowledge base
- **Cross-Document Reasoning**: Connects information across different document sources

## Architecture

The system consists of three main components:

### 1. Document Scraper & Indexer
- Continuously monitors DTU's official websites
- Extracts text, images, and metadata from PDF documents
- Maintains a real-time index of all documents
- Tracks changes and updates automatically

### 2. Multimodal RAG Engine
- **Mistral OCR**: Extracts text and visual content from PDF documents and images
- **Gemini Embeddings**: Generates high-quality vector embeddings for semantic search
- **PostgreSQL Vector Database**: Stores and retrieves document embeddings efficiently
- **Gemini 2.5 Pro**: Generates contextual, multimodal responses with image understanding
- Processes both text and visual content from documents
- Extracts images, charts, and diagrams from research papers

### 3. Conversational Interface
- Android application with WebView-based chat interface
- n8n workflow integration for multimodal responses
- Supports image rendering in markdown responses
- Real-time query processing

## Research Applications

### Academic Research Support
- **Paper Analysis**: Upload and query research papers with image extraction
- **Literature Review**: Search across multiple papers and documents
- **Visual Content Understanding**: Extract and explain figures, diagrams, and charts
- **Citation Assistance**: Find relevant sources and references

### Institutional Information Access
- **Real-time Notices**: Get instant updates on new announcements
- **Policy Queries**: Ask questions about DTU policies and regulations
- **Circular Information**: Access latest circulars and administrative updates
- **Exam Results**: Query exam-related information and results

### Multimodal Capabilities
- **Image Extraction**: Mistral OCR automatically extracts images, diagrams, and figures from PDF documents
- **Visual Context**: Gemini 2.5 Pro understands images in context of surrounding text
- **Diagram Analysis**: Processes charts, graphs, and technical diagrams with OCR and vision understanding
- **Figure References**: Links text references to corresponding images in responses
- **Embedded Content**: Handles complex PDF layouts with embedded images and tables

## System Components

### Backend Services

#### Web Scraper (`index.js`)
- Monitors DTU websites every minute
- Tracks 6 categories: Notices, Jobs, Tenders, Latest News, Forthcoming Events, 1st Year Notices
- Scrapes exam results from exam portal
- Detects new documents through change comparison

#### Telegram Notifier (`telegram.js`)
- Sends real-time notifications for new documents
- Downloads and forwards PDF attachments
- Formats messages with Markdown
- Categorizes notifications by type

#### Bulk Scraper (`scrape-all-urls.js`)
- One-time utility to scrape all historical documents
- Collects all public URLs from DTU websites
- Generates structured JSON output
- Creates URL index for RAG system

### Android Application

#### Features
- **WebView Chat Interface**: Embedded n8n chat widget
- **Multimodal Response Rendering**: Displays images, text, and formatted content
- **Cross-Origin Image Support**: Handles CORS/ORB issues for external images
- **Native Android Experience**: Full-featured mobile application
- **Offline Capability**: Cached responses for offline access

#### Technical Implementation
- Kotlin-based native Android app
- WebView with JavaScript injection for CORS handling
- Markdown rendering with image support
- Network security configuration for mixed content

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Android Studio (for Android app development)
- Telegram Bot Token (for notifications)
- n8n instance with multimodal RAG workflow

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd AI_FOR_DTU

# Install dependencies
npm install

# Create required directories
mkdir -p cache attachments output

# Configure Telegram bot
# Edit telegram.js and set BOT_TOKEN and CHANNEL_USERNAME
```

### Android App Setup

1. Open `android/` directory in Android Studio
2. Sync Gradle files
3. Configure n8n chat URL in `AppConfig.kt`:
   ```kotlin
   const val N8N_CHAT_URL = "https://your-n8n-instance.com/webhook/your-id/chat"
   ```
4. Build and install:
   ```bash
   cd android
   gradle clean build
   gradle installDebug
   ```

### Download Pre-built APK

You can download the pre-built APK files directly:

- **[DTU-Saathi-debug.apk](https://github.com/Kushalkhemka/hackdays_multimodal_dtu_and_research_rag/raw/main/DTU-Saathi-debug.apk)** - Debug build (recommended for testing)
- **[DTU-Saathi-release-unsigned.apk](https://github.com/Kushalkhemka/hackdays_multimodal_dtu_and_research_rag/raw/main/DTU-Saathi-release-unsigned.apk)** - Release build (unsigned, requires signing for distribution)

**Note**: The debug APK is ready to install. The release APK is unsigned and needs to be signed before distribution.

### n8n Workflow Configuration

The system requires an n8n workflow configured with:
- **Mistral OCR**: For extracting text and images from PDF documents
- **PostgreSQL with pgvector**: Vector database for storing document embeddings
- **Gemini Embeddings API**: For generating vector embeddings from text
- **Gemini 2.5 Pro**: For generating multimodal responses with image understanding
- Document processing pipeline
- RAG query processing and retrieval
- Response generation with image support

## Usage

### Starting the Scraper

```bash
npm start
```

The scraper runs continuously, checking for new documents every minute and updating the knowledge base in real-time.

### Bulk Data Collection

To collect all historical documents:

```bash
npm run scrape
```

This generates:
- `output/all-notices.json` - Complete document index
- `output/all-urls.txt` - All document URLs
- `output/urls-by-category.json` - Categorized URLs

### Using the Android App

1. Launch the DTU Saathi app
2. Start chatting with the RAG agent
3. Ask questions about:
   - Research papers and their content
   - DTU notices and circulars
   - Policies and regulations
   - Exam results and schedules
4. View images and diagrams extracted from documents

## Research Methodology

### Document Processing Pipeline

1. **Collection**: Automated scraping from official sources
2. **Extraction**: 
   - Mistral OCR extracts text and images from PDFs
   - Handles complex layouts and embedded images
3. **Embedding Generation**: 
   - Gemini Embeddings API creates vector representations
   - Generates embeddings for both text and image descriptions
4. **Storage**: 
   - Embeddings stored in PostgreSQL with pgvector extension
   - Enables efficient similarity search
5. **Update**: Real-time updates as new documents arrive

### Multimodal RAG Process

1. **Document Processing**: 
   - Mistral OCR extracts text and images from PDFs
   - Gemini Embeddings generates vector representations
   - Embeddings stored in PostgreSQL vector database

2. **Query Processing**:
   - User query converted to embedding using Gemini Embeddings
   - Semantic search performed in PostgreSQL vector database
   - Relevant documents and images retrieved

3. **Response Generation**:
   - Gemini 2.5 Pro processes query with retrieved context
   - Context includes text and extracted images
   - Generates multimodal response with image references

4. **Rendering**: 
   - Response displayed in Android app
   - Images rendered from extracted content
   - Markdown formatting for readability

### Real-time Update Mechanism

- Continuous monitoring of source websites
- Change detection through content comparison
- Automatic re-indexing of new documents
- Immediate availability in RAG system

## Data Sources

### Primary Sources
- **Main Website**: `http://www.dtu.ac.in/`
  - Notices, Jobs, Tenders, Latest News, Forthcoming Events, 1st Year Notices
- **Exam Portal**: `http://exam.dtu.ac.in/result.htm`
  - Exam results and related documents

### Document Types
- Research papers and publications
- Administrative circulars
- Policy documents
- Job postings and tenders
- Exam results and schedules
- Event announcements

## Technical Stack

### Backend
- **Node.js**: Runtime environment
- **Axios**: HTTP client for web scraping
- **Cheerio**: HTML parsing and DOM manipulation
- **Form-Data**: File upload handling
- **n8n**: Workflow automation and RAG processing

### Android
- **Kotlin**: Programming language
- **WebView**: Embedded web interface
- **Retrofit**: HTTP client
- **Markwon**: Markdown rendering
- **Glide**: Image loading and caching

### RAG System
- **PostgreSQL with pgvector**: Vector database for storing and querying document embeddings
- **Mistral OCR**: Multimodal OCR for extracting text and images from PDFs
- **Gemini Embeddings**: Google's Gemini embedding model for semantic search
- **Gemini 2.5 Pro**: Advanced multimodal LLM for generating contextual responses with image understanding

## Research Contributions

### Novel Features
1. **Real-time Multimodal RAG**: First system to combine real-time document monitoring with multimodal RAG
2. **Institutional Knowledge Base**: Specialized RAG system for academic institutions
3. **Image Extraction Pipeline**: Automated extraction and indexing of visual content
4. **Cross-Document Reasoning**: Ability to connect information across different document types

### Research Applications
- **Information Retrieval**: Advanced semantic search using Gemini embeddings and PostgreSQL vector database
- **Knowledge Management**: Automated organization of institutional knowledge with real-time updates
- **Conversational AI**: Natural language interfaces powered by Gemini 2.5 Pro
- **Multimodal Understanding**: Image extraction and understanding using Mistral OCR and Gemini 2.5 Pro
- **Real-time Systems**: Live updating knowledge bases with continuous indexing

## Output Files

### Generated Data
- `cache/*.json`: Cached documents for change detection
- `output/all-notices.json`: Complete document index with metadata
- `output/all-urls.txt`: All collected document URLs
- `output/urls-by-category.json`: URLs organized by category
- `attachments/*.pdf`: Downloaded PDF documents

### Data Format

```json
{
  "scrapedAt": "2025-11-09T22:50:00.000Z",
  "totalNotices": 1411,
  "totalUniqueUrls": 1656,
  "noticesByCategory": {
    "Notices": [...],
    "Jobs": [...],
    "Exams": [...]
  },
  "urlDetails": [...]
}
```

## Limitations & Future Work

### Current Limitations
- Image extraction limited to PDF documents
- Processing time for large documents
- Network dependency for real-time updates

### Future Enhancements
- Support for more document formats (Word, PowerPoint)
- Advanced image understanding and OCR
- Multi-language support
- Offline mode with local vector database
- Collaborative features for research teams
- Integration with academic databases

## Citation

If you use this system in your research, please cite:

```
DTU Saathi: A Multimodal RAG Agent for Real-time Academic Document Access
[Your Institution/Name]
[Year]
```

## License

This project is developed for research purposes. Please ensure compliance with DTU's terms of service when scraping their websites.

## Acknowledgments

- Delhi Technological University (DTU) for providing public access to notices and documents
- Google NotebookLM for inspiration on multimodal RAG interfaces
- n8n community for workflow automation tools
- Open source contributors to the libraries used in this project

## Contact & Support

For research inquiries, technical questions, or collaboration opportunities, please open an issue or contact the development team.

---

**Note**: This system is designed for research and educational purposes. Users should respect DTU's website terms of service and rate limits when using the scraper.
