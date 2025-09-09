/**
 * Nano Banana and Flux Kontext v1.2 - Complete JSX implementation for Photoshop
 * 
 * Author: Rob de Winter
 * Website: robdewinter.com | dwmtrainingen.nl
 * LinkedIn: https://www.linkedin.com/in/robdewinter/
 * 
 * Requirements:
 * - macOS: curl (pre-installed)
 * - Windows 10/11: curl.exe (pre-installed since Windows 10 1803)
 * - On Windows: no reference image support
 * - Works with Replicate API for AI image generation
 * 
 * Features:
 * - Selection-based AI image generation using Nano Banana and Flux models
 * - Optional upscaling with Real-ESRGAN
 * - Secure API key management
 * - Single-step undo functionality
 */

#target photoshop

// ===== CONFIGURATION =====
var CONFIG = {
    API_KEY: getAPIKey(),
    MODELS: {
        "Nano-Banana (Gemini)": "google/nano-banana",
        "Flux Kontext Pro": "0f1178f5a27e9aa2d2d39c8a43c110f7fa7cbf64062ff04a04cd40899e546065",
        "Flux Kontext Max": "black-forest-labs/flux-kontext-max"
    },
    MAX_POLL_ATTEMPTS: 60,
    POLL_INTERVAL: 2,
    JPEG_QUALITY: 9,
    MAX_DIMENSION: 1280,
    IS_WINDOWS: $.os.indexOf("Windows") !== -1
};

// ===== GLOBAL CANCEL FLAG =====
var PROCESS_CANCELLED = false;

// ===== PROGRESS WINDOW =====

