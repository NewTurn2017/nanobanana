#!/bin/bash

# Nano Banana 설치 스크립트 (macOS)
# 사용자 Scripts 폴더에 설치하여 권한 문제를 피합니다

echo "🎨 Nano Banana for Photoshop 설치 시작..."
echo ""

# Photoshop 버전 선택
echo "Photoshop 버전을 선택하세요:"
echo "1) Photoshop 2025"
echo "2) Photoshop 2024"
echo "3) Photoshop 2023"
echo "4) 기타 (직접 입력)"
read -p "선택 (1-4): " version_choice

case $version_choice in
    1)
        PS_VERSION="2025"
        ;;
    2)
        PS_VERSION="2024"
        ;;
    3)
        PS_VERSION="2023"
        ;;
    4)
        read -p "Photoshop 버전 입력 (예: 2022): " PS_VERSION
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

# 사용자 Scripts 폴더 경로
USER_SCRIPTS_DIR="$HOME/Library/Application Support/Adobe/Adobe Photoshop $PS_VERSION/Presets/Scripts"

# 폴더 생성
echo "📁 Scripts 폴더 생성 중..."
mkdir -p "$USER_SCRIPTS_DIR"

# 파일 복사
echo "📋 파일 복사 중..."
cp "Nano-Banana-Gemini.jsx" "$USER_SCRIPTS_DIR/"
cp "preset.js" "$USER_SCRIPTS_DIR/"

# 설치 확인
if [ -f "$USER_SCRIPTS_DIR/Nano-Banana-Gemini.jsx" ]; then
    echo ""
    echo "✅ 설치 완료!"
    echo ""
    echo "📍 설치 위치:"
    echo "   $USER_SCRIPTS_DIR"
    echo ""
    echo "🚀 사용 방법:"
    echo "   1. Photoshop을 재시작하세요"
    echo "   2. File > Scripts > Nano-Banana-Gemini 메뉴를 선택하세요"
    echo ""
    echo "💡 팁: 권한 문제 없이 사용자 폴더에 설치되었습니다!"
else
    echo ""
    echo "❌ 설치 실패"
    echo "   수동으로 파일을 복사해주세요."
fi