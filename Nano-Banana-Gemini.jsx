/**
 * Nano Banana for Photoshop v2.3.1 - Google Gemini API 통합 버전
 * 
 * 제작자: Genie
 * 웹사이트: www.codewithgenie.com
 * 
 * 요구사항:
 * - macOS: curl (사전 설치됨)
 * - Windows 10/11: curl.exe (Windows 10 1803부터 사전 설치됨)
 * - Google Gemini API 키 필요
 * 
 * 기능:
 * - 선택 영역 기반 AI 이미지 생성 (Gemini 2.5 Flash 사용)
 * - 이미지와 텍스트 동시 생성
 * - 보안 API 키 관리
 * - 고급 색상 피커
 * - 자동 업데이트 시스템
 */

#target photoshop

// ===== 버전 정보 =====
var PLUGIN_VERSION = "2.4.0";
var AUTO_UPDATE_ENABLED = true;
var UPDATE_CHECK_URL = "https://api.github.com/repos/NewTurn2017/nanobanana/releases/latest";

// ===== 설정 =====
var CONFIG = {
    API_KEY: getAPIKey(),
    MODEL_ID: "gemini-2.5-flash-image-preview",
    API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",
    GENERATE_CONTENT_API: "streamGenerateContent",
    MAX_POLL_ATTEMPTS: 60,
    POLL_INTERVAL: 2,
    JPEG_QUALITY: 9,
    MAX_DIMENSION: 1280,
    IS_WINDOWS: $.os.indexOf("Windows") !== -1
};

// ===== 프리셋 데이터 로드 =====
// preset.js 파일을 include하는 방법
var PRESETS = [];
var PRESET_CATEGORIES = ['전체', '사용자'];

// preset.js 파일 로드 시도
function loadPresetFile() {
    try {
        // 현재 실행 중인 스크립트의 폴더 경로 가져오기
        var currentScript = new File($.fileName);
        var scriptFolder = currentScript.parent;
        var presetFile = new File(scriptFolder.fullName + "/preset.js");
        
        // preset.js 파일이 존재하는지 확인
        if (presetFile.exists) {
            // 파일 읽기
            presetFile.open("r");
            presetFile.encoding = "UTF-8";
            var content = presetFile.read();
            presetFile.close();
            
            // JavaScript 코드 실행
            eval(content);
            
            // presets 변수가 정의되었는지 확인
            if (typeof presets !== 'undefined' && presets.length > 0) {
                PRESETS = presets;
                
                // 카테고리 수집
                var categorySet = {};
                for (var i = 0; i < PRESETS.length; i++) {
                    if (PRESETS[i].category) {
                        categorySet[PRESETS[i].category] = true;
                    }
                }
                
                // 카테고리 목록 재구성
                PRESET_CATEGORIES = ['전체'];
                for (var cat in categorySet) {
                    PRESET_CATEGORIES.push(cat);
                }
                PRESET_CATEGORIES.push('사용자');
                
                // 성공 (조용히 로드 - 배포 버전에서는 알림 없음)
                // alert("프리셋 로드 성공: " + PRESETS.length + "개");
                return true;
            }
        }
    } catch(e) {
        // 오류 발생 시 조용히 실패 (기본 프리셋 사용)
    }
    
    // 로드 실패 시 기본 프리셋
    PRESETS = [
        { id: 'figure', title: '피규어로 변환', description: '사진을 캐릭터 피규어로 변환합니다.', prompt: "Transform a photo into a character figure.", imageCount: 1, category: '변환' },
        { id: 'colorize', title: '흑백 사진 컬러화', description: '흑백 사진을 컬러풀한 사진으로 변환합니다.', prompt: 'Turn a black-and-white photo into a colorful one.', imageCount: 1, category: '변환' },
        { id: 'bg-change', title: '배경 변경', description: '인물을 다른 배경 이미지에 합성합니다.', prompt: 'Place the person from the first image into the background of the second image naturally.', imageCount: 2, category: '합성' },
        { id: 'enhance', title: '이미지 향상', description: '이미지 품질과 디테일을 향상시킵니다.', prompt: 'Enhance image quality, improve details, fix lighting and color balance.', imageCount: 1, category: '편집' }
    ];
    PRESET_CATEGORIES = ['전체', '변환', '합성', '편집', '사용자'];
    return false;
}

// 스크립트 시작 시 프리셋 로드
loadPresetFile();

// 모든 프리셋 가져오기 (기본 + 사용자)
function getAllPresets() {
    var allPresets = PRESETS.slice(); // 기본 프리셋 복사
    var userPresets = loadUserPresets();
    return allPresets.concat(userPresets);
}

// ===== 전역 취소 플래그 =====
var PROCESS_CANCELLED = false;

// ===== 빠른 프리셋 관리 =====
function getQuickPresetsFile() {
    var userDataFolder = new Folder(Folder.userData + "/NanoBanana");
    if (!userDataFolder.exists) {
        userDataFolder.create();
    }
    return new File(userDataFolder + "/quick_presets.json");
}

function loadQuickPresetIds() {
    var file = getQuickPresetsFile();
    if (file.exists) {
        try {
            file.open("r");
            file.encoding = "UTF-8";
            var content = file.read();
            file.close();
            if (content) {
                return eval('(' + content + ')');
            }
        } catch(e) {}
    }
    // 기본 빠른 프리셋 ID들
    return ['figure', 'colorize', 'bg-change', 'enhance', 'remove-object'];
}

function saveQuickPresetIds(ids) {
    var file = getQuickPresetsFile();
    try {
        file.open("w");
        file.encoding = "UTF-8";
        // JSON 배열로 저장
        var json = '["' + ids.join('","') + '"]';
        file.write(json);
        file.close();
        return true;
    } catch(e) {
        return false;
    }
}

// ===== 세션 데이터 관리 =====
function getSessionDataFile() {
    var userDataFolder = new Folder(Folder.userData + "/NanoBanana");
    if (!userDataFolder.exists) {
        userDataFolder.create();
    }
    return new File(userDataFolder + "/session_data.json");
}

function saveSessionData(data) {
    var file = getSessionDataFile();
    try {
        file.open("w");
        file.encoding = "UTF-8";
        
        // 수동으로 JSON 생성
        var json = '{';
        json += '"prompt":"' + escapeJsonString(data.prompt || '') + '",';
        json += '"referenceFiles":[';
        
        if (data.referenceFiles && data.referenceFiles.length > 0) {
            for (var i = 0; i < data.referenceFiles.length; i++) {
                json += '"' + escapeJsonString(data.referenceFiles[i]) + '"';
                if (i < data.referenceFiles.length - 1) json += ',';
            }
        }
        json += '],';
        json += '"backgroundColor":' + (data.backgroundColor ? 
            '{"r":' + data.backgroundColor.r + ',"g":' + data.backgroundColor.g + ',"b":' + data.backgroundColor.b + '}' : 
            'null');
        json += '}';
        
        file.write(json);
        file.close();
        return true;
    } catch(e) {
        return false;
    }
}

function loadSessionData() {
    var file = getSessionDataFile();
    if (file.exists) {
        try {
            file.open("r");
            file.encoding = "UTF-8";
            var content = file.read();
            file.close();
            
            // 간단한 JSON 파싱
            var data = {
                prompt: '',
                referenceFiles: [],
                backgroundColor: null
            };
            
            // 프롬프트 추출
            var promptMatch = content.match(/"prompt"\s*:\s*"([^"]*)"/);
            if (promptMatch) {
                // 유니코드 이스케이프 문자를 실제 문자로 변환
                data.prompt = unescapeJsonString(promptMatch[1]);
            }
            
            // 참조 파일 추출
            var filesMatch = content.match(/"referenceFiles"\s*:\s*\[(.*?)\]/);
            if (filesMatch) {
                var filesStr = filesMatch[1];
                if (filesStr) {
                    var fileMatches = filesStr.match(/"([^"]+)"/g);
                    if (fileMatches) {
                        for (var i = 0; i < fileMatches.length; i++) {
                            var filePath = fileMatches[i].replace(/"/g, '');
                            // 파일 경로도 유니코드 디코딩
                            data.referenceFiles.push(unescapeJsonString(filePath));
                        }
                    }
                }
            }
            
            // 배경색 추출
            var bgMatch = content.match(/"backgroundColor"\s*:\s*\{([^}]+)\}/);
            if (bgMatch) {
                var rMatch = bgMatch[1].match(/"r"\s*:\s*(\d+)/);
                var gMatch = bgMatch[1].match(/"g"\s*:\s*(\d+)/);
                var bMatch = bgMatch[1].match(/"b"\s*:\s*(\d+)/);
                
                if (rMatch && gMatch && bMatch) {
                    data.backgroundColor = {
                        r: parseInt(rMatch[1]),
                        g: parseInt(gMatch[1]),
                        b: parseInt(bMatch[1])
                    };
                }
            }
            
            return data;
        } catch(e) {
            return null;
        }
    }
    return null;
}

// ===== 사용자 프리셋 관리 =====
function getUserPresetsFile() {
    var userDataFolder = new Folder(Folder.userData + "/NanoBanana");
    if (!userDataFolder.exists) {
        userDataFolder.create();
    }
    return new File(userDataFolder + "/user_presets.json");
}

function loadUserPresets() {
    var file = getUserPresetsFile();
    if (file.exists) {
        try {
            file.open("r");
            file.encoding = "UTF-8";
            var content = file.read();
            file.close();
            if (content) {
                return eval('(' + content + ')');
            }
        } catch(e) {
            // 에러 발생 시 빈 배열 반환
        }
    }
    return [];
}

function deleteUserPreset(presetId) {
    var userPresets = loadUserPresets();
    var updatedPresets = [];
    
    for (var i = 0; i < userPresets.length; i++) {
        if (userPresets[i].id !== presetId) {
            updatedPresets.push(userPresets[i]);
        }
    }
    
    if (saveUserPresets(updatedPresets)) {
        return true;
    }
    return false;
}

function editUserPreset(presetId, newTitle, newDescription, newPrompt, newImageCount) {
    var userPresets = loadUserPresets();
    
    for (var i = 0; i < userPresets.length; i++) {
        if (userPresets[i].id === presetId) {
            userPresets[i].title = newTitle;
            userPresets[i].description = newDescription;
            userPresets[i].prompt = newPrompt;
            userPresets[i].imageCount = newImageCount;
            break;
        }
    }
    
    if (saveUserPresets(userPresets)) {
        return true;
    }
    return false;
}

function saveUserPresets(userPresets) {
    var file = getUserPresetsFile();
    try {
        file.open("w");
        file.encoding = "UTF-8";
        // JSON 문자열로 변환 (수동으로)
        var json = "[\n";
        for (var i = 0; i < userPresets.length; i++) {
            if (i > 0) json += ",\n";
            var preset = userPresets[i];
            json += "  {\n";
            json += '    "id": "' + preset.id + '",\n';
            json += '    "title": "' + escapeJsonString(preset.title) + '",\n';
            json += '    "description": "' + escapeJsonString(preset.description) + '",\n';
            json += '    "prompt": "' + escapeJsonString(preset.prompt) + '",\n';
            json += '    "imageCount": ' + (typeof preset.imageCount === 'string' ? '"' + preset.imageCount + '"' : preset.imageCount) + ',\n';
            json += '    "category": "' + preset.category + '"\n';
            json += "  }";
        }
        json += "\n]";
        file.write(json);
        file.close();
        return true;
    } catch(e) {
        alert("사용자 프리셋 저장 실패: " + e.message);
        return false;
    }
}

function addUserPreset(title, description, prompt, imageCount, category) {
    var userPresets = loadUserPresets();
    var newPreset = {
        id: 'user_' + new Date().getTime(),
        title: title,
        description: description,
        prompt: prompt,
        imageCount: imageCount,
        category: category || '사용자'
    };
    userPresets.push(newPreset);
    if (saveUserPresets(userPresets)) {
        return newPreset;
    }
    return null;
}

// ===== 진행 상황 창 =====

/**
 * 멀티 프로그레스 윈도우 생성 - 여러 이미지 동시 생성 시 사용
 */
