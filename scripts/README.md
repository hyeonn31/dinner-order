# DB 시드 스크립트 가이드

웹 앱(저녁 신청·관리자)은 **코드가 아니라 MySQL DB**의 데이터를 표시합니다.  
메뉴를 바꾸려면 파일만 push하는 것이 아니라, **아래 스크립트를 `DATABASE_URL`이 설정된 환경에서 실행**해야 합니다.

`.env` 예시:

```env
DATABASE_URL=mysql://user:password@host:4000/database_name
```

Vercel / Manus / 로컬이 **같은 DB**를 쓰는지 반드시 확인하세요.

---

## 어떤 스크립트를 쓸까? (요약)

| 목적 | 스크립트 | npm 명령 |
|------|----------|----------|
| **메뉴·식당 전체를 최신 목록으로 교체** (기본) | `seed-new-menus.mjs` | `pnpm run db:seed` |
| 오미마리 메뉴만 복구 | `fix-omimari-menus.mjs` | `pnpm run db:fix-omimari` |
| 처음부터 전체 세팅 (직원 포함, 레거시) | `seed.mjs` | `pnpm run db:seed-legacy` |
| 직원 닉네임만 | `seed-employees.mjs` 등 | (별도 실행) |

**일반적으로는 `seed-new-menus.mjs`만 기준**으로 맞추면 됩니다.

---

## 1. `seed-new-menus.mjs` — **기본 (권장)**

- 엑셀/최신 정리본 기준 식당·메뉴
- 실행 시 **기존 주문·메뉴·식당·카테고리·오늘의 식당 설정을 모두 삭제** 후 다시 삽입
- 식당 ID는 DB **자동 증가** (1, 2가 아닐 수 있음)
- 직원 데이터는 넣지 않음

```bash
pnpm run db:seed
```

---

## 2. `fix-omimari-menus.mjs` — 오미마리만

- DB에 오미마리 식당은 있는데 **메뉴가 비어 있을 때**
- 다른 식당·주문은 건드리지 않음

```bash
pnpm run db:fix-omimari
```

---

## 3. `seed.mjs` — 레거시 / 초기 설치용

- 예전 **전체 19개 식당** + 메뉴 + **직원 95명** 한 번에
- `INSERT IGNORE` 위주 → **전체 삭제는 하지 않음**
- 메뉴를 여러 번 실행하면 **중복**될 수 있음
- 식당 ID **1~19 고정** (옛 문서·테스트와 맞춤)

**빈 DB에서 처음 채울 때** 또는 레거시 목록이 필요할 때만 사용하세요.

```bash
pnpm run db:seed-legacy
```

---

## `seed.mjs` vs `seed-new-menus.mjs` 차이

| | seed-new-menus (권장) | seed.mjs (레거시) |
|---|----------------------|-------------------|
| 주문·오늘 설정 | 삭제됨 | 유지 |
| 식당 수 | 적음 (최신 엑셀 기준) | 19곳 전체 |
| 한식 | 본도시락, 본비빔밥, 정우, 오미마리 등 | + 강남돈부리, 극강은마, 오토김밥, 이게볶음밥 |
| 직원 | 없음 | 포함 |
| 메뉴 이름 | 최신 (예: 갈비도시락) | 구버전 (예: 갈비 도시락) |

---

## Manus / Vercel / Cursor

- **Git push만으로** 웹 메뉴는 바뀌지 않습니다.
- **Manus**: 코드 반영 후 **Deploy** 필요.
- **Vercel**: push 후 자동 배포되더라도 **DB는 스크립트로 따로** 갱신해야 합니다.
- 스크립트는 **배포된 사이트와 동일한 `DATABASE_URL`**로 실행하세요.

---

## 실행 순서 예시 (운영 DB 초기화)

1. `.env`에 `DATABASE_URL` 설정  
2. `pnpm run db:seed` — 메뉴·식당 최신화  
3. `node scripts/seed-employees.mjs` — 직원 필요 시  
4. 관리자 페이지에서 **오늘의 식당** 다시 선택  
