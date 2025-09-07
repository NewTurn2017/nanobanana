@echo off
chcp 65001 >nul
echo.
echo 🎨 Nano Banana for Photoshop 설치 시작...
echo.

:: Photoshop 버전 선택
echo Photoshop 버전을 선택하세요:
echo 1) Photoshop 2025
echo 2) Photoshop 2024
echo 3) Photoshop 2023
echo 4) 기타 (직접 입력)
set /p version_choice="선택 (1-4): "

if "%version_choice%"=="1" (
    set PS_VERSION=2025
) else if "%version_choice%"=="2" (
    set PS_VERSION=2024
) else if "%version_choice%"=="3" (
    set PS_VERSION=2023
) else if "%version_choice%"=="4" (
    set /p PS_VERSION="Photoshop 버전 입력 (예: 2022): "
) else (
    echo ❌ 잘못된 선택입니다.
    pause
    exit /b 1
)

:: 사용자 Scripts 폴더 경로
set USER_SCRIPTS_DIR=%APPDATA%\Adobe\Adobe Photoshop %PS_VERSION%\Presets\Scripts

:: 폴더 생성
echo 📁 Scripts 폴더 생성 중...
if not exist "%USER_SCRIPTS_DIR%" mkdir "%USER_SCRIPTS_DIR%"

:: 파일 복사
echo 📋 파일 복사 중...
copy /Y "Nano-Banana-Gemini.jsx" "%USER_SCRIPTS_DIR%\" >nul
copy /Y "preset.js" "%USER_SCRIPTS_DIR%\" >nul

:: 설치 확인
if exist "%USER_SCRIPTS_DIR%\Nano-Banana-Gemini.jsx" (
    echo.
    echo ✅ 설치 완료!
    echo.
    echo 📍 설치 위치:
    echo    %USER_SCRIPTS_DIR%
    echo.
    echo 🚀 사용 방법:
    echo    1. Photoshop을 재시작하세요
    echo    2. File - Scripts - Nano-Banana-Gemini 메뉴를 선택하세요
    echo.
    echo 💡 팁: 권한 문제 없이 사용자 폴더에 설치되었습니다!
) else (
    echo.
    echo ❌ 설치 실패
    echo    수동으로 파일을 복사해주세요.
)

echo.
pause