function createMultiProgressWindow(count) {
    PROCESS_CANCELLED = false;
    
    var win = new Window("palette", "AI 이미지 생성 중 (" + count + "장 병렬 처리)");
    win.orientation = "column";
    win.alignChildren = "fill";
    win.preferredSize.width = 400;
    win.margins = 15;
    win.spacing = 10;
    
    // 모델 정보
    var modelText = win.add("statictext", undefined, "Gemini 2.5 Flash로 " + count + "장 동시 생성 중");
    modelText.graphics.font = ScriptUI.newFont(modelText.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    // 전체 진행 상황
    win.statusText = win.add("statictext", undefined, "이미지 준비 중...");
    
    // 개별 프로그레스 바들
    var progressPanel = win.add("panel", undefined, "생성 진행 상황");
    progressPanel.alignChildren = "fill";
    progressPanel.margins = 10;
    
    win.progressBars = [];
    win.statusTexts = [];
    
    for (var i = 0; i < count; i++) {
        var group = progressPanel.add("group");
        group.alignment = "fill";
        
        var label = group.add("statictext", undefined, "이미지 " + (i+1) + ":");
        label.preferredSize.width = 60;
        
        var progressBar = group.add("progressbar", undefined, 0, 100);
        progressBar.preferredSize.width = 200;
        
        var statusText = group.add("statictext", undefined, "대기");
        statusText.preferredSize.width = 60;
        
        win.progressBars.push(progressBar);
        win.statusTexts.push(statusText);
    }
    
    // 예상 시간
    var timeText = win.add("statictext", undefined, "병렬 처리로 시간이 단축됩니다 (보통 15-40초)");
    timeText.graphics.font = ScriptUI.newFont(timeText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // 개별 프로그레스 업데이트 함수
    win.updateProgress = function(index, value) {
        if (index >= 0 && index < win.progressBars.length) {
            win.progressBars[index].value = value;
            if (value === 100) {
                win.statusTexts[index].text = "완료";
            } else if (value > 0) {
                win.statusTexts[index].text = "처리중";
            }
        }
    };
    
    // 단일 프로그레스 윈도우와 호환성을 위한 함수들
    win.updateStatus = function(text) {
        win.statusText.text = text;
    };
    
    // Windows 전용 경고
    if (CONFIG.IS_WINDOWS) {
        var separator = win.add("panel");
        separator.preferredSize.height = 1;
        
        var warningText = win.add("statictext", undefined, 
            "참고: 여러 명령 창이 잠시 나타날 수 있습니다.", {multiline: false});
        warningText.graphics.font = ScriptUI.newFont(warningText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 9);
        warningText.justify = "center";
    }
    
    // 취소 버튼
    var cancelBtn = win.add("button", undefined, "취소");
    cancelBtn.onClick = function() {
        PROCESS_CANCELLED = true;
        win.close();
    };
    
    win.show();
    return win;
}

function createProgressWindow() {
    PROCESS_CANCELLED = false;
    
    var win = new Window("palette", "AI 생성 중");
    win.orientation = "column";
    win.alignChildren = "fill";
    win.preferredSize.width = 350;
    win.margins = 15;
    win.spacing = 10;
    
    // 모델 정보
    var modelText = win.add("statictext", undefined, "Gemini 2.5 Flash로 생성 중");
    modelText.graphics.font = ScriptUI.newFont(modelText.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    // 진행 텍스트
    win.statusText = win.add("statictext", undefined, "이미지 준비 중...");
    
    // 예상 시간
    var timeText = win.add("statictext", undefined, "보통 10-30초 소요됩니다");
    timeText.graphics.font = ScriptUI.newFont(timeText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // Windows 전용 경고
    if (CONFIG.IS_WINDOWS) {
        var separator = win.add("panel");
        separator.preferredSize.height = 1;
        
        var warningText = win.add("statictext", undefined, 
            "참고: 명령 창이 잠시 나타납니다.\nWindows에서 정상적인 현상이니 기다려 주세요.", {multiline: true});
        warningText.graphics.font = ScriptUI.newFont(warningText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 9);
        warningText.justify = "center";
    }
    
    // 업데이트 함수
    win.updateStatus = function(status) {
        try {
            win.statusText.text = status;
            win.update();
        } catch(e) {}
    };
    
    // 팔레트로 표시 (비차단)
    win.show();
    
    return win;
}

// ===== CURL 감지 =====

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
    var dialog = new Window("dialog", "Curl을 찾을 수 없음");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 450;
    
    var message = dialog.add("statictext", undefined, 
        "이 플러그인은 curl이 설치되어 있어야 합니다.\n\n" +
        "• macOS: Curl이 사전 설치됨\n" +
        "• Windows 10/11: Curl이 사전 설치됨\n" +
        "• 이전 Windows: 지원 안 됨\n\n" +
        "Windows 10/11을 사용 중인데 이 메시지가 나타나면,\n" +
        "Windows를 업데이트하거나 지원팀에 문의하세요.", {multiline: true});
    message.preferredSize.height = 150;
    
    var okBtn = dialog.add("button", undefined, "확인");
    okBtn.onClick = function() { dialog.close(); };
    
    dialog.show();
}

// ===== CURL 작업 =====

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
            file.encoding = "UTF-8";  // UTF-8 인코딩 설정
            
            // Nano-Banana-Flux-Kontext.jsx와 동일한 방식으로 단순하게 읽기
            var content = file.read();
            file.close();
            
            // 파일이 제대로 읽히지 않은 경우 바이너리 모드로 다시 시도
            if (!content || content.length === 0) {
                file.open("r");
                file.encoding = "BINARY";
                content = file.read();
                file.close();
            }
            
            file.remove();
            return content;
        }
    }
    
    return null;
}

/**
 * Base64 인코딩 - Windows 경로 수정 포함
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
            // macOS base64 — 원본을 임시 복사 후 인코딩 (Yoink 등 임시/프라미스 파일 호환)
            // 원본 확장자 보존
            var fileNameMac = imageFile.name || "";
            var extMac = "";
            var dotIndexMac = fileNameMac.lastIndexOf(".");
            if (dotIndexMac > -1) {
                extMac = fileNameMac.substring(dotIndexMac);
            }
            if (!extMac) extMac = ".jpg"; // fallback

            var tempCopyMac = new File(Folder.temp + "/temp_encode_" + new Date().getTime() + extMac);
            var copySuccessMac = false;
            try {
                copySuccessMac = imageFile.copy(tempCopyMac.fsName);
            } catch(eMac) {
                copySuccessMac = false;
            }
            if (!copySuccessMac) {
                // 시스템 복사 폴백 (경로/권한 이슈 대응)
                app.system('cp -f "' + imageFile.fsName + '" "' + tempCopyMac.fsName + '"');
            }

            if (!tempCopyMac.exists) {
                if (progressWin) progressWin.updateStatus("Error: Could not copy file on macOS");
                return null;
            }

            var cmd = 'base64 -i "' + tempCopyMac.fsName + '" > "' + outputFile.fsName + '"';
            app.system(cmd);

            // 임시 복사본 제거
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
        if (progressWin) progressWin.updateStatus("Encoding error: " + e.message);
    }
    
    return null;
}

// ===== API 함수 =====

/**
 * 병렬 API 호출 - 여러 요청을 동시에 처리
 */
