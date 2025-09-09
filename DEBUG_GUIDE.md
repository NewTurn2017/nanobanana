# 🔍 Windows 참조 이미지 디버깅 가이드

## 현재 상황
- ✅ 테스트 스크립트는 100% 통과
- ❌ 실제 플러그인에서는 참조 이미지가 반영되지 않음

## 디버깅 방법

### 방법 1: callAPI 함수 교체 (권장)
1. `Nano-Banana-Gemini.jsx` 파일을 백업하세요
2. `debug-reference-patch.jsx` 파일을 열어서 전체 내용을 복사하세요
3. `Nano-Banana-Gemini.jsx`에서 `function callAPI` 함수를 찾아서 전체를 교체하세요
4. `encodeImageBase64_debug` 함수와 `saveDebugLog` 함수도 추가하세요

### 방법 2: 직접 테스트
1. Photoshop에서 이미지를 열고 선택 영역을 만드세요
2. Nano-Banana-Gemini 실행
3. "이미지 추가" 버튼으로 참조 이미지 1-2개 추가
4. 프롬프트 입력 후 생성

## 생성되는 디버그 파일 (바탕화면)

### 1. `nano-api-call-debug.txt`
전체 API 호출 과정의 상세 로그:
- 각 단계별 타임스탬프
- 메인 이미지 인코딩 과정
- 각 참조 이미지 인코딩 과정
- 페이로드 구성 과정
- API 응답

### 2. `nano-payload-debug.json`
실제로 Gemini API로 전송되는 JSON 페이로드:
- 순서 확인: text → main image → reference images
- 각 이미지의 base64 데이터 포함 여부

### 3. `nano-banana-debug.log`
인코딩 과정의 상세 로그

## 확인해야 할 주요 포인트

### 1. 참조 이미지 인코딩 확인
`nano-api-call-debug.txt`에서 다음을 확인:
```
=== ENCODING REFERENCE IMAGES ===
Processing reference 1...
[REF1] Starting encode...
[REF1] File: C:\path\to\ref1.jpg
[REF1] Exists: true
[REF1] Encoded successfully: 12345 chars
Reference 1 added successfully
```

### 2. 페이로드 순서 확인
```
Payload order check:
  Text at position: 38
  Main image at position: 150
  ✓ Order is CORRECT
```

### 3. 페이로드 구성 확인
`nano-payload-debug.json` 파일을 열어서:
1. `"text":` 로 시작하는지
2. 그 다음에 메인 이미지 데이터가 있는지
3. 그 다음에 참조 이미지 데이터가 있는지

JSON 구조 예시:
```json
{
  "contents": [{
    "role": "user",
    "parts": [
      {"text": "Generate an image: ..."},
      {"inlineData": {"mime_type": "image/jpeg", "data": "메인이미지BASE64"}},
      {"inlineData": {"mime_type": "image/jpeg", "data": "참조1BASE64"}},
      {"inlineData": {"mime_type": "image/jpeg", "data": "참조2BASE64"}}
    ]
  }]
}
```

## 가능한 문제들

### 1. 인코딩 실패
- certutil 명령어가 실제로 실행되지 않음
- 파일 경로에 특수문자나 공백 문제

### 2. 페이로드 누락
- 참조 이미지가 페이로드에 추가되지 않음
- 조건문 문제로 건너뛰어짐

### 3. API 거부
- Gemini API가 참조 이미지를 무시
- 이미지 크기나 형식 문제

## 다음 단계

1. 위의 디버그 파일들을 확인하세요
2. 특히 `nano-api-call-debug.txt`에서 ERROR나 FAILED를 찾아보세요
3. `nano-payload-debug.json`에서 참조 이미지 데이터가 실제로 포함되어 있는지 확인하세요
4. 문제를 발견하면 해당 부분의 로그를 공유해주세요

## 빠른 확인 사항

Windows PowerShell에서 직접 테스트:
```powershell
# 테스트 파일 생성
echo "test" > test.txt

# certutil 테스트
certutil -encode test.txt output.txt

# 결과 확인
type output.txt
```

이 명령이 작동하지 않으면 certutil 자체의 문제일 수 있습니다.