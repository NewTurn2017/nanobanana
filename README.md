# 🎨 Nano Banana for Photoshop

[![Auto Release](https://github.com/NewTurn2017/nanobanana/actions/workflows/auto-release.yml/badge.svg)](https://github.com/NewTurn2017/nanobanana/actions/workflows/auto-release.yml)
[![Latest Release](https://img.shields.io/github/v/release/NewTurn2017/nanobanana)](https://github.com/NewTurn2017/nanobanana/releases/latest)

Google Gemini AI를 활용한 Photoshop 이미지 생성 플러그인

## ⚠️ 중요 안내

현재 Gemini 2.5 Flash Image Preview 모델의 이미지 생성 기능에 제한이 있습니다:
- API가 주로 텍스트 응답을 반환
- 이미지 생성이 안정적이지 않음
- Google이 공식적으로 이미지 생성을 완전히 지원할 때까지 대기 필요

## 🔧 대안 솔루션

### 1. Gemini Pro Vision 사용 (이미지 분석 전용)
- 이미지를 분석하고 설명을 생성
- 이미지 편집 제안 제공
- 스타일 분석 및 추천

### 2. 다른 AI 모델 연동
- **Stable Diffusion API**: 안정적인 이미지 생성
- **DALL-E 3**: OpenAI의 이미지 생성 모델
- **Midjourney API**: 고품질 아트워크 생성

### 3. 로컬 AI 모델
- **Stable Diffusion WebUI**: 로컬에서 실행
- **ComfyUI**: 노드 기반 이미지 생성

## 📦 설치 방법

1. **플러그인 복사**
   ```bash
   # macOS
   cp Nano-Banana-Gemini.jsx "/Applications/Adobe Photoshop 2025/Presets/Scripts/"
   
   # Windows
   copy Nano-Banana-Gemini.jsx "C:\Program Files\Adobe\Adobe Photoshop 2025\Presets\Scripts\"
   ```

2. **Photoshop 재시작**

3. **실행**: `File > Scripts > Nano-Banana-Gemini`

## 🔑 API 키 발급

1. [Google AI Studio](https://aistudio.google.com) 접속
2. "Get API key" 클릭
3. API 키 생성 및 복사

## 💡 현재 가능한 기능

### 이미지 분석 및 설명
```javascript
프롬프트: "이 이미지를 분석해줘"
결과: 이미지에 대한 상세한 텍스트 설명
```

### 스타일 제안
```javascript
프롬프트: "이 이미지를 어떻게 개선할 수 있을까?"
결과: 편집 제안 및 스타일 추천
```

## 🚀 향후 계획

1. **Gemini API 업데이트 대기**
   - Google의 공식 이미지 생성 지원 대기
   - 안정적인 이미지 생성 API 출시 예정

2. **멀티 모델 지원**
   - 여러 AI 모델 선택 가능
   - 용도별 최적화된 모델 사용

3. **하이브리드 워크플로우**
   - 분석: Gemini
   - 생성: Stable Diffusion/DALL-E
   - 후처리: Photoshop 자동화

## 🐛 문제 해결

### "이미지를 찾을 수 없습니다" 오류
- 현재 Gemini API가 텍스트만 반환하는 경우가 많음
- 프롬프트를 더 구체적으로 작성
- 다른 AI 모델 사용 고려

### 디버그 파일 위치
- macOS: `/private/var/folders/.../T/`
- Windows: `%TEMP%`
- 파일명: `gemini_response_debug.txt`

## 📚 참고 자료

- [Google AI Studio 문서](https://ai.google.dev/docs)
- [Gemini API 참조](https://ai.google.dev/api/rest)
- [사용자 가이드](./사용자_가이드.md)

## 📞 지원

- 이슈 리포트: GitHub Issues
- 개발자: Genie

## 📝 라이선스

MIT License

---

**참고**: 이 플러그인은 실험적 프로젝트입니다. Gemini API의 이미지 생성 기능이 완전히 지원될 때까지 제한적으로 작동할 수 있습니다.