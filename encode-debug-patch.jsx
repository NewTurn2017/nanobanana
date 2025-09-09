/**
 * Enhanced encodeImageBase64 with Windows Debugging
 * 
 * Replace the encodeImageBase64 function in Nano-Banana-Gemini.jsx with this version
 * to get detailed debugging information about the encoding process on Windows.
 */

function encodeImageBase64(imageFile, progressWin, refIndex) {
    // Track timing
    var startTime = new Date().getTime();
    var debugPrefix = refIndex ? "[REF " + refIndex + "] " : "[MAIN] ";
    
    // Simple debug to desktop
    function logSimple(msg) {
        if ($.os.indexOf("Windows") !== -1) {
            try {
                var simpleLog = new File(Folder.desktop + "/encode-debug.txt");
                simpleLog.open("a");
                simpleLog.writeln(new Date().toTimeString().substr(0,8) + " " + debugPrefix + msg);
                simpleLog.close();
            } catch(e) {}
        }
    }
    
    logSimple("=== START ENCODING ===");
    logSimple("File: " + imageFile.fsName);
    logSimple("Exists: " + imageFile.exists);
    
    try {
        if (progressWin) progressWin.updateStatus("Encoding image...");
        
        var outputFile = new File(Folder.temp + "/base64_" + new Date().getTime() + ".txt");
        
        if ($.os.indexOf("Windows") !== -1) {
            // === WINDOWS PROCESSING ===
            logSimple("Platform: WINDOWS");
            
            // Step 1: Verify file exists
            if (!imageFile.exists) {
                logSimple("ERROR: File does not exist!");
                return null;
            }
            logSimple("File size: " + imageFile.length + " bytes");
            
            // Step 2: Get file extension
            var fileName = imageFile.name || "";
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            if (!ext) ext = ".jpg";
            logSimple("Extension: " + ext);
            
            // Step 3: Create temp copy with unique name
            var timestamp = new Date().getTime();
            var random = Math.floor(Math.random() * 10000);
            var tempName = "temp_encode_" + timestamp + "_" + random;
            if (refIndex) tempName += "_ref" + refIndex;
            var tempCopy = new File(Folder.temp + "/" + tempName + ext);
            
            logSimple("Temp file: " + tempCopy.fsName);
            
            // Step 4: Copy file
            var copySuccess = false;
            
            // Try File.copy() first
            logSimple("Attempting File.copy()...");
            try {
                copySuccess = imageFile.copy(tempCopy.fsName);
                logSimple("File.copy() result: " + copySuccess);
            } catch(e) {
                logSimple("File.copy() failed: " + e.message);
            }
            
            // Fallback to system copy
            if (!copySuccess) {
                logSimple("Using system copy fallback...");
                var srcPath = imageFile.fsName;
                var dstPath = tempCopy.fsName;
                
                // Use xcopy for better reliability
                var copyCmd = 'cmd.exe /c xcopy /Y "' + srcPath + '" "' + dstPath + '*"';
                logSimple("Copy command: " + copyCmd);
                
                try {
                    app.system(copyCmd);
                    tempCopy = new File(tempCopy.fsName);
                    copySuccess = tempCopy.exists;
                    logSimple("System copy result: " + copySuccess);
                    
                    if (copySuccess) {
                        logSimple("Temp file size: " + tempCopy.length + " bytes");
                    }
                } catch(e) {
                    logSimple("System copy error: " + e.message);
                }
            }
            
            // Step 5: Choose file to encode
            var fileToEncode = copySuccess ? tempCopy : imageFile;
            logSimple("Will encode: " + fileToEncode.fsName);
            logSimple("File to encode exists: " + fileToEncode.exists);
            
            // Step 6: Run certutil
            logSimple("Running certutil...");
            var certCmd = 'cmd.exe /c "certutil -encode \\"' + fileToEncode.fsName + '\\" \\"' + outputFile.fsName + '\\""';
            logSimple("Certutil command: " + certCmd);
            
            try {
                app.system(certCmd);
                logSimple("Certutil executed");
            } catch(e) {
                logSimple("Certutil error: " + e.message);
            }
            
            // Step 7: Check output
            logSimple("Checking output file: " + outputFile.fsName);
            logSimple("Output exists: " + outputFile.exists);
            
            if (outputFile.exists) {
                logSimple("Output size: " + outputFile.length + " bytes");
            }
            
            // Step 8: Clean up temp file
            if (copySuccess && tempCopy.exists) {
                try {
                    tempCopy.remove();
                    logSimple("Temp file removed");
                } catch(e) {
                    logSimple("Could not remove temp: " + e.message);
                }
            }
            
            // Step 9: Read base64 data
            if (outputFile.exists) {
                logSimple("Reading base64 data...");
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                
                logSimple("Raw data length: " + data.length);
                
                // Save raw base64 for inspection
                if (refIndex) {
                    try {
                        var rawFile = new File(Folder.desktop + "/base64-ref" + refIndex + "-raw.txt");
                        rawFile.open("w");
                        rawFile.write(data.substring(0, 1000)); // Save first 1000 chars
                        rawFile.close();
                        logSimple("Raw sample saved to: " + rawFile.fsName);
                    } catch(e) {}
                }
                
                // Clean the data
                data = data.replace(/-----BEGIN CERTIFICATE-----/g, "");
                data = data.replace(/-----END CERTIFICATE-----/g, "");
                data = data.replace(/[\r\n\s]/g, "");
                
                logSimple("Clean data length: " + data.length);
                logSimple("First 50 chars: " + data.substring(0, 50));
                
                try {
                    outputFile.remove();
                } catch(e) {}
                
                var duration = new Date().getTime() - startTime;
                logSimple("Encoding duration: " + duration + "ms");
                logSimple("=== ENCODING SUCCESS ===");
                
                return data;
            } else {
                logSimple("ERROR: No output file created!");
                logSimple("=== ENCODING FAILED ===");
                return null;
            }
            
        } else {
            // === MACOS PROCESSING ===
            logSimple("Platform: MACOS");
            
            var fileNameMac = imageFile.name || "";
            var extMac = "";
            var dotIndexMac = fileNameMac.lastIndexOf(".");
            if (dotIndexMac > -1) {
                extMac = fileNameMac.substring(dotIndexMac);
            }
            if (!extMac) extMac = ".jpg";

            var tempCopyMac = new File(Folder.temp + "/temp_encode_" + new Date().getTime() + extMac);
            var copySuccessMac = false;
            try {
                copySuccessMac = imageFile.copy(tempCopyMac.fsName);
            } catch(eMac) {
                copySuccessMac = false;
            }
            if (!copySuccessMac) {
                app.system('cp -f "' + imageFile.fsName + '" "' + tempCopyMac.fsName + '"');
            }

            if (!tempCopyMac.exists) {
                if (progressWin) progressWin.updateStatus("Error: Could not copy file on macOS");
                return null;
            }

            var cmd = 'base64 -i "' + tempCopyMac.fsName + '" > "' + outputFile.fsName + '"';
            app.system(cmd);

            try { tempCopyMac.remove(); } catch (eRm) {}
            
            if (outputFile.exists) {
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                outputFile.remove();
                
                return data.replace(/[\r\n\s]/g, "");
            }
        }
    } catch(e) {
        logSimple("EXCEPTION: " + e.message);
        logSimple("Line: " + e.line);
        logSimple("=== ENCODING FAILED (EXCEPTION) ===");
        if (progressWin) progressWin.updateStatus("Encoding error: " + e.message);
    }
    
    return null;
}