function callAPIParallel(imageFile, prompt, count, progressWin, referenceFiles) {
    try {
        // 취소 확인
        if (PROCESS_CANCELLED) return null;
        
        // 메인 이미지 인코딩 (한 번만 수행)
        var base64Data = encodeImageBase64(imageFile, progressWin);
        if (!base64Data || PROCESS_CANCELLED) {
            if (!PROCESS_CANCELLED) alert("이미지를 인코딩할 수 없습니다");
            return null;
        }
        
        // 참조 이미지들 인코딩
        var referenceBase64Data = [];
        if (referenceFiles && referenceFiles.length > 0) {
            for (var i = 0; i < referenceFiles.length; i++) {
                if (PROCESS_CANCELLED) return null;
                if (progressWin) progressWin.updateStatus("참조 이미지 " + (i+1) + " 인코딩 중...");
                
                var refBase64 = encodeImageBase64(referenceFiles[i], progressWin);
                if (refBase64) {
                    referenceBase64Data.push(refBase64);
                }
            }
        }
        
        // JSON 페이로드 생성 (한 번만)
        var enhancedPrompt = "Generate an image: " + prompt;
        var parts = [];
        
        // 텍스트 프롬프트 추가
        parts.push('{"text":"' + escapeJsonString(enhancedPrompt) + '"}');
        
        // 메인 이미지 추가
        parts.push('{"inline_data":{"mime_type":"image/jpeg","data":"' + base64Data + '"}}');
        
        // 참조 이미지들 추가
        for (var j = 0; j < referenceBase64Data.length; j++) {
            parts.push('{"inline_data":{"mime_type":"image/jpeg","data":"' + referenceBase64Data[j] + '"}}');
        }
        
        var payload = '{"contents":[{"parts":[' + parts.join(',') + ']}]}';
        
        // 병렬 요청 실행
        var responseFiles = [];
        var timestamp = new Date().getTime();
        
        for (var k = 0; k < count; k++) {
            if (PROCESS_CANCELLED) break;
            
            var responseFile = new File(Folder.temp + "/response_" + k + "_" + timestamp + ".json");
            responseFiles.push(responseFile);
            
            // curl 명령 생성
            var apiUrl = CONFIG.API_ENDPOINT + CONFIG.MODEL_ID + ":" + CONFIG.GENERATE_CONTENT_API + "?key=" + CONFIG.API_KEY;
            var curlArgs = '-s -X POST ' +
                '-H "Content-Type: application/json" ' +
                '-d @- ' +
                '"' + apiUrl + '" > "' + responseFile.fsName + '"';
            
            // 백그라운드 실행
            if (CONFIG.IS_WINDOWS) {
                // Windows: 백그라운드 실행
                var cmdFile = new File(Folder.temp + "/curl_" + k + "_" + timestamp + ".bat");
                cmdFile.open("w");
                cmdFile.writeln('@echo off');
                cmdFile.writeln('echo ' + payload.replace(/"/g, '""') + ' | curl.exe ' + curlArgs);
                cmdFile.close();
                
                app.system('start /B cmd.exe /c "' + cmdFile.fsName + '"');
            } else {
                // macOS: 백그라운드 실행
                var scriptFile = new File(Folder.temp + "/curl_" + k + "_" + timestamp + ".sh");
                scriptFile.open("w");
                scriptFile.writeln('#!/bin/bash');
                scriptFile.writeln("echo '" + payload.replace(/'/g, "'\\''") + "' | curl " + curlArgs);
                scriptFile.close();
                
                app.system('chmod +x "' + scriptFile.fsName + '" && "' + scriptFile.fsName + '" &');
            }
        }
        
        // 모든 응답 대기 및 수집
        var results = [];
        var maxWaitTime = 60000; // 60초 최대 대기
        var checkInterval = 1000; // 1초마다 확인
        var startTime = new Date().getTime();
        
        while (results.length < count && (new Date().getTime() - startTime) < maxWaitTime) {
            if (PROCESS_CANCELLED) break;
            
            for (var m = 0; m < responseFiles.length; m++) {
                if (!responseFiles[m]) continue;
                
                if (responseFiles[m].exists && responseFiles[m].length > 0) {
                    // 파일이 완전히 쓰여졌는지 확인 (크기가 안정화될 때까지 대기)
                    $.sleep(500);
                    var prevSize = responseFiles[m].length;
                    $.sleep(500);
                    
                    if (responseFiles[m].length === prevSize && prevSize > 0) {
                        // 응답 읽기
                        responseFiles[m].open("r");
                        responseFiles[m].encoding = "UTF-8";
                        var response = responseFiles[m].read();
                        responseFiles[m].close();
                        
                        // 결과 처리
                        var result = processGeminiResponse(response, progressWin);
                        if (result) {
                            results.push(result);
                            if (progressWin && progressWin.updateProgress) {
                                progressWin.updateProgress(m, 100);
                            }
                        }
                        
                        // 처리된 파일 삭제
                        responseFiles[m].remove();
                        responseFiles[m] = null;
                    }
                }
            }
            
            if (progressWin) progressWin.updateStatus("응답 대기 중... (" + results.length + "/" + count + ")");
            $.sleep(checkInterval);
        }
        
        // 임시 파일 정리
        for (var n = 0; n < responseFiles.length; n++) {
            if (responseFiles[n] && responseFiles[n].exists) {
                responseFiles[n].remove();
            }
        }
        
        return results.length > 0 ? results : null;
        
    } catch(e) {
        if (!PROCESS_CANCELLED) alert("병렬 API 오류: " + e.message);
        return null;
    }
}

function callAPI(imageFile, prompt, progressWin, referenceFiles) {
    try {
        // 취소 확인
        if (PROCESS_CANCELLED) return null;
        
        // 메인 이미지 인코딩
        var base64Data = encodeImageBase64(imageFile, progressWin);
        if (!base64Data || PROCESS_CANCELLED) {
            if (!PROCESS_CANCELLED) alert("이미지를 인코딩할 수 없습니다");
            return null;
        }
        
        // 취소 확인
        if (PROCESS_CANCELLED) return null;
        
        // Gemini API 페이로드 생성
        if (progressWin) progressWin.updateStatus("AI 요청 준비 중...");
        
        // JSON 문자열로 수동 생성 (ExtendScript는 JSON.stringify 미지원)
        // 프롬프트를 더 명확하게 이미지 생성 요청으로 만들기
        var enhancedPrompt = "Generate an image: " + prompt;
        
        // parts 배열 구성 - 텍스트 프롬프트 먼저 추가
        var partsArray = '{"text":"' + escapeJsonString(enhancedPrompt) + '"}';
        
        // 참조 이미지들 인코딩 및 추가 (있는 경우)
        if (referenceFiles && referenceFiles.length > 0) {
            for (var i = 0; i < referenceFiles.length; i++) {
                if (referenceFiles[i] && referenceFiles[i].exists) {
                    if (progressWin) progressWin.updateStatus("참조 이미지 " + (i + 1) + "/" + referenceFiles.length + " 인코딩 중...");
                    var refBase64Data = encodeImageBase64(referenceFiles[i], progressWin);
                    if (refBase64Data) {
                        var refMime = getMimeType(referenceFiles[i]);
                        partsArray += ',{"inlineData":{"mime_type":"' + refMime + '","data":"' + refBase64Data + '"}}';
                    }
                }
                // 취소 확인
                if (PROCESS_CANCELLED) return null;
            }
        }
        
        // 메인 이미지 (선택 영역) 추가
        var mainMime = getMimeType(imageFile);
        partsArray += ',{"inlineData":{"mime_type":"' + mainMime + '","data":"' + base64Data + '"}}';
        
        var jsonPayload = '{"contents":[{"role":"user","parts":[' +
                          partsArray +
                          ']}],' +
                          '"generationConfig":{' +
                          '"responseModalities":["IMAGE"],' +
                          '"temperature":1.0,' +
                          '"topP":0.95,' +
                          '"topK":40' +
                          '}}';
        
        // 페이로드를 파일에 저장
        var payloadFile = new File(Folder.temp + "/payload_" + new Date().getTime() + ".json");
        payloadFile.open("w");
        payloadFile.write(jsonPayload);
        payloadFile.close();
        
        // 취소 확인
        if (PROCESS_CANCELLED) {
            payloadFile.remove();
            return null;
        }
        
        // API 요청
        if (progressWin) progressWin.updateStatus("Gemini AI로 전송 중...");
        
        var responseFile = new File(Folder.temp + "/response_" + new Date().getTime() + ".json");
        var apiUrl = CONFIG.API_ENDPOINT + CONFIG.MODEL_ID + ":" + CONFIG.GENERATE_CONTENT_API + "?key=" + CONFIG.API_KEY;
        
        var curlArgs = '-s -X POST ' +
                       '-H "Content-Type: application/json" ' +
                       '-d @"' + payloadFile.fsName + '" ' +
                       '"' + apiUrl + '"';
        
        var response = executeCurl(curlArgs, responseFile.fsName);
        
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
        if (!PROCESS_CANCELLED) alert("API 오류: " + e.message);
        return null;
    }
}

function processGeminiResponse(response, progressWin) {
    try {
        // Gemini 스트리밍 응답 처리
        var imageData = null;
        var mimeType = null;
        var textContent = "";
        
        // 디버그: 응답 저장
        var debugFile = new File(Folder.temp + "/gemini_response_debug.txt");
        debugFile.open("w");
        debugFile.encoding = "UTF-8";
        debugFile.write(response);
        debugFile.close();
        
        // 스트리밍 응답은 여러 JSON 객체가 쉼표로 구분되거나 배열로 올 수 있음
        var chunks = [];
        
        // 응답이 이미 배열 형태인지 확인
        if (response.indexOf('[{') === 0) {
            // 이미 JSON 배열 형태
            try {
                chunks = eval('(' + response + ')');
            } catch(e) {
                // 파싱 실패 시 빈 배열
                chunks = [];
            }
        } else {
            // 쉼표로 구분된 JSON 객체들
            try {
                // 응답을 정리: 후행 쉼표 제거 및 배열로 감싸기
                var cleanedResponse = response.replace(/,\s*$/, '').replace(/,\s*\n\s*,/g, ',\n');
                var jsonArrayStr = '[' + cleanedResponse + ']';
                chunks = eval('(' + jsonArrayStr + ')');
            } catch(e1) {
                // 파싱 실패 시 줄바꿈으로 구분하여 개별 파싱
                try {
                    var lines = response.split(/\n|,\s*\n/);
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].replace(/^\s+|\s+$/g, '').replace(/^,|,$/g, '');
                        if (line.length === 0) continue;
                        
                        try {
                            var chunk = eval('(' + line + ')');
                            chunks.push(chunk);
                        } catch(e2) {
                            // 개별 줄 파싱 실패는 무시
                        }
                    }
                } catch(e3) {
                    // 모든 파싱 시도 실패
                    chunks = [];
                }
            }
        }
        
        // 모든 청크를 순회하며 이미지와 텍스트 수집
        for (var i = 0; i < chunks.length; i++) {
            var chunk = chunks[i];
            
            // Python 코드와 동일한 구조로 체크
            if (!chunk.candidates || !chunk.candidates[0]) continue;
            
            var candidate = chunk.candidates[0];
            if (!candidate.content || !candidate.content.parts) continue;
            
            // parts 배열의 각 요소 확인
            for (var j = 0; j < candidate.content.parts.length; j++) {
                var part = candidate.content.parts[j];
                
                // 이미지 데이터 체크 - camelCase와 snake_case 모두 체크
                if (part.inlineData || part.inline_data) {
                    var inlineData = part.inlineData || part.inline_data;
                    if (inlineData.data) {
                        imageData = inlineData.data;
                        mimeType = inlineData.mimeType || inlineData.mime_type || "image/png";
                        if (progressWin) progressWin.updateStatus("이미지 데이터 발견 (청크 " + (i+1) + ")");
                    }
                }
                
                // 텍스트 데이터 체크
                if (part.text) {
                    textContent += part.text;
                }
            }
        }
        
        // 결과 처리
        if (imageData) {
            // 확장자 결정
            var extension = ".png";
            if (mimeType) {
                if (mimeType.indexOf("jpeg") > -1 || mimeType.indexOf("jpg") > -1) {
                    extension = ".jpg";
                } else if (mimeType.indexOf("webp") > -1) {
                    extension = ".webp";
                }
            }
            
            var resultFile = new File(Folder.temp + "/ai_result_" + new Date().getTime() + extension);
            
            // Base64를 바이너리로 디코드하여 저장
            if (saveBase64AsImage(imageData, resultFile)) {
                if (progressWin) progressWin.updateStatus("이미지 생성 완료");
                return resultFile;
            } else {
                alert("이미지 저장 실패");
                return null;
            }
        } else if (textContent) {
            // 텍스트만 반환된 경우
            alert("텍스트 응답:\n" + textContent);
            return null;
        } else {
            alert("응답에서 이미지나 텍스트를 찾을 수 없습니다.\n디버그 파일: " + debugFile.fsName);
            return null;
        }
        
    } catch(e) {
        alert("응답 처리 오류: " + e.message + "\n" + e.line);
        return null;
    }
}

function saveBase64AsImage(base64Data, outputFile) {
    try {
        // 임시 Base64 파일 생성
        var base64File = new File(Folder.temp + "/base64_temp_" + new Date().getTime() + ".txt");
        base64File.open("w");
        base64File.write(base64Data);
        base64File.close();
        
        if (CONFIG.IS_WINDOWS) {
            // Windows: certutil을 사용하여 디코드
            var cmd = 'cmd.exe /c "certutil -decode "' + base64File.fsName + '" "' + outputFile.fsName + '""';
            app.system(cmd);
        } else {
            // macOS: base64를 사용하여 디코드
            var cmd = 'base64 -d -i "' + base64File.fsName + '" > "' + outputFile.fsName + '"';
            app.system(cmd);
        }
        
        base64File.remove();
        
        return outputFile.exists && outputFile.length > 0;
        
    } catch(e) {
        return false;
    }
}

// ===== 처리 함수 =====

function processSelection(prompt, newDocument, referenceFiles, generateCount) {
    try {
        var doc = app.activeDocument;
        
        // generateCount가 정의되지 않았으면 기본값 1
        if (typeof generateCount === 'undefined' || !generateCount) {
            generateCount = 1;
        }
        
        // 현재 선택 영역 저장
        var savedSelection = doc.channels.add();
        savedSelection.name = "AI 선택 영역";
        doc.selection.store(savedSelection);
        
        // 선택 영역 경계 가져오기
        var bounds = doc.selection.bounds;
        var x1 = Math.round(bounds[0].value);
        var y1 = Math.round(bounds[1].value);
        var x2 = Math.round(bounds[2].value);
        var y2 = Math.round(bounds[3].value);
        
        // 선택 영역 내보내기
        var tempFile = exportSelection(doc, x1, y1, x2, y2);
        
        if (!tempFile || !tempFile.exists) {
            alert("선택 영역을 내보낼 수 없습니다");
            savedSelection.remove();
            return;
        }
        
        // 생성 개수에 따라 다른 처리
        if (generateCount > 1) {
            // 병렬 처리용 진행 상황 창
            var progressWin = createMultiProgressWindow(generateCount);
            
            // 병렬 API 호출
            var resultFiles = callAPIParallel(tempFile, prompt, generateCount, progressWin, referenceFiles);
            
            // 정리
            tempFile.remove();
            
            if (PROCESS_CANCELLED) {
                progressWin.close();
                savedSelection.remove();
                return;
            }
            
            if (resultFiles && resultFiles.length > 0) {
                if (!PROCESS_CANCELLED) {
                    progressWin.updateStatus("문서에 결과 배치 중...");
                    
                    if (newDocument) {
                        // 새 문서로 열 때는 첫 번째 결과만 열기
                        app.open(resultFiles[0]);
                    } else {
                        // 여러 결과를 그룹으로 배치
                        placeMultipleResults(doc, resultFiles, x1, y1, x2, y2, savedSelection, prompt);
                    }
                }
            }
            
            progressWin.close();
            
            // 생성된 파일들 정리
            for (var i = 0; i < resultFiles.length; i++) {
                try { resultFiles[i].remove(); } catch(e) {}
            }
            
        } else {
            // 기존 단일 처리
            var progressWin = createProgressWindow();
            
            // API 호출 (멀티 참조 이미지 포함)
            var resultFile = callAPI(tempFile, prompt, progressWin, referenceFiles);
            
            // 정리
            tempFile.remove();
            
            if (PROCESS_CANCELLED) {
                progressWin.close();
                savedSelection.remove();
                return;
            }
            
            if (resultFile && resultFile.exists) {
                if (!PROCESS_CANCELLED) {
                    progressWin.updateStatus("문서에 결과 배치 중...");
                    
                    if (newDocument) {
                        app.open(resultFile);
                    } else {
                        placeResultInDocument(doc, resultFile, x1, y1, x2, y2, savedSelection, prompt);
                    }
                }
            }
            
            resultFile.remove();
            progressWin.close();
        }
        
        savedSelection.remove();
        
    } catch(e) {
        alert("처리 오류: " + e.message);
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
        alert("내보내기 오류: " + e.message);
        return null;
    }
}

// ===== API 키 관리 =====

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
    var prefsFolder = new Folder(Folder.userData + "/NanoBanana");
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
    var dialog = new Window("dialog", "Gemini API 키 " + (fromSettings ? "설정" : "필요"));
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 450;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    var instructionPanel = dialog.add("panel", undefined, fromSettings ? "API 키 업데이트" : "초기 설정");
    instructionPanel.alignChildren = "left";
    instructionPanel.margins = 10;
    
    instructionPanel.add("statictext", undefined, "1. aistudio.google.com으로 이동");
    instructionPanel.add("statictext", undefined, "2. 'Get API key' 클릭");
    instructionPanel.add("statictext", undefined, "3. API 키 생성 또는 복사");
    instructionPanel.add("statictext", undefined, "4. 아래에 붙여넣기:");
    
    var apiKeyGroup = dialog.add("group");
    apiKeyGroup.add("statictext", undefined, "API 키:");
    var apiKeyInput = apiKeyGroup.add("edittext", undefined, "");
    apiKeyInput.characters = 40;
    
    if (fromSettings && CONFIG.API_KEY) {
        apiKeyInput.text = CONFIG.API_KEY;
        apiKeyInput.active = true;
        
        var maskedKey = CONFIG.API_KEY.substr(0, 8) + "..." + CONFIG.API_KEY.substr(-4);
        var currentKeyText = dialog.add("statictext", undefined, "현재 키: " + maskedKey);
        currentKeyText.graphics.font = ScriptUI.newFont(currentKeyText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    } else {
        apiKeyInput.active = true;
    }
    
    var privacyText = dialog.add("statictext", undefined, "API 키는 사용자 환경설정에 로컬로 저장됩니다");
    privacyText.graphics.font = ScriptUI.newFont(privacyText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // Button group
    
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, fromSettings ? "업데이트" : "확인");
    var cancelButton = buttonGroup.add("button", undefined, "취소");
    
    okButton.onClick = function() {
        if (apiKeyInput.text.length < 10) {
            if (fromSettings) {
                dialog.close(0);
            } else {
                alert("유효한 API 키를 입력하세요");
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
        // 공백 제거
        apiKey = apiKey.replace(/^\s+|\s+$/g, '');
        
        // 기본 검증 - Gemini API 키는 보통 AIza로 시작
        if (apiKey.length < 20) {
            return false;
        }
        
        // 잠시 대기
        $.sleep(100);
        
        var testFile = new File(Folder.temp + "/test_" + new Date().getTime() + ".json");
        
        // API 테스트 스크립트 작성
        var scriptFile = new File(Folder.temp + "/test_api_" + new Date().getTime() + (CONFIG.IS_WINDOWS ? ".bat" : ".sh"));
        scriptFile.open("w");
        
        var testUrl = CONFIG.API_ENDPOINT + "gemini-pro:generateContent?key=" + apiKey;
        
        if (CONFIG.IS_WINDOWS) {
            scriptFile.writeln('@echo off');
            scriptFile.writeln('curl.exe -s -X POST -H "Content-Type: application/json" -d "{\"contents\":[{\"parts\":[{\"text\":\"test\"}]}]}" "' + testUrl + '" > "' + testFile.fsName + '"');
        } else {
            scriptFile.writeln('#!/bin/bash');
            scriptFile.writeln('curl -s -X POST -H "Content-Type: application/json" -d \'{"contents":[{"parts":[{"text":"test"}]}]}\' "' + testUrl + '" > "' + testFile.fsName + '"');
        }
        scriptFile.close();
        
        // 스크립트 실행
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
            
            // 성공 확인 - Gemini는 candidates를 반환
            if (response.indexOf("candidates") > -1) {
                return true;
            }
            
            // 인증 오류 확인
            if (response.indexOf("API_KEY_INVALID") > -1) {
                return false;
            }
            
            // 다른 문제가 있어도 키를 수락
            return true;
        }
        
        // 테스트 실패시에도 키 수락
        return true;
        
    } catch(e) {
        // 에러 발생시에도 진행 가능하도록
        return true;
    }
}

// ===== 메인 대화상자 =====

function createDialog() {
    var dialog = new Window("dialog", "나노바나나 by Genie - www.codewithgenie.com");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 500;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    // 세션 데이터 로드 (없거나 파싱 실패 시 안전한 기본값 사용)
    var sessionData = loadSessionData();
    if (!sessionData) {
        sessionData = { prompt: '', referenceFiles: [], backgroundColor: null };
    }
    
    // 상단 행 - 모델 정보와 설정
    var topRow = dialog.add("group");
    topRow.alignment = "fill";
    
    // 왼쪽: 제품명 및 버전 정보
    var leftGroup = topRow.add("group");
    leftGroup.orientation = "column";
    leftGroup.alignChildren = "left";
    
    var modelInfo = leftGroup.add("statictext", undefined, "나노바나나 (Gemini 2.5 Flash)");
    modelInfo.graphics.font = ScriptUI.newFont(modelInfo.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    var versionText = leftGroup.add("statictext", undefined, "버전: v" + PLUGIN_VERSION + " | 제작: Genie");
    versionText.graphics.font = ScriptUI.newFont(versionText.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
    
    // 오른쪽: 설정 및 업데이트 버튼
    var settingsGroup = topRow.add("group");
    settingsGroup.alignment = "right";
    
    var updateBtn = settingsGroup.add("button", undefined, "업데이트 확인");
    updateBtn.preferredSize.width = 90;
    
    var settingsBtn = settingsGroup.add("button", undefined, "설정");
    settingsBtn.preferredSize.width = 60;
    
    // 업데이트 확인 버튼 클릭
    updateBtn.onClick = function() {
        checkForManualUpdate();
    };
    
    // 설정 버튼 클릭
    settingsBtn.onClick = function() {
        var newKey = promptForAPIKey(true);
        if (newKey && newKey.length > 10) {
            CONFIG.API_KEY = newKey;
            saveAPIKey(newKey);
            alert("API 키가 성공적으로 업데이트되었습니다!");
        }
    };
    
    // 빠른 프리셋 버튼 (자주 사용하는 기능)
    var quickPresetPanel = dialog.add("panel", undefined, "빠른 프리셋");
    quickPresetPanel.orientation = "column";
    quickPresetPanel.alignChildren = "fill";
    quickPresetPanel.margins = 8;
    quickPresetPanel.spacing = 5;
    
    // 빠른 프리셋 버튼 행
    var quickButtonRow = quickPresetPanel.add("group");
    quickButtonRow.alignment = "fill";
    
    // 관리 버튼
    var manageButton = quickPresetPanel.add("button", undefined, "⚙ 빠른 프리셋 관리");
    manageButton.preferredSize.height = 20;
    manageButton.graphics.font = ScriptUI.newFont(manageButton.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
    
    // 저장된 빠른 프리셋 ID 로드
    var quickPresetIds = loadQuickPresetIds();
    var quickPresets = [];
    
    // 모든 프리셋에서 빠른 프리셋 찾기 (사용자 프리셋 포함)
    var allPresets = getAllPresets();
    for (var i = 0; i < quickPresetIds.length && quickPresets.length < 5; i++) {
        for (var j = 0; j < allPresets.length; j++) {
            if (allPresets[j].id === quickPresetIds[i]) {
                quickPresets.push({
                    title: allPresets[j].title.length > 8 ? allPresets[j].title.substring(0, 7) + "..." : allPresets[j].title,
                    preset: allPresets[j]
                });
                break;
            }
        }
    }
    
    // 빠른 프리셋 버튼 생성
    for (var i = 0; i < quickPresets.length; i++) {
        (function(quickPreset) {
            var btn = quickButtonRow.add("button", undefined, quickPreset.title);
            btn.preferredSize.width = 85;
            btn.onClick = function() {
                dialog.promptInput.text = quickPreset.preset.prompt;
                if (quickPreset.preset.imageCount === 2) {
                    alert("이 프리셋은 2개의 참조 이미지가 필요합니다.");
                } else if (quickPreset.preset.imageCount === 'multiple') {
                    alert("이 프리셋은 여러 개의 참조 이미지를 사용할 수 있습니다.");
                }
            };
        })(quickPresets[i]);
    }
    
    // 빠른 프리셋 관리 버튼 클릭
    manageButton.onClick = function() {
        var manageDialog = new Window("dialog", "빠른 프리셋 관리");
        manageDialog.orientation = "column";
        manageDialog.alignChildren = "fill";
        manageDialog.preferredSize.width = 400;
        manageDialog.margins = 15;
        manageDialog.spacing = 10;
        
        manageDialog.add("statictext", undefined, "빠른 프리셋으로 등록할 항목을 선택하세요 (최대 5개):");
        
        // 현재 빠른 프리셋 목록
        var currentList = manageDialog.add("listbox", undefined, [], {multiselect: true});
        currentList.preferredSize.height = 300;
        
        // 모든 프리셋을 목록에 추가
        var allPresets = getAllPresets();
        var selectedIndices = [];
        
        for (var i = 0; i < allPresets.length; i++) {
            var item = currentList.add("item", allPresets[i].title + " (" + allPresets[i].category + ")");
            item.presetId = allPresets[i].id;
            
            // 현재 빠른 프리셋인지 확인
            for (var j = 0; j < quickPresetIds.length; j++) {
                if (allPresets[i].id === quickPresetIds[j]) {
                    selectedIndices.push(i);
                    break;
                }
            }
        }
        
        // 기존 선택 항목 표시
        for (var i = 0; i < selectedIndices.length; i++) {
            currentList.selection = selectedIndices[i];
        }
        
        var helpText = manageDialog.add("statictext", undefined, "Ctrl/Cmd + 클릭으로 여러 개 선택 가능", {multiline: false});
        helpText.graphics.font = ScriptUI.newFont(helpText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
        
        // 버튼
        var buttonGroup = manageDialog.add("group");
        buttonGroup.alignment = "center";
        var saveBtn = buttonGroup.add("button", undefined, "저장");
        var cancelBtn = buttonGroup.add("button", undefined, "취소");
        
        saveBtn.onClick = function() {
            var newQuickIds = [];
            if (currentList.selection) {
                // selection이 배열인지 확인
                var selections = currentList.selection;
                if (!(selections instanceof Array)) {
                    selections = [selections];
                }
                
                for (var i = 0; i < selections.length && i < 5; i++) {
                    newQuickIds.push(selections[i].presetId);
                }
            }
            
            if (newQuickIds.length === 0) {
                alert("최소 하나의 프리셋을 선택해주세요.");
                return;
            }
            
            if (saveQuickPresetIds(newQuickIds)) {
                alert("빠른 프리셋이 저장되었습니다.\n다음 실행 시 적용됩니다.");
                manageDialog.close();
            } else {
                alert("저장 실패");
            }
        };
        
        cancelBtn.onClick = function() {
            manageDialog.close();
        };
        
        manageDialog.show();
    };
    
    // 프리셋 선택 패널 (로드된 프리셋 수 표시)
    var presetTitle = "프리셋 선택";
    if (PRESETS.length > 10) {
        presetTitle += " (" + PRESETS.length + "개 로드됨)";
    }
    var presetPanel = dialog.add("panel", undefined, presetTitle);
    presetPanel.alignChildren = "fill";
    presetPanel.margins = 10;
    presetPanel.spacing = 8;
    
    // 검색 및 카테고리 행
    var searchRow = presetPanel.add("group");
    searchRow.alignment = "fill";
    
    // 검색 입력
    searchRow.add("statictext", undefined, "검색:");
    var searchInput = searchRow.add("edittext", undefined, "");
    searchInput.characters = 15;
    
    // 카테고리 드롭다운
    searchRow.add("statictext", undefined, "카테고리:");
    var categoryDropdown = searchRow.add("dropdownlist", undefined, PRESET_CATEGORIES);
    categoryDropdown.selection = 0;
    categoryDropdown.preferredSize.width = 100;
    
    // 프리셋 목록
    var presetListBox = presetPanel.add("listbox", undefined, []);
    presetListBox.preferredSize.height = 100;
    
    // 선택된 프리셋 설명
    var descriptionText = presetPanel.add("statictext", undefined, "프리셋을 선택하면 설명이 표시됩니다.", {multiline: true});
    descriptionText.preferredSize.height = 40;
    descriptionText.graphics.font = ScriptUI.newFont(descriptionText.graphics.font.name, ScriptUI.FontStyle.ITALIC, 10);
    
    // 버튼 그룹
    var presetButtonGroup = presetPanel.add("group");
    presetButtonGroup.alignment = "fill";
    
    var applyPresetButton = presetButtonGroup.add("button", undefined, "프리셋 적용");
    applyPresetButton.enabled = false;
    
    var savePresetButton = presetButtonGroup.add("button", undefined, "현재 프롬프트 저장");
    savePresetButton.enabled = false;
    
    var managePresetsButton = presetButtonGroup.add("button", undefined, "프리셋 관리");
    
    // 프리셋 목록 업데이트 함수
    function updatePresetList() {
        presetListBox.removeAll();
        var searchTerm = searchInput.text.toLowerCase();
        var selectedCategory = categoryDropdown.selection ? categoryDropdown.selection.text : '전체';
        var allPresets = getAllPresets(); // 기본 + 사용자 프리셋
        
        for (var i = 0; i < allPresets.length; i++) {
            var preset = allPresets[i];
            var matchesSearch = !searchTerm || 
                preset.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                preset.description.toLowerCase().indexOf(searchTerm) !== -1 ||
                preset.prompt.toLowerCase().indexOf(searchTerm) !== -1;
            var matchesCategory = selectedCategory === '전체' || preset.category === selectedCategory;
            
            if (matchesSearch && matchesCategory) {
                var displayName = preset.title;
                if (preset.id && preset.id.indexOf('user_') === 0) {
                    displayName = "★ " + displayName; // 사용자 프리셋 표시
                }
                var item = presetListBox.add("item", displayName + " (" + preset.category + ")");
                item.presetData = preset;
            }
        }
        
        descriptionText.text = "프리셋을 선택하면 설명이 표시됩니다.";
        applyPresetButton.enabled = false;
    }
    
    // 이벤트 핸들러
    searchInput.onChanging = updatePresetList;
    categoryDropdown.onChange = updatePresetList;
    
    presetListBox.onChange = function() {
        if (presetListBox.selection && presetListBox.selection.presetData) {
            var preset = presetListBox.selection.presetData;
            descriptionText.text = preset.description + "\n필요 이미지: " + 
                (preset.imageCount === 'multiple' ? '여러 개' : preset.imageCount + '개');
            applyPresetButton.enabled = true;
        }
    };
    
    // 프롬프트 입력
    var promptGroup = dialog.add("panel", undefined, "프롬프트:");
    promptGroup.alignChildren = "fill";
    promptGroup.margins = 10;
    dialog.promptInput = promptGroup.add("edittext", undefined, sessionData.prompt || "");
    dialog.promptInput.characters = 60;
    dialog.promptInput.active = true;
    
    dialog.promptInput.addEventListener('keydown', function(e) {
        if (e.keyName == 'Enter') {
            e.preventDefault();
            dialog.close(1);
        }
    });
    
    // 프롬프트 입력 변경 시 저장 버튼 활성화
    dialog.promptInput.onChanging = function() {
        savePresetButton.enabled = dialog.promptInput.text.length > 0;
    };
    
    // 프리셋 적용 버튼 클릭
    applyPresetButton.onClick = function() {
        if (presetListBox.selection && presetListBox.selection.presetData) {
            var preset = presetListBox.selection.presetData;
            dialog.promptInput.text = preset.prompt;
            
            // 이미지 개수에 따른 자동 알림
            if (preset.imageCount === 2) {
                alert("이 프리셋은 2개의 참조 이미지가 필요합니다.\n아래에서 참조 이미지를 추가해주세요.");
            } else if (preset.imageCount === 'multiple') {
                alert("이 프리셋은 여러 개의 참조 이미지를 사용할 수 있습니다.\n아래에서 필요한 이미지를 추가해주세요.");
            }
            
            // imageCount 정보를 dialog에 저장
            dialog.presetImageCount = preset.imageCount;
        }
    };
    
    // 프리셋 관리 버튼 클릭
    managePresetsButton.onClick = function() {
        var selectedPreset = presetListBox.selection && presetListBox.selection.presetData;
        
        // 사용자 프리셋인지 확인
        if (!selectedPreset || !selectedPreset.id || selectedPreset.id.indexOf('user_') !== 0) {
            alert("사용자가 만든 프리셋만 수정/삭제할 수 있습니다.");
            return;
        }
        
        var manageDialog = new Window("dialog", "프리셋 관리");
        manageDialog.orientation = "column";
        manageDialog.alignChildren = "fill";
        manageDialog.margins = 15;
        manageDialog.spacing = 10;
        
        manageDialog.add("statictext", undefined, "선택된 프리셋: " + selectedPreset.title);
        
        var buttonGroup = manageDialog.add("group");
        buttonGroup.alignment = "center";
        
        var editBtn = buttonGroup.add("button", undefined, "수정");
        var deleteBtn = buttonGroup.add("button", undefined, "삭제");
        var cancelBtn = buttonGroup.add("button", undefined, "취소");
        
        editBtn.onClick = function() {
            manageDialog.close();
            
            // 수정 대화상자
            var editDialog = new Window("dialog", "프리셋 수정");
            editDialog.orientation = "column";
            editDialog.alignChildren = "fill";
            editDialog.margins = 15;
            editDialog.spacing = 10;
            
            editDialog.add("statictext", undefined, "제목:");
            var titleInput = editDialog.add("edittext", undefined, selectedPreset.title);
            titleInput.characters = 30;
            
            editDialog.add("statictext", undefined, "설명:");
            var descInput = editDialog.add("edittext", undefined, selectedPreset.description);
            descInput.characters = 30;
            
            editDialog.add("statictext", undefined, "프롬프트:");
            var promptInput = editDialog.add("edittext", undefined, selectedPreset.prompt);
            promptInput.characters = 30;
            promptInput.preferredSize.height = 60;
            
            editDialog.add("statictext", undefined, "필요한 이미지 개수:");
            var imageCountGroup = editDialog.add("group");
            var imageCountRadio1 = imageCountGroup.add("radiobutton", undefined, "1개");
            var imageCountRadio2 = imageCountGroup.add("radiobutton", undefined, "2개");
            var imageCountRadioMulti = imageCountGroup.add("radiobutton", undefined, "여러 개");
            
            if (selectedPreset.imageCount === 1) imageCountRadio1.value = true;
            else if (selectedPreset.imageCount === 2) imageCountRadio2.value = true;
            else if (selectedPreset.imageCount === "multiple") imageCountRadioMulti.value = true;
            
            var editButtonGroup = editDialog.add("group");
            editButtonGroup.alignment = "center";
            var saveEditBtn = editButtonGroup.add("button", undefined, "저장");
            var cancelEditBtn = editButtonGroup.add("button", undefined, "취소");
            
            saveEditBtn.onClick = function() {
                if (titleInput.text.length === 0) {
                    alert("제목을 입력해주세요.");
                    return;
                }
                
                var imageCount = 1;
                if (imageCountRadio2.value) imageCount = 2;
                else if (imageCountRadioMulti.value) imageCount = "multiple";
                
                if (editUserPreset(
                    selectedPreset.id,
                    titleInput.text,
                    descInput.text || "",
                    promptInput.text,
                    imageCount
                )) {
                    alert("프리셋이 수정되었습니다!");
                    updatePresetList();
                    editDialog.close();
                } else {
                    alert("수정 실패");
                }
            };
            
            cancelEditBtn.onClick = function() {
                editDialog.close();
            };
            
            editDialog.show();
        };
        
        deleteBtn.onClick = function() {
            if (confirm("정말로 '" + selectedPreset.title + "' 프리셋을 삭제하시겠습니까?")) {
                if (deleteUserPreset(selectedPreset.id)) {
                    alert("프리셋이 삭제되었습니다.");
                    updatePresetList();
                    manageDialog.close();
                } else {
                    alert("삭제 실패");
                }
            }
        };
        
        cancelBtn.onClick = function() {
            manageDialog.close();
        };
        
        manageDialog.show();
    };
    
    // 프리셋 저장 버튼 클릭
    savePresetButton.onClick = function() {
        if (dialog.promptInput.text.length === 0) {
            alert("먼저 프롬프트를 입력해주세요.");
            return;
        }
        
        // 저장 대화상자
        var saveDialog = new Window("dialog", "프리셋 저장");
        saveDialog.orientation = "column";
        saveDialog.alignChildren = "fill";
        saveDialog.margins = 15;
        saveDialog.spacing = 10;
        
        saveDialog.add("statictext", undefined, "제목:");
        var titleInput = saveDialog.add("edittext", undefined, "");
        titleInput.characters = 30;
        titleInput.active = true;
        
        saveDialog.add("statictext", undefined, "설명:");
        var descInput = saveDialog.add("edittext", undefined, "");
        descInput.characters = 30;
        
        saveDialog.add("statictext", undefined, "필요한 이미지 개수:");
        var imageCountGroup = saveDialog.add("group");
        var imageCountRadio1 = imageCountGroup.add("radiobutton", undefined, "1개");
        var imageCountRadio2 = imageCountGroup.add("radiobutton", undefined, "2개");
        var imageCountRadioMulti = imageCountGroup.add("radiobutton", undefined, "여러 개");
        imageCountRadio1.value = true;
        
        var buttonGroup = saveDialog.add("group");
        buttonGroup.alignment = "center";
        var saveBtn = buttonGroup.add("button", undefined, "저장");
        var cancelBtn = buttonGroup.add("button", undefined, "취소");
        
        saveBtn.onClick = function() {
            if (titleInput.text.length === 0) {
                alert("제목을 입력해주세요.");
                return;
            }
            
            var imageCount = 1;
            if (imageCountRadio2.value) imageCount = 2;
            else if (imageCountRadioMulti.value) imageCount = "multiple";
            
            var newPreset = addUserPreset(
                titleInput.text,
                descInput.text || "",
                dialog.promptInput.text,
                imageCount,
                "사용자"
            );
            
            if (newPreset) {
                alert("프리셋이 저장되었습니다!");
                updatePresetList(); // 목록 새로고침
                // 사용자 카테고리로 자동 전환
                for (var i = 0; i < categoryDropdown.items.length; i++) {
                    if (categoryDropdown.items[i].text === "사용자") {
                        categoryDropdown.selection = i;
                        break;
                    }
                }
                saveDialog.close();
            }
        };
        
        cancelBtn.onClick = function() {
            saveDialog.close();
        };
        
        saveDialog.show();
    };
    
    // 초기 목록 로드
    updatePresetList();
    
    // 참조 이미지 선택 (멀티 이미지 지원)
    var refPanel = dialog.add("panel", undefined, "참조 이미지 (선택 사항)");
    refPanel.alignChildren = "fill";
    refPanel.margins = 10;
    
    // 버튼 그룹
    var refButtonGroup = refPanel.add("group");
    refButtonGroup.alignment = "fill";
    var addRefButton = refButtonGroup.add("button", undefined, "이미지 추가");
    addRefButton.preferredSize.width = 100;
    var removeRefButton = refButtonGroup.add("button", undefined, "선택 삭제");
    removeRefButton.preferredSize.width = 100;
    var clearRefButton = refButtonGroup.add("button", undefined, "모두 지우기");
    clearRefButton.preferredSize.width = 100;
    
    // 이미지 목록 표시
    var refListBox = refPanel.add("listbox", undefined, []);
    refListBox.preferredSize.height = 80;
    refListBox.multiselect = true; // 다중 선택 허용 (삭제/관리 용이)
    
    // 저장된 참조 파일 복원
    dialog.referenceFiles = [];
    if (sessionData.referenceFiles && sessionData.referenceFiles.length > 0) {
        for (var i = 0; i < sessionData.referenceFiles.length; i++) {
            var file = new File(sessionData.referenceFiles[i]);
            if (file.exists) {
                dialog.referenceFiles.push(file);
                refListBox.add("item", file.displayName);
            }
        }
    }
    
    addRefButton.onClick = function() {
        // 가능하면 멀티 선택 허용 (Windows 포함)
        var fileFilter = CONFIG.IS_WINDOWS ? "Image Files:*.jpg;*.jpeg;*.png" : "*.jpg;*.jpeg;*.png";
        var allowMultiple = true;
        var file = File.openDialog("참조 이미지 선택", fileFilter, allowMultiple);
        
        if (file) {
            // 파일이 배열인지 확인 (멀티 선택)
            var files = file instanceof Array ? file : [file];
            for (var i = 0; i < files.length; i++) {
                if (files[i] && files[i].exists) {
                    dialog.referenceFiles.push(files[i]);
                    // 한글 파일명 처리
                    var fileName = files[i].name;
                    try {
                        // ExtendScript에서 한글 처리를 위한 방법
                        fileName = decodeURI(files[i].name);
                    } catch(e) {
                        // 디코딩 실패 시 원본 사용
                    }
                    refListBox.add("item", fileName);
                }
            }
        }
    };
    
    // 선택 항목 삭제 (부분 지우기)
    removeRefButton.onClick = function() {
        try {
            var sel = refListBox.selection;
            if (!sel) {
                alert("삭제할 항목을 선택하세요.");
                return;
            }
            // 단일/다중 선택 모두 지원
            var indices = [];
            if (sel instanceof Array) {
                for (var s = 0; s < sel.length; s++) {
                    for (var i = 0; i < refListBox.items.length; i++) {
                        if (refListBox.items[i] === sel[s]) { indices.push(i); break; }
                    }
                }
            } else {
                for (var j = 0; j < refListBox.items.length; j++) {
                    if (refListBox.items[j] === sel) { indices.push(j); break; }
                }
            }
            // 큰 인덱스부터 제거
            indices.sort(function(a,b){ return b-a; });
            for (var k = 0; k < indices.length; k++) {
                var idx = indices[k];
                if (dialog.referenceFiles && dialog.referenceFiles.length > idx) {
                    dialog.referenceFiles.splice(idx, 1);
                }
                refListBox.remove(idx);
            }
        } catch(e) {}
    };
    
    clearRefButton.onClick = function() {
        dialog.referenceFiles = [];
        refListBox.removeAll();
    };
    
    // 색상 피커 패널
    var colorPanel = dialog.add("panel", undefined, "색상 선택");
    colorPanel.alignChildren = "fill";
    colorPanel.margins = 10;
    colorPanel.spacing = 8;
    
    // 색상 표시 및 선택 그룹
    var colorGroup = colorPanel.add("group");
    colorGroup.alignment = "fill";
    
    // 선택된 색상 표시
    var selectedColorPanel = colorGroup.add("panel");
    selectedColorPanel.preferredSize.width = 60;
    selectedColorPanel.preferredSize.height = 30;
    
    // 색상 HEX 코드 표시
    var colorHexText = colorGroup.add("statictext", undefined, "색상 없음");
    colorHexText.characters = 12;
    
    // 색상 관련 버튼들
    var colorButtonGroup = colorGroup.add("group");
    colorButtonGroup.alignment = "right";
    
    var pickColorButton = colorButtonGroup.add("button", undefined, "색상 선택");
    pickColorButton.preferredSize.width = 80;
    
    var getForegroundButton = colorButtonGroup.add("button", undefined, "전경색");
    getForegroundButton.preferredSize.width = 60;
    
    var palette256Button = colorButtonGroup.add("button", undefined, "팔레트256");
    palette256Button.preferredSize.width = 80;
    
    // 프롬프트에 색상 추가 옵션
    var colorOptionsGroup = colorPanel.add("group");
    colorOptionsGroup.alignment = "fill";
    
    var addToPromptCheckbox = colorOptionsGroup.add("checkbox", undefined, "프롬프트에 자동 추가");
    addToPromptCheckbox.value = false;
    
    var colorFormatDropdown = colorOptionsGroup.add("dropdownlist", undefined, ["HEX (#FF0000)", "RGB (255,0,0)", "색상 이름"]);
    colorFormatDropdown.selection = 0;
    colorFormatDropdown.preferredSize.width = 120;
    colorFormatDropdown.enabled = false;
    
    // 선택된 색상 저장 (세션 데이터에서 복원)
    dialog.selectedColor = sessionData.backgroundColor || null;
    
    // 세션에서 색상이 있으면 프리뷰 업데이트
    if (dialog.selectedColor) {
        updateColorPreview(dialog.selectedColor);
    }
    
    // 색상 프리뷰 업데이트 함수
    function updateColorPreview(color) {
        if (color) {
            try {
                var g = selectedColorPanel.graphics;
                var brush = g.newBrush(g.BrushType.SOLID_COLOR, [color.r/255, color.g/255, color.b/255]);
                g.backgroundColor = brush;
                selectedColorPanel.onDraw = function() {
                    var g = this.graphics;
                    g.newBrush(g.BrushType.SOLID_COLOR, [color.r/255, color.g/255, color.b/255]);
                    g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, [color.r/255, color.g/255, color.b/255]), 
                               [[0, 0], [this.size.width, 0], [this.size.width, this.size.height], [0, this.size.height]]);
                };
                colorHexText.text = rgbToHex(color.r, color.g, color.b);
                dialog.selectedColor = color;
                colorFormatDropdown.enabled = addToPromptCheckbox.value;
            } catch(e) {}
        }
    }
    
    // 색상 선택 버튼 이벤트
    pickColorButton.onClick = function() {
        var color = createAdvancedColorPicker(dialog.selectedColor);
        if (color) {
            updateColorPreview(color);
        }
    };
    
    // 전경색 가져오기 버튼 이벤트
    getForegroundButton.onClick = function() {
        try {
            var foreground = app.foregroundColor;
            var color = {
                r: Math.round(foreground.rgb.red),
                g: Math.round(foreground.rgb.green),
                b: Math.round(foreground.rgb.blue)
            };
            updateColorPreview(color);
        } catch(e) {
            alert("전경색을 가져올 수 없습니다.");
        }
    };
    
    // 256 팔레트 버튼 이벤트
    palette256Button.onClick = function() {
        var color = createPalette256Picker(dialog.selectedColor);
        if (color) {
            updateColorPreview(color);
        }
    };
    
    // 자동 추가 체크박스 이벤트
    addToPromptCheckbox.onClick = function() {
        colorFormatDropdown.enabled = addToPromptCheckbox.value && dialog.selectedColor !== null;
    };
    
    // dialog에 참조 저장 (main에서 접근 가능하도록)
    dialog.addToPromptCheckbox = addToPromptCheckbox;
    dialog.colorFormatDropdown = colorFormatDropdown;
    
    // 출력 옵션
    var outputPanel = dialog.add("panel", undefined, "출력 옵션");
    outputPanel.alignChildren = "fill";
    outputPanel.margins = 10;
    outputPanel.spacing = 8;
    
    // 생성 개수 선택
    var countGroup = outputPanel.add("group");
    countGroup.alignment = "fill";
    countGroup.add("statictext", undefined, "생성 개수:");
    var generateCountDropdown = outputPanel.add("dropdownlist", undefined, ["1장", "2장 (병렬)", "3장 (병렬)", "4장 (병렬)"]);
    generateCountDropdown.selection = 0;
    generateCountDropdown.preferredSize.width = 120;
    
    // 병렬 생성 설명
    var parallelInfo = outputPanel.add("statictext", undefined, "※ 2장 이상 선택 시 동시에 여러 변형을 생성합니다", {multiline: false});
    parallelInfo.graphics.font = ScriptUI.newFont(parallelInfo.graphics.font.name, ScriptUI.FontStyle.ITALIC, 9);
    
    dialog.newDocCheckbox = outputPanel.add("checkbox", undefined, "새 문서로 출력");
    dialog.newDocCheckbox.value = false;
    
    // dialog에 생성 개수 저장
    dialog.generateCountDropdown = generateCountDropdown;
    
    // 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var generateButton = buttonGroup.add("button", undefined, "생성");
    generateButton.preferredSize.width = 80;
    var resetButton = buttonGroup.add("button", undefined, "초기화");
    resetButton.preferredSize.width = 60;
    var cancelButton = buttonGroup.add("button", undefined, "취소");
    cancelButton.preferredSize.width = 60;
    
    // 초기화 버튼 클릭
    resetButton.onClick = function() {
        // 프롬프트 초기화
        dialog.promptInput.text = "";
        
        // 참조 이미지 초기화
        refListBox.removeAll();
        dialog.referenceFiles = [];
        
        // 색상 초기화
        dialog.selectedColor = null;
        colorHexText.text = "색상 없음";
        try {
            selectedColorPanel.onDraw = function() {};
            selectedColorPanel.notify("onDraw");
        } catch(e) {}
        
        // 세션 데이터 삭제
        var sessionFile = getSessionDataFile();
        if (sessionFile.exists) {
            sessionFile.remove();
        }
        
        alert("초기화되었습니다.");
    };
    
    generateButton.onClick = function() {
        // 세션 데이터 저장
        var filePathsArray = [];
        if (dialog.referenceFiles) {
            for (var i = 0; i < dialog.referenceFiles.length; i++) {
                filePathsArray.push(dialog.referenceFiles[i].fsName);
            }
        }
        saveSessionData({
            prompt: dialog.promptInput.text,
            referenceFiles: filePathsArray,
            backgroundColor: dialog.selectedColor
        });
        dialog.close(1);
    };
    
    cancelButton.onClick = function() {
        // 취소 시에도 세션 데이터 저장
        var filePathsArray = [];
        if (dialog.referenceFiles) {
            for (var i = 0; i < dialog.referenceFiles.length; i++) {
                filePathsArray.push(dialog.referenceFiles[i].fsName);
            }
        }
        saveSessionData({
            prompt: dialog.promptInput.text,
            referenceFiles: filePathsArray,
            backgroundColor: dialog.selectedColor
        });
        dialog.close(0);
    };
    
    return dialog;
}

// ===== 색상 변환 함수 =====

function hsbToRgb(h, s, b) {
    // H: 0-360, S: 0-100, B: 0-100
    h = h / 360;
    s = s / 100;
    b = b / 100;
    
    var r, g, b2;
    
    if (s === 0) {
        r = g = b2 = b;
    } else {
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = b * (1 - s);
        var q = b * (1 - f * s);
        var t = b * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = b; g = t; b2 = p; break;
            case 1: r = q; g = b; b2 = p; break;
            case 2: r = p; g = b; b2 = t; break;
            case 3: r = p; g = q; b2 = b; break;
            case 4: r = t; g = p; b2 = b; break;
            case 5: r = b; g = p; b2 = q; break;
        }
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b2 * 255)
    };
}

function rgbToHsb(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, b2 = max;
    
    var d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        b: Math.round(b2 * 100)
    };
}

function rgbToHex(r, g, b) {
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

// 파일에서 MIME 타입 추론
function getMimeType(file) {
    try {
        var name = null;
        if (file) {
            if (file.name) name = file.name;
            else if (file.fsName) name = file.fsName;
            else if (typeof file === 'string') name = file;
        }
        if (!name) return "image/jpeg";
        var dot = name.lastIndexOf('.');
        var ext = dot >= 0 ? name.substring(dot + 1).toLowerCase() : "";
        switch (ext) {
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'webp': return 'image/webp';
            case 'gif': return 'image/gif';
            case 'bmp': return 'image/bmp';
            case 'tif':
            case 'tiff': return 'image/tiff';
            case 'heic': return 'image/heic';
            default: return 'image/jpeg';
        }
    } catch (e) {
        return 'image/jpeg';
    }
}

// 256색(3-3-2) 팔레트 인덱스를 RGB로 변환
function indexTo332Color(index) {
    index = Math.max(0, Math.min(255, index|0));
    var r3 = (index >> 5) & 0x07; // 3 bits
    var g3 = (index >> 2) & 0x07; // 3 bits
    var b2 = index & 0x03;        // 2 bits
    var r = Math.round(r3 * 255 / 7);
    var g = Math.round(g3 * 255 / 7);
    var b = Math.round(b2 * 255 / 3);
    return { r: r, g: g, b: b };
}

function rgbToCmyk(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    var k = 1 - Math.max(r, g, b);
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    var c = (1 - r - k) / (1 - k);
    var m = (1 - g - k) / (1 - k);
    var y = (1 - b - k) / (1 - k);
    
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

function getColorName(color) {
    // 기본 색상 이름 매핑
    var colors = [
        { name: "red", r: 255, g: 0, b: 0 },
        { name: "green", r: 0, g: 255, b: 0 },
        { name: "blue", r: 0, g: 0, b: 255 },
        { name: "yellow", r: 255, g: 255, b: 0 },
        { name: "cyan", r: 0, g: 255, b: 255 },
        { name: "magenta", r: 255, g: 0, b: 255 },
        { name: "orange", r: 255, g: 165, b: 0 },
        { name: "purple", r: 128, g: 0, b: 128 },
        { name: "pink", r: 255, g: 192, b: 203 },
        { name: "brown", r: 165, g: 42, b: 42 },
        { name: "black", r: 0, g: 0, b: 0 },
        { name: "white", r: 255, g: 255, b: 255 },
        { name: "gray", r: 128, g: 128, b: 128 },
        { name: "navy", r: 0, g: 0, b: 128 },
        { name: "teal", r: 0, g: 128, b: 128 },
        { name: "lime", r: 0, g: 255, b: 0 },
        { name: "olive", r: 128, g: 128, b: 0 },
        { name: "maroon", r: 128, g: 0, b: 0 }
    ];
    
    // 가장 가까운 색상 찾기
    var minDistance = 999999;
    var closestColor = "custom color";
    
    for (var i = 0; i < colors.length; i++) {
        var distance = Math.sqrt(
            Math.pow(color.r - colors[i].r, 2) +
            Math.pow(color.g - colors[i].g, 2) +
            Math.pow(color.b - colors[i].b, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = colors[i].name;
        }
    }
    
    // 정확한 매치가 아니면 "~색상" 형태로 반환
    if (minDistance > 30) {
        return "similar to " + closestColor;
    }
    
    return closestColor;
}

// ===== 고급 색상 피커 =====

function createAdvancedColorPicker(initialColor) {
    // 1) 시도: Photoshop 네이티브 고급 컬러 피커 사용 (app.showColorPicker)
    try {
        if (app && typeof app.showColorPicker === 'function') {
            // 현재 전경색 백업
            var original = app.foregroundColor;

            // 초기 색상이 있으면 전경색을 해당 색으로 설정해 피커 초기값으로 사용
            try {
                if (initialColor && typeof initialColor.r === 'number') {
                    var temp = new SolidColor();
                    temp.rgb.red = initialColor.r;
                    temp.rgb.green = initialColor.g;
                    temp.rgb.blue = initialColor.b;
                    app.foregroundColor = temp;
                }
            } catch (e1) {}

            // 다이얼로그 표시 허용 모드 보장
            var oldDialogs = app.displayDialogs;
            try { app.displayDialogs = DialogModes.ALL; } catch (e2) {}

            var ok = app.showColorPicker();

            // 기존 다이얼로그 모드 복원
            try { app.displayDialogs = oldDialogs; } catch (e3) {}

            var result = null;
            if (ok) {
                try {
                    var picked = app.foregroundColor.rgb;
                    result = {
                        r: Math.round(picked.red),
                        g: Math.round(picked.green),
                        b: Math.round(picked.blue)
                    };
                } catch (e4) {}
            }

            // 사용자 전경색 복원 (플러그인이 전역 상태를 바꾸지 않도록)
            try { app.foregroundColor = original; } catch (e5) {}

            return result;
        }
    } catch (e) {
        // 네이티브 피커 실패 시 다음 폴백으로 진행
    }

    // 2) 폴백: ExtendScript 공용 컬러 피커 ($.colorPicker)
    try {
        if (typeof $.colorPicker === 'function') {
            var pickedInt = $.colorPicker();
            if (pickedInt !== -1) {
                // pickedInt는 0xRRGGBB 정수
                var r = (pickedInt >> 16) & 0xFF;
                var g = (pickedInt >> 8) & 0xFF;
                var b = pickedInt & 0xFF;
                return { r: r, g: g, b: b };
            }
            return null; // 취소
        }
    } catch (e6) {
        // 무시하고 최종 폴백 사용
    }

    // 3) 최종 폴백: 커스텀 피커 사용
    return createFallbackColorPicker(initialColor);
}

// 폴백 색상 피커 (네이티브 피커가 작동하지 않을 경우)
function createFallbackColorPicker(initialColor) {
    var dialog = new Window("dialog", "색상 선택");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.spacing = 10;
    dialog.margins = 15;
    
    // 초기 색상 설정
    var currentColor = initialColor || { r: 24, g: 47, b: 44 };
    var selectedColor = { r: currentColor.r, g: currentColor.g, b: currentColor.b };
    
    // 색상 프리뷰 패널
    var previewPanel = dialog.add("panel", undefined, "색상 미리보기");
    var previewGroup = previewPanel.add("group");
    previewGroup.alignment = "fill";
    
    // 새로운 색상 표시
    var newColorDisplay = previewGroup.add("panel");
    newColorDisplay.preferredSize.width = 200;
    newColorDisplay.preferredSize.height = 50;
    
    var hexText = previewGroup.add("statictext", undefined, rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b));
    hexText.characters = 12;
    
    // 색상 값 입력 패널
    var valuesPanel = dialog.add("panel", undefined, "색상 값");
    valuesPanel.alignChildren = "fill";
    valuesPanel.margins = 10;
    
    // RGB 입력
    var rgbGroup = valuesPanel.add("group");
    rgbGroup.add("statictext", undefined, "R:");
    var rInput = rgbGroup.add("edittext", undefined, selectedColor.r.toString());
    rInput.characters = 4;
    
    rgbGroup.add("statictext", undefined, "G:");
    var gInput = rgbGroup.add("edittext", undefined, selectedColor.g.toString());
    gInput.characters = 4;
    
    rgbGroup.add("statictext", undefined, "B:");
    var bInput = rgbGroup.add("edittext", undefined, selectedColor.b.toString());
    bInput.characters = 4;
    
    // HEX 입력
    var hexGroup = valuesPanel.add("group");
    hexGroup.add("statictext", undefined, "#");
    var hexInput = hexGroup.add("edittext", undefined, rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b).substring(1));
    hexInput.characters = 8;
    
    // 256 컬러 빠른 선택 (3-3-2 팔레트)
    var swatchPanel = dialog.add("panel", undefined, "빠른 선택 (256)");
    swatchPanel.alignChildren = "fill";
    swatchPanel.margins = 10;
    
    var rows256 = 16, cols256 = 16;
    var cellSize = 18;
    for (var rr = 0; rr < rows256; rr++) {
        var rowGroup = swatchPanel.add("group");
        for (var cc = 0; cc < cols256; cc++) {
            (function(idx){
                var c332 = indexTo332Color(idx);
                var colorBtn = rowGroup.add("button", undefined, "");
                colorBtn.preferredSize.width = cellSize;
                colorBtn.preferredSize.height = cellSize;
                colorBtn.helpTip = rgbToHex(c332.r, c332.g, c332.b);
                colorBtn.fillBrush = colorBtn.graphics.newBrush(colorBtn.graphics.BrushType.SOLID_COLOR, [c332.r/255, c332.g/255, c332.b/255]);
                colorBtn.onDraw = function() {
                    this.graphics.newPath();
                    this.graphics.rectPath(0, 0, this.size.width, this.size.height);
                    this.graphics.fillPath(this.fillBrush);
                };
                colorBtn.onClick = function() {
                    selectedColor = { r: c332.r, g: c332.g, b: c332.b };
                    rInput.text = selectedColor.r.toString();
                    gInput.text = selectedColor.g.toString();
                    bInput.text = selectedColor.b.toString();
                    hexInput.text = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b).substring(1);
                    hexText.text = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
                    updatePreview();
                };
            })(rr * cols256 + cc);
        }
    }
    
    // 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "확인");
    var cancelButton = buttonGroup.add("button", undefined, "취소");
    
    // 색상 업데이트 함수
    function updateFromRgb() {
        var r = parseInt(rInput.text) || 0;
        var g = parseInt(gInput.text) || 0;
        var b = parseInt(bInput.text) || 0;
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        selectedColor = { r: r, g: g, b: b };
        
        // HEX 업데이트
        hexInput.text = rgbToHex(r, g, b).substring(1);
        hexText.text = rgbToHex(r, g, b);
        
        updatePreview();
    }
    
    function updateFromHex() {
        var hex = hexInput.text.replace(/[^0-9A-Fa-f]/g, '');
        if (hex.length === 6) {
            var rgb = hexToRgb("#" + hex);
            selectedColor = rgb;
            
            // RGB 필드 업데이트
            rInput.text = rgb.r.toString();
            gInput.text = rgb.g.toString();
            bInput.text = rgb.b.toString();
            
            updateFromRgb();
        }
    }
    
    function updatePreview() {
        try {
            var g = newColorDisplay.graphics;
            var brush = g.newBrush(g.BrushType.SOLID_COLOR, [selectedColor.r/255, selectedColor.g/255, selectedColor.b/255]);
            g.backgroundColor = brush;
        } catch(e) {}
    }
    
    // 이벤트 핸들러
    rInput.onChange = gInput.onChange = bInput.onChange = updateFromRgb;
    hexInput.onChange = updateFromHex;
    
    // 초기 프리뷰 업데이트
    updatePreview();
    
    // 버튼 이벤트
    okButton.onClick = function() {
        dialog.close(1);
    };
    
    cancelButton.onClick = function() {
        dialog.close(0);
    };
    
    // 다이얼로그 표시
    if (dialog.show() === 1) {
        return selectedColor;
    }
    return null;
}

// 256 컬러 팔레트 전용 피커 (간단, 빠른 선택)
function createPalette256Picker(initialColor) {
    var dialog = new Window("dialog", "256 색상 팔레트");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.spacing = 10;
    dialog.margins = 15;

    var currentColor = initialColor || { r: 24, g: 47, b: 44 };
    var selectedColor = { r: currentColor.r, g: currentColor.g, b: currentColor.b };

    // 간단 프리뷰
    var previewGroup = dialog.add("group");
    var preview = previewGroup.add("panel");
    preview.preferredSize.width = 200;
    preview.preferredSize.height = 30;
    preview.onDraw = function() {
        var g = this.graphics;
        var brush = g.newBrush(g.BrushType.SOLID_COLOR, [selectedColor.r/255, selectedColor.g/255, selectedColor.b/255]);
        g.newPath();
        g.rectPath(0, 0, this.size.width, this.size.height);
        g.fillPath(brush);
    };
    var hexLabel = previewGroup.add("statictext", undefined, rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b));

    // 16x16 스와치 그리드
    var swatchPanel = dialog.add("panel", undefined, "빠른 선택 (256)");
    swatchPanel.alignChildren = "fill";
    swatchPanel.margins = 10;
    var rows = 16, cols = 16;
    var cell = 18;
    for (var r = 0; r < rows; r++) {
        var rowGroup = swatchPanel.add("group");
        for (var c = 0; c < cols; c++) {
            (function(idx){
                var col = indexTo332Color(idx);
                var btn = rowGroup.add("button", undefined, "");
                btn.preferredSize.width = cell;
                btn.preferredSize.height = cell;
                btn.helpTip = rgbToHex(col.r, col.g, col.b);
                btn.fillBrush = btn.graphics.newBrush(btn.graphics.BrushType.SOLID_COLOR, [col.r/255, col.g/255, col.b/255]);
                btn.onDraw = function() {
                    this.graphics.newPath();
                    this.graphics.rectPath(0, 0, this.size.width, this.size.height);
                    this.graphics.fillPath(this.fillBrush);
                };
                btn.onClick = function() {
                    selectedColor = { r: col.r, g: col.g, b: col.b };
                    try { preview.notify("onDraw"); } catch(e) {}
                    hexLabel.text = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
                };
            })(r * cols + c);
        }
    }

    var buttons = dialog.add("group");
    var ok = buttons.add("button", undefined, "확인");
    var cancel = buttons.add("button", undefined, "취소");

    ok.onClick = function(){ dialog.close(1); };
    cancel.onClick = function(){ dialog.close(0); };

    if (dialog.show() === 1) {
        return selectedColor;
    }
    return null;
}

// ===== 헬퍼 함수 =====

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
    // 유니코드 문자를 이스케이프 처리
    var escaped = "";
    for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        var code = c.charCodeAt(0);
        
        if (code < 0x20 || code > 0x7E) {
            // ASCII 범위 밖의 문자는 유니코드 이스케이프
            escaped += "\\u" + ("0000" + code.toString(16)).slice(-4);
        } else if (c === '"') {
            escaped += '\\"';
        } else if (c === '\\') {
            escaped += '\\\\';
        } else if (c === '\n') {
            escaped += '\\n';
        } else if (c === '\r') {
            escaped += '\\r';
        } else if (c === '\t') {
            escaped += '\\t';
        } else {
            escaped += c;
        }
    }
    return escaped;
}

