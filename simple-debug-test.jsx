/**
 * 간단한 디버그 테스트
 * Photoshop에서 실행해서 Windows 환경과 파일 저장을 테스트합니다
 */

#target photoshop

// 1. 환경 확인
var isWindows = $.os.indexOf("Windows") !== -1;
var osInfo = "OS: " + $.os + "\n";
osInfo += "Is Windows: " + isWindows + "\n";
osInfo += "Desktop Path: " + Folder.desktop.fsName + "\n";
osInfo += "Temp Path: " + Folder.temp.fsName + "\n";

alert("=== 환경 정보 ===\n" + osInfo);

// 2. 바탕화면에 파일 생성 테스트
try {
    var testFile = new File(Folder.desktop + "/nano-test-file.txt");
    testFile.open("w");
    testFile.writeln("=== NANO BANANA TEST ===");
    testFile.writeln("Time: " + new Date().toString());
    testFile.writeln("OS: " + $.os);
    testFile.writeln("Windows Mode: " + isWindows);
    testFile.writeln("Desktop: " + Folder.desktop.fsName);
    testFile.close();
    
    alert("테스트 파일 생성 성공!\n\n파일 위치:\n" + testFile.fsName + "\n\n바탕화면을 확인해보세요.");
} catch(e) {
    alert("파일 생성 실패!\n\n오류:\n" + e.message);
}

// 3. CONFIG 객체 테스트
var testConfig = {
    IS_WINDOWS: $.os.indexOf("Windows") !== -1
};

alert("CONFIG.IS_WINDOWS: " + testConfig.IS_WINDOWS);

// 4. 실제 callAPI 디버깅 활성화 테스트
if (isWindows) {
    alert("Windows 환경 확인됨!\n\n실제 플러그인 실행 시:\n" +
          "1. 참조 이미지를 추가하세요\n" +
          "2. 바탕화면에 다음 파일들이 생성됩니다:\n" +
          "   - nano-banana-simple-debug.txt\n" +
          "   - nano-banana-payload-full.json\n" +
          "   - nano-banana-api-debug.log");
} else {
    alert("macOS 환경입니다.\nWindows에서만 디버깅 파일이 생성됩니다.");
}