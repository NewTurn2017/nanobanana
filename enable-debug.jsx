/**
 * Quick Debug Enable for Nano-Banana
 * 이 스크립트를 실행하면 즉시 디버그 모드가 활성화됩니다
 */

// ===== 빠른 디버그 활성화 =====

// 1. 콘솔 창 열기 (가능한 경우)
if (app.name === "Adobe Photoshop") {
    // $.level = 2; // 디버그 레벨 설정 (0=none, 1=error, 2=debug)
    
    // 디버그 정보 표시
    var debugInfo = "=== NANO-BANANA DEBUG MODE ===\n";
    debugInfo += "OS: " + $.os + "\n";
    debugInfo += "Photoshop: " + app.version + "\n";
    debugInfo += "Temp Folder: " + Folder.temp.fsName + "\n";
    debugInfo += "Is Windows: " + ($.os.indexOf("Windows") !== -1) + "\n";
    debugInfo += "==============================\n";
    
    // 알림창으로 표시
    alert(debugInfo);
    
    // 콘솔에도 출력
    $.writeln(debugInfo);
}

// 2. 간단한 로그 함수
function log(msg) {
    $.writeln("[" + new Date().toTimeString().substr(0,8) + "] " + msg);
    
    // 파일로도 저장
    try {
        var logFile = new File(Folder.desktop + "/nano-debug.txt");
        logFile.open("a");
        logFile.writeln("[" + new Date().toTimeString().substr(0,8) + "] " + msg);
        logFile.close();
    } catch(e) {}
}

// 3. 전역 에러 핸들러
$.onerror = function(err) {
    var errorMsg = "ERROR: " + err + "\n";
    errorMsg += "Line: " + $.line + "\n";
    errorMsg += "File: " + $.fileName + "\n";
    
    $.writeln(errorMsg);
    alert(errorMsg);
    
    return true; // 에러 처리됨
};

// 4. 테스트 함수
function testDebug() {
    log("Debug mode activated!");
    log("Testing file operations...");
    
    // 테스트 파일 생성
    var testFile = new File(Folder.temp + "/debug_test.txt");
    testFile.open("w");
    testFile.write("Debug Test");
    testFile.close();
    
    log("Test file created: " + testFile.fsName);
    log("File exists: " + testFile.exists);
    
    // Windows 특정 테스트
    if ($.os.indexOf("Windows") !== -1) {
        log("Windows-specific test:");
        
        // 경로 변환 테스트
        var path = testFile.fsName;
        log("  Original path: " + path);
        log("  With backslashes: " + path.replace(/\//g, "\\"));
        
        // certutil 테스트
        var base64File = new File(Folder.temp + "/debug_base64.txt");
        var cmd = 'cmd.exe /c "certutil -encode "' + testFile.fsName + '" "' + base64File.fsName + '""';
        log("  Certutil command: " + cmd);
        
        try {
            app.system(cmd);
            log("  Certutil executed");
            log("  Base64 file exists: " + base64File.exists);
            if (base64File.exists) {
                log("  Base64 file size: " + base64File.length);
                base64File.remove();
            }
        } catch(e) {
            log("  Certutil error: " + e.message);
        }
    }
    
    // 정리
    if (testFile.exists) testFile.remove();
    
    log("Debug test completed!");
}

// 5. 실행
testDebug();

alert("Debug mode enabled!\n\nCheck:\n1. ExtendScript Toolkit Console\n2. Desktop/nano-debug.txt");