/**
 * Debug Helper for Nano-Banana
 * ExtendScript 디버그 모드 활성화 및 로그 수집
 */

// ===== 전역 디버그 설정 =====
var DEBUG_MODE = true;  // 디버그 모드 활성화
var LOG_TO_FILE = true; // 파일로 로그 저장
var SHOW_ALERTS = false; // 알림창으로 표시 (너무 많으면 귀찮음)

// ===== 로그 파일 설정 =====
var logFile = new File(Folder.desktop + "/nano-banana-debug.log");

// ===== 디버그 헬퍼 함수들 =====

/**
 * 콘솔과 파일에 로그 기록
 */
function debugLog(message, level) {
    if (!DEBUG_MODE) return;
    
    level = level || "INFO";
    var timestamp = new Date().toLocaleString();
    var logMessage = "[" + timestamp + "] [" + level + "] " + message;
    
    // 1. ExtendScript Toolkit 콘솔에 출력
    $.writeln(logMessage);
    
    // 2. 파일에 저장
    if (LOG_TO_FILE) {
        try {
            logFile.open("a"); // append mode
            logFile.writeln(logMessage);
            logFile.close();
        } catch(e) {
            $.writeln("Could not write to log file: " + e.message);
        }
    }
    
    // 3. 알림창 표시 (선택적)
    if (SHOW_ALERTS && level === "ERROR") {
        alert("ERROR: " + message);
    }
}

/**
 * 객체를 문자열로 변환하여 로그
 */
function debugObject(obj, name) {
    if (!DEBUG_MODE) return;
    
    name = name || "Object";
    debugLog("=== " + name + " ===");
    
    for (var key in obj) {
        try {
            var value = obj[key];
            var type = typeof value;
            
            if (type === "function") {
                debugLog("  " + key + ": [Function]");
            } else if (type === "object" && value !== null) {
                debugLog("  " + key + ": [Object]");
            } else {
                debugLog("  " + key + ": " + value + " (" + type + ")");
            }
        } catch(e) {
            debugLog("  " + key + ": [Error reading property]");
        }
    }
}

/**
 * 파일 정보 디버깅
 */
function debugFile(file, label) {
    if (!DEBUG_MODE) return;
    
    label = label || "File";
    debugLog("=== " + label + " Debug Info ===");
    
    if (!file) {
        debugLog("  File is null or undefined", "ERROR");
        return;
    }
    
    debugLog("  Path: " + file.fsName);
    debugLog("  Name: " + file.name);
    debugLog("  Exists: " + file.exists);
    
    if (file.exists) {
        debugLog("  Size: " + file.length + " bytes");
        debugLog("  Created: " + file.created);
        debugLog("  Modified: " + file.modified);
        debugLog("  Parent: " + (file.parent ? file.parent.fsName : "none"));
    }
}

/**
 * 실행 시간 측정
 */
function debugTimer(label) {
    this.label = label || "Timer";
    this.startTime = new Date().getTime();
    
    this.log = function(message) {
        var elapsed = new Date().getTime() - this.startTime;
        debugLog(this.label + " - " + message + " (" + elapsed + "ms)");
    };
    
    this.end = function() {
        var elapsed = new Date().getTime() - this.startTime;
        debugLog(this.label + " completed in " + elapsed + "ms");
        return elapsed;
    };
}

/**
 * try-catch 래퍼 with 자세한 에러 로깅
 */
function debugTry(func, context) {
    context = context || "Operation";
    
    try {
        debugLog("Starting: " + context);
        var result = func();
        debugLog("Success: " + context);
        return result;
    } catch(e) {
        debugLog("Failed: " + context, "ERROR");
        debugLog("  Error: " + e.message, "ERROR");
        debugLog("  Line: " + e.line, "ERROR");
        debugLog("  File: " + e.fileName, "ERROR");
        debugLog("  Stack: " + e.stack, "ERROR");
        throw e;
    }
}

// ===== 시스템 정보 수집 =====
function collectSystemInfo() {
    debugLog("=== System Information ===");
    debugLog("  OS: " + $.os);
    debugLog("  Locale: " + $.locale);
    debugLog("  ExtendScript Version: " + $.version);
    debugLog("  ExtendScript Build: " + $.build);
    
    if (typeof app !== 'undefined') {
        debugLog("  Photoshop Version: " + app.version);
        debugLog("  Photoshop Build: " + app.build);
        debugLog("  System Architecture: " + app.systemInformation);
    }
    
    debugLog("  Temp Folder: " + Folder.temp.fsName);
    debugLog("  Desktop: " + Folder.desktop.fsName);
    debugLog("  User Data: " + Folder.userData.fsName);
}