function createProgressWindow(modelName) {
    PROCESS_CANCELLED = false;
    
    var win = new Window("palette", "AI Generation");
    win.orientation = "column";
    win.alignChildren = "fill";
    win.preferredSize.width = 350;
    win.margins = 15;
    win.spacing = 10;
    
    // Model info
    var modelText = win.add("statictext", undefined, "Generating with " + modelName);
    modelText.graphics.font = ScriptUI.newFont(modelText.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    // Progress text
    win.statusText = win.add("statictext", undefined, "Preparing image...");
    
    // Time estimate
    var timeText = win.add("statictext", undefined, "This usually takes 10-30 seconds");
    timeText.graphics.font = ScriptUI.newFont(timeText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // Windows-specific warning
    if (CONFIG.IS_WINDOWS) {
        var separator = win.add("panel");
        separator.preferredSize.height = 1;
        
        var warningText = win.add("statictext", undefined, 
            "Note: Command windows will appear briefly.\nThis is normal on Windows - please wait.", {multiline: true});
        warningText.graphics.font = ScriptUI.newFont(warningText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 9);
        warningText.justify = "center";
    }
    
    // Update function
    win.updateStatus = function(status) {
        try {
            win.statusText.text = status;
            win.update();
        } catch(e) {}
    };
    
    // Show as palette (non-blocking)
    win.show();
    
    return win;
}

// ===== CURL DETECTION =====

function checkCurlAvailable() {
    try {
        var testFile = new File(Folder.temp + "/curl_test_" + new Date().getTime() + ".txt");
        
        var cmd;
        if (CONFIG.IS_WINDOWS) {
            cmd = 'cmd.exe /c "curl.exe --version > "' + testFile.fsName + '" 2>&1"';
        } else {
            cmd = 'curl --version > "' + testFile.fsName + '" 2>&1';
        }
        
        app.system(cmd);
        
        if (testFile.exists) {
            testFile.open("r");
            var result = testFile.read();
            testFile.close();
            testFile.remove();
            return result.indexOf("curl") > -1;
        }
        
        return false;
        
    } catch(e) {
        return false;
    }
}

function showCurlMissingDialog() {
    var dialog = new Window("dialog", "Curl Not Found");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 450;
    
    var message = dialog.add("statictext", undefined, 
        "This plugin requires curl to be installed.\n\n" +
        "• macOS: Curl is pre-installed\n" +
        "• Windows 10/11: Curl should be pre-installed\n" +
        "• Older Windows: Not supported\n\n" +
        "If you're on Windows 10/11 and seeing this message,\n" +
        "please update Windows or contact support.", {multiline: true});
    message.preferredSize.height = 150;
    
    var okBtn = dialog.add("button", undefined, "OK");
    okBtn.onClick = function() { dialog.close(); };
    
    dialog.show();
}

// ===== CURL OPERATIONS =====

function executeCurl(curlArgs, outputFile) {
    var cmd;
    
    if (CONFIG.IS_WINDOWS) {
        cmd = 'cmd.exe /c "curl.exe ' + curlArgs + ' > "' + outputFile + '" 2>&1"';
    } else {
        cmd = 'curl ' + curlArgs + ' > "' + outputFile + '" 2>&1';
    }
    
    app.system(cmd);
    
    if (outputFile) {
        var file = new File(outputFile);
        if (file.exists) {
            file.open("r");
            var content = file.read();
            file.close();
            file.remove();
            return content;
        }
    }
    
    return null;
}

/**
 * Base64 encode image - with Windows path fix
 */
function encodeImageBase64(imageFile, progressWin) {
    try {
        if (progressWin) progressWin.updateStatus("Encoding image...");
        
        var outputFile = new File(Folder.temp + "/base64_" + new Date().getTime() + ".txt");
        
        if (CONFIG.IS_WINDOWS) {
            // Get original file extension
            var fileName = imageFile.name || "";
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            if (!ext) ext = ".jpg"; // fallback
            
            // Copy file to temp with original extension
            var tempCopy = new File(Folder.temp + "/temp_encode_" + new Date().getTime() + ext);
            
            // Try File.copy first
            var copySuccess = false;
            try {
                copySuccess = imageFile.copy(tempCopy.fsName);
            } catch(e) {
                copySuccess = false;
            }
            
            // Fallback to system copy if needed
            if (!copySuccess) {
                app.system('cmd.exe /c copy /Y "' + imageFile.fsName + '" "' + tempCopy.fsName + '"');
            }
            
            // Check if copy exists
            if (!tempCopy.exists) {
                if (progressWin) progressWin.updateStatus("Error: Could not copy file");
                return null;
            }
            
            // Windows certutil with temp file
            var cmd = 'cmd.exe /c "certutil -encode "' + tempCopy.fsName + '" "' + outputFile.fsName + '""';
            app.system(cmd);
            
            tempCopy.remove();
            
            if (outputFile.exists) {
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                outputFile.remove();
                
                // Remove certutil headers
                data = data.replace(/-----BEGIN CERTIFICATE-----/g, "");
                data = data.replace(/-----END CERTIFICATE-----/g, "");
                data = data.replace(/[\r\n\s]/g, "");
                
                return data;
            }
        } else {
            // macOS base64
            var cmd = 'base64 -i "' + imageFile.fsName + '" > "' + outputFile.fsName + '"';
            app.system(cmd);
            
            if (outputFile.exists) {
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                outputFile.remove();
                
                return data.replace(/[\r\n\s]/g, "");
            }
        }
    } catch(e) {
        if (progressWin) progressWin.updateStatus("Encoding error: " + e.message);
    }
    
    return null;
}

// ===== API FUNCTIONS =====

function callAPI(imageFile, referenceFile, prompt, modelVersion, isNanoBanana, progressWin) {
    try {
        // Check for cancellation
        if (PROCESS_CANCELLED) return null;
        
        // Encode main image
        var base64Data = encodeImageBase64(imageFile, progressWin);
        if (!base64Data || PROCESS_CANCELLED) {
            if (!PROCESS_CANCELLED) alert("Could not encode image");
            return null;
        }
        
        var mainImageUrl = "data:image/jpeg;base64," + base64Data;
        
        // Encode reference if needed
        var refImageUrl = null;
        if (referenceFile && referenceFile.exists && isNanoBanana) {
            if (progressWin) progressWin.updateStatus("Encoding reference image...");
            
            // Check for cancellation
            if (PROCESS_CANCELLED) return null;
            
            var refBase64Data = encodeImageBase64(referenceFile, progressWin);
            if (refBase64Data) {
                refImageUrl = "data:image/jpeg;base64," + refBase64Data;
            }
        }
        
        // Check for cancellation
        if (PROCESS_CANCELLED) return null;
        
        // Create payload
        if (progressWin) progressWin.updateStatus("Preparing AI request...");
        
        var payload;
        if (isNanoBanana) {
            payload = '{"version":"' + modelVersion + '","input":{';
            payload += '"prompt":"' + escapeJsonString(prompt) + '"';
            
            if (refImageUrl) {
                payload += ',"image_input":["' + refImageUrl + '","' + mainImageUrl + '"]';
            } else {
                payload += ',"image_input":["' + mainImageUrl + '"]';
            }
            
            payload += '}}';
        } else {
            // Flux
            payload = '{"version":"' + modelVersion + '",' +
                      '"input":{' +
                      '"prompt":"' + escapeJsonString(prompt) + '",' +
                      '"input_image":"' + mainImageUrl + '",' +
                      '"output_format":"jpg"' +
                      '}}';
        }
        
        // Write payload to file
        var payloadFile = new File(Folder.temp + "/payload_" + new Date().getTime() + ".json");
        payloadFile.open("w");
        payloadFile.write(payload);
        payloadFile.close();
        
        // Check for cancellation
        if (PROCESS_CANCELLED) {
            payloadFile.remove();
            return null;
        }
        
        // Make API request
        if (progressWin) progressWin.updateStatus("Sending to AI model...");
        
        var responseFile = new File(Folder.temp + "/response_" + new Date().getTime() + ".json");
        var curlArgs = '-s -X POST ' +
                       '-H "Authorization: Token ' + CONFIG.API_KEY + '" ' +
                       '-H "Content-Type: application/json" ' +
                       '-H "Prefer: wait" ' +
                       '-d @"' + payloadFile.fsName + '" ' +
                       '"https://api.replicate.com/v1/predictions"';
        
        var response = executeCurl(curlArgs, responseFile.fsName);
        
        payloadFile.remove();
        
        if (!response || PROCESS_CANCELLED) {
            if (!PROCESS_CANCELLED) alert("No response from API");
            return null;
        }
        
        // Check for errors
        if (response.indexOf("detail") > -1 && response.indexOf("error") > -1) {
            alert("API Error - please check your API key in Settings");
            return null;
        }
        
        // Check for immediate success
        if (response.indexOf('"status":"succeeded"') > -1 && response.indexOf('"output"') > -1) {
            if (progressWin) progressWin.updateStatus("Downloading result...");
            return downloadResult(response);
        }
        
        // Otherwise poll for result
        var predictionId = extractPredictionId(response);
        if (predictionId) {
            return pollForResult(predictionId, progressWin);
        }
        
        alert("Unexpected API response");
        return null;
        
    } catch(e) {
        if (!PROCESS_CANCELLED) alert("API error: " + e.message);
        return null;
    }
}

function pollForResult(predictionId, progressWin) {
    var maxAttempts = CONFIG.MAX_POLL_ATTEMPTS;
    
    for (var i = 0; i < maxAttempts; i++) {
        // Check for cancellation
        if (PROCESS_CANCELLED) return null;
        
        $.sleep(CONFIG.POLL_INTERVAL * 1000);
        
        if (progressWin) {
            var percent = Math.round((i / maxAttempts) * 100);
            progressWin.updateStatus("AI is working... " + percent + "%");
        }
        
        var statusFile = new File(Folder.temp + "/status_" + new Date().getTime() + ".json");
        var curlArgs = '-s -H "Authorization: Token ' + CONFIG.API_KEY + '" ' +
                       '"https://api.replicate.com/v1/predictions/' + predictionId + '"';
        
        var response = executeCurl(curlArgs, statusFile.fsName);
        
        if (response && !PROCESS_CANCELLED) {
            if (response.indexOf('"status":"succeeded"') > -1) {
                if (progressWin) progressWin.updateStatus("Downloading result...");
                return downloadResult(response);
            } else if (response.indexOf('"status":"failed"') > -1) {
                alert("Generation failed");
                return null;
            }
        }
    }
    
    if (!PROCESS_CANCELLED) {
        alert("Timeout - please try again");
    }
    return null;
}

function downloadResult(response) {
    var outputUrl = extractOutputUrl(response);
    
    if (!outputUrl) {
        alert("Could not find output URL");
        return null;
    }
    
    var resultFile = new File(Folder.temp + "/ai_result_" + new Date().getTime() + ".jpg");
    var downloadFile = new File(Folder.temp + "/download_" + new Date().getTime() + ".jpg");
    
    var curlArgs = '-s -L -o "' + downloadFile.fsName + '" "' + outputUrl + '"';
    executeCurl(curlArgs, resultFile.fsName);
    
    // Check if download file exists (curl -o creates the file directly)
    if (downloadFile.exists && downloadFile.length > 0) {
        return downloadFile;
    }
    
    alert("Could not download result");
    return null;
}

function upscaleImage(imageFile, progressWin) {
    try {
        if (progressWin) progressWin.updateStatus("Preparing upscale...");
        
        var base64Data = encodeImageBase64(imageFile, null);
        if (!base64Data || PROCESS_CANCELLED) {
            return imageFile;
        }
        
        var dataUrl = "data:image/jpeg;base64," + base64Data;
        
        var payload = '{"version":"f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",' +
                      '"input":{' +
                      '"image":"' + dataUrl + '",' +
                      '"scale":2,' +
                      '"face_enhance":false' +
                      '}}';
        
        var payloadFile = new File(Folder.temp + "/upscale_payload_" + new Date().getTime() + ".json");
        payloadFile.open("w");
        payloadFile.write(payload);
        payloadFile.close();
        
        if (progressWin) progressWin.updateStatus("Sending to upscaler...");
        
        var responseFile = new File(Folder.temp + "/upscale_response_" + new Date().getTime() + ".json");
        var curlArgs = '-s -X POST ' +
                       '-H "Authorization: Token ' + CONFIG.API_KEY + '" ' +
                       '-H "Content-Type: application/json" ' +
                       '-d @"' + payloadFile.fsName + '" ' +
                       '"https://api.replicate.com/v1/predictions"';
        
        var response = executeCurl(curlArgs, responseFile.fsName);
        
        payloadFile.remove();
        
        if (response && !PROCESS_CANCELLED) {
            var predictionId = extractPredictionId(response);
            if (predictionId) {
                if (progressWin) progressWin.updateStatus("Upscaling in progress...");
                var upscaledFile = pollForResult(predictionId, progressWin);
                if (upscaledFile && upscaledFile.exists) {
                    imageFile.remove();
                    return upscaledFile;
                }
            }
        }
        
        return imageFile;
        
    } catch(e) {
        return imageFile;
    }
}

// ===== PROCESSING FUNCTIONS =====

function processSelection(prompt, modelName, newDocument, upscale, referenceFile) {
    try {
        var doc = app.activeDocument;
        var modelVersion = CONFIG.MODELS[modelName];
        var isNanoBanana = modelName.indexOf("Nano") > -1;
        
        // Save current selection
        var savedSelection = doc.channels.add();
        savedSelection.name = "AI Selection";
        doc.selection.store(savedSelection);
        
        // Get selection bounds
        var bounds = doc.selection.bounds;
        var x1 = Math.round(bounds[0].value);
        var y1 = Math.round(bounds[1].value);
        var x2 = Math.round(bounds[2].value);
        var y2 = Math.round(bounds[3].value);
        
        // Export selection
        var tempFile = exportSelection(doc, x1, y1, x2, y2);
        
        if (!tempFile || !tempFile.exists) {
            alert("Could not export selection");
            savedSelection.remove();
            return;
        }
        
        // Show progress window
        var progressWin = createProgressWindow(modelName);
        
        // Call API
        var resultFile = callAPI(tempFile, referenceFile, prompt, modelVersion, isNanoBanana, progressWin);
        
        // Cleanup
        tempFile.remove();
        
        if (PROCESS_CANCELLED) {
            progressWin.close();
            savedSelection.remove();
            return;
        }
        
        if (resultFile && resultFile.exists) {
            if (upscale && !PROCESS_CANCELLED) {
                progressWin.updateStatus("Starting upscale process...");
                resultFile = upscaleImage(resultFile, progressWin);
            }
            
            if (!PROCESS_CANCELLED) {
                progressWin.updateStatus("Placing result in document...");
                
                if (newDocument) {
                    app.open(resultFile);
                } else {
                    placeResultInDocument(doc, resultFile, x1, y1, x2, y2, savedSelection, prompt);
                }
            }
            
            resultFile.remove();
            progressWin.close();
        } else {
            progressWin.close();
            if (!PROCESS_CANCELLED) {
                alert("Could not generate image");
            }
            savedSelection.remove();
        }
        
    } catch(e) {
        alert("Processing error: " + e.message);
    }
}

function exportSelection(doc, x1, y1, x2, y2) {
    try {
        doc.selection.deselect();
        doc.artLayers.add();
        var tempLayer = doc.activeLayer;
        tempLayer.name = "Temp Merged";
        
        selectAll();
        copyMerged();
        doc.paste();
        
        var cropDoc = doc.duplicate("temp_crop", true);
        cropDoc.crop([x1, y1, x2, y2]);
        
        // Resize if too large
        var width = cropDoc.width.value;
        var height = cropDoc.height.value;
        var maxDim = CONFIG.MAX_DIMENSION;
        
        if (width > maxDim || height > maxDim) {
            var scale = maxDim / Math.max(width, height);
            var newWidth = Math.round(width * scale);
            var newHeight = Math.round(height * scale);
            cropDoc.resizeImage(UnitValue(newWidth, "px"), UnitValue(newHeight, "px"), null, ResampleMethod.BICUBIC);
        }
        
        var timestamp = new Date().getTime();
        var tempFile = new File(Folder.temp + "/ai_input_" + timestamp + ".jpg");
        
        var saveOptions = new JPEGSaveOptions();
        saveOptions.quality = CONFIG.JPEG_QUALITY;
        cropDoc.saveAs(tempFile, saveOptions, true, Extension.LOWERCASE);
        
        cropDoc.close(SaveOptions.DONOTSAVECHANGES);
        
        doc.activeLayer = tempLayer;
        tempLayer.remove();
        
        return tempFile;
        
    } catch(e) {
        alert("Export error: " + e.message);
        return null;
    }
}

// ===== API KEY MANAGEMENT =====

function getAPIKey() {
    var apiKey = loadAPIKey();
    
    if (!apiKey || apiKey.length < 10) {
        apiKey = promptForAPIKey();
        
        if (apiKey && apiKey.length > 10) {
            saveAPIKey(apiKey);
        }
    }
    
    return apiKey;
}

function getPreferencesFile() {
    var prefsFolder = new Folder(Folder.userData + "/FluxKontext");
    if (!prefsFolder.exists) {
        prefsFolder.create();
    }
    
    return new File(prefsFolder + "/preferences.json");
}

function loadPreferences() {
    try {
        var prefsFile = getPreferencesFile();
        if (prefsFile.exists) {
            prefsFile.open("r");
            var content = prefsFile.read();
            prefsFile.close();
            
            var prefs = {};
            
            var apiKeyMatch = content.match(/"apiKey"\s*:\s*"([^"]+)"/);
            if (apiKeyMatch) prefs.apiKey = apiKeyMatch[1];
            
            var modelMatch = content.match(/"lastModel"\s*:\s*"([^"]+)"/);
            if (modelMatch) prefs.lastModel = modelMatch[1];
            
            return prefs;
        }
    } catch(e) {}
    return {};
}

