#!/usr/bin/env node

/**
 * 문서 파일 자동 복사 스크립트
 * docs/pharmacy/README.md → public/docs/pharmacy/README.md
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../docs/pharmacy/README.md');
const targetDir = path.join(__dirname, '../public/docs/pharmacy');
const targetFile = path.join(targetDir, 'README.md');

try {
  // 소스 파일 존재 확인
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ 소스 파일을 찾을 수 없습니다: ${sourceFile}`);
    process.exit(1);
  }

  // 대상 디렉토리 생성 (없는 경우)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✅ 디렉토리 생성: ${targetDir}`);
  }

  // 파일 복사
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ 문서 파일 복사 완료:`);
  console.log(`   소스: ${sourceFile}`);
  console.log(`   대상: ${targetFile}`);

  // 파일 크기 확인
  const stats = fs.statSync(targetFile);
  console.log(`   크기: ${(stats.size / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ 문서 복사 중 오류 발생:', error.message);
  process.exit(1);
}
