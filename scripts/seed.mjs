import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// ─── 카테고리 ───────────────────────────────────────────────
const categories = [
  { id: 1, name: "한식", sortOrder: 1 },
  { id: 2, name: "양식", sortOrder: 2 },
  { id: 3, name: "샐러드", sortOrder: 3 },
  { id: 4, name: "햄버거", sortOrder: 4 },
  { id: 5, name: "일식", sortOrder: 5 },
];

// ─── 식당 ───────────────────────────────────────────────────
const restaurants = [
  // 한식
  { id: 1, categoryId: 1, name: "본도시락", sortOrder: 1 },
  { id: 2, categoryId: 1, name: "본 비빔밥(본죽&비빔밥)", sortOrder: 2 },
  { id: 3, categoryId: 1, name: "정우의 도시락", sortOrder: 3 },
  { id: 4, categoryId: 1, name: "오미마리", sortOrder: 4 },
  { id: 5, categoryId: 1, name: "강남돈부리", sortOrder: 5 },
  { id: 6, categoryId: 1, name: "극강은마", sortOrder: 6 },
  { id: 7, categoryId: 1, name: "오토김밥(역삼점)", sortOrder: 7 },
  { id: 8, categoryId: 1, name: "이게볶음밥(강남점)", sortOrder: 8 },
  // 양식
  { id: 9, categoryId: 2, name: "버텍스", sortOrder: 1 },
  { id: 10, categoryId: 2, name: "타이반쩜", sortOrder: 2 },
  { id: 11, categoryId: 2, name: "미태리 파스타", sortOrder: 3 },
  { id: 12, categoryId: 2, name: "이삭토스트", sortOrder: 4 },
  { id: 13, categoryId: 2, name: "피자먹다 은마대치점", sortOrder: 5 },
  { id: 14, categoryId: 2, name: "파스타에 꼬치다", sortOrder: 6 },
  // 샐러드
  { id: 15, categoryId: 3, name: "샐러디", sortOrder: 1 },
  { id: 16, categoryId: 3, name: "포케올데이", sortOrder: 2 },
  { id: 17, categoryId: 3, name: "프로티너", sortOrder: 3 },
  // 햄버거
  { id: 18, categoryId: 4, name: "맘스터치", sortOrder: 1 },
  { id: 19, categoryId: 4, name: "롯데리아", sortOrder: 2 },
];

