import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // 기존 데이터 삭제
  await connection.execute('DELETE FROM orders');
  await connection.execute('DELETE FROM menu_items');
  await connection.execute('DELETE FROM restaurants');
  await connection.execute('DELETE FROM restaurant_categories');
  await connection.execute('DELETE FROM daily_settings');
  
  console.log('기존 데이터 삭제 완료');

  // 카테고리 추가
  const categories = ['한식', '양식', '샐러드', '햄버거', '일식'];
  const categoryMap = {};
  
  for (let i = 0; i < categories.length; i++) {
    const [result] = await connection.execute(
      'INSERT INTO restaurant_categories (name, sortOrder) VALUES (?, ?)',
      [categories[i], i]
    );
    categoryMap[categories[i]] = result.insertId;
  }
  
  console.log('카테고리 추가 완료:', categoryMap);

  // 새로운 식당 및 메뉴 데이터
  const restaurantMenus = [
    {
      category: '한식',
      restaurants: [
        {
          name: '본도시락',
          menus: [
            { name: '본도시락', type: 'main' },
            { name: '본격도시락(스팸두부조림)', type: 'main' },
            { name: '바싹불고기 반상', type: 'main' },
            { name: '숯불닭구이 반상', type: 'main' },
            { name: '깻잎제육 반상', type: 'main' },
            { name: '버섯소불고기 반상', type: 'main' },
            { name: '꽈리닭구이 반상', type: 'main' },
            { name: '궁중떡갈비 반상', type: 'main' },
            { name: '스크램블드 에그 치킨마요', type: 'main' },
            { name: '스크램블드 에그 치킨마요(곱배기)', type: 'main' },
            { name: '울릉도 나물 버섯영양밥', type: 'main' }
          ]
        },
        {
          name: '본 비빔밥(본죽&비빔밥)',
          menus: [
            { name: '본 비빔밥', type: 'main' },
            { name: '6가지 나물 비빔밥', type: 'main' },
            { name: '제육볶음 나물 비빔밥', type: 'main' },
            { name: '소불고기 나물 비빔밥', type: 'main' },
            { name: '낙지 김치 비빔밥', type: 'main' },
            { name: '참치야채 비빔밥', type: 'main' },
            { name: '삼계죽', type: 'main' },
            { name: '쇠고기야채죽', type: 'main' },
            { name: '참치야채죽', type: 'main' },
            { name: '7가지 야채죽', type: 'main' }
          ]
        },
        {
          name: '정우의 도시락',
          menus: [
            { name: '정우의 도시락', type: 'main' },
            { name: '갈비도시락', type: 'main' },
            { name: '간장불고기 도시락', type: 'main' },
            { name: '우삼겹 도시락', type: 'main' },
            { name: '삼겹 도시락', type: 'main' },
            { name: '제육 도시락', type: 'main' },
            { name: '스팸 도시락', type: 'main' }
          ]
        }
      ]
    },
    {
      category: '양식',
      restaurants: [
        {
          name: '버텍스',
          menus: [
            { name: '미국식 닭고기 덮밥 S', type: 'main' },
            { name: '미국식 닭고기 덮밥 M', type: 'main' },
            { name: '미국식 닭고기 덮밥 L', type: 'main' },
            { name: '미국식 새우 닭고기 덮밥 S', type: 'main' },
            { name: '미국식 새우 닭고기 덮밥 M', type: 'main' },
            { name: '버텍스 소스 (필수)', type: 'option' },
            { name: '데리야끼', type: 'option' },
            { name: '페퍼', type: 'option' },
            { name: '염염', type: 'option' },
            { name: '치폴레', type: 'option' }
          ]
        },
        {
          name: '타이반쩜',
          menus: [
            { name: '팟타이 (태국 대표 볶음면)', type: 'main' },
            { name: '미고랭', type: 'main' },
            { name: '타이칠리 (매움 1단계 / 신라면 UP)', type: 'main' },
            { name: '타이칠리 (매움 2단계 / 불닭 UP)', type: 'main' },
            { name: '팟씨유 (태국 간장 볶음면)', type: 'main' },
            { name: '나시고랭', type: 'main' },
            { name: '칠리프라이드 (매운 볶음밥)', type: 'main' },
            { name: '카오팟 (파인애플 볶음밥)', type: 'main' }
          ]
        },
        {
          name: '미태리 파스타',
          menus: [
            { name: '미태리 치즈피자', type: 'main' },
            { name: '미태리 고르곤졸라 피자', type: 'main' },
            { name: '미태리 페퍼로니 피자', type: 'main' },
            { name: '베이컨 토마토 파스타', type: 'main' },
            { name: '베이컨 크림 파스타', type: 'main' },
            { name: '해물 토마토 파스타', type: 'main' },
            { name: '해물 짬뽕 파스타', type: 'main' },
            { name: '로제 크림 파스타', type: 'main' },
            { name: '이태리 전통 빠네', type: 'main' },
            { name: '매운맛 빠네', type: 'main' },
            { name: '로제 맵제 파스타', type: 'main' },
            { name: '매운 크림 파스타', type: 'main' }
          ]
        }
      ]
    },
    {
      category: '샐러드',
      restaurants: [
        {
          name: '샐러디',
          menus: [
            { name: '로스트 닭다리살 샐러드', type: 'main' },
            { name: '우삼겹 메밀면 누들볼', type: 'main' },
            { name: '노릇두부 단호박 샐러드', type: 'main' },
            { name: '탄단지 샐러드', type: 'main' },
            { name: '그라브락스 연어 샐러드', type: 'main' },
            { name: '(기본) 선택한 메뉴 기본볼', type: 'main' },
            { name: '샐러드 채소볼->포케볼로 변경', type: 'option' }
          ]
        },
        {
          name: '포케올데이',
          menus: [
            { name: '곡물밥 포케', type: 'main' },
            { name: '메밀면 포케', type: 'main' },
            { name: '야채만 포케', type: 'main' },
            { name: '통들깨 들기름 메밀면 샐러드(참치 X / 소스선택x)', type: 'main' },
            { name: '포케올데이 토핑', type: 'option' },
            { name: '훈제오리', type: 'option' },
            { name: '육회', type: 'option' },
            { name: '불고기', type: 'option' },
            { name: '닭가슴살', type: 'option' },
            { name: '참치', type: 'option' },
            { name: '포케올데이 소스', type: 'option' },
            { name: '스리라차', type: 'option' },
            { name: '참깨간장', type: 'option' },
            { name: '포케 곡물볼 -> 채소볼로 변경', type: 'option' }
          ]
        },
        {
          name: '프로티너',
          menus: [
            { name: '닭가슴살 샐러드박스 S', type: 'main' },
            { name: '닭가슴살 샐러드박스 M', type: 'main' },
            { name: '돼지안심 샐러드박스 S', type: 'main' },
            { name: '돼지안심 샐러드박스 M', type: 'main' },
            { name: '폴드포크 샐러드박스 S', type: 'main' },
            { name: '폴드포크 샐러드박스 M', type: 'main' },
            { name: '소부채살 샐러드박스 S', type: 'main' },
            { name: '연어스테이크 샐러드박스 S', type: 'main' },
            { name: '프로티너 드레싱', type: 'option' },
            { name: '토마토살사', type: 'option' },
            { name: '레몬', type: 'option' },
            { name: '치미추리', type: 'option' },
            { name: '스파이시오리엔탈', type: 'option' }
          ]
        },
        {
          name: '단백하루',
          menus: [
            { name: '샐러디 베이스변경 채소볼<->곡물볼', type: 'option' }
          ]
        }
      ]
    },
    {
      category: '햄버거',
      restaurants: [
        {
          name: '맘스터치',
          menus: [
            { name: '아라비아따치즈버거', type: 'main' },
            { name: '딥치즈싸이버거', type: 'main' },
            { name: '화이트갈릭싸이버거', type: 'main' },
            { name: '싸이플렉스버거', type: 'main' },
            { name: '싸이버거', type: 'main' },
            { name: '딥치즈버거', type: 'main' },
            { name: '인크레더블버거', type: 'main' },
            { name: '불고기버거', type: 'main' },
            { name: '통새우버거', type: 'main' },
            { name: '화이트갈릭버거', type: 'main' },
            { name: '감자튀김', type: 'side' },
            { name: '맘스터치 기타 요청사항', type: 'option' }
          ]
        },
        {
          name: '롯데리아',
          menus: [
            { name: '한우 불고기버거', type: 'main' },
            { name: '핫 크리스피 치킨버거', type: 'main' },
            { name: '리아 불고기버거', type: 'main' },
            { name: '데리버거', type: 'main' },
            { name: '모짜렐라 인더 버거 베이컨', type: 'main' },
            { name: '리아 새우', type: 'main' },
            { name: '전주 비빔라이스 버거', type: 'main' },
            { name: '기본 감자튀김', type: 'side' },
            { name: '양념감자로 변경 (어니언)', type: 'side' },
            { name: '제로콜라', type: 'drink' },
            { name: '롯데리아 기타 요청사항', type: 'option' },
            { name: '롯데리아 사이드 변경', type: 'option' }
          ]
        },
        {
          name: '프랭크 버거',
          menus: [
            { name: '더블 비프 치즈버거', type: 'main' },
            { name: 'JG버거', type: 'main' },
            { name: 'K불고기 버거', type: 'main' },
            { name: '프랭크버거', type: 'main' },
            { name: '쉬림프버거', type: 'main' },
            { name: '치즈버거', type: 'main' },
            { name: '크리스피치킨버거', type: 'main' },
            { name: '베이컨 치즈버거', type: 'main' },
            { name: '비프 앤 쉬림프버거', type: 'main' },
            { name: '제로콜라', type: 'drink' },
            { name: '프랭크 버거 기타 요청사항', type: 'option' }
          ]
        }
      ]
    }
  ];

  // 식당 및 메뉴 추가
  for (const categoryData of restaurantMenus) {
    const categoryId = categoryMap[categoryData.category];
    
    for (let rIdx = 0; rIdx < categoryData.restaurants.length; rIdx++) {
      const restaurantData = categoryData.restaurants[rIdx];
      
      // 식당 추가
      const [restaurantResult] = await connection.execute(
        'INSERT INTO restaurants (categoryId, name, sortOrder) VALUES (?, ?, ?)',
        [categoryId, restaurantData.name, rIdx]
      );
      const restaurantId = restaurantResult.insertId;

      // 메뉴 추가
      for (let mIdx = 0; mIdx < restaurantData.menus.length; mIdx++) {
        const menu = restaurantData.menus[mIdx];
        await connection.execute(
          'INSERT INTO menu_items (restaurantId, name, itemType, sortOrder) VALUES (?, ?, ?, ?)',
          [restaurantId, menu.name, menu.type, mIdx]
        );
      }

      console.log(`✓ ${categoryData.category} - ${restaurantData.name} (${restaurantData.menus.length}개 메뉴)`);
    }
  }

  console.log('\n✅ 모든 메뉴 데이터 추가 완료!');
} catch (error) {
  console.error('❌ 오류:', error.message);
} finally {
  await connection.end();
}