function saveAPIKey(apiKey) {
    try {
        var prefs = loadPreferences();
        
        var prefsFile = getPreferencesFile();
        prefsFile.open("w");
        var json = '{"apiKey":"' + apiKey + '"';
        if (prefs.lastModel) {
            json += ',"lastModel":"' + prefs.lastModel + '"';
        }
        json += '}';
        prefsFile.write(json);
        prefsFile.close();
        return true;
    } catch(e) {
        return false;
    }
}

function loadAPIKey() {
    try {
        var prefsFile = getPreferencesFile();
        if (prefsFile.exists) {
            prefsFile.open("r");
            var content = prefsFile.read();
            prefsFile.close();
            
            var match = content.match(/"apiKey"\s*:\s*"([^"]+)"/);
            if (match && match[1]) {
                return match[1];
            }
        }
    } catch(e) {}
    return null;
}

function loadLastModel() {
    try {
        var prefsFile = getPreferencesFile();
        if (prefsFile.exists) {
            prefsFile.open("r");
            var content = prefsFile.read();
            prefsFile.close();
            
            var match = content.match(/"lastModel"\s*:\s*"([^"]+)"/);
            if (match && match[1]) {
                return match[1];
            }
        }
    } catch(e) {}
    return null;
}

function saveLastModel(modelName) {
    try {
        var prefs = loadPreferences();
        
        var prefsFile = getPreferencesFile();
        prefsFile.open("w");
        var json = '{';
        if (prefs.apiKey) {
            json += '"apiKey":"' + prefs.apiKey + '"';
        }
        if (modelName) {
            if (prefs.apiKey) json += ',';
            json += '"lastModel":"' + modelName + '"';
        }
        json += '}';
        prefsFile.write(json);
        prefsFile.close();
    } catch(e) {}
}

