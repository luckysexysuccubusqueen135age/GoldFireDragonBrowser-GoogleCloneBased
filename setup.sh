#!/bin/bash

# FireDragon + InvisiProxy 통합 설치 스크립트
# Setup script for FireDragon Browser with InvisiProxy integration

echo "🔥 FireDragon Browser + InvisiProxy 통합 설치 시작..."
echo "=================================================="

# 1. 노드 버전 확인
echo "📦 Node.js 버전 확인..."
node --version
npm --version

# 2. InvisiProxy 클론
echo ""
echo "📥 InvisiProxy 저장소 클론 중..."
if [ ! -d "invisiproxy" ]; then
  git clone https://github.com/QuiteAFancyEmerald/InvisiProxy.git invisiproxy
  echo "✅ InvisiProxy 클론 완료!"
else
  echo "⚠️ InvisiProxy 디렉토리가 이미 존재합니다."
fi

# 3. InvisiProxy 의존성 설치
echo ""
echo "📦 InvisiProxy 의존성 설치 중..."
cd invisiproxy
npm install
echo "✅ InvisiProxy 의존성 설치 완료!"

# 4. InvisiProxy 빌드
echo ""
echo "🏗️ InvisiProxy 빌드 중..."
npm run build
echo "✅ InvisiProxy 빌드 완료!"

# 5. 통합 설정 파일 생성
cd ..
echo ""
echo "⚙️ 통합 설정 파일 생성 중..."

# server-integrated.js 생성
cat > invisiproxy/server-integrated.js << 'EOF'
/**
 * FireDragon + InvisiProxy 통합 서버
 * Integrated server for FireDragon Browser with InvisiProxy
 */

const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');

const app = Fastify({
  logger: true,
  bodyLimit: 1048576 * 50,
});

// 정적 파일 제공 (GoogleClone HTML)
app.register(fastifyStatic, {
  root: path.join(__dirname, '..'),
  prefix: '/',
});

// InvisiProxy 서버 임포트
(async () => {
  await import('./src/server.mjs');
})();

// 포트 3000에서 시작
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🔥 FireDragon + InvisiProxy 서버 실행 중: http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
EOF

echo "✅ 통합 설정 완료!"

# 6. package.json 업데이트
echo ""
echo "📝 package.json 업데이트..."

# 새로운 스크립트 추가
cat > integrated-package.json << 'EOF'
{
  "name": "firedragon-invisiproxy",
  "version": "1.0.0",
  "description": "FireDragon Browser integrated with InvisiProxy",
  "main": "invisiproxy/backend.js",
  "scripts": {
    "start": "cd invisiproxy && npm start",
    "dev": "cd invisiproxy && npm run manual-start",
    "build": "cd invisiproxy && npm run build",
    "install-all": "npm install && cd invisiproxy && npm install",
    "integrated": "node invisiproxy/server-integrated.js",
    "proxy": "cd invisiproxy && npm start",
    "stop": "cd invisiproxy && npm run stop",
    "fresh-start": "cd invisiproxy && npm run fresh-start"
  },
  "keywords": [
    "firedragon",
    "browser",
    "proxy",
    "invisiproxy"
  ],
  "author": "FireDragon Team",
  "license": "MIT"
}
EOF

echo "✅ 패키지 설정 완료!"

echo ""
echo "=================================================="
echo "✅ 설치 완료!"
echo ""
echo "🚀 시작 방법:"
echo "  npm start         - InvisiProxy 시작"
echo "  npm run integrated - 통합 서버 시작"
echo ""
echo "📂 디렉토리 구조:"
echo "  /index.html          - FireDragon HTML 인터페이스"
echo "  /invisiproxy/        - InvisiProxy 백엔드"
echo "=================================================="