// ===== 참조 이미지 디버그 버전 =====
function encodeImageBase64_debug(imageFile, progressWin, refIndex) {
    var timer = new debugTimer("encodeImageBase64" + (refIndex ? "_ref" + refIndex : ""));
    
    debugLog("========================================");
    debugLog("Starting Base64 Encoding" + (refIndex ? " for Reference " + refIndex : ""));
    debugFile(imageFile, "Input Image");
    
    try {
        if (progressWin) progressWin.updateStatus("Encoding image...");
        
        var outputFile = new File(Folder.temp + "/base64_" + new Date().getTime() + ".txt");
        debugLog("Output file will be: " + outputFile.fsName);
        
        if ($.os.indexOf("Windows") !== -1) {
            debugLog("=== Windows Encoding Process ===");
            
            // 1. 파일 존재 확인
            if (!imageFile.exists) {
                debugLog("ERROR: Image file does not exist!", "ERROR");
                timer.end();
                return null;
            }
            
            // 2. 확장자 추출
            var fileName = imageFile.name || "";
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            if (!ext) ext = ".jpg";
            debugLog("Extension: " + ext);
            
            // 3. 임시 파일 생성
            var timestamp = new Date().getTime();
            var random = Math.floor(Math.random() * 10000);
            var tempCopy = new File(Folder.temp + "/temp_encode_" + timestamp + "_" + random + ext);
            debugLog("Temp copy will be: " + tempCopy.fsName);
            
            // 4. 파일 복사
            var copySuccess = false;
            
            // File.copy() 시도
            timer.log("Trying File.copy()");
            try {
                copySuccess = imageFile.copy(tempCopy.fsName);
                debugLog("File.copy() returned: " + copySuccess);
            } catch(e) {
                debugLog("File.copy() exception: " + e.message, "WARN");
            }
            
            // 시스템 복사 폴백
            if (!copySuccess) {
                timer.log("Trying system copy");
                var srcPath = imageFile.fsName;
                var dstPath = tempCopy.fsName;
                var copyCmd = 'cmd.exe /c copy /Y "' + srcPath + '" "' + dstPath + '"';
                
                debugLog("System copy command: " + copyCmd);
                
                try {
                    app.system(copyCmd);
                    tempCopy = new File(tempCopy.fsName);
                    copySuccess = tempCopy.exists;
                    debugLog("System copy result: " + copySuccess);
                } catch(e) {
                    debugLog("System copy exception: " + e.message, "ERROR");
                }
            }
            
            debugFile(tempCopy, "Temp Copy");
            
            // 5. Base64 인코딩
            var fileToEncode = copySuccess ? tempCopy : imageFile;
            debugLog("Will encode: " + fileToEncode.fsName);
            
            timer.log("Starting certutil");
            var certCmd = 'cmd.exe /c "certutil -encode "' + fileToEncode.fsName + '" "' + outputFile.fsName + '""';
            debugLog("Certutil command: " + certCmd);
            
            try {
                app.system(certCmd);
                debugLog("Certutil executed");
            } catch(e) {
                debugLog("Certutil exception: " + e.message, "ERROR");
            }
            
            // 6. 임시 파일 정리
            if (copySuccess && tempCopy.exists) {
                try {
                    tempCopy.remove();
                    debugLog("Temp file removed");
                } catch(e) {
                    debugLog("Could not remove temp file: " + e.message, "WARN");
                }
            }
            
            // 7. 결과 읽기
            debugFile(outputFile, "Base64 Output");
            
            if (outputFile.exists) {
                timer.log("Reading base64");
                outputFile.open("r");
                var data = outputFile.read();
                outputFile.close();
                
                debugLog("Raw base64 length: " + data.length);
                
                // 헤더 제거
                data = data.replace(/-----BEGIN CERTIFICATE-----/g, "");
                data = data.replace(/-----END CERTIFICATE-----/g, "");
                data = data.replace(/[\r\n\s]/g, "");
                
                debugLog("Clean base64 length: " + data.length);
                debugLog("First 100 chars: " + data.substring(0, 100));
                
                try {
                    outputFile.remove();
                } catch(e) {
                    debugLog("Could not remove output file: " + e.message, "WARN");
                }
                
                timer.end();
                
                if (data.length > 0) {
                    debugLog("SUCCESS: Base64 encoding completed");
                    return data;
                } else {
                    debugLog("ERROR: Base64 data is empty", "ERROR");
                    return null;
                }
            } else {
                debugLog("ERROR: Output file was not created", "ERROR");
                timer.end();
                return null;
            }
            
        } else {
            // macOS 처리
            debugLog("=== macOS Encoding Process ===");
            // ... macOS 코드 (기존과 동일)
        }
        
    } catch(e) {
        debugLog("EXCEPTION in encodeImageBase64: " + e.message, "ERROR");
        debugLog("  Line: " + e.line, "ERROR");
        timer.end();
        return null;
    }
}

// ===== 초기화 =====
if (DEBUG_MODE) {
    debugLog("\n\n========================================");
    debugLog("NANO-BANANA DEBUG SESSION STARTED");
    debugLog("========================================");
    collectSystemInfo();
    debugLog("Debug log file: " + logFile.fsName);
    debugLog("========================================\n");
}

// ===== 사용 예시 =====
/*
// 원본 코드에서 사용하기:

// 1. 이 파일을 include
//@include "debug-helper.jsx"

// 2. 디버그 로깅 사용
debugLog("Starting process...");
debugLog("Error occurred!", "ERROR");

// 3. 타이머 사용
var timer = new debugTimer("API Call");
// ... API 호출 코드 ...
timer.end();

// 4. 파일 디버깅
debugFile(myFile, "Reference Image");

// 5. Try-catch 래퍼
debugTry(function() {
    // 위험한 코드
    return someFunction();
}, "Processing image");
*/

alert("Debug Helper Loaded!\n\nDebug log will be saved to:\n" + logFile.fsName);