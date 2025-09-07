# Contributing Guidelines

## 커밋 메시지 규칙

자동 릴리스 노트 생성을 위해 다음 규칙을 따라주세요:

### 커밋 타입

- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `improve:` - 기능 개선
- `perf:` - 성능 개선
- `docs:` - 문서 수정
- `style:` - 코드 스타일 변경 (기능 변경 없음)
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 추가/수정
- `chore:` - 빌드 과정 또는 보조 도구 변경

### 예시

```
feat: Add native Photoshop color picker support
fix: Resolve color picker blank screen issue
improve: Enhance update check functionality
perf: Optimize image processing performance
```

## 버전 관리

1. `Nano-Banana-Gemini.jsx` 파일의 `PLUGIN_VERSION` 변수를 수정합니다
2. 의미있는 커밋 메시지와 함께 커밋합니다
3. `git push`를 실행하면 자동으로 릴리스가 생성됩니다

### 버전 번호 규칙 (Semantic Versioning)

- **Major (X.0.0)**: 호환되지 않는 API 변경
- **Minor (0.X.0)**: 하위 호환되는 기능 추가
- **Patch (0.0.X)**: 하위 호환되는 버그 수정

예: `2.2.0` → `2.3.0` (새 기능), `2.2.0` → `2.2.1` (버그 수정)