function unescapeJsonString(str) {
    // 유니코드 이스케이프 문자를 실제 문자로 변환
    return str.replace(/\\u([0-9a-fA-F]{4})/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    }).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
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

/**
 * 여러 결과를 그룹으로 배치
 */
function placeMultipleResults(doc, resultFiles, x1, y1, x2, y2, savedSelection, prompt) {
    try {
        // 레이어 그룹 생성
        var layerGroup = doc.layerSets.add();
        layerGroup.name = prompt.substring(0, 25) + " (" + resultFiles.length + "장)";
        
        for (var i = 0; i < resultFiles.length; i++) {
            var resultDoc = app.open(resultFiles[i]);
            
            // 그룹으로 복사
            resultDoc.artLayers[0].duplicate(layerGroup, ElementPlacement.PLACEATBEGINNING);
            resultDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            var newLayer = layerGroup.artLayers[0];
            newLayer.name = prompt.substring(0, 25) + " #" + (i+1);
            
            // 크기 조정
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
            
            // 위치 조정
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
            
            // 마스크 적용
            doc.selection.load(savedSelection);
            doc.activeLayer = newLayer;
            addLayerMask();
            doc.selection.deselect();
            
            // 첫 번째 레이어만 표시, 나머지는 숨김
            newLayer.visible = (i === 0);
        }
        
        savedSelection.remove();
        
        // 첫 번째 레이어 활성화
        if (layerGroup.artLayers.length > 0) {
            doc.activeLayer = layerGroup.artLayers[layerGroup.artLayers.length - 1];
        }
        
    } catch(e) {
        alert("다중 배치 오류: " + e.message);
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
        alert("배치 오류: " + e.message);
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

// ===== 자동 업데이트 시스템 =====

function SmartUpdater() {
    this.currentScriptPath = $.fileName;
    this.scriptFolder = new File($.fileName).parent;
    
    this.updateFiles = [
        "Nano-Banana-Gemini.jsx",
        "preset.js"
    ];
    
    this.backupFolder = new Folder(Folder.userData + "/NanoBanana/backups");
    if (!this.backupFolder.exists) {
        this.backupFolder.create();
    }
}

SmartUpdater.prototype.checkForUpdate = function() {
    try {
        var tempFile = new File(Folder.temp + "/version_check_" + new Date().getTime() + ".json");
        var cmd;
        
        if (CONFIG.IS_WINDOWS) {
            cmd = 'curl.exe -s -L "' + UPDATE_CHECK_URL + '" > "' + tempFile.fsName + '"';
        } else {
            cmd = 'curl -s -L "' + UPDATE_CHECK_URL + '" > "' + tempFile.fsName + '"';
        }
        
        app.system(cmd);
        
        if (tempFile.exists && tempFile.length > 0) {
            tempFile.open("r");
            var response = tempFile.read();
            tempFile.close();
            tempFile.remove();
            
            var tagMatch = response.match(/"tag_name"\s*:\s*"v?([^"]+)"/);
            if (tagMatch && tagMatch[1]) {
                var latestVersion = tagMatch[1];
                
                if (this.isNewerVersion(latestVersion, PLUGIN_VERSION)) {
                    var downloadUrlMatch = response.match(/"browser_download_url"\s*:\s*"([^"]+)"/);
                    var changelogMatch = response.match(/"body"\s*:\s*"([^"]+)"/);
                    
                    return {
                        currentVersion: PLUGIN_VERSION,
                        newVersion: latestVersion,
                        downloadUrl: downloadUrlMatch ? downloadUrlMatch[1].replace(/\\/g, "") : null,
                        changelog: changelogMatch ? changelogMatch[1].replace(/\\n/g, "\n").replace(/\\r/g, "") : ""
                    };
                }
            }
        }
    } catch(e) {}
    return false;
};

