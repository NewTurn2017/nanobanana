/**
 * 강제 디버깅 패치
 * 
 * Nano-Banana-Gemini.jsx의 callAPI 함수 시작 부분에 이 코드를 추가하세요.
 * 참조 이미지 유무와 상관없이 항상 디버깅 파일을 생성합니다.
 */

// callAPI 함수 시작 부분에 추가할 코드:

function callAPI(imageFile, prompt, progressWin, referenceFiles) {
    // ===== 강제 디버깅 시작 =====
    var forceDebug = true; // 항상 디버깅 활성화
    var debugInfo = [];
    
    function logDebug(msg) {
        debugInfo.push(msg);
        $.writeln(msg);
    }
    
    logDebug("=== CALL API DEBUG START ===");
    logDebug("Time: " + new Date().toString());
    logDebug("OS: " + $.os);
    logDebug("Windows: " + ($.os.indexOf("Windows") !== -1));
    logDebug("Prompt: " + prompt);
    logDebug("Main Image: " + imageFile.fsName);
    logDebug("Reference Count: " + (referenceFiles ? referenceFiles.length : 0));
    
    // 참조 이미지 정보
    if (referenceFiles && referenceFiles.length > 0) {
        logDebug("\n=== REFERENCE FILES ===");
        for (var i = 0; i < referenceFiles.length; i++) {
            if (referenceFiles[i]) {
                logDebug("Ref " + (i+1) + ": " + referenceFiles[i].fsName);
                logDebug("  Exists: " + referenceFiles[i].exists);
                logDebug("  Size: " + (referenceFiles[i].exists ? referenceFiles[i].length : "N/A"));
            } else {
                logDebug("Ref " + (i+1) + ": NULL");
            }
        }
    } else {
        logDebug("NO REFERENCE FILES");
    }
    
    // 디버그 파일 강제 생성 (OS 상관없이)
    try {
        var forceDebugFile = new File(Folder.desktop + "/nano-force-debug.txt");
        forceDebugFile.open("w");
        forceDebugFile.writeln("=== NANO BANANA FORCE DEBUG ===");
        forceDebugFile.writeln("Generated: " + new Date().toString());
        forceDebugFile.writeln("=====================================\n");
        
        for (var j = 0; j < debugInfo.length; j++) {
            forceDebugFile.writeln(debugInfo[j]);
        }
        
        forceDebugFile.writeln("\n=== CONTINUING WITH ORIGINAL FUNCTION ===");
        forceDebugFile.close();
        
        // 알림
        alert("디버그 파일 생성됨!\n" + forceDebugFile.fsName);
        
    } catch(e) {
        alert("디버그 파일 생성 실패: " + e.message);
    }
    
    // ===== 여기부터 원래 callAPI 함수 내용 계속 =====
    
    // ... 기존 코드 ...
}