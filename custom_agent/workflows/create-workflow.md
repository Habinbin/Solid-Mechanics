---
description: custom_agent/workflows/에 새 workflow 파일을 생성한다.
---

# Create Workflow

## Prerequisites

1. `/list-agent-config` 워크플로우를 먼저 실행하여 기존 workflows와 중복되지 않는지 확인한다.

## 생성 절차

2. `custom_agent/workflows/{workflow-name}.md` 파일을 아래 템플릿으로 생성한다:

```markdown
---
description: {한 줄 설명}
---

# {Workflow 제목}

## Steps

1. {첫 번째 단계}
2. {두 번째 단계}
...
```

## 작성 원칙

- **간결함 우선**: 각 단계는 명확한 하나의 액션으로 작성한다.
- **상호 참조**: 다른 워크플로우를 호출할 때는 `/워크플로우명`으로 참조한다.
