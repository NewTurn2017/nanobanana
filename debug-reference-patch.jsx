/**
 * 참조 이미지 디버깅 패치
 * 
 * callAPI 함수에 더 자세한 디버깅을 추가합니다.
 * Nano-Banana-Gemini.jsx의 callAPI 함수를 이 버전으로 교체하세요.
 */

function callAPI(imageFile, prompt, progressWin, referenceFiles) {
    // === 상세 디버깅 시작 ===
    var debugLog = [];
    var debugStartTime = new Date().getTime();
    
    function addDebug(msg) {
        var elapsed = new Date().getTime() - debugStartTime;
        debugLog.push("[" + elapsed + "ms] " + msg);
        $.writeln(msg);
    }
    
    addDebug("=== CALL API START ===");
    addDebug("OS: " + $.os);
    addDebug("Windows Mode: " + ($.os.indexOf("Windows") !== -1));
    addDebug("Prompt: " + prompt);
    addDebug("Main Image: " + imageFile.fsName);
    addDebug("Reference Files Count: " + (referenceFiles ? referenceFiles.length : 0));
    
    if (referenceFiles && referenceFiles.length > 0) {
        for (var i = 0; i < referenceFiles.length; i++) {
            if (referenceFiles[i]) {
                addDebug("Ref " + (i+1) + ": " + referenceFiles[i].fsName);
                addDebug("  Exists: " + referenceFiles[i].exists);
                addDebug("  Size: " + referenceFiles[i].length);
            }
        }
    }
    
    try {
        // 취소 확인
        if (PROCESS_CANCELLED) return null;
        
        // === 메인 이미지 인코딩 ===
        addDebug("\n=== ENCODING MAIN IMAGE ===");
        if (progressWin) progressWin.updateStatus("메인 이미지 인코딩 중...");
        
        var base64Data = encodeImageBase64_debug(imageFile, progressWin, null, addDebug);
        
        if (!base64Data || PROCESS_CANCELLED) {
            addDebug("ERROR: Main image encoding failed!");
            saveDebugLog(debugLog);
            if (!PROCESS_CANCELLED) alert("이미지를 인코딩할 수 없습니다");
            return null;
        }
        
        addDebug("Main image encoded: " + base64Data.length + " chars");
        
        // === 페이로드 생성 시작 ===
        addDebug("\n=== BUILDING PAYLOAD ===");
        var enhancedPrompt = "Generate an image: " + prompt;
        
        // 1. 텍스트 프롬프트
        var partsArray = '{"text":"' + escapeJsonString(enhancedPrompt) + '"}';
        addDebug("Added text prompt");
        
        // 2. 메인 이미지 (중요: 반드시 텍스트 다음에!)
        var mainMime = getMimeType(imageFile);
        partsArray += ',{"inlineData":{"mime_type":"' + mainMime + '","data":"' + base64Data + '"}}';
        addDebug("Added main image with MIME: " + mainMime);
        
        // 3. 참조 이미지들 (메인 이미지 다음에!)
        var refCount = 0;
        if (referenceFiles && referenceFiles.length > 0) {
            addDebug("\n=== ENCODING REFERENCE IMAGES ===");
            
            for (var j = 0; j < referenceFiles.length; j++) {
                if (referenceFiles[j] && referenceFiles[j].exists) {
                    addDebug("\nProcessing reference " + (j+1) + "...");
                    
                    if (progressWin) {
                        progressWin.updateStatus("참조 이미지 " + (j+1) + "/" + referenceFiles.length + " 인코딩 중...");
                    }
                    
                    var refBase64Data = encodeImageBase64_debug(referenceFiles[j], progressWin, j+1, addDebug);
                    
                    if (refBase64Data) {
                        var refMime = getMimeType(referenceFiles[j]);
                        partsArray += ',{"inlineData":{"mime_type":"' + refMime + '","data":"' + refBase64Data + '"}}';
                        refCount++;
                        addDebug("Reference " + (j+1) + " added successfully");
                        addDebug("  MIME: " + refMime);
                        addDebug("  Base64 length: " + refBase64Data.length);
                    } else {
                        addDebug("ERROR: Failed to encode reference " + (j+1));
                    }
                }
                
                if (PROCESS_CANCELLED) {
                    saveDebugLog(debugLog);
                    return null;
                }
            }
            
            addDebug("\nTotal references encoded: " + refCount + "/" + referenceFiles.length);
        }
        
        // === 최종 페이로드 구성 ===
        var jsonPayload = '{"contents":[{"role":"user","parts":[' +
                          partsArray +
                          ']}],' +
                          '"generationConfig":{' +
                          '"responseModalities":["IMAGE"],' +
                          '"temperature":1.0,' +
                          '"topP":0.95,' +
                          '"topK":40' +
                          '}}';
        
        addDebug("\n=== PAYLOAD COMPLETE ===");
        addDebug("Total payload length: " + jsonPayload.length + " chars");
        addDebug("Parts in payload: Text + Main + " + refCount + " references");
        
        // 페이로드 순서 검증
        var textPos = jsonPayload.indexOf('"text"');
        var mainPos = jsonPayload.indexOf(base64Data.substring(0, 20));
        addDebug("\nPayload order check:");
        addDebug("  Text at position: " + textPos);
        addDebug("  Main image at position: " + mainPos);
        
        if (textPos < mainPos) {
            addDebug("  ✓ Order is CORRECT");
        } else {
            addDebug("  ✗ Order is WRONG!");
        }
        
        // 페이로드 저장
        var payloadFile = new File(Folder.temp + "/payload_" + new Date().getTime() + ".json");
        payloadFile.open("w");
        payloadFile.write(jsonPayload);
        payloadFile.close();
        addDebug("\nPayload saved to: " + payloadFile.fsName);
        
        // Windows에서 추가 디버깅 파일 저장
        if ($.os.indexOf("Windows") !== -1) {
            var desktopPayload = new File(Folder.desktop + "/nano-payload-debug.json");
            desktopPayload.open("w");
            desktopPayload.write(jsonPayload);
            desktopPayload.close();
            addDebug("Payload also saved to desktop");
        }
        
        // === API 호출 ===
        addDebug("\n=== CALLING API ===");
        if (progressWin) progressWin.updateStatus("Gemini AI로 전송 중...");
        
        var responseFile = new File(Folder.temp + "/response_" + new Date().getTime() + ".json");
        var apiUrl = CONFIG.API_ENDPOINT + CONFIG.MODEL_ID + ":" + CONFIG.GENERATE_CONTENT_API + "?key=" + CONFIG.API_KEY;
        
        var payloadPath = payloadFile.fsName;
        var curlArgs = '-s -X POST ' +
                       '-H "Content-Type: application/json" ' +
                       '-d @"' + payloadPath + '" ' +
                       '"' + apiUrl + '"';
        
        addDebug("Executing curl...");
        var response = executeCurl(curlArgs, responseFile.fsName);
        
        addDebug("API response received: " + (response ? "YES" : "NO"));
        if (response) {
            addDebug("Response length: " + response.length + " chars");
            addDebug("Response preview: " + response.substring(0, 100));
        }
        
        // 디버그 로그 저장
        saveDebugLog(debugLog);
        
        // 정리
        payloadFile.remove();
        
        if (!response || PROCESS_CANCELLED) {
            if (!PROCESS_CANCELLED) alert("API 응답 없음");
            return null;
        }
        
        // 에러 확인
        if (response.indexOf("error") > -1) {
            alert("API 오류 - 설정에서 API 키를 확인하세요");
            return null;
        }
        
        // Gemini 응답 처리
        if (progressWin) progressWin.updateStatus("결과 처리 중...");
        return processGeminiResponse(response, progressWin);
        
    } catch(e) {
        addDebug("EXCEPTION: " + e.message);
        addDebug("Line: " + e.line);
        saveDebugLog(debugLog);
        if (!PROCESS_CANCELLED) alert("API 오류: " + e.message);
        return null;
    }
}

