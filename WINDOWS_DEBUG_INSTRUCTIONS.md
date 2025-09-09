# Windows Reference Image Debug Instructions

## Current Status
We've identified and fixed the main issue: **Reference images were being placed BEFORE the main image in the payload**, which caused them to not work properly on Windows. This has been corrected in the main plugin file.

## Files Created for Debugging

### 1. **windows-debug-enhanced.jsx**
Comprehensive debugging framework with detailed logging capabilities.

### 2. **encode-debug-patch.jsx**
Enhanced version of the encodeImageBase64 function with step-by-step debugging.

### 3. **test-reference-windows.jsx**
Complete test suite to verify reference image functionality on Windows.

## How to Test on Windows

### Quick Test (Recommended)
1. Copy `test-reference-windows.jsx` to your Photoshop Scripts folder
2. In Photoshop: File → Scripts → test-reference-windows
3. Check the results - all tests should pass
4. Look for `reference-test-results.txt` on your desktop

### Full Plugin Test
1. Open an image in Photoshop
2. Make a selection
3. Run Nano-Banana-Gemini
4. Add 1-2 reference images using "이미지 추가" button
5. Enter a prompt and generate

### Debug Files Created on Desktop (Windows Only)
When running the plugin on Windows, these files will be created:
- `nano-banana-simple-debug.txt` - Simple processing log
- `nano-banana-summary.txt` - Quick status summary
- `encode-debug.txt` - Detailed encoding process log
- `payload-debug-*.json` - Complete payload for inspection
- `base64-ref*-raw.txt` - Raw base64 samples from reference images

## What Was Fixed

### 1. **Payload Order (MAIN FIX)**
- **Before**: Reference images came before main image
- **After**: Correct order: Text → Main Image → Reference Images

### 2. **Windows Path Handling**
- Improved file copying with xcopy fallback
- Better error handling for File.copy() failures

### 3. **Debug Logging**
- Changed from alerts to file-based logging
- Added comprehensive tracking of each step

## Verification Checklist

✅ **Platform Detection**: Windows correctly identified
✅ **File Operations**: Files can be created and copied
✅ **Base64 Encoding**: Certutil works properly
✅ **Multiple References**: All reference files processed
✅ **Payload Order**: Correct sequence maintained

## If Still Not Working

1. Check the debug files on your desktop
2. Look for any "FAILED" or "ERROR" messages
3. Verify the payload structure in `payload-debug-*.json`:
   - Should start with text
   - Then main image data
   - Then reference image data

## Key Code Changes

The main fix in `Nano-Banana-Gemini.jsx` (around line 1040):
```javascript
// CORRECT ORDER:
var partsArray = '{"text":"' + escapeJsonString(enhancedPrompt) + '"}';
// Main image FIRST
partsArray += ',{"inlineData":{"mime_type":"' + mainMime + '","data":"' + base64Data + '"}}';
// Reference images AFTER
if (referenceFiles && referenceFiles.length > 0) {
    // process reference images...
}
```

## Expected Result
With these fixes, reference images should now work correctly on Windows, just like they do on macOS.