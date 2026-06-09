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
      // 2. [신규 추가] fonts/ 폴더 내부의 a큐티허니 ttf/woff 폰트를 빌드 자원으로 강제 맵핑
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          // 빌드가 끝나도 루트 밑의 fonts/ 폴더 명칭과 파일명을 그대로 강제 유지 복사합니다.
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
