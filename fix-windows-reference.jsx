/**
 * Windows Reference Image Fix for Nano-Banana
 * 
 * 이 파일은 Windows에서 참조 이미지 처리 문제를 해결하는 수정사항입니다.
 * Nano-Banana-Gemini.jsx의 encodeImageBase64 함수를 개선합니다.
 */

// ===== 개선된 Base64 인코딩 함수 =====
function encodeImageBase64_improved(imageFile, progressWin) {
    try {
        if (progressWin) progressWin.updateStatus("Encoding image...");
        
        var outputFile = new File(Folder.temp + "/base64_" + new Date().getTime() + ".txt");
        
        if (CONFIG.IS_WINDOWS) {
            // Windows 처리 개선
            $.writeln("[DEBUG] Starting Windows encoding for: " + imageFile.fsName);
            
            // 1. 파일 존재 확인
            if (!imageFile.exists) {
                $.writeln("[ERROR] Image file does not exist: " + imageFile.fsName);
                if (progressWin) progressWin.updateStatus("Error: Image file not found");
                return null;
            }
            
            // 2. 원본 파일 확장자 가져오기
            var fileName = imageFile.name || "";
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            if (!ext) ext = ".jpg";
            $.writeln("[DEBUG] File extension: " + ext);
            
            // 3. 임시 파일 생성 (타임스탬프 추가로 충돌 방지)
            var timestamp = new Date().getTime();
            var random = Math.floor(Math.random() * 10000);
            var tempCopy = new File(Folder.temp + "/temp_encode_" + timestamp + "_" + random + ext);
            $.writeln("[DEBUG] Temp copy path: " + tempCopy.fsName);
            
            // 4. 파일 복사 시도
            var copySuccess = false;
            
            // 방법 1: File.copy() 시도
            try {
                copySuccess = imageFile.copy(tempCopy.fsName);
                $.writeln("[DEBUG] File.copy() result: " + copySuccess);
            } catch(e) {
                $.writeln("[DEBUG] File.copy() failed: " + e.message);
                copySuccess = false;
            }
            
            // 방법 2: 시스템 복사 폴백
            if (!copySuccess) {
                $.writeln("[DEBUG] Trying system copy fallback...");
                
                // fsName은 이미 Windows 경로 형식이므로 추가 변환 불필요
                var srcPath = imageFile.fsName;
                var dstPath = tempCopy.fsName;
                
                // 경로에 공백이 있을 수 있으므로 따옴표로 감싸기
                var copyCmd = 'cmd.exe /c copy /Y "' + srcPath + '" "' + dstPath + '"';
                $.writeln("[DEBUG] Copy command: " + copyCmd);
                
                try {
                    app.system(copyCmd);
                    // 복사 성공 여부 확인
                    tempCopy = new File(tempCopy.fsName); // 파일 객체 새로고침
                    copySuccess = tempCopy.exists;
                    $.writeln("[DEBUG] System copy result: " + copySuccess);
                } catch(e) {
                    $.writeln("[ERROR] System copy failed: " + e.message);
                }
            }
            
            // 5. 복사 실패 시 원본 파일 직접 사용 (최후의 수단)
            var fileToEncode = copySuccess ? tempCopy : imageFile;
            $.writeln("[DEBUG] File to encode: " + fileToEncode.fsName);
            
            // 6. certutil로 Base64 인코딩
            var srcPath = fileToEncode.fsName;
            var dstPath = outputFile.fsName;
            
            // certutil 명령어 구성
            var certCmd = 'cmd.exe /c "certutil -encode "' + srcPath + '" "' + dstPath + '""';
            $.writeln("[DEBUG] Certutil command: " + certCmd);
            
            try {
                app.system(certCmd);
                $.writeln("[DEBUG] Certutil executed");
            } catch(e) {
                $.writeln("[ERROR] Certutil failed: " + e.message);
            }
            
            // 7. 임시 파일 정리 (복사본이 있는 경우)
            if (copySuccess && tempCopy.exists) {
                try {
                    tempCopy.remove();
                    $.writeln("[DEBUG] Temp file removed");
                } catch(e) {
                    $.writeln("[DEBUG] Could not remove temp file: " + e.message);
                }
            }
            
            // 8. Base64 결과 읽기
            if (outputFile.exists) {
                $.writeln("[DEBUG] Reading base64 output...");
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                
                // 파일 크기 확인
                $.writeln("[DEBUG] Base64 file size: " + outputFile.length + " bytes");
                
                try {
                    outputFile.remove();
                } catch(e) {
                    // 무시
                }
                
                // certutil 헤더 제거
                data = data.replace(/-----BEGIN CERTIFICATE-----/g, "");
                data = data.replace(/-----END CERTIFICATE-----/g, "");
                data = data.replace(/[\r\n\s]/g, "");
                
                $.writeln("[DEBUG] Clean base64 length: " + data.length + " chars");
                
                if (data.length > 0) {
                    return data;
                } else {
                    $.writeln("[ERROR] Base64 data is empty");
                    return null;
                }
            } else {
                $.writeln("[ERROR] Base64 output file not created");
                return null;
            }
            
        } else {
            // macOS 처리 (기존 코드와 동일)
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
        $.writeln("[ERROR] encodeImageBase64 exception: " + e.message);
        if (progressWin) progressWin.updateStatus("Encoding error: " + e.message);
    }
    
    return null;
}

// ===== 참조 이미지 처리 개선 =====
function processReferenceImages_improved(referenceFiles, progressWin) {
    var encodedImages = [];
    
    for (var i = 0; i < referenceFiles.length; i++) {
        if (!referenceFiles[i] || !referenceFiles[i].exists) {
            $.writeln("[WARN] Reference file " + (i+1) + " does not exist");
            continue;
        }
        
        $.writeln("[INFO] Processing reference image " + (i+1) + "/" + referenceFiles.length);
        
        if (progressWin) {
            progressWin.updateStatus("참조 이미지 " + (i + 1) + "/" + referenceFiles.length + " 인코딩 중...");
        }
        
        // 각 참조 이미지 인코딩
        var base64Data = encodeImageBase64_improved(referenceFiles[i], progressWin);
        
        if (base64Data) {
            $.writeln("[SUCCESS] Reference image " + (i+1) + " encoded: " + base64Data.length + " chars");
            encodedImages.push({
                data: base64Data,
                mimeType: getMimeType(referenceFiles[i])
            });
        } else {
            $.writeln("[ERROR] Failed to encode reference image " + (i+1));
        }
    }
    
    $.writeln("[INFO] Total encoded references: " + encodedImages.length + "/" + referenceFiles.length);
    return encodedImages;
}

// ===== MIME 타입 결정 =====
function getMimeType(file) {
    var name = file.name.toLowerCase();
    if (name.indexOf(".png") > -1) return "image/png";
    if (name.indexOf(".gif") > -1) return "image/gif";
    if (name.indexOf(".webp") > -1) return "image/webp";
    if (name.indexOf(".bmp") > -1) return "image/bmp";
    return "image/jpeg"; // 기본값
}

// ===== 디버그 모드 활성화 =====
$.writeln("=== Windows Reference Image Fix Loaded ===");
$.writeln("This file contains improved functions for Windows compatibility");
$.writeln("Replace the original functions in Nano-Banana-Gemini.jsx with these");
$.writeln("=========================================");