SmartUpdater.prototype.isNewerVersion = function(version1, version2) {
    var v1 = version1.split(".").map(function(n) { return parseInt(n) || 0; });
    var v2 = version2.split(".").map(function(n) { return parseInt(n) || 0; });
    
    for (var i = 0; i < Math.max(v1.length, v2.length); i++) {
        var n1 = v1[i] || 0;
        var n2 = v2[i] || 0;
        if (n1 > n2) return true;
        if (n1 < n2) return false;
    }
    return false;
};

// 디버깅용: 최신 버전 정보 가져오기
SmartUpdater.prototype.getLatestVersionInfo = function() {
    try {
        var tempFile = new File(Folder.temp + "/debug_version_" + new Date().getTime() + ".json");
        var cmd;
        
        if (CONFIG.IS_WINDOWS) {
            cmd = 'curl.exe -s -L "' + UPDATE_CHECK_URL + '" > "' + tempFile.fsName + '"';
        } else {
            cmd = 'curl -s -L "' + UPDATE_CHECK_URL + '" > "' + tempFile.fsName + '"';
        }
        
        app.system(cmd);
        
        if (tempFile.exists && tempFile.length > 0) {
            tempFile.open("r");
            var response = tempFile.read();
            tempFile.close();
            tempFile.remove();
            
            var tagMatch = response.match(/"tag_name"\s*:\s*"v?([^"]+)"/);
            if (tagMatch && tagMatch[1]) {
                return tagMatch[1];
            }
        }
    } catch(e) {}
    return null;
};

