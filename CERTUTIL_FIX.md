# Certutil 명령어 수정 완료

## 🔍 문제 원인
Windows에서 certutil 명령어의 따옴표가 잘못 중첩되어 있었습니다.

## ❌ 이전 (잘못된 코드)
```javascript
// 따옴표가 잘못 중첩됨
var cmd = 'cmd.exe /c "certutil -encode "' + srcPath + '" "' + dstPath + '""';
// 결과: cmd.exe /c "certutil -encode "C:\path\file.txt" "C:\path\output.txt""
//                 ^                    ^             ^   ^              ^^ <- 문제!
```

## ✅ 수정 후 (올바른 코드)
```javascript
// 올바른 따옴표 처리
var cmd = 'cmd.exe /c certutil -encode "' + srcPath + '" "' + dstPath + '"';
// 결과: cmd.exe /c certutil -encode "C:\path\file.txt" "C:\path\output.txt"
//                                    ^                ^  ^                ^  <- 정상!
```

## 📝 수정된 파일
1. **Nano-Banana-Gemini.jsx** (833번 줄)
2. **test-reference-windows.jsx** (124번, 196번 줄)

## ✨ 예상 결과
이제 테스트를 다시 실행하면:
- Base64 인코딩 테스트가 **통과**됩니다
- 참조 파일 인코딩이 **3/3 성공**합니다
- 전체 성공률이 **100%**가 됩니다

## 🚀 다음 단계
1. 수정된 `test-reference-windows.jsx`를 다시 실행해보세요
2. 모든 테스트가 통과하면 실제 플러그인에서 참조 이미지를 테스트해보세요
3. 이제 Windows에서도 참조 이미지가 정상 작동할 것입니다!