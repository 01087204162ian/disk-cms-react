#!/bin/bash
# nvm 설정을 .zshrc에 추가하는 스크립트

echo "nvm 설정을 .zshrc에 추가합니다..."

# .zshrc 파일이 없으면 생성
if [ ! -f ~/.zshrc ]; then
    touch ~/.zshrc
    echo ".zshrc 파일을 생성했습니다."
fi

# nvm 설정이 이미 있는지 확인
if grep -q "NVM_DIR" ~/.zshrc; then
    echo "nvm 설정이 이미 .zshrc에 있습니다."
else
    # nvm 설정 추가
    cat >> ~/.zshrc << 'EOF'

# nvm 설정
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    echo "nvm 설정을 .zshrc에 추가했습니다."
fi

echo ""
echo "다음 단계:"
echo "1. 터미널을 재시작하거나 다음 명령어를 실행하세요:"
echo "   source ~/.zshrc"
echo ""
echo "2. 그 다음 다음 명령어를 실행하세요:"
echo "   nvm install 18"
echo "   nvm use 18"
echo "   cd disk-cms-react-v2"
echo "   npm install"
echo "   npm run dev"