SmartUpdater.prototype.performUpdate = function(updateInfo) {
    var progressDialog = this.showProgressDialog();
    
    try {
        progressDialog.updateStatus("현재 버전 백업 중...");
        var backups = this.backupCurrentFiles();
        
        progressDialog.updateStatus("새 버전 다운로드 중...");
        var downloadedFiles = this.downloadNewFiles(updateInfo);
        
        progressDialog.updateStatus("파일 업데이트 중...");
        var success = this.replaceFiles(downloadedFiles);
        
        progressDialog.close();
        
        if (success) {
            this.showRestartDialog(updateInfo);
            return true;
        } else {
            this.rollbackFromBackups(backups);
            alert("업데이트 실패. 이전 버전으로 복원되었습니다.");
            return false;
        }
        
    } catch(e) {
        progressDialog.close();
        alert("업데이트 중 오류 발생: " + e.message);
        return false;
    }
};

SmartUpdater.prototype.backupCurrentFiles = function() {
    var timestamp = new Date().getTime();
    var backups = {};
    
    for (var i = 0; i < this.updateFiles.length; i++) {
        var fileName = this.updateFiles[i];
        var sourceFile = new File(this.scriptFolder.fsName + "/" + fileName);
        
        if (sourceFile.exists) {
            var ext = fileName.substring(fileName.lastIndexOf("."));
            var baseName = fileName.substring(0, fileName.lastIndexOf("."));
            var backupName = baseName + "_v" + PLUGIN_VERSION + "_" + timestamp + ext;
            var backupPath = this.backupFolder.fsName + "/" + backupName;
            
            sourceFile.copy(backupPath);
            backups[fileName] = backupPath;
        }
    }
    
    return backups;
};

