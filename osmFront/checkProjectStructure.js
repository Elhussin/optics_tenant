const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const appDir = path.join(srcDir, 'app');
const publicDir = path.join(projectRoot, 'public');
const nextConfigPath = path.join(projectRoot, 'next.config.ts');
const packageJsonPath = path.join(projectRoot, 'package.json');
const tsConfigPath = path.join(projectRoot, 'tsconfig.json');

function checkFileExistence(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${description} غير موجود: ${filePath}`);
  } else {
    console.log(`✅ ${description}: ${filePath}`);
  }
}

function checkDirectoryStructure() {
  console.log('🔍 التحقق من بنية المشروع:');

  // التحقق من وجود مجلد src/app
  checkFileExistence(appDir, 'مجلد src/app');

  // التحقق من وجود مجلد public في الجذر
  checkFileExistence(publicDir, 'مجلد public');

  // التحقق من وجود ملفات التكوين في الجذر
  checkFileExistence(nextConfigPath, 'ملف next.config.ts');
  checkFileExistence(packageJsonPath, 'ملف package.json');
  checkFileExistence(tsConfigPath, 'ملف tsconfig.json');

  // التحقق من وجود ملف page.tsx في src/app
  const pageFilePath = path.join(appDir, '[locale]/page.tsx');
  checkFileExistence(pageFilePath, 'ملف src/app/[locale]/page.tsx');
}

checkDirectoryStructure();