function promptForAPIKey(fromSettings) {
    var dialog = new Window("dialog", "Replicate API Key " + (fromSettings ? "Settings" : "Required"));
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 450;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    var instructionPanel = dialog.add("panel", undefined, fromSettings ? "Update API Key" : "First Time Setup");
    instructionPanel.alignChildren = "left";
    instructionPanel.margins = 10;
    
    instructionPanel.add("statictext", undefined, "1. Go to replicate.com and create an account");
    instructionPanel.add("statictext", undefined, "2. Go to replicate.com/account/api-tokens");
    instructionPanel.add("statictext", undefined, "3. Copy your API token (starts with 'r8_...')");
    instructionPanel.add("statictext", undefined, "4. Paste it below:");
    
    var apiKeyGroup = dialog.add("group");
    apiKeyGroup.add("statictext", undefined, "API Key:");
    var apiKeyInput = apiKeyGroup.add("edittext", undefined, "");
    apiKeyInput.characters = 40;
    
    if (fromSettings && CONFIG.API_KEY) {
        apiKeyInput.text = CONFIG.API_KEY;
        apiKeyInput.active = true;
        
        var maskedKey = CONFIG.API_KEY.substr(0, 8) + "..." + CONFIG.API_KEY.substr(-4);
        var currentKeyText = dialog.add("statictext", undefined, "Current key: " + maskedKey);
        currentKeyText.graphics.font = ScriptUI.newFont(currentKeyText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    } else {
        apiKeyInput.active = true;
    }
    
    var privacyText = dialog.add("statictext", undefined, "Your API key is stored locally in your user preferences");
    privacyText.graphics.font = ScriptUI.newFont(privacyText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // Button group
    
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, fromSettings ? "Update" : "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        if (apiKeyInput.text.length < 10) {
            if (fromSettings) {
                dialog.close(0);
            } else {
                alert("Please enter a valid API key");
            }
        } else {
            dialog.close(1);
        }
    };
    
    cancelButton.onClick = function() {
        dialog.close(0);
    };
    
    var result = dialog.show();
    
    if (result == 1) {
        return apiKeyInput.text;
    }
    
    return null;
}

