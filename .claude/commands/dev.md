---
description: "전체 개발 파이프라인 실행: 계획 → 구현 → 품질 검증. 3개 에이전트를 순차적으로 활용합니다."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# /dev — Full Development Pipeline

사용자의 요청을 3단계 에이전트 파이프라인으로 처리합니다.

## 사용자 요청

$ARGUMENTS

## 실행 워크플로우

아래 3단계를 순차적으로 실행하세요. 각 단계의 결과를 다음 단계의 입력으로 활용합니다.

### Phase 1: 계획 수립 (plan-architect)

Task tool로 `plan-architect` 에이전트를 실행합니다.

**프롬프트**: 사용자의 요청을 분석하고, 현재 코드베이스를 탐색한 뒤, 구체적인 구현 계획을 수립해주세요. 요구사항 정리, 구현 단계, 리스크, 완료 기준을 포함해주세요.

- 에이전트가 반환한 계획을 사용자에게 보여줍니다.
- 사용자에게 계획을 확인받습니다. (AskUserQuestion 사용)
  - "이 계획대로 진행할까요?"
  - 옵션: "진행" / "수정 필요"
- 사용자가 "수정 필요"를 선택하면 피드백을 반영하여 plan-architect를 다시 실행합니다.

### Phase 2: 구현 (senior-developer)

사용자가 계획을 승인하면, Task tool로 `senior-developer` 에이전트를 실행합니다.

**프롬프트**: Phase 1에서 수립된 계획을 기반으로 코드를 구현해주세요. 계획의 각 단계를 순서대로 실행하고, 기존 코드베이스의 패턴과 컨벤션을 따라주세요.

- 계획 내용 전체를 프롬프트에 포함시킵니다.
- 구현 결과를 사용자에게 요약하여 보여줍니다.

### Phase 3: 품질 검증 (code-quality-guard)

구현이 완료되면, Task tool로 `code-quality-guard` 에이전트를 실행합니다.

**프롬프트**: 방금 변경된 코드의 품질을 검증해주세요. lint와 build를 실행하고, 문제가 있으면 수정해주세요.

- 품질 검증 결과를 사용자에게 보여줍니다.
- 문제가 발견되어 코드가 수정된 경우, 수정 내용을 요약합니다.

## 최종 출력

3단계가 모두 완료되면 아래 형식으로 최종 요약을 출력합니다:

```
## /dev 파이프라인 완료

### 계획 (plan-architect)
- [계획 요약 2-3줄]

### 구현 (senior-developer)
- [변경된 파일 목록]
- [주요 변경 사항 요약]

### 품질 검증 (code-quality-guard)
- Lint: PASS/FAIL
- Build: PASS/FAIL
- [수정된 이슈 요약]
```

## 주의사항

- 각 에이전트에게 이전 단계의 결과를 충분히 전달하세요.
- Phase 2에서는 반드시 Phase 1의 구체적인 구현 단계를 포함시키세요.
- 에이전트 간 컨텍스트가 끊기지 않도록 핵심 정보를 프롬프트에 명시하세요.
- 사용자 요청이 비어있으면 ($ARGUMENTS가 빈 경우) AskUserQuestion으로 무엇을 개발할지 물어보세요.
