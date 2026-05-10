import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { config } from 'dotenv';
config();

const { drizzle } = await import('drizzle-orm/mysql2');
const mysql = await import('mysql2/promise');
const { employees } = await import('../drizzle/schema.ts');

const EMPLOYEES = [
  "Neo", "Noah", "Zelda", "Lian", "Lina", "Miso", "Heather", "Zoey", "Neiver", "Summer",
  "Dan", "Brown", "Been", "Key", "Joker", "Snow", "Tatoo", "Steven", "Toby", "Ted",
  "Nelly", "Happy", "Chad", "Red", "iru", "Haru", "Rune", "Ash", "Tavy", "Luke",
  "Felix", "Cathy", "Chloe", "Henry", "Kray", "Johnny", "Dave", "Robin", "Tapir", "Miel",
  "Elen", "June", "Mati", "Loki", "Logan", "Castle", "Juno", "Ferney", "Day", "Chris",
  "Lux", "Tommy", "Ross", "Sophia", "Ori", "Anakin", "Darren", "Thomas", "Ember", "Liz",
  "Sam", "James", "Lutie", "Roa", "Tony", "Teo", "Mika", "Leon", "Mason", "Lumi",
  "Wayne", "Ruell", "Hoon", "Pony", "Evan", "Kobe", "Ray", "Hicks", "Isaac", "Ryoo",
  "Ben", "Hank", "Campbell", "Arc", "Eisen", "Mark", "Vivian", "Pabian", "Kai", "Brian",
  "Howl", "Luiz", "Winter", "Loey", "Opal", "Herta", "Zain", "Beck", "Kirk", "Andy",
  "Bourbon", "Hia", "Oliver", "Doyle", "Owen", "Zen", "Arthur", "Sean", "Cony", "Holmes",
  "Dani", "Dylon"
];

async function seedEmployees() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log("🌱 Updating employees...");

  // 기존 직원 삭제 후 재삽입
  await db.delete(employees);

  const employeeData = EMPLOYEES.map((nickname, idx) => ({
    nickname,
    sortOrder: idx + 1,
    isActive: true,
  }));

  await db.insert(employees).values(employeeData);
  console.log(`✅ ${EMPLOYEES.length} employees inserted`);

  await connection.end();
  console.log("🎉 Done!");
}

seedEmployees().catch(console.error);