function testAPIKey(apiKey) {
    try {
        // Trim whitespace en check basic format
        apiKey = apiKey.replace(/^\s+|\s+$/g, '');
        
        // Basic validation - moet met r8_ beginnen
        if (apiKey.indexOf("r8_") !== 0) {
            return false;
        }
        
        // Wacht even om te zorgen dat de key volledig is
        $.sleep(100);
        
        var testFile = new File(Folder.temp + "/test_" + new Date().getTime() + ".json");
        
        // Schrijf een tijdelijk batch/shell script om escaping problemen te voorkomen
        var scriptFile = new File(Folder.temp + "/test_api_" + new Date().getTime() + (CONFIG.IS_WINDOWS ? ".bat" : ".sh"));
        scriptFile.open("w");
        
        if (CONFIG.IS_WINDOWS) {
            scriptFile.writeln('@echo off');
            scriptFile.writeln('curl.exe -s -H "Authorization: Token ' + apiKey + '" "https://api.replicate.com/v1/account" > "' + testFile.fsName + '"');
        } else {
            scriptFile.writeln('#!/bin/bash');
            scriptFile.writeln('curl -s -H "Authorization: Token ' + apiKey + '" "https://api.replicate.com/v1/account" > "' + testFile.fsName + '"');
        }
        scriptFile.close();
        
        // Execute script
        if (CONFIG.IS_WINDOWS) {
            app.system('cmd.exe /c "' + scriptFile.fsName + '"');
        } else {
            app.system('chmod +x "' + scriptFile.fsName + '" && "' + scriptFile.fsName + '"');
        }
        
        scriptFile.remove();
        
        if (testFile.exists) {
            testFile.open("r");
            var response = testFile.read();
            testFile.close();
            testFile.remove();
            
            // Check for success - Replicate geeft "username" terug bij geldige key
            if (response.indexOf("username") > -1) {
                return true;
            }
            
            // Check voor authentication error (betekent key format is OK maar key is ongeldig)
            if (response.indexOf("authentication") > -1) {
                return false;
            }
            
            // Als we hier komen, was er een ander probleem - accepteer de key
            // (beter om gebruiker door te laten gaan dan vast te lopen)
            return true;
        }
        
        // Als test faalt, accepteer key toch (gebruiker kan doorgaan)
        return true;
        
    } catch(e) {
        // Bij ANY error, return true zodat gebruiker kan doorgaan
        return true;
    }
}

