# Contributing to Machodown

먼저 기여해 주셔서 감사합니다! 다음 가이드를 따라 주세요.

## 개발 환경 세팅

```bash
git clone https://github.com/hongdaeri/machodown.git
cd machodown
npm install
npm run dev
```

## 브랜치 전략

- `master` — 안정 릴리즈
- `feature/<name>` — 기능 개발
- `fix/<name>` — 버그 수정

## Pull Request 절차

1. `master`에서 새 브랜치를 생성하세요.
2. 변경 내용을 커밋합니다. (커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식 사용)
3. `npm run typecheck && npm run lint && npm test`가 모두 통과하는지 확인하세요.
4. PR을 열고 변경 사항을 설명하는 설명을 작성해 주세요.

## 커밋 메시지 형식

```
<type>: <description>

[optional body]
```

타입: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

예시:
```
feat: 탭에서 파일 드래그 앤 드롭 지원 추가
fix: 다크 모드에서 스크롤바 색상 오류 수정
```

## 코드 스타일

- TypeScript strict 모드 준수
- ESLint + Prettier 규칙을 따릅니다 (`npm run lint`, `npm run format`)
- 새 기능에는 반드시 테스트를 추가해 주세요 (`npm test`)

## 이슈 및 기능 제안

- 버그 리포트: [Bug Report 템플릿](.github/ISSUE_TEMPLATE/bug_report.md)을 사용해 주세요.
- 기능 제안: [Feature Request 템플릿](.github/ISSUE_TEMPLATE/feature_request.md)을 사용해 주세요.

## 라이선스

이 프로젝트에 기여하면 귀하의 기여가 [MIT 라이선스](LICENSE) 하에 제공된다는 데 동의하는 것으로 간주됩니다.