// 디버깅 기능이 추가된 인코딩 함수
function encodeImageBase64_debug(imageFile, progressWin, refIndex, debugFunc) {
    var prefix = refIndex ? "[REF" + refIndex + "] " : "[MAIN] ";
    
    debugFunc(prefix + "Starting encode...");
    debugFunc(prefix + "File: " + imageFile.fsName);
    debugFunc(prefix + "Exists: " + imageFile.exists);
    debugFunc(prefix + "Size: " + imageFile.length);
    
    try {
        if (progressWin) progressWin.updateStatus("Encoding image...");
        
        var outputFile = new File(Folder.temp + "/base64_" + new Date().getTime() + ".txt");
        
        if ($.os.indexOf("Windows") !== -1) {
            // Windows 처리
            debugFunc(prefix + "Using Windows certutil");
            
            if (!imageFile.exists) {
                debugFunc(prefix + "ERROR: File does not exist!");
                return null;
            }
            
            // 파일 확장자
            var fileName = imageFile.name || "";
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            if (!ext) ext = ".jpg";
            
            // 임시 파일 생성
            var timestamp = new Date().getTime();
            var random = Math.floor(Math.random() * 10000);
            var tempCopy = new File(Folder.temp + "/temp_encode_" + timestamp + "_" + random + ext);
            
            // 파일 복사
            var copySuccess = false;
            try {
                copySuccess = imageFile.copy(tempCopy.fsName);
                debugFunc(prefix + "File.copy() result: " + copySuccess);
            } catch(e) {
                debugFunc(prefix + "File.copy() failed, using system copy");
                var copyCmd = 'cmd.exe /c copy /Y "' + imageFile.fsName + '" "' + tempCopy.fsName + '"';
                app.system(copyCmd);
                tempCopy = new File(tempCopy.fsName);
                copySuccess = tempCopy.exists;
            }
            
            var fileToEncode = copySuccess ? tempCopy : imageFile;
            debugFunc(prefix + "Encoding file: " + fileToEncode.fsName);
            
            // certutil 실행 (수정된 명령어)
            var cmd = 'cmd.exe /c certutil -encode "' + fileToEncode.fsName + '" "' + outputFile.fsName + '"';
            debugFunc(prefix + "Command: " + cmd);
            
            app.system(cmd);
            
            // 결과 확인
            debugFunc(prefix + "Output file exists: " + outputFile.exists);
            
            if (outputFile.exists) {
                debugFunc(prefix + "Output file size: " + outputFile.length);
                
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                
                // 정리
                data = data.replace(/-----BEGIN CERTIFICATE-----/g, "");
                data = data.replace(/-----END CERTIFICATE-----/g, "");
                data = data.replace(/[\r\n\s]/g, "");
                
                debugFunc(prefix + "Encoded successfully: " + data.length + " chars");
                
                outputFile.remove();
                if (copySuccess && tempCopy.exists) {
                    tempCopy.remove();
                }
                
                return data;
            } else {
                debugFunc(prefix + "ERROR: Output file not created!");
                return null;
            }
            
        } else {
            // macOS 처리
            debugFunc(prefix + "Using macOS base64");
            
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
                app.system('cp -f "' + imageFile.fsName + '" "' + tempCopyMac.fsName + '"');
            }

            if (!tempCopyMac.exists) {
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
                
                debugFunc(prefix + "Encoded successfully: " + data.length + " chars");
                return data.replace(/[\r\n\s]/g, "");
            }
        }
    } catch(e) {
        debugFunc(prefix + "EXCEPTION: " + e.message);
        return null;
    }
    
    return null;
}

// 디버그 로그 저장
function saveDebugLog(debugLog) {
    try {
        var logFile = new File(Folder.desktop + "/nano-api-call-debug.txt");
        logFile.open("w");
        logFile.writeln("NANO-BANANA API CALL DEBUG LOG");
        logFile.writeln("Time: " + new Date().toString());
        logFile.writeln("=====================================\n");
        
        for (var i = 0; i < debugLog.length; i++) {
            logFile.writeln(debugLog[i]);
        }
        
        logFile.writeln("\n=====================================");
        logFile.writeln("END OF DEBUG LOG");
        logFile.close();
        
        $.writeln("Debug log saved to: " + logFile.fsName);
    } catch(e) {
        $.writeln("Could not save debug log: " + e.message);
    }
}