// ===== MAIN DIALOG =====

function createDialog() {
    var dialog = new Window("dialog", "NanoBanana-Flux Kontext");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 400;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    // Model selector and Settings in top row
    var topRow = dialog.add("group");
    topRow.alignment = "fill";
    
    var modelGroup = topRow.add("group");
    modelGroup.alignment = "left";
    modelGroup.add("statictext", undefined, "Model:");
    dialog.modelDropdown = modelGroup.add("dropdownlist", undefined, ["Nano-Banana (Gemini)", "Flux Kontext Pro", "Flux Kontext Max"]);
    
    var lastModel = loadLastModel();
    var defaultModel = 0;
    if (lastModel) {
        for (var i = 0; i < dialog.modelDropdown.items.length; i++) {
            if (dialog.modelDropdown.items[i].text == lastModel) {
                defaultModel = i;
                break;
            }
        }
    }
    dialog.modelDropdown.selection = defaultModel;
    
    var settingsGroup = topRow.add("group");
    settingsGroup.alignment = "right";
    var settingsBtn = settingsGroup.add("button", undefined, "Settings");
    settingsBtn.preferredSize.width = 80;
    
    settingsBtn.onClick = function() {
        var newKey = promptForAPIKey(true);
        if (newKey && newKey.length > 10) {
            CONFIG.API_KEY = newKey;
            saveAPIKey(newKey);
            alert("API key updated successfully!");
        }
    };
    
    // Prompt input
    var promptGroup = dialog.add("panel", undefined, "Prompt:");
    promptGroup.alignChildren = "fill";
    promptGroup.margins = 10;
    dialog.promptInput = promptGroup.add("edittext", undefined, "");
    dialog.promptInput.characters = 50;
    dialog.promptInput.active = true;
    
    dialog.promptInput.addEventListener('keydown', function(e) {
        if (e.keyName == 'Enter') {
            e.preventDefault();
            dialog.close(1);
        }
    });
    
    // Reference image selector (Nano-Banana only, NOT on Windows)
    var referenceGroup = null;
    var refButton = null;
    var refText = null;
    
    // Only show reference option on macOS
    if (!CONFIG.IS_WINDOWS) {
        referenceGroup = dialog.add("group");
        referenceGroup.alignment = "fill";
        referenceGroup.add("statictext", undefined, "Reference:");
        refButton = referenceGroup.add("button", undefined, "Browse...");
        refButton.preferredSize.width = 80;
        refText = referenceGroup.add("statictext", undefined, "(optional)");
        refText.characters = 25;
        dialog.referenceFile = null;
        
        refButton.onClick = function() {
            var file = File.openDialog("Select reference image", "*.jpg;*.jpeg;*.png");
            if (file) {
                refText.text = file.name;
                dialog.referenceFile = file;
            }
        };
    } else {
        // On Windows, always null
        dialog.referenceFile = null;
    }
    
    // Foreground color checkbox (Nano-Banana only)
    dialog.colorCheckbox = dialog.add("checkbox", undefined, "Use foreground color");
    dialog.colorCheckbox.value = false;
    
    // Output options
    dialog.newDocCheckbox = dialog.add("checkbox", undefined, "Output to new document");
    dialog.newDocCheckbox.value = false;
    
    dialog.upscaleCheckbox = dialog.add("checkbox", undefined, "Upscale result (2x resolution)");
    dialog.upscaleCheckbox.value = false;
    
    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var generateButton = buttonGroup.add("button", undefined, "Generate");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    generateButton.onClick = function() { dialog.close(1); };
    cancelButton.onClick = function() { dialog.close(0); };
    
    // Model dropdown change handler
    dialog.modelDropdown.onChange = function() {
        var isNanoBanana = this.selection.text.indexOf("Nano") > -1;
        
        // Only handle reference group on macOS
        if (!CONFIG.IS_WINDOWS && referenceGroup) {
            referenceGroup.visible = isNanoBanana;
            
            if (!isNanoBanana) {
                dialog.referenceFile = null;
                if (refText) refText.text = "(optional)";
            }
        }
        
        dialog.colorCheckbox.visible = isNanoBanana;
        
        if (!isNanoBanana) {
            dialog.colorCheckbox.value = false;
        }
        
        saveLastModel(this.selection.text);
    };
    
    // Initialize visibility
    var isNanoBananaDefault = dialog.modelDropdown.selection.text.indexOf("Nano") > -1;
    if (!CONFIG.IS_WINDOWS && referenceGroup) {
        referenceGroup.visible = isNanoBananaDefault;
    }
    dialog.colorCheckbox.visible = isNanoBananaDefault;
    
    return dialog;
}

