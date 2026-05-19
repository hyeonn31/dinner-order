/**
 * 오미마리 메뉴만 복구 (전체 시드 없이)
 * 실행: pnpm run db:fix-omimari  (scripts/README.md 참고)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const OMIMARI_MENUS = [
  "신선 김밥 닭강정 세트",
  "참치 김밥 닭강정 세트",
  "크래미 김밥 닭강정 세트",
  "씨앗멸치 김밥 닭강정 세트",
  "스팸 김밥 닭강정 세트",
  "치즈계란 김밥 닭강정 세트",
  "와사마요 불고기 김밥 닭강정 세트",
  "지단 김밥 닭강정 세트",
  "닭강정(소)",
  "저녁식사 안해용",
];

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL 이 없습니다. .env 파일을 확인하세요.");
  process.exit(1);
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  let [rows] = await connection.execute(
    "SELECT id, name FROM restaurants WHERE name = ? LIMIT 1",
    ["오미마리"]
  );

  let restaurantId;

  if (rows.length === 0) {
    const [cats] = await connection.execute(
      "SELECT id FROM restaurant_categories WHERE name = ? LIMIT 1",
      ["한식"]
    );
    if (cats.length === 0) {
      console.error("❌ '한식' 카테고리가 없습니다. seed를 먼저 실행하세요.");
      process.exit(1);
    }
    const categoryId = cats[0].id;
    const [maxSort] = await connection.execute(
      "SELECT COALESCE(MAX(sortOrder), 0) AS m FROM restaurants WHERE categoryId = ?",
      [categoryId]
    );
    const [insert] = await connection.execute(
      "INSERT INTO restaurants (categoryId, name, sortOrder, isActive) VALUES (?, ?, ?, 1)",
      [categoryId, "오미마리", maxSort[0].m + 1]
    );
    restaurantId = insert.insertId;
    console.log(`✓ 오미마리 식당 생성 (id: ${restaurantId})`);
  } else {
    restaurantId = rows[0].id;
    console.log(`오미마리 restaurantId: ${restaurantId}`);
  }

  const [before] = await connection.execute(
    "SELECT id, name FROM menu_items WHERE restaurantId = ? ORDER BY sortOrder",
    [restaurantId]
  );
  console.log("기존 메뉴:", before.length ? before.map((m) => m.name).join(", ") : "(없음)");

  await connection.execute("DELETE FROM menu_items WHERE restaurantId = ?", [restaurantId]);

  for (let i = 0; i < OMIMARI_MENUS.length; i++) {
    await connection.execute(
      "INSERT INTO menu_items (restaurantId, name, itemType, sortOrder) VALUES (?, ?, 'main', ?)",
      [restaurantId, OMIMARI_MENUS[i], i + 1]
    );
  }

  console.log(`✅ 오미마리 메뉴 ${OMIMARI_MENUS.length}개 등록 완료`);
} finally {
  await connection.end();
}