SmartUpdater.prototype.downloadNewFiles = function(updateInfo) {
    var downloads = {};
    var tempFolder = new Folder(Folder.temp + "/nanobanana_update_" + new Date().getTime());
    tempFolder.create();
    
    // GitHub releases URL에서 파일별 URL 생성
    var baseUrl = "https://github.com/NewTurn2017/nanobanana/releases/download/v" + updateInfo.newVersion;
    
    for (var i = 0; i < this.updateFiles.length; i++) {
        var fileName = this.updateFiles[i];
        var downloadUrl = baseUrl + "/" + fileName;
        var tempFile = new File(tempFolder.fsName + "/" + fileName);
        
        var cmd;
        if (CONFIG.IS_WINDOWS) {
            cmd = 'curl.exe -L -o "' + tempFile.fsName + '" "' + downloadUrl + '"';
        } else {
            cmd = 'curl -L -o "' + tempFile.fsName + '" "' + downloadUrl + '"';
        }
        
        app.system(cmd);
        
        if (tempFile.exists && tempFile.length > 0) {
            downloads[fileName] = tempFile.fsName;
        } else {
            throw new Error(fileName + " 다운로드 실패");
        }
    }
    
    return downloads;
};

SmartUpdater.prototype.replaceFiles = function(downloadedFiles) {
    var allSuccess = true;
    
    for (var fileName in downloadedFiles) {
        var targetFile = new File(this.scriptFolder.fsName + "/" + fileName);
        var sourceFile = new File(downloadedFiles[fileName]);
        
        try {
            if (targetFile.exists) {
                targetFile.rename(targetFile.name + ".updating");
            }
            
            sourceFile.copy(targetFile.fsName);
            
            var tempFile = new File(targetFile.fsName + ".updating");
            if (tempFile.exists) {
                tempFile.remove();
            }
            
            sourceFile.remove();
            
        } catch(e) {
            allSuccess = false;
            if (CONFIG.IS_WINDOWS) {
                try {
                    app.system('cmd.exe /c copy /Y "' + sourceFile.fsName + '" "' + targetFile.fsName + '"');
                    allSuccess = true;
                } catch(e2) {
                    allSuccess = false;
                }
            }
        }
    }
    
    return allSuccess;
};