// ===== HELPER FUNCTIONS =====

function extractPredictionId(response) {
    try {
        var match = response.match(/"id"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
            return match[1];
        }
    } catch(e) {}
    return null;
}

function extractOutputUrl(response) {
    try {
        var match = response.match(/"output"\s*:\s*\[?\s*"([^"]+)"/);
        if (match && match[1]) {
            return match[1];
        }
    } catch(e) {}
    return null;
}

function escapeJsonString(str) {
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
}

function toHex(n) {
    var hex = Math.round(n).toString(16);
    if (hex.length < 2) hex = "0" + hex;
    return hex.toUpperCase();
}

function hasActiveSelection() {
    try {
        var bounds = app.activeDocument.selection.bounds;
        return true;
    } catch (e) {
        return false;
    }
}

function placeResultInDocument(doc, resultFile, x1, y1, x2, y2, savedSelection, prompt) {
    try {
        var resultDoc = app.open(resultFile);
        
        resultDoc.artLayers[0].duplicate(doc, ElementPlacement.PLACEATBEGINNING);
        resultDoc.close(SaveOptions.DONOTSAVECHANGES);
        
        var newLayer = doc.artLayers[0];
        newLayer.name = prompt.substring(0, 30);
        
        var targetWidth = x2 - x1;
        var targetHeight = y2 - y1;
        
        var currentBounds = newLayer.bounds;
        var currentWidth = currentBounds[2].value - currentBounds[0].value;
        var currentHeight = currentBounds[3].value - currentBounds[1].value;
        
        if (Math.abs(currentWidth - targetWidth) > 1 || Math.abs(currentHeight - targetHeight) > 1) {
            var scaleX = (targetWidth / currentWidth) * 100;
            var scaleY = (targetHeight / currentHeight) * 100;
            var uniformScale = Math.min(scaleX, scaleY);
            
            newLayer.resize(uniformScale, uniformScale, AnchorPosition.TOPLEFT);
        }
        
        var finalBounds = newLayer.bounds;
        var finalWidth = finalBounds[2].value - finalBounds[0].value;
        var finalHeight = finalBounds[3].value - finalBounds[1].value;
        
        var centerX = x1 + (targetWidth / 2);
        var centerY = y1 + (targetHeight / 2);
        
        var currentCenterX = finalBounds[0].value + (finalWidth / 2);
        var currentCenterY = finalBounds[1].value + (finalHeight / 2);
        
        var dx = centerX - currentCenterX;
        var dy = centerY - currentCenterY;
        
        newLayer.translate(dx, dy);
        
        doc.selection.load(savedSelection);
        addLayerMask();
        doc.selection.deselect();
        
        savedSelection.remove();
        
    } catch(e) {
        alert("Placement error: " + e.message);
    }
}

