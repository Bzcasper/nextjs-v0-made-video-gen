# AI Loop Video Generator

An advanced AI-powered app that creates stunning looped videos using Fal AI for media generation and DeepInfra for intelligent prompt creation. Now supports all media file types and ZIP archive processing!

## 🚀 Features

- 🎨 **AI-Powered Generation**: Uses Fal AI's fast inference for high-quality images and videos
- 🧠 **Smart Prompts**: DeepInfra analyzes your keywords to create optimized generation prompts
- 🔄 **Seamless Loops**: Generates videos designed to loop perfectly
- 📱 **Social Media Ready**: Auto-generates titles, descriptions, tags, and hashtags
- 🎛️ **Customizable**: Control duration, quality, and upload custom media
- 📦 **ZIP Support**: Upload ZIP archives with multiple media files for batch processing
- 🎵 **Universal Media Support**: Accepts all image, audio, and video formats
- ⚡ **Fast Processing**: Optimized for quick turnaround times

## 📁 Supported File Types

### Individual Files
- **Images**: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, HEIF
- **Audio**: MP3, WAV, OGG, AAC, FLAC, M4A, WMA, AIFF, Opus
- **Video**: MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V, 3GP, OGV

### ZIP Archives
- **Automatic Extraction**: Upload ZIP files containing multiple media files
- **Batch Processing**: Process up to 50 files per ZIP archive
- **Smart Filtering**: Automatically identifies and processes only media files
- **Size Limits**: ZIP files up to 500MB, individual files up to 200MB

## 🛠️ Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
# or
yarn install
\`\`\`

### 2. Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in your API keys:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required environment variables:
- \`FAL_KEY\`: Your Fal AI API key
- \`DEEPINFRA_API_KEY\`: Your DeepInfra API key

### 3. Get API Keys

#### Fal AI
1. Visit [fal.ai](https://fal.ai)
2. Sign up for an account
3. Generate an API key from your dashboard
4. Add it to your \`.env.local\` file

#### DeepInfra
1. Visit [deepinfra.com](https://deepinfra.com)
2. Create an account
3. Generate an API key
4. Add it to your \`.env.local\` file

### 4. Run the Development Server

\`\`\`bash
npm run dev
# or
pnpm dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Usage

### Basic Workflow
1. **Enter Keywords**: Describe your song, instrumental, or media content in detail
2. **Upload Files**: 
   - Individual media files (drag & drop or click to upload)
   - ZIP archives containing multiple files
3. **Configure Settings**: Set duration (5-60s) and quality level
4. **Generate**: Click generate and watch the AI pipeline work
5. **Download**: Get your looped video with complete metadata

### ZIP File Processing
1. **Upload ZIP**: Click the ZIP upload area and select your archive
2. **Auto-Processing**: The system automatically extracts and identifies media files
3. **File Management**: Review extracted files, remove unwanted ones
4. **Generation**: Use extracted files along with your keywords for generation

### Advanced Features
- **Multi-File Support**: Upload multiple individual files or ZIP archives
- **File Management**: Remove individual files, clear all files
- **Progress Tracking**: Real-time status updates during ZIP processing and generation
- **Error Recovery**: Graceful handling of unsupported files or processing errors

## 🔧 API Endpoints

- \`/api/generate-prompts\` - Creates optimized prompts using DeepInfra
- \`/api/generate-media\` - Generates images/videos using Fal AI
- \`/api/process-zip\` - Extracts and processes ZIP archives
- \`/api/fal/proxy\` - Proxy for Fal AI requests

## 📊 File Limits

| File Type | Individual Limit | ZIP Archive Limit | Max Files per ZIP |
|-----------|------------------|-------------------|-------------------|
| Images | 50MB | 500MB total | 50 files |
| Audio | 200MB | 500MB total | 50 files |
| Video | 200MB | 500MB total | 50 files |
| ZIP | N/A | 500MB | 50 files |

## 🎯 Quality Settings

- **Draft**: Fast generation, good quality (⚡)
- **Standard**: Balanced speed and quality (⭐)
- **High**: Better quality, slower generation (💎)
- **Ultra**: Best quality, longest processing time (🚀)

## 🔍 Troubleshooting

### Common Issues

1. **ZIP Processing Errors**: 
   - Ensure ZIP file is under 500MB
   - Check that ZIP contains valid media files
   - Verify ZIP file is not corrupted

2. **File Upload Issues**: 
   - Verify file formats are supported
   - Check file sizes are within limits
   - Ensure stable internet connection

3. **Generation Failures**: 
   - Check API keys are correctly set
   - Verify keywords are descriptive enough
   - Try reducing file count or size

### Error Messages

- "No valid media files found in ZIP": ZIP doesn't contain supported media formats
- "ZIP file too large": Archive exceeds 500MB limit
- "Failed to process ZIP file": Corrupted or invalid ZIP archive
- File validation errors: Files exceed size limits or unsupported formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with various file types and ZIP archives
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆕 Recent Updates

- ✅ Added support for all media file types
- ✅ Implemented ZIP archive processing
- ✅ Enhanced file management interface
- ✅ Improved error handling and validation
- ✅ Added batch processing capabilities
- ✅ Enhanced progress tracking and user feedback
\`\`\`
