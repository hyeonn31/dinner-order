import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // 기존 직원 데이터 삭제
  await connection.execute('DELETE FROM employees');
  
  console.log('기존 직원 데이터 삭제 완료');

  // 직원 목록 (기존 엑셀에서 추출)
  const employees = [
    'Neo', 'Noah', 'Zelda', 'Lian', 'Lina', 'Miso', 'Heather', 'Zoey', 'Neiver', 'Summer',
    'Dan', 'Brown', 'Been', 'Key', 'Joker', 'Snow', 'Tatoo', 'Steven', 'Toby', 'Ted',
    'Nelly', 'Happy', 'Chad', 'Red', 'iru', 'Haru', 'Rune', 'Ash', 'Tavy', 'Luke',
    'Felix', 'Cathy', 'Chloe', 'Henry', 'Kray', 'Johnny', 'Dave', 'Robin', 'Tapir', 'Miel',
    'Elen', 'June', 'Mati', 'Loki', 'Logan', 'Castle', 'Juno', 'Ferney', 'Day', 'Chris',
    'Lux', 'Tommy', 'Ross', 'Sophia', 'Ori', 'Anakin', 'Darren', 'Thomas', 'Ember', 'Liz',
    'Sam', 'James', 'Lutie', 'Roa', 'Tony', 'Teo', 'Mika', 'Leon', 'Mason', 'Lumi',
    'Wayne', 'Ruell', 'Hoon', 'Pony', 'Evan', 'Kobe', 'Ray', 'Hicks', 'Isaac', 'Ryoo',
    'Ben', 'Hank', 'Campbell', 'Arc', 'Eisen', 'Mark', 'Vivian', 'Pabian', 'Kai', 'Brian',
    'Howl', 'Luiz', 'Winter', 'Loey', 'Opal', 'Herta', 'Zain', 'Beck', 'Kirk', 'Andy',
    'Bourbon', 'Hia', 'Oliver', 'Doyle', 'Owen', 'Zen', 'Arthur', 'Sean', 'Cony', 'Holmes',
    'Dani', 'Dylon' , 'Flash'
  ];

  // 직원 추가
  for (let i = 0; i < employees.length; i++) {
    const nickname = employees[i].trim();
    if (nickname && !nickname.includes('=')) { // 수식 제외
      await connection.execute(
        'INSERT INTO employees (nickname, sortOrder) VALUES (?, ?)',
        [nickname, i]
      );
    }
  }

  console.log(`✅ 총 ${employees.length}명의 직원 데이터 추가 완료!`);
} catch (error) {
  console.error('❌ 오류:', error.message);
} finally {
  await connection.end();
}
