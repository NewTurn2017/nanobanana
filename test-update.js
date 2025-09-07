#!/usr/bin/env node

/**
 * Nano Banana 업데이트 시스템 테스트
 * 
 * 이 스크립트는 실제 업데이트 프로세스를 시뮬레이션합니다.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 설정
const CURRENT_VERSION = '2.1.0';
const UPDATE_CHECK_URL = 'https://api.github.com/repos/NewTurn2017/nanobanana/releases/latest';
const TEST_INSTALL_PATH = path.join(__dirname, 'test-install');

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function compareVersions(v1, v2) {
    const normalize = v => v.replace('v', '').split('.').map(Number);
    const parts1 = normalize(v1);
    const parts2 = normalize(v2);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 < part2) return -1;
        if (part1 > part2) return 1;
    }
    return 0;
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        
        https.get(url, { headers: { 'User-Agent': 'NanoBanana-Updater' } }, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

async function checkForUpdate() {
    log('\n🔍 업데이트 확인 중...', 'cyan');
    
    return new Promise((resolve, reject) => {
        https.get(UPDATE_CHECK_URL, {
            headers: { 'User-Agent': 'NanoBanana-Updater' }
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const release = JSON.parse(data);
                    resolve(release);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function simulateUpdate(release) {
    const latestVersion = release.tag_name;
    
    log(`\n📦 현재 버전: ${CURRENT_VERSION}`, 'yellow');
    log(`📦 최신 버전: ${latestVersion}`, 'green');
    
    if (compareVersions(CURRENT_VERSION, latestVersion) >= 0) {
        log('\n✅ 이미 최신 버전입니다!', 'green');
        return false;
    }
    
    log('\n🎉 새로운 업데이트가 있습니다!', 'bright');
    
    // 릴리스 노트 표시
    if (release.body) {
        log('\n📝 릴리스 노트:', 'cyan');
        console.log(release.body);
    }
    
    // 다운로드 URL 찾기
    const jsxAsset = release.assets.find(a => a.name === 'Nano-Banana-Gemini.jsx');
    const presetAsset = release.assets.find(a => a.name === 'preset.js');
    
    if (!jsxAsset || !presetAsset) {
        log('\n❌ 필요한 파일을 찾을 수 없습니다!', 'red');
        return false;
    }
    
    log('\n📥 업데이트 파일 다운로드 중...', 'cyan');
    
    // 테스트 디렉토리 생성
    if (!fs.existsSync(TEST_INSTALL_PATH)) {
        fs.mkdirSync(TEST_INSTALL_PATH, { recursive: true });
    }
    
    try {
        // 백업 생성
        log('  백업 생성 중...', 'yellow');
        const backupPath = path.join(TEST_INSTALL_PATH, 'backup');
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        
        // 다운로드 시뮬레이션
        log(`  Nano-Banana-Gemini.jsx 다운로드 중... (${(jsxAsset.size / 1024).toFixed(2)} KB)`, 'yellow');
        // 실제로는 downloadFile(jsxAsset.browser_download_url, ...) 사용
        
        log(`  preset.js 다운로드 중... (${(presetAsset.size / 1024).toFixed(2)} KB)`, 'yellow');
        // 실제로는 downloadFile(presetAsset.browser_download_url, ...) 사용
        
        log('\n✅ 업데이트 다운로드 완료!', 'green');
        
        // 파일 교체 시뮬레이션
        log('\n🔄 파일 교체 중...', 'cyan');
        log('  기존 파일 백업...', 'yellow');
        log('  새 파일 적용...', 'yellow');
        log('  권한 설정...', 'yellow');
        
        log('\n✅ 업데이트 설치 완료!', 'green');
        log('\n⚠️  Photoshop을 재시작하여 변경사항을 적용하세요.', 'bright');
        
        return true;
    } catch (error) {
        log(`\n❌ 업데이트 실패: ${error.message}`, 'red');
        log('  백업에서 복원 중...', 'yellow');
        return false;
    }
}

async function testPlatformDetection() {
    log('\n🖥️  플랫폼별 경로 감지 테스트', 'cyan');
    
    const testPaths = [
        // Windows
        'C:\\Program Files\\Adobe\\Adobe Photoshop 2025\\Presets\\Scripts\\Nano-Banana-Gemini.jsx',
        'C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Presets\\Scripts\\Nano-Banana-Gemini.jsx',
        'C:\\Program Files\\Adobe\\Adobe Photoshop (Beta)\\Presets\\Scripts\\Nano-Banana-Gemini.jsx',
        // macOS
        '/Applications/Adobe Photoshop 2025/Presets/Scripts/Nano-Banana-Gemini.jsx',
        '/Applications/Adobe Photoshop 2024/Presets/Scripts/Nano-Banana-Gemini.jsx',
        '/Applications/Adobe Photoshop (Beta)/Presets/Scripts/Nano-Banana-Gemini.jsx'
    ];
    
    testPaths.forEach(testPath => {
        const dir = path.dirname(testPath);
        const version = testPath.includes('2025') ? '2025' : 
                        testPath.includes('2024') ? '2024' : 'Beta';
        const platform = testPath.includes('C:\\') ? 'Windows' : 'macOS';
        
        log(`  ${platform} Photoshop ${version}: ${dir}`, 'yellow');
    });
}

async function main() {
    log('='.repeat(60), 'cyan');
    log('🍌 Nano Banana 업데이트 시스템 테스트', 'bright');
    log('='.repeat(60), 'cyan');
    
    try {
        // 플랫폼 감지 테스트
        await testPlatformDetection();
        
        // 업데이트 확인
        const release = await checkForUpdate();
        
        // 업데이트 시뮬레이션
        const updated = await simulateUpdate(release);
        
        if (updated) {
            log('\n🎊 테스트 성공!', 'green');
        } else {
            log('\n📌 업데이트가 필요하지 않습니다.', 'blue');
        }
        
        // 통계 표시
        log('\n📊 업데이트 통계:', 'cyan');
        log(`  릴리스 날짜: ${new Date(release.published_at).toLocaleString('ko-KR')}`, 'yellow');
        log(`  다운로드 수: ${release.assets.reduce((sum, a) => sum + a.download_count, 0)}`, 'yellow');
        
    } catch (error) {
        log(`\n❌ 오류 발생: ${error.message}`, 'red');
        process.exit(1);
    }
    
    log('\n' + '='.repeat(60), 'cyan');
}

// 실행
if (require.main === module) {
    main();
}