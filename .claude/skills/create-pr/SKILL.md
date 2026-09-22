---
name: create-pr
description: |
  현재 브랜치의 변경사항과 커밋 히스토리를 분석해 GitHub Pull Request를 생성한다.
  사용자가 "PR 만들어줘", "pull request 생성", "PR 올려줘", "create a PR", "open a pull request"
  같은 요청을 하거나, 작업을 마치고 리뷰를 받아야 하는 상황이면 이 스킬을 사용한다.
  프로젝트가 영문 위주(해외 오픈소스 등)인지 한국어 위주인지 자동 판단해 그에 맞는 PR 템플릿을 적용한다.
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

# Create PR 스킬

현재 브랜치의 변경사항을 분석해 제목과 본문을 갖춘 Pull Request를 생성합니다.

## 절차

### 1단계: 사전 확인

```bash
gh auth status
git branch --show-current
git status
```

- `gh auth status`가 실패하면 로그인이 안 된 것이므로 사용자에게 알리고 중단합니다.
- 현재 브랜치가 base 브랜치(보통 `main`, 저장소마다 다를 수 있음 — `git remote show origin`으로 확인)와 같으면 PR을 만들 수 없으므로, 새 브랜치를 만들지 여부를 사용자에게 확인합니다.
- 이미 현재 브랜치에 열린 PR이 있으면(`gh pr view` 성공) 새로 만들지 않고 사용자에게 알립니다.

### 2단계: 변경사항 분석

base 브랜치 대비 전체 변경사항과 커밋 히스토리를 확인합니다:

```bash
git fetch origin
git log origin/<base>..HEAD --oneline
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
```

**커밋 하나만 보지 말고, 브랜치가 base에서 갈라진 이후의 전체 커밋과 diff를 확인합니다.** PR 요약은 마지막 커밋이 아니라 브랜치 전체의 누적 변경을 설명해야 합니다.

### 3단계: 브랜치 push

원격에 현재 브랜치가 없거나 로컬과 어긋나 있으면 push합니다:

```bash
git push -u origin <현재 브랜치>
```

### 4단계: 템플릿 언어 판단

프로젝트 성격에 따라 사용할 템플릿을 정합니다:

- **영문 판단 근거**: README가 영문 위주, 커밋 메시지가 영문 위주, `gh repo view --json owner`의 owner가 해외 오픈소스 조직으로 보임
- **한국어 판단 근거**: README가 한국어 위주, 커밋 메시지가 한국어 위주

애매하면 **최근 커밋 메시지 언어 비율**로 판단합니다(과반이 한국어면 한국어, 아니면 영문). 판단 후:

- 영문 → `references/pr-template-en.md` 사용
- 한국어 → `references/pr-template-ko.md` 사용

### 5단계: PR 제목·본문 작성

선택한 템플릿 파일을 읽고, 2단계에서 분석한 내용으로 플레이스홀더를 채웁니다:

- `{{SUMMARY}}` — 이 브랜치가 무엇을 왜 바꾸는지 2~3문장 요약
- `{{CHANGES}}` — 논리적 단위로 묶은 변경 내용 불릿 목록
- `{{TEST_PLAN}}` — 실행한 테스트/검증 방법을 체크리스트 형태로. 실제로 확인하지 않은 항목은 "확인 필요"로 남겨두고 지어내지 않습니다.
- `{{RELATED_ISSUES}}` — 커밋 메시지나 브랜치명에서 이슈 번호(`#123` 등)를 찾아 연결. 없으면 이 섹션 전체를 본문에서 제거합니다.

PR 제목은 커밋 메시지 컨벤션(`<타입>(<범위>): <제목>`, 있다면 [commit 스킬](.claude/skills/commit/SKILL.md) 참고)을 따르고 70자 이내로 작성합니다.

### 6단계: PR 생성

```bash
gh pr create --title "<제목>" --body "<본문>"
```

본문에 개행이 포함되므로 heredoc으로 전달합니다.

### 7단계: 완료 확인

```bash
gh pr view --web=false --json url,number
```

## 특별한 경우들

### 커밋된 변경사항이 없는 경우

base 브랜치와 diff가 없으면 PR을 만들 수 없다는 것을 명확히 알리고 중단합니다.

### base 브랜치를 찾을 수 없는 경우

`git remote show origin`의 `HEAD branch`를 신뢰합니다. 그래도 불명확하면 `main`과 `master` 순으로 존재 여부를 확인하고, 그래도 안 되면 사용자에게 묻습니다.

### 템플릿 판단이 정말 애매한 경우

커밋 메시지 언어 비율까지 봐도 50:50에 가까우면, 임의로 정하지 않고 사용자에게 어떤 템플릿을 쓸지 묻습니다.

## 주의사항

- **사용자 승인 없이 바로 PR을 생성합니다.** 이 스킬을 호출한 것 자체가 PR 생성에 대한 동의로 간주합니다. 단, base 브랜치 판단이나 템플릿 언어 판단처럼 되돌리기 어려운 모호한 지점에서는 진행 전에 확인합니다.
- **테스트 계획을 지어내지 않습니다.** 실제로 실행한 검증만 적고, 하지 않은 것은 "확인 필요"로 표시합니다.
- **Draft 여부**는 사용자가 명시하지 않으면 일반 PR로 생성합니다. "초안", "draft"라는 언급이 있으면 `--draft`를 추가합니다.

## 출력 포맷

최종 결과는 다음과 같이 표시합니다:

```
✓ PR 생성 완료
URL: https://github.com/<owner>/<repo>/pull/<번호>
제목: feat(auth): JWT 기반 사용자 인증 구현
템플릿: 한국어
커밋: 3개
```
