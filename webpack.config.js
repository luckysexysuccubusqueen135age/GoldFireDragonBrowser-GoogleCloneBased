const path = require('path'); 

module.exports = { 
  entry: './src/app.ts', 
  mode: 'production', 
  target: 'web', 
  module: { 
    rules: [
      // 1. 기존 TypeScript 컴파일러 규칙
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader', 
        exclude: /node_modules/ 
      },
      // 2. [완벽 결합 패치] CSS 규칙 파싱 및 HTML 헤더 강제 인젝션 처리
      // 폰트가 선언된 gamefont.css를 해석하여 웹 전체에 뿌려주도록 변환합니다.
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // 3. [완벽 결합 패치] fonts/ 폴더 내부의 a큐티허니 리소스 파일 강제 하이재킹 복사 규칙
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          // 빌드가 종료되어도 배포 공간 루트 밑의 fonts/ 폴더 형태와 원본 파일명을 그대로 고정합니다.
          filename: 'fonts/[name][ext]' 
        }
      }
    ] 
  }, 
  resolve: { extensions: ['.ts', '.js'] }, 
  output: { 
    filename: 'bundle.js', 
    path: path.resolve(__dirname, './') 
  } 
};