// ─── 메뉴 ───────────────────────────────────────────────────
const menuItems = [
  // 본도시락 (1)
  ...["본격도시락(카츠, 전)", "본격도시락(스팸두부조림)", "바싹불고기 반상", "숯불닭구이 반상", "깻잎제육 반상", "버섯소불고기 반상", "꽈리닭구이 반상", "궁중떡갈비 반상", "스크램블드 에그 치킨마요", "스크램블드 에그 치킨마요(곱배기)", "울릉도 나물 버섯영양밥", ].map((n, i) => ({ restaurantId: 1, name: n, itemType: "main", sortOrder: i + 1 })),

  // 본 비빔밥(본죽&비빔밥) (2)
  ...["6가지 나물 비빔밥", "제육볶음 나물 비빔밥", "소불고기 나물 비빔밥", "낙지 김치 비빔밥", "참치야채 비빔밥", "삼계죽", "쇠고기야채죽", "참치야채죽", "7가지 야채죽"].map((n, i) => ({ restaurantId: 2, name: n, itemType: "main", sortOrder: i + 1 })),

  // 정우의 도시락 (3)
  ...["갈비 도시락", "간장불고기 도시락", "우삼겹 도시락", "삼겹 도시락", "제육 도시락", "스팸 도시락"].map((n, i) => ({ restaurantId: 3, name: n, itemType: "main", sortOrder: i + 1 })),

  // 오미마리 (4)
  ...["신선 김밥 닭강정 세트", "참치 김밥 닭강정 세트", "크래미 김밥 닭강정 세트", "씨앗멸치 김밥 닭강정 세트", "스팸 김밥 닭강정 세트", "치즈계란 김밥 닭강정 세트", "와사마요 불고기 김밥 닭강정 세트", "지단 김밥 닭강정 세트", "닭강정(소)", "저녁식사 안해용"].map((n, i) => ({ restaurantId: 4, name: n, itemType: "main", sortOrder: i + 1 })),

  // 강남돈부리 (5)
  ...["가츠동", "볶음 김치가츠동 (김치돈까스덮밥)", "에비가츠동 (돈까스+왕새우)", "오야꼬동 (가라아게+계란덮밥)", "직화 매콤규동 (우삼겹 덮밥)", "매콤 돈카츠마요 오믈렛 덮밥", "매콤 치킨마요 오믈렛덮밥", "데미함박 오믈렛덮밥(경양식)"].map((n, i) => ({ restaurantId: 5, name: n, itemType: "main", sortOrder: i + 1 })),

  // 극강은마 (6)
  ...["세세리동 (닭목살 덮밥)", "규동 (소고기덮밥)", "부타동 (돼지고기 덮밥)", "가라아게동 (튀김덮밥)"].map((n, i) => ({ restaurantId: 6, name: n, itemType: "main", sortOrder: i + 1 })),

  // 오토김밥(역삼점) (7)
  ...["오토김밥(약간 매콤) + 닭강정", "스팸김밥 + 닭강정", "고추냉이김밥 + 닭강정", "오토닭강정 (청양고추 토핑)", "오토닭강정 (청양고추 토핑 빼기)"].map((n, i) => ({ restaurantId: 7, name: n, itemType: "main", sortOrder: i + 1 })),

  // 이게볶음밥(강남점) (8)
  ...["삼겹김치 볶음밥", "리얼스팸김치 볶음밥", "철판닭갈비 볶음밥", "참치김치 볶음밥", "돼지불판 볶음밥", "햄야채볶음밥", "이게 제육덮밥 이지"].map((n, i) => ({ restaurantId: 8, name: n, itemType: "main", sortOrder: i + 1 })),

  // 버텍스 (9)
  ...["미국식 닭고기 덮밥 S", "미국식 닭고기 덮밥 M", "미국식 닭고기 덮밥 L", "미국식 새우 닭고기 덮밥 S", "미국식 새우 닭고기 덮밥 M"].map((n, i) => ({ restaurantId: 9, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["데리야끼", "페퍼", "염염", "치폴레"].map((n, i) => ({ restaurantId: 9, name: n, itemType: "option", sortOrder: i + 1 })),

  // 타이반쩜 (10)
  ...["팟타이 (태국 대표 볶음면)", "미고랭", "타이칠리 (매움 1단계 / 신라면 UP)", "타이칠리 (매움 2단계 / 불닭 UP)", "팟씨유 (태국 간장 볶음면)", "칠리프라이드 (매운 볶음밥)", "카오팟 (파인애플 볶음밥)", "붓카케 냉우동정식 (냉우동+덴뿌라+유부초밥2p)", "텐붓카케 냉우동정식(냉우동+새우튀김+단호박+텐뿌라)", "에비덴뿌라 온우동정식(온우동+새우튀김+단호박+텐뿌라)", "토리텐 온우동정식(온우동+치킨가라아게+텐뿌라)", "돈등심카츠", "킹새우카츠", "모듬카츠", "규동", "가라아게동", "에비동"].map((n, i) => ({ restaurantId: 10, name: n, itemType: "main", sortOrder: i + 1 })),

  // 미태리 파스타 (11)
  ...["미태리 치즈피자", "미태리 고르곤졸라 피자", "미태리 페퍼로니 피자", "베이컨 토마토 파스타", "베이컨 크림 파스타", "해물 짬뽕 파스타", "로제 크림 파스타", "매운 크림 파스타", "양송이 크림 파스타", "감바스 파스타", "토마토 치즈 리조또", "크림 치즈 리조또", "알리오올리오", "봉골레 파스타"].map((n, i) => ({ restaurantId: 11, name: n, itemType: "main", sortOrder: i + 1 })),

  // 이삭토스트 (12)
  ...["감자스폐셜", "감자스폐셜 x2", "햄스페셜", "햄스페셜 x2", "베이컨 베스트", "그릴드 불갈비", "그릴드 불갈비 x2", "베이컨 포테이토 피자 x2", "딥치즈 베이컨 포테이토", "딥치즈 베이컨 포테이토 x2"].map((n, i) => ({ restaurantId: 12, name: n, itemType: "main", sortOrder: i + 1 })),

  // 피자먹다 은마대치점 (13)
  ...["마르게리따 피자 1인 세트(감튀)", "달콤연유 피자 1인 세트(감튀)", "스위트고구마 피자 1인 세트(감튀)", "콤비네이션 피자 1인 세트(감튀)", "페퍼로니 피자 1인 세트(감튀)", "하와이언 피자 1인 세트(감튀)", "바질토마토 피자 1인 세트(감튀)", "마르게리따 피자&파스타 세트", "달콤연유 피자&파스타 세트", "스위트고구마 피자&파스타 세트"].map((n, i) => ({ restaurantId: 13, name: n, itemType: "main", sortOrder: i + 1 })),

  // 파스타에 꼬치다 (14)
  ...["베이컨쪽파오일파스타 + 닭꼬치 1P", "베이컨크림파스타 + 닭꼬치 1P", "매콤크림파스타 + 닭꼬치 1P", "토마토파스타 + 닭꼬치 1P", "나폴리탄파스타 + 닭꼬치 1P", "매콤크림리조또 + 닭꼬치 1P"].map((n, i) => ({ restaurantId: 14, name: n, itemType: "main", sortOrder: i + 1 })),

  // 샐러디 (15)
  ...["로스트 닭다리살 샐러드", "우삼겹 메밀면 누들볼", "노릇두부 단호박 샐러드", "탄단지 샐러드", "그라브락스 연어 샐러드", "칠리베이컨 포케볼", "바베큐닭다리살 포케볼", "로스트삼겹 포케볼"].map((n, i) => ({ restaurantId: 15, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["(기본) 선택한 메뉴 기본볼", "샐러드 채소볼->포케볼로 변경", "포케 곡물볼 -> 채소볼로 변경"].map((n, i) => ({ restaurantId: 15, name: n, itemType: "option", sortOrder: i + 1 })),
  ...["추천드레싱(기본)", "시저", "오리엔탈", "크리미칠리", "발사믹", "크리미할라피뇨", "타바스코오리엔탈", "고추장비빔"].map((n, i) => ({ restaurantId: 15, name: n, itemType: "side", sortOrder: i + 1 })),

  // 포케올데이 (16)
  ...["곡물밥 포케", "메밀면 포케", "야채만 포케"].map((n, i) => ({ restaurantId: 16, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["훈제오리", "육회", "불고기", "닭가슴살", "참치"].map((n, i) => ({ restaurantId: 16, name: n, itemType: "side", sortOrder: i + 1 })),
  ...["스리라차", "참깨간장", "와사비간장", "유자간장", "쌈장", "비건스리라차", "비건크리미어니언", "비건참깨"].map((n, i) => ({ restaurantId: 16, name: n, itemType: "option", sortOrder: i + 1 })),

  // 프로티너 (17)
  ...["닭가슴살 샐러드박스 S", "닭가슴살 샐러드박스 M", "돼지안심 샐러드박스 S", "돼지안심 샐러드박스 M", "폴드포크 샐러드박스 S", "폴드포크 샐러드박스 M", "소부채살 샐러드박스 S", "연어스테이크 샐러드박스 S"].map((n, i) => ({ restaurantId: 17, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["토마토살사", "레몬", "치미추리", "스파이시오리엔탈", "선택안함"].map((n, i) => ({ restaurantId: 17, name: n, itemType: "side", sortOrder: i + 1 })),

  // 맘스터치 (18)
  ...["싸이버거 세트", "싸이버거", "불싸이버거 세트", "불싸이버거", "싸이오리지널버거 세트", "싸이오리지널버거", "싸이클래식버거 세트", "싸이클래식버거", "모짜렐라 인더 버거 베이컨 세트", "모짜렐라 인더 버거 베이컨", "리아 새우 세트", "리아 새우", "한우 불고기버거 세트", "한우 불고기버거"].map((n, i) => ({ restaurantId: 18, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["치즈스틱(2ea)으로 변경", "지파이로 변경", "어니언링으로 변경", "콘샐러드로 변경"].map((n, i) => ({ restaurantId: 18, name: n, itemType: "side", sortOrder: i + 1 })),
  ...["콜라", "제로콜라", "사이다", "사이다제로", "펩시제로", "오렌지주스"].map((n, i) => ({ restaurantId: 18, name: n, itemType: "drink", sortOrder: i + 1 })),

  // 롯데리아 (19)
  ...["에그불고기버거 세트", "에그불고기버거", "리아 불고기버거 세트", "리아 불고기버거", "새우버거 세트", "새우버거", "모짜렐라인더버거 세트", "모짜렐라인더버거"].map((n, i) => ({ restaurantId: 19, name: n, itemType: "main", sortOrder: i + 1 })),
  ...["치즈스틱(2ea)으로 변경", "어니언링으로 변경", "콘샐러드로 변경"].map((n, i) => ({ restaurantId: 19, name: n, itemType: "side", sortOrder: i + 1 })),
  ...["콜라", "제로콜라", "사이다", "사이다제로", "펩시제로"].map((n, i) => ({ restaurantId: 19, name: n, itemType: "drink", sortOrder: i + 1 })),
];

// ─── 직원 목록 ────────────────────────────────────────────────
const employees = [
  "Neo","Noah","Zelda","Lian","Lina","Miso","Heather","Zoey","Neiver","Summer",
  "Dan","Brown","Been","Key","Joker","Snow","Tatoo","Steven","Toby","Ted",
  "Nelly","Happy","Chad","Red","iru","Haru","Rune","Ash","Tavy","Luke",
  "Felix","Cathy","Chloe","Lux","Tommy","Ross","Sophia","Ori","Anakin","Darren",
  "Thomas","Ember","Liz","Sam","James","Lutie","Roa","Tony","Teo","Mika",
  "Leon","Mason","Lumi","Wayne","Ruell","Hoon","Pony","Evan","Kobe","Ray",
  "Hicks","Isaac","Ryoo","Ben","Hank","Campbell","Arc","Eisen","Mark","Vivian",
  "Pabian","Kai","Brian","Howl","Luiz","Winter","Loey","Opal","Herta","Zain",
  "Beck","Kirk","Andy","Bourbon","Hia","Oliver","Doyle","Owen","Zen","Arthur",
  "Sean","Cony","Holmes","Dani","Dylon","Flash",
];

// ─── INSERT ───────────────────────────────────────────────────
console.log("🌱 Seeding database...");

// Categories
for (const cat of categories) {
  await connection.execute(
    "INSERT IGNORE INTO restaurant_categories (id, name, sortOrder) VALUES (?, ?, ?)",
    [cat.id, cat.name, cat.sortOrder]
  );
}
console.log(`✅ ${categories.length} categories inserted`);

// Restaurants
for (const r of restaurants) {
  await connection.execute(
    "INSERT IGNORE INTO restaurants (id, categoryId, name, sortOrder) VALUES (?, ?, ?, ?)",
    [r.id, r.categoryId, r.name, r.sortOrder]
  );
}
console.log(`✅ ${restaurants.length} restaurants inserted`);

// Menu items
let menuCount = 0;
for (const m of menuItems) {
  await connection.execute(
    "INSERT INTO menu_items (restaurantId, name, itemType, sortOrder) VALUES (?, ?, ?, ?)",
    [m.restaurantId, m.name, m.itemType, m.sortOrder]
  );
  menuCount++;
}
console.log(`✅ ${menuCount} menu items inserted`);

// Employees
for (let i = 0; i < employees.length; i++) {
  await connection.execute(
    "INSERT IGNORE INTO employees (nickname, sortOrder) VALUES (?, ?)",
    [employees[i], i + 1]
  );
}
console.log(`✅ ${employees.length} employees inserted`);

await connection.end();
console.log("🎉 Seed complete!");
