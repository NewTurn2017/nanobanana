# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Adobe Photoshop ExtendScript (JSX) plugin for AI-powered image generation using Google Gemini API. The plugin uses Gemini 2.5 Flash model to transform selected areas in Photoshop documents using AI prompts.

## Core Architecture

### Main Components
1. **API Integration Layer** (`callAPI`, `processGeminiResponse`, `saveBase64AsImage`)
   - Handles communication with Google Gemini API using curl commands
   - Processes streaming responses from Gemini
   - Base64 encoding/decoding for image data transfer

2. **Image Processing Pipeline** (`processSelection`, `exportSelection`, `placeResultInDocument`)
   - Extracts selection from Photoshop document
   - Manages temporary file operations
   - Handles layer masking and positioning

3. **Cross-Platform Compatibility**
   - Windows: Uses `cmd.exe` and `certutil` for base64 encoding
   - macOS: Uses native `curl` and `base64` commands
   - Platform detection via `$.os.indexOf("Windows")`

## Development Commands

### Testing the Plugin
```bash
# Copy to Photoshop Scripts folder:
# macOS: /Applications/Adobe Photoshop [Version]/Presets/Scripts/
# Windows: C:\Program Files\Adobe\Adobe Photoshop [Version]\Presets\Scripts\

# Run in Photoshop: File > Scripts > Nano-Banana-Gemini
```

### Debugging
- Use `$.writeln()` for console output in ExtendScript Toolkit
- Check temp folder for intermediate files during debugging
- API responses stored temporarily in `Folder.temp`

## Key Implementation Details

### API Key Management
- Stored in `userData/NanoBanana/preferences.json`
- Functions: `getAPIKey()`, `saveAPIKey()`, `loadAPIKey()`
- Secure local storage, no hardcoded credentials

### Model Configuration
```javascript
MODEL_ID: "gemini-2.5-flash-image-preview"
API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/"
GENERATE_CONTENT_API: "streamGenerateContent"
```

### Critical Functions Flow
1. User makes selection in Photoshop
2. `main()` → Shows dialog for prompt input
3. `processSelection()` → Exports selection as JPEG
4. `callAPI()` → Sends to Gemini API with base64 encoding
5. `processGeminiResponse()` → Processes streaming response
6. `placeResultInDocument()` → Places result with layer mask

## Platform-Specific Considerations

### Windows Limitations
- Command windows appear briefly during curl execution
- Uses `certutil` for base64 encoding/decoding

### macOS Advantages
- Cleaner curl execution without visible windows
- Native base64 command available

## Error Handling Patterns
- All API calls wrapped in try-catch blocks
- Temporary files cleaned up in error scenarios
- User-friendly error messages for common issues (no selection, no API key, etc.)

## Important Constants
- `MAX_DIMENSION`: 1280px (resizes larger selections)
- `JPEG_QUALITY`: 9 (balance between quality and file size)
- `MAX_POLL_ATTEMPTS`: 60 (2-minute timeout for AI generation)
- `POLL_INTERVAL`: 2 seconds