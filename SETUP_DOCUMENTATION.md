# 문서 페이지 설정 가이드

## 1. 필요한 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/simg/development/disk-cms-react
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

## 2. 파일 구조

다음 파일들이 생성되었습니다:

- `src/pages/pharmacy/Documentation.tsx` - 문서 페이지 컴포넌트
- `public/docs/pharmacy/README.md` - 문서 파일 (복사됨)
- `src/App.tsx` - 라우트 추가됨

## 3. 접근 URL

문서 페이지는 다음 URL로 접근할 수 있습니다:

- **로컬 개발**: http://localhost:5173/pharmacy/documentation
- **프로덕션**: https://react.disk-cms.simg.kr/pharmacy/documentation

## 4. 메뉴에 추가하기 (선택사항)

사이드바 메뉴에 문서 링크를 추가하려면 `public/config/menu-config.json` 파일을 수정하세요:

```json
{
  "menus": [
    {
      "id": "pharmacy",
      "title": "약국배상책임보험",
      "icon": "fas fa-pills",
      "order": 3,
      "children": [
        {
          "id": "pharmacy-applications",
          "title": "신청 목록",
          "page": "pharmacy/applications",
          "order": 1
        },
        {
          "id": "pharmacy-documentation",
          "title": "문서",
          "page": "pharmacy/documentation",
          "order": 2
        }
      ]
    }
  ]
}
```

## 5. 문서 파일 업데이트

문서를 업데이트하려면:

1. `docs/pharmacy/README.md` 파일을 수정
2. 다음 명령어로 `public` 폴더에 복사:
   ```bash
   cp docs/pharmacy/README.md public/docs/pharmacy/README.md
   ```

또는 빌드 스크립트에 자동 복사 로직을 추가할 수 있습니다.

## 6. 문제 해결

### 문서가 로드되지 않는 경우

1. `public/docs/pharmacy/README.md` 파일이 존재하는지 확인
2. 브라우저 개발자 도구의 Network 탭에서 파일 요청 확인
3. 서버가 `public` 폴더를 정적 파일로 제공하는지 확인

### 스타일이 적용되지 않는 경우

Tailwind CSS의 `prose` 클래스가 필요할 수 있습니다. `tailwindcss/typography` 플러그인을 설치하세요:

```bash
npm install @tailwindcss/typography
```

그리고 `tailwind.config.js`에 추가:

```js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```