function selectAll() {
    app.activeDocument.selection.selectAll();
}

function copyMerged() {
    var idCpyM = charIDToTypeID("CpyM");
    executeAction(idCpyM, undefined, DialogModes.NO);
}

function addLayerMask() {
    try {
        var idMk = charIDToTypeID("Mk  ");
        var desc = new ActionDescriptor();
        var idNw = charIDToTypeID("Nw  ");
        var idChnl = charIDToTypeID("Chnl");
        desc.putClass(idNw, idChnl);
        var idAt = charIDToTypeID("At  ");
        var ref = new ActionReference();
        var idChnl = charIDToTypeID("Chnl");
        var idChnl = charIDToTypeID("Chnl");
        var idMsk = charIDToTypeID("Msk ");
        ref.putEnumerated(idChnl, idChnl, idMsk);
        desc.putReference(idAt, ref);
        var idUsng = charIDToTypeID("Usng");
        var idUsrM = charIDToTypeID("UsrM");
        var idRvlS = charIDToTypeID("RvlS");
        desc.putEnumerated(idUsng, idUsrM, idRvlS);
        executeAction(idMk, desc, DialogModes.NO);
    } catch(e) {}
}

// ===== MAIN FUNCTION =====

function main() {
    // Check if curl is available
    if (!checkCurlAvailable()) {
        showCurlMissingDialog();
        return;
    }
    
    if (!CONFIG.API_KEY) {
        alert("No API key found. The script cannot continue without a valid Replicate API key.");
        return;
    }
    
    if (!app.documents.length) {
        alert("Please open an image in Photoshop first!");
        return;
    }
    
    if (!hasActiveSelection()) {
        alert("Please make a selection first using any selection tool!");
        return;
    }
    
    var dialog = createDialog();
    var result = dialog.show();
    
    if (result == 1) {
        var prompt = dialog.promptInput.text;
        var selectedModel = dialog.modelDropdown.selection.text;
        var newDocument = dialog.newDocCheckbox.value;
        var upscale = dialog.upscaleCheckbox.value;
        var referenceFile = dialog.referenceFile;
        var useColor = dialog.colorCheckbox.value;
        
        if (prompt.length > 0) {
            // Add color to prompt if checkbox is checked
            if (useColor && selectedModel.indexOf("Nano") > -1) {
                var color = app.foregroundColor;
                var hex = "#" + toHex(color.rgb.red) + toHex(color.rgb.green) + toHex(color.rgb.blue);
                prompt += " #" + hex;
            }
            
            var operationName = selectedModel + ": " + prompt.substring(0, 30);
            
            if (newDocument) {
                processSelection(prompt, selectedModel, newDocument, upscale, referenceFile);
            } else {
                app.activeDocument.suspendHistory(operationName, 
                    "processSelection('" + prompt.replace(/'/g, "\\'") + "', '" + 
                    selectedModel + "', " + newDocument + ", " + upscale + ", " + 
                    (referenceFile ? "File('" + referenceFile.fsName + "')" : "null") + ")");
            }
        } else {
            alert("Please enter a prompt first!");
        }
    }
}

// ===== START SCRIPT =====
main();