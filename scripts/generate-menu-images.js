/**
 * 메뉴 이미지 플레이스홀더 생성 스크립트
 * 
 * 실행: node scripts/generate-menu-images.js
 */

const fs = require('fs');
const path = require('path');

const MENUS_DIR = path.join(process.cwd(), 'public', 'menus');

async function generatePlaceholderImages() {
  // public/menus 디렉토리 생성
  if (!fs.existsSync(MENUS_DIR)) {
    fs.mkdirSync(MENUS_DIR, { recursive: true });
    console.log(`✅ Created directory: ${MENUS_DIR}`);
  }

  // 간단한 플레이스홀더: 1x1 픽셀 투명 PNG
  const placeholder = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );

  let generated = 0;
  let skipped = 0;

  // menuDatabase를 JSON 파일에서 읽어오거나 직접 정의
  const menus = [
    // 한식
    { id: 'kimchi-jjigae', name: '김치찌개' },
    { id: 'doenjang-jjigae', name: '된장찌개' },
    { id: 'sundubu-jjigae', name: '순두부찌개' },
    { id: 'budae-jjigae', name: '부대찌개' },
    { id: 'dakdoritang', name: '닭도리탕' },
    { id: 'gamjatang', name: '감자탕' },
    { id: 'ppyeo-haejangguk', name: '뼈해장국' },
    { id: 'haejangguk', name: '해장국' },
    { id: 'galbitang', name: '갈비탕' },
    { id: 'seolleongtang', name: '설렁탕' },
    { id: 'gomtang', name: '곰탕' },
    { id: 'samgyetang', name: '삼계탕' },
    { id: 'gopchang-jeongol', name: '곱창전골' },
    { id: 'sundae-jeongol', name: '순대전골' },
    { id: 'doejigukbap', name: '돼지국밥' },
    { id: 'sundae-gukbap', name: '순대국밥' },
    { id: 'kongnamul-gukbap', name: '콩나물국밥' },
    { id: 'gul-gukbap', name: '굴국밥' },
    { id: 'chueotang', name: '추어탕' },
    { id: 'yukgaejang', name: '육개장' },
    { id: 'jjimdak', name: '찜닭' },
    { id: 'haemul-jjim', name: '해물찜' },
    { id: 'agu-jjim', name: '아구찜' },
    { id: 'dak-hanmari', name: '닭한마리' },
    { id: 'galbi-jjim', name: '갈비찜' },
    { id: 'kalguksu', name: '칼국수' },
    { id: 'haemul-kalguksu', name: '해물칼국수' },
    { id: 'janchi-guksu', name: '잔치국수' },
    { id: 'manduguk', name: '만두국' },
    { id: 'naengmyeon', name: '냉면' },
    { id: 'bibim-naengmyeon', name: '비빔냉면' },
    { id: 'mulhoe', name: '물회' },
    { id: 'milmyeon', name: '밀면' },
    { id: 'samgyeopsal', name: '삼겹살' },
    { id: 'galbi-gui', name: '갈비구이' },
    { id: 'bulgogi', name: '불고기' },
    { id: 'bossam', name: '보쌈' },
    { id: 'jeyuk-bokkeum', name: '제육볶음' },
    { id: 'ojingeo-bokkeum', name: '오징어볶음' },
    { id: 'nakji-bokkeum', name: '낙지볶음' },
    { id: 'dakgalbi', name: '닭갈비' },
    { id: 'galchijorim', name: '갈치조림' },
    { id: 'jangeo-gui', name: '장어구이' },
    { id: 'daegu-tang', name: '대구탕' },
    { id: 'mulmegi-tang', name: '물메기탕' },
    { id: 'bibimbap', name: '비빔밥' },
    { id: 'dolsot-bibimbap', name: '돌솥비빔밥' },
    { id: 'kimchi-bokkeumbap', name: '김치볶음밥' },
    { id: 'jeyuk-deopbap', name: '제육덮밥' },
    { id: 'bulgogi-deopbap', name: '불고기덮밥' },
    { id: 'kkomak-bibimbap', name: '꼬막비빔밥' },
    { id: 'jeonbok-juk', name: '전복죽' },
    { id: 'jangeo-deopbap', name: '장어덮밥' },
    { id: 'ojingeo-deopbap', name: '오징어덮밥' },
    { id: 'yukgaejang-deopbap', name: '육개장덮밥' },
    { id: 'gamja-ongsimi', name: '감자옹심이' },
    { id: 'hwangtae-haejangguk', name: '황태해장국' },
    { id: 'dodari-ssukguk', name: '도다리쑥국' },
    { id: 'maesaengi-guk', name: '매생이국' },
    { id: 'jang-gejang', name: '간장게장' },
    { id: 'yangnyeom-gejang', name: '양념게장' },
    { id: 'gul-jjim', name: '굴찜' },
    { id: 'daege', name: '대게' },
    { id: 'king-crab', name: '킹크랩' },
    { id: 'gogi-guksu', name: '고기국수' },
    { id: 'okdom-gui', name: '옥돔구이' },
    { id: 'seongge-miyeokguk', name: '성게미역국' },
    { id: 'baechu-kimchi-jjigae', name: '배추김치찌개' },
    { id: 'kkotgetang', name: '꽃게탕' },
    { id: 'altang', name: '알탕' },
    // 분식
    { id: 'tteokbokki', name: '떡볶이' },
    { id: 'gimbap', name: '김밥' },
    { id: 'ramyeon', name: '라면' },
    { id: 'sundae', name: '순대' },
    { id: 'twigim', name: '튀김' },
    { id: 'eomuk', name: '어묵' },
    // 치킨
    { id: 'chikin', name: '치킨' },
    // 중식
    { id: 'jjajangmyeon', name: '짜장면' },
    { id: 'ganjjajang', name: '간짜장' },
    { id: 'jjamppong', name: '짬뽕' },
    { id: 'tangsuyuk', name: '탕수육' },
    { id: 'bokkeumbap', name: '볶음밥' },
    { id: 'mapadubu', name: '마파두부' },
    // 일식
    { id: 'chobap', name: '초밥' },
    { id: 'udon', name: '우동' },
    { id: 'ramen', name: '라멘' },
    { id: 'donkaseu', name: '돈까스' },
    { id: 'gyudon', name: '규동' },
    // 양식/패스트푸드
    { id: 'pizza', name: '피자' },
    { id: 'pasta', name: '파스타' },
    { id: 'steak', name: '스테이크' },
    { id: 'salad', name: '샐러드' },
    { id: 'hamburger', name: '햄버거' },
    { id: 'sandwich', name: '샌드위치' },
    // 아시안
    { id: 'ssal-guksu', name: '쌀국수' },
  ];

  for (const menu of menus) {
    const fileName = `${menu.id}.jpg`;
    const filePath = path.join(MENUS_DIR, fileName);

    // 이미 파일이 있으면 스킵
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    fs.writeFileSync(filePath, placeholder);
    generated++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Generated: ${generated} images`);
  console.log(`   ⏭️  Skipped: ${skipped} images (already exist)`);
  console.log(`   📁 Total menus: ${menus.length}`);
  console.log(`\n💡 Note: Placeholder images are 1x1 transparent PNGs.`);
  console.log(`   Replace with actual food photos for production.`);
}

// 실행
generatePlaceholderImages()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
