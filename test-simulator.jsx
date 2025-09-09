/**
 * ExtendScript Simulator for Testing Nano-Banana on Windows
 * This simulates the Photoshop environment for testing file operations
 */

#target photoshop

// ===== 환경 시뮬레이션 =====
var TEST_MODE = true;
var SIMULATED_OS = "Windows"; // "Windows" or "Mac"

// 원본 환경 변수 백업
var ORIGINAL_OS = $.os;

// 시뮬레이션 설정
function simulateEnvironment(os) {
    if (TEST_MODE) {
        // OS 시뮬레이션
        $.os = os + " NT 10.0";
        
        // 테스트 출력
        $.writeln("=== SIMULATION MODE ===");
        $.writeln("Simulated OS: " + $.os);
        $.writeln("Is Windows: " + ($.os.indexOf("Windows") !== -1));
        $.writeln("====================\n");
    }
}

// ===== 파일 처리 테스트 =====
function testFileOperations() {
    $.writeln("\n=== FILE OPERATIONS TEST ===");
    
    // 테스트 파일 생성
    var testFile = new File(Folder.temp + "/test_image.jpg");
    testFile.open("w");
    testFile.write("DUMMY_IMAGE_DATA");
    testFile.close();
    
    $.writeln("Test file created: " + testFile.fsName);
    $.writeln("File exists: " + testFile.exists);
    
    // Windows 경로 처리 테스트
    if ($.os.indexOf("Windows") !== -1) {
        var windowsPath = testFile.fsName.replace(/\//g, '\\');
        $.writeln("Windows path: " + windowsPath);
        
        // @ 참조 테스트
        var atReference = '@"' + windowsPath + '"';
        $.writeln("@ reference: " + atReference);
    }
    
    // 파일 복사 테스트
    var copyDest = new File(Folder.temp + "/test_copy.jpg");
    var copySuccess = false;
    
    try {
        copySuccess = testFile.copy(copyDest.fsName);
        $.writeln("File.copy() success: " + copySuccess);
    } catch(e) {
        $.writeln("File.copy() failed: " + e.message);
    }
    
    // 시스템 복사 폴백 테스트
    if (!copySuccess) {
        $.writeln("Testing system copy fallback...");
        if ($.os.indexOf("Windows") !== -1) {
            var srcPath = testFile.fsName.replace(/\//g, '\\');
            var dstPath = copyDest.fsName.replace(/\//g, '\\');
            var cmd = 'cmd.exe /c copy /Y "' + srcPath + '" "' + dstPath + '"';
            $.writeln("System command: " + cmd);
            
            // 실제 실행은 Photoshop 환경에서만 가능
            if (typeof app !== 'undefined' && app.system) {
                app.system(cmd);
                $.writeln("System copy executed");
            } else {
                $.writeln("System copy simulated (not in Photoshop)");
            }
        }
    }
    
    // 정리
    try {
        testFile.remove();
        if (copyDest.exists) copyDest.remove();
    } catch(e) {}
    
    $.writeln("======================\n");
}

// ===== Base64 인코딩 테스트 =====
function testBase64Encoding() {
    $.writeln("\n=== BASE64 ENCODING TEST ===");
    
    var imageFile = new File(Folder.temp + "/test_encode.jpg");
    imageFile.open("w");
    imageFile.write("TEST_IMAGE_CONTENT");
    imageFile.close();
    
    $.writeln("Source file: " + imageFile.fsName);
    
    if ($.os.indexOf("Windows") !== -1) {
        $.writeln("\n--- Windows Base64 Process ---");
        
        // 원본 확장자 유지 테스트
        var fileName = imageFile.name;
        var ext = "";
        var dotIndex = fileName.lastIndexOf(".");
        if (dotIndex > -1) {
            ext = fileName.substring(dotIndex);
        }
        $.writeln("Extension detected: " + ext);
        
        // 임시 복사 파일
        var tempCopy = new File(Folder.temp + "/temp_encode_" + new Date().getTime() + ext);
        $.writeln("Temp copy path: " + tempCopy.fsName);
        
        // 복사 시도
        var copySuccess = false;
        try {
            copySuccess = imageFile.copy(tempCopy.fsName);
            $.writeln("Copy success: " + copySuccess);
        } catch(e) {
            $.writeln("Copy failed: " + e.message);
            
            // 시스템 복사 폴백
            var srcPath = imageFile.fsName.replace(/\//g, '\\');
            var dstPath = tempCopy.fsName.replace(/\//g, '\\');
            $.writeln("Fallback src: " + srcPath);
            $.writeln("Fallback dst: " + dstPath);
            
            var copyCmd = 'cmd.exe /c copy /Y "' + srcPath + '" "' + dstPath + '"';
            $.writeln("Fallback command: " + copyCmd);
        }
        
        // Base64 출력 파일
        var outputFile = new File(Folder.temp + "/base64_output.txt");
        var outputPath = outputFile.fsName.replace(/\//g, '\\');
        $.writeln("Output path: " + outputPath);
        
        // Certutil 명령어
        var certutilCmd = 'cmd.exe /c "certutil -encode "' + 
                         tempCopy.fsName.replace(/\//g, '\\') + '" "' + 
                         outputPath + '""';
        $.writeln("Certutil command: " + certutilCmd);
        
    } else {
        $.writeln("\n--- macOS Base64 Process ---");
        
        var outputFile = new File(Folder.temp + "/base64_output.txt");
        var base64Cmd = 'base64 -i "' + imageFile.fsName + '" > "' + outputFile.fsName + '"';
        $.writeln("Base64 command: " + base64Cmd);
    }
    
    // 정리
    try {
        imageFile.remove();
        if (outputFile && outputFile.exists) outputFile.remove();
    } catch(e) {}
    
    $.writeln("=======================\n");
}

// ===== curl 명령어 테스트 =====
function testCurlCommand() {
    $.writeln("\n=== CURL COMMAND TEST ===");
    
    // 페이로드 파일
    var payloadFile = new File(Folder.temp + "/test_payload.json");
    payloadFile.open("w");
    payloadFile.write('{"test": "data"}');
    payloadFile.close();
    
    $.writeln("Payload file: " + payloadFile.fsName);
    
    if ($.os.indexOf("Windows") !== -1) {
        $.writeln("\n--- Windows curl ---");
        
        // Windows 경로 변환
        var windowsPayload = payloadFile.fsName.replace(/\//g, '\\');
        $.writeln("Windows payload path: " + windowsPayload);
        
        // @ 참조 형식
        var atReference = '@"' + windowsPayload + '"';
        $.writeln("@ reference: " + atReference);
        
        // curl 인자
        var curlArgs = '-s -X POST -H "Content-Type: application/json" -d ' + atReference + ' "https://example.com/api"';
        $.writeln("Curl args: " + curlArgs);
        
        // executeCurl 시뮬레이션
        $.writeln("\n--- executeCurl simulation ---");
        var simulatedArgs = curlArgs.replace(/@"([^"]+)"/g, function(match, path) {
            var windowsPath = path.replace(/\//g, '\\');
            $.writeln("Path conversion: " + path + " -> " + windowsPath);
            return '@"' + windowsPath + '"';
        });
        $.writeln("Processed args: " + simulatedArgs);
        
        // 출력 파일
        var outputFile = new File(Folder.temp + "/curl_response.json");
        var windowsOutput = outputFile.fsName.replace(/\//g, '\\');
        
        var fullCommand = 'cmd.exe /c "curl.exe ' + simulatedArgs + ' > "' + windowsOutput + '" 2>&1"';
        $.writeln("Full command: " + fullCommand);
        
    } else {
        $.writeln("\n--- macOS curl ---");
        
        var curlArgs = '-s -X POST -H "Content-Type: application/json" -d @"' + payloadFile.fsName + '" "https://example.com/api"';
        $.writeln("Curl args: " + curlArgs);
        
        var outputFile = new File(Folder.temp + "/curl_response.json");
        var fullCommand = 'curl ' + curlArgs + ' > "' + outputFile.fsName + '" 2>&1';
        $.writeln("Full command: " + fullCommand);
    }
    
    // 정리
    try {
        payloadFile.remove();
        if (outputFile && outputFile.exists) outputFile.remove();
    } catch(e) {}
    
    $.writeln("==================\n");
}

// ===== 참조 이미지 처리 테스트 =====
function testReferenceImageProcessing() {
    $.writeln("\n=== REFERENCE IMAGE PROCESSING TEST ===");
    
    // 참조 이미지 배열 시뮬레이션
    var referenceFiles = [];
    for (var i = 0; i < 2; i++) {
        var refFile = new File(Folder.temp + "/ref_image_" + i + ".jpg");
        refFile.open("w");
        refFile.write("REFERENCE_IMAGE_" + i);
        refFile.close();
        referenceFiles.push(refFile);
        $.writeln("Reference file " + (i+1) + ": " + refFile.fsName);
    }
    
    // 각 참조 이미지 처리
    for (var i = 0; i < referenceFiles.length; i++) {
        $.writeln("\n--- Processing Reference " + (i+1) + " ---");
        var refFile = referenceFiles[i];
        
        if ($.os.indexOf("Windows") !== -1) {
            // Windows 처리
            var fileName = refFile.name;
            var ext = "";
            var dotIndex = fileName.lastIndexOf(".");
            if (dotIndex > -1) {
                ext = fileName.substring(dotIndex);
            }
            
            $.writeln("File: " + refFile.fsName);
            $.writeln("Extension: " + ext);
            
            // 임시 복사
            var tempCopy = new File(Folder.temp + "/temp_ref_" + new Date().getTime() + "_" + i + ext);
            
            var copySuccess = false;
            try {
                copySuccess = refFile.copy(tempCopy.fsName);
                $.writeln("Copy result: " + copySuccess);
            } catch(e) {
                $.writeln("Copy error: " + e.message);
                
                // Windows 경로 변환
                var srcPath = refFile.fsName.replace(/\//g, '\\');
                var dstPath = tempCopy.fsName.replace(/\//g, '\\');
                $.writeln("Windows src: " + srcPath);
                $.writeln("Windows dst: " + dstPath);
                
                var cmd = 'cmd.exe /c copy /Y "' + srcPath + '" "' + dstPath + '"';
                $.writeln("Copy command: " + cmd);
            }
            
            // Base64 인코딩
            if (tempCopy.exists || copySuccess) {
                var base64Output = new File(Folder.temp + "/base64_ref_" + i + ".txt");
                var srcPath = tempCopy.fsName.replace(/\//g, '\\');
                var dstPath = base64Output.fsName.replace(/\//g, '\\');
                
                var certCmd = 'cmd.exe /c "certutil -encode "' + srcPath + '" "' + dstPath + '""';
                $.writeln("Certutil command: " + certCmd);
            }
            
        } else {
            // macOS 처리
            $.writeln("macOS processing for: " + refFile.fsName);
            var base64Cmd = 'base64 -i "' + refFile.fsName + '"';
            $.writeln("Base64 command: " + base64Cmd);
        }
    }
    
    // 정리
    for (var i = 0; i < referenceFiles.length; i++) {
        try {
            referenceFiles[i].remove();
        } catch(e) {}
    }
    
    $.writeln("==============================\n");
}

// ===== 메인 테스트 실행 =====
function runTests() {
    $.writeln("\n========================================");
    $.writeln("   NANO-BANANA WINDOWS TEST SIMULATOR   ");
    $.writeln("========================================\n");
    
    // Windows 환경 시뮬레이션
    simulateEnvironment(SIMULATED_OS);
    
    // 각 테스트 실행
    testFileOperations();
    testBase64Encoding();
    testCurlCommand();
    testReferenceImageProcessing();
    
    $.writeln("\n=== TEST SUMMARY ===");
    $.writeln("All tests completed");
    $.writeln("Check the output for potential issues");
    $.writeln("Compare with actual Windows behavior");
    $.writeln("===================\n");
    
    // 환경 복원
    if (TEST_MODE) {
        $.os = ORIGINAL_OS;
        $.writeln("Environment restored: " + $.os);
    }
}

// ===== 실행 =====
runTests();

// Photoshop에서 실행시 결과 표시
if (typeof app !== 'undefined') {
    alert("Test completed!\nCheck ExtendScript Toolkit console for results");
}