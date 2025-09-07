# Nano Banana 자동 업데이트 시스템

## 개요
Nano Banana v2.1.0부터 GitHub Releases를 통한 자동 업데이트 시스템이 구현되었습니다.

## 주요 기능

### 1. 자동 경로 감지
- `$.fileName`을 사용하여 현재 스크립트의 정확한 설치 경로 감지
- Windows/macOS, Photoshop 2024/2025/Beta 버전 모두 지원
- 경로 예시:
  - Windows: `C:\Program Files\Adobe\Adobe Photoshop (Beta)\Presets\Scripts\`
  - macOS: `/Applications/Adobe Photoshop 2025/Presets/Scripts/`

### 2. 버전 확인
- GitHub API를 통해 최신 릴리스 확인
- 시작 시 자동 확인 (1일 1회)
- 수동 확인 옵션 제공

### 3. 안전한 업데이트
- 업데이트 전 백업 생성
- 실패 시 자동 롤백
- 원자적 파일 교체로 데이터 손실 방지

### 4. 업데이트 대상 파일
- `Nano-Banana-Gemini.jsx` - 메인 플러그인 파일
- `preset.js` - 프리셋 설정 파일

## 업데이트 프로세스

1. **버전 확인**
   ```javascript
   // GitHub API 호출
   GET https://api.github.com/repos/NewTurn2017/nanobanana/releases/latest
   ```

2. **사용자 알림**
   - 새 버전 발견 시 다이얼로그 표시
   - 릴리스 노트 표시
   - 업데이트/건너뛰기 선택 옵션

3. **다운로드 및 설치**
   - curl을 통한 파일 다운로드
   - 임시 폴더에 저장 후 검증
   - 백업 생성 후 파일 교체

4. **재시작 안내**
   - Photoshop 재시작 필요 알림
   - 다음 실행 시 새 버전 적용

## 설정

### 자동 업데이트 비활성화
```javascript
// Nano-Banana-Gemini.jsx 상단에서 수정
var AUTO_UPDATE_ENABLED = false;  // true → false로 변경
```

### 업데이트 확인 주기 변경
```javascript
// SmartUpdater 클래스 내부
var UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;  // 기본: 24시간
```

## 문제 해결

### 업데이트가 작동하지 않을 때
1. 인터넷 연결 확인
2. GitHub API 접근 가능 여부 확인
3. 스크립트 폴더 쓰기 권한 확인

### 백업 위치
- Windows: `%APPDATA%/NanoBanana/backups/`
- macOS: `~/Library/Application Support/NanoBanana/backups/`

### 수동 업데이트
1. [GitHub Releases](https://github.com/NewTurn2017/nanobanana/releases) 페이지 방문
2. 최신 버전의 파일 다운로드
3. Photoshop Scripts 폴더에 수동 복사

## 개발자 정보

### 새 릴리스 생성
```bash
# 버전 태그 생성
git tag v2.1.2
git push origin v2.1.2

# GitHub CLI로 릴리스 생성
gh release create v2.1.2 \
  --title "v2.1.2 - 기능 개선" \
  --notes "- 색상 피커 개선\n- 버그 수정" \
  Nano-Banana-Gemini.jsx preset.js
```

### 테스트
```bash
# Node.js 테스트 스크립트 실행
node test-update.js

# HTML 테스트 페이지 열기
open test-update-system.html
```

## 보안 고려사항
- API 키는 업데이트 과정에서 전송되지 않음
- HTTPS를 통한 안전한 다운로드
- 파일 무결성 검증 (크기 확인)

## 향후 계획
- [ ] 델타 업데이트 지원
- [ ] 업데이트 롤백 기능
- [ ] 베타 채널 지원
- [ ] 자동 업데이트 스케줄링