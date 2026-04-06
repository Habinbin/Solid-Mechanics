---
description: custom_agent/rules/에 새 rule 파일을 생성한다.
---

# Create Rule

## Prerequisites

1. `/list-agent-config` 워크플로우를 먼저 실행하여 기존 rules와 중복되지 않는지 확인한다. 기존 rule을 확장하는 것이 더 적합하면 새로 만들지 않는다.

## Trigger 선택 가이드

| Trigger | 용도 | 예시 |
|---------|------|------|
| `always_on` | 프로젝트 전반에 항상 적용 | 코딩 컨벤션, 아키텍처 원칙 |
| `model_decision` | 에이전트가 description 기반으로 적용 여부 판단 | 특정 도메인 전문 지식 |
| `glob` | 특정 파일 패턴에만 적용 | `"backend/**/*.py"` |

> `manual` trigger는 사용하지 않는다.

## 생성 절차

2. trigger 타입과 glob 패턴(해당 시)을 결정한다.

3. `custom_agent/rules/{rule-name}.md` 파일을 아래 템플릿으로 생성한다:

```markdown
---
trigger: {always_on | model_decision | glob}
glob: "{패턴}"  # glob trigger일 때만 필요
description: "{한 줄 설명}"
---

# {Rule 제목}

{규칙 내용 - 간결하게 작성}
```

## 작성 원칙

- **간결함 우선**: 12,000자 제한이지만, 짧을수록 좋다. 핵심만 담는다.
- **구조화**: 표, 코드 블록, Good/Bad 예시로 빠르게 파악 가능하게 작성한다.
- **상호 참조**: 관련 rule/skill이 있으면 `@filename`으로 참조한다.
- 하위 디렉토리 참조 파일이 필요하면 `{rule-name}/` 폴더에 배치한다.