SmartUpdater.prototype.rollbackFromBackups = function(backups) {
    for (var fileName in backups) {
        try {
            var backupFile = new File(backups[fileName]);
            var targetFile = new File(this.scriptFolder.fsName + "/" + fileName);
            backupFile.copy(targetFile.fsName);
        } catch(e) {}
    }
};

SmartUpdater.prototype.showProgressDialog = function() {
    var dialog = new Window("palette", "업데이트 진행 중");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 350;
    dialog.margins = 15;
    
    dialog.statusText = dialog.add("statictext", undefined, "업데이트 준비 중...");
    
    dialog.updateStatus = function(message) {
        dialog.statusText.text = message;
        dialog.update();
    };
    
    dialog.show();
    return dialog;
};

SmartUpdater.prototype.showRestartDialog = function(updateInfo) {
    var dialog = new Window("dialog", "업데이트 완료!");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 400;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    var successPanel = dialog.add("panel", undefined, "✅ 업데이트 성공");
    successPanel.alignChildren = "left";
    successPanel.margins = 10;
    
    successPanel.add("statictext", undefined, "버전 " + updateInfo.currentVersion + " → " + updateInfo.newVersion);
    successPanel.add("statictext", undefined, "다음 파일이 업데이트되었습니다:");
    successPanel.add("statictext", undefined, "  • Nano-Banana-Gemini.jsx");
    successPanel.add("statictext", undefined, "  • preset.js");
    
    var restartPanel = dialog.add("panel", undefined, "⚠️ 중요 안내");
    restartPanel.alignChildren = "left";
    restartPanel.margins = 10;
    
    var msg1 = restartPanel.add("statictext", undefined, "새 버전을 적용하려면 Photoshop을 재시작해야 합니다.");
    msg1.graphics.font = ScriptUI.newFont(msg1.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    restartPanel.add("statictext", undefined, "");
    restartPanel.add("statictext", undefined, "재시작 방법:");
    restartPanel.add("statictext", undefined, "1. 현재 작업을 저장하세요");
    restartPanel.add("statictext", undefined, "2. Photoshop을 완전히 종료하세요");
    restartPanel.add("statictext", undefined, "3. Photoshop을 다시 실행하세요");
    
    if (updateInfo.changelog) {
        var changePanel = dialog.add("panel", undefined, "변경사항");
        var changeText = changePanel.add("edittext", undefined, updateInfo.changelog, {multiline: true});
        changeText.preferredSize.height = 80;
        changeText.enabled = false;
    }
    
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var okBtn = buttonGroup.add("button", undefined, "확인");
    
    okBtn.onClick = function() {
        dialog.close();
        alert("새 버전은 Photoshop 재시작 후 적용됩니다.\n지금 Photoshop을 재시작하시기 바랍니다.");
    };
    
    dialog.show();
};

// 수동 업데이트 확인 함수
function checkForManualUpdate() {
    try {
        // 업데이트 확인 중 표시
        var checkingDialog = new Window("palette", "업데이트 확인");
        checkingDialog.orientation = "column";
        checkingDialog.alignChildren = "center";
        checkingDialog.preferredSize.width = 250;
        checkingDialog.margins = 15;
        
        var msg = checkingDialog.add("statictext", undefined, "업데이트를 확인하는 중...");
        var debugMsg = checkingDialog.add("statictext", undefined, "현재: v" + PLUGIN_VERSION);
        debugMsg.graphics.font = ScriptUI.newFont(debugMsg.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
        checkingDialog.show();
        
        // SmartUpdater 인스턴스 생성 및 업데이트 확인
        var updater = new SmartUpdater();
        var updateInfo = updater.checkForUpdate();
        
        checkingDialog.close();
        
        // 디버깅용: 실제 GitHub API 응답 확인
        var debugInfo = updater.getLatestVersionInfo();
        
        if (updateInfo) {
            // 새 버전이 있는 경우
            showUpdateDialog(updateInfo, updater);
        } else {
            // 최신 버전인 경우
            var latestDialog = new Window("dialog", "업데이트 확인");
            latestDialog.orientation = "column";
            latestDialog.alignChildren = "center";
            latestDialog.preferredSize.width = 300;
            latestDialog.margins = 15;
            latestDialog.spacing = 10;
            
            var icon = latestDialog.add("statictext", undefined, "✓");
            icon.graphics.font = ScriptUI.newFont(icon.graphics.font.name, ScriptUI.FontStyle.BOLD, 24);
            icon.graphics.foregroundColor = icon.graphics.newPen(icon.graphics.PenType.SOLID_COLOR, [0, 0.7, 0], 1);
            
            var msgText = latestDialog.add("statictext", undefined, "최신 버전입니다!");
            msgText.graphics.font = ScriptUI.newFont(msgText.graphics.font.name, ScriptUI.FontStyle.BOLD, 14);
            
            var versionText = latestDialog.add("statictext", undefined, "현재 버전: v" + PLUGIN_VERSION);
            versionText.graphics.font = ScriptUI.newFont(versionText.graphics.font.name, ScriptUI.FontStyle.REGULAR, 12);
            
            // 디버그 정보 추가
            if (debugInfo) {
                var debugText = latestDialog.add("statictext", undefined, "서버 최신: v" + debugInfo);
                debugText.graphics.font = ScriptUI.newFont(debugText.graphics.font.name, ScriptUI.FontStyle.REGULAR, 10);
            }
            
            var okBtn = latestDialog.add("button", undefined, "확인");
            okBtn.preferredSize.width = 100;
            okBtn.onClick = function() { latestDialog.close(); };
            
            latestDialog.show();
        }
    } catch(e) {
        alert("업데이트 확인 중 오류가 발생했습니다:\n" + e.message);
    }
}

// 업데이트 대화상자 개선
function showUpdateDialog(updateInfo, updater) {
    var dialog = new Window("dialog", "업데이트 가능!");
    dialog.orientation = "column";
    dialog.alignChildren = "center";
    dialog.preferredSize.width = 400;
    dialog.margins = 15;
    dialog.spacing = 10;
    
    // 업데이트 아이콘
    var icon = dialog.add("statictext", undefined, "⬇");
    icon.graphics.font = ScriptUI.newFont(icon.graphics.font.name, ScriptUI.FontStyle.BOLD, 24);
    
    // 제목
    var title = dialog.add("statictext", undefined, "새 버전을 사용할 수 있습니다!");
    title.graphics.font = ScriptUI.newFont(title.graphics.font.name, ScriptUI.FontStyle.BOLD, 14);
    
    // 버전 정보 패널
    var versionPanel = dialog.add("panel");
    versionPanel.orientation = "column";
    versionPanel.alignChildren = "fill";
    versionPanel.margins = 10;
    versionPanel.preferredSize.width = 350;
    
    var currentVersion = versionPanel.add("statictext", undefined, "현재 버전: v" + updateInfo.currentVersion);
    var newVersion = versionPanel.add("statictext", undefined, "새 버전: v" + updateInfo.newVersion);
    newVersion.graphics.font = ScriptUI.newFont(newVersion.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    // 변경 사항
    if (updateInfo.changelog) {
        var changelogPanel = dialog.add("panel", undefined, "변경 사항");
        changelogPanel.alignChildren = "fill";
        changelogPanel.margins = 10;
        changelogPanel.preferredSize.width = 350;
        changelogPanel.preferredSize.height = 100;
        
        var changelogText = changelogPanel.add("edittext", undefined, updateInfo.changelog, {multiline: true, readonly: true});
        changelogText.preferredSize.height = 80;
    }
    
    // 버튼
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var updateBtn = buttonGroup.add("button", undefined, "지금 업데이트");
    updateBtn.preferredSize.width = 120;
    
    var laterBtn = buttonGroup.add("button", undefined, "나중에");
    laterBtn.preferredSize.width = 80;
    
    updateBtn.onClick = function() {
        dialog.close();
        updater.performUpdate(updateInfo);
    };
    
    laterBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

function checkForUpdatesAsync() {
    if (!AUTO_UPDATE_ENABLED) return;
    
    try {
        var settingsFile = new File(Folder.userData + "/NanoBanana/update_settings.json");
        var lastCheck = 0;
        
        if (settingsFile.exists) {
            settingsFile.open("r");
            var content = settingsFile.read();
            settingsFile.close();
            
            var match = content.match(/"lastCheck"\s*:\s*(\d+)/);
            if (match) lastCheck = parseInt(match[1]);
        }
        
        var now = new Date().getTime();
        var checkInterval = 1000; // 1초 (테스트용, 원래는 86400000)
        
        if ((now - lastCheck) > checkInterval) {
            var updater = new SmartUpdater();
            var updateInfo = updater.checkForUpdate();
            
            if (updateInfo) {
                showUpdateNotification(updateInfo, updater);
            }
            
            // 마지막 체크 시간 저장
            var settingsFolder = new Folder(Folder.userData + "/NanoBanana");
            if (!settingsFolder.exists) settingsFolder.create();
            
            settingsFile.open("w");
            settingsFile.write('{"lastCheck":' + now + ',"version":"' + PLUGIN_VERSION + '"}');
            settingsFile.close();
        }
    } catch(e) {}
}

function showUpdateNotification(updateInfo, updater) {
    var dialog = new Window("dialog", "새 버전 사용 가능");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 350;
    dialog.margins = 15;
    
    var message = dialog.add("statictext", undefined, 
        "Nano Banana 새 버전 " + updateInfo.newVersion + "이(가) 사용 가능합니다.");
    message.graphics.font = ScriptUI.newFont(message.graphics.font.name, ScriptUI.FontStyle.BOLD, 12);
    
    dialog.add("statictext", undefined, "현재 버전: " + updateInfo.currentVersion);
    
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var updateBtn = buttonGroup.add("button", undefined, "지금 업데이트");
    var laterBtn = buttonGroup.add("button", undefined, "나중에");
    
    updateBtn.onClick = function() {
        dialog.close();
        updater.performUpdate(updateInfo);
    };
    
    laterBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// ===== 메인 함수 =====

function main() {
    // 자동 업데이트 체크 (백그라운드)
    checkForUpdatesAsync();
    
    // Curl 사용 가능 확인
    if (!checkCurlAvailable()) {
        showCurlMissingDialog();
        return;
    }
    
    if (!CONFIG.API_KEY) {
        alert("API 키를 찾을 수 없습니다. 유효한 Gemini API 키 없이는 스크립트를 실행할 수 없습니다.");
        return;
    }
    
    if (!app.documents.length) {
        alert("먼저 Photoshop에서 이미지를 열어주세요!");
        return;
    }
    
    if (!hasActiveSelection()) {
        alert("먼저 선택 도구를 사용하여 영역을 선택해주세요!");
        return;
    }
    
    var dialog = createDialog();
    var result = dialog.show();
    
    if (result == 1) {
        var prompt = dialog.promptInput.text;
        var newDocument = dialog.newDocCheckbox.value;
        var selectedColor = dialog.selectedColor;
        var addToPrompt = dialog.addToPromptCheckbox ? dialog.addToPromptCheckbox.value : false;
        var colorFormat = dialog.colorFormatDropdown ? dialog.colorFormatDropdown.selection.index : 0;
        var referenceFiles = dialog.referenceFiles;
        var generateCount = dialog.generateCountDropdown ? parseInt(dialog.generateCountDropdown.selection.text) : 1;
        
        if (prompt.length > 0) {
            // 색상이 선택되고 프롬프트에 추가 옵션이 체크되면 색상 추가
            if (selectedColor && addToPrompt) {
                var colorString = "";
                switch(colorFormat) {
                    case 0: // HEX
                        colorString = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
                        break;
                    case 1: // RGB
                        colorString = "rgb(" + selectedColor.r + "," + selectedColor.g + "," + selectedColor.b + ")";
                        break;
                    case 2: // 색상 이름 (근사값)
                        colorString = getColorName(selectedColor);
                        break;
                    default:
                        colorString = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
                }
                prompt += " " + colorString;
            }
            
            var operationName = "Gemini AI: " + prompt.substring(0, 30);
            
            if (newDocument) {
                processSelection(prompt, newDocument, referenceFiles, generateCount);
            } else {
                // suspendHistory를 위한 파일 배열 문자열 생성
                var refFilesStr = "[]";
                if (referenceFiles && referenceFiles.length > 0) {
                    refFilesStr = "[";
                    for (var i = 0; i < referenceFiles.length; i++) {
                        if (i > 0) refFilesStr += ", ";
                        refFilesStr += "File('" + referenceFiles[i].fsName + "')";
                    }
                    refFilesStr += "]";
                }
                
                app.activeDocument.suspendHistory(operationName, 
                    "processSelection('" + prompt.replace(/'/g, "\\'") + "', " + newDocument + ", " + refFilesStr + ", " + generateCount + ")");
            }
        } else {
            alert("먼저 프롬프트를 입력해주세요!");
        }
    }
}

// ===== 스크립트 시작 =====
main();
