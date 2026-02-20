/**
 * 메뉴 이미지 플레이스홀더 생성 스크립트
 * 
 * 실행: npx ts-node scripts/generate-menu-images.ts
 * 
 * 각 메뉴 ID에 대해 /public/menus/{id}.jpg 플레이스홀더 생성
 */

import { menuDatabase } from '../lib/menuDatabase';
import * as fs from 'fs';
import * as path from 'path';

// Canvas를 사용하여 실제 이미지 생성 (Node.js 환경)
// 간단한 플레이스홀더만 필요하면 1x1 픽셀 이미지로도 가능

const MENUS_DIR = path.join(process.cwd(), 'public', 'menus');

// 카테고리별 색상
const CATEGORY_COLORS: Record<string, string> = {
  '한식': '#FF6B6B',
  '중식': '#FFA500',
  '일식': '#FFD700',
  '분식': '#FF69B4',
  '치킨': '#FFE4B5',
  '양식': '#87CEEB',
  '패스트푸드': '#FFA07A',
  '아시안': '#98D8C8',
};

function createPlaceholderSVG(menuName: string, category: string): string {
  const color = CATEGORY_COLORS[category] || '#CCCCCC';
  
  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${color}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="48" 
    font-weight="bold"
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >${menuName}</text>
  <text 
    x="50%" 
    y="60%" 
    font-family="Arial, sans-serif" 
    font-size="24" 
    fill="rgba(255,255,255,0.8)" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >${category}</text>
</svg>`;
}

async function generatePlaceholderImages() {
  // public/menus 디렉토리 생성
  if (!fs.existsSync(MENUS_DIR)) {
    fs.mkdirSync(MENUS_DIR, { recursive: true });
    console.log(`✅ Created directory: ${MENUS_DIR}`);
  }

  let generated = 0;
  let skipped = 0;

  for (const menu of menuDatabase) {
    const fileName = `${menu.id}.jpg`;
    const filePath = path.join(MENUS_DIR, fileName);

    // 이미 파일이 있으면 스킵
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    // SVG 플레이스홀더 생성
    const svg = createPlaceholderSVG(menu.name, menu.category);
    
    // SVG를 파일로 저장 (실제로는 .svg지만 .jpg로 저장하여 Next.js Image 컴포넌트에서 사용 가능)
    // 프로덕션에서는 sharp 등을 사용하여 실제 JPG로 변환 가능
    
    // 간단한 플레이스홀더: 1x1 픽셀 투명 이미지
    // Base64 encoded 1x1 transparent PNG
    const placeholder = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    fs.writeFileSync(filePath, placeholder);
    generated++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${generated} images`);
  console.log(`   ⏭️  Skipped: ${skipped} images (already exist)`);
  console.log(`   📁 Total menus: ${menuDatabase.length}`);
  console.log(`\n💡 Note: Placeholder images are 1x1 transparent PNGs.`);
  console.log(`   Replace with actual food photos for production.`);
}

// 실행
if (require.main === module) {
  generatePlaceholderImages()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Error:', err);
      process.exit(1);
    });
}

export { generatePlaceholderImages };
