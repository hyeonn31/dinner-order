# 저녁식사 신청 시스템 (dinner-order)

## DB 메뉴 / 식당 데이터

**기본:** `seed-new-menus.mjs` → `pnpm run db:seed`

자세한 설명·다른 스크립트: **[scripts/README.md](scripts/README.md)**

```bash
cp .env.example .env   # DATABASE_URL 입력
pnpm install
pnpm run db:seed       # 메뉴·식당 전체 교체 (주문·오늘 설정 삭제됨)
```

## 로컬 개발

```bash
pnpm dev
```

## 배포

- **Vercel:** `vercel.json` 참고, `DATABASE_URL` 환경 변수 필수  
- **Manus:** Deploy 후 동일 DB에 시드 스크립트 실행
