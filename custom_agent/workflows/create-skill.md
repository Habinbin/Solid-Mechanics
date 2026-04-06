---
description: custom_agent/skills/에 새 skill을 생성한다.
---

# Create Skill

## Prerequisites

1. `/list-agent-config` 워크플로우를 먼저 실행하여 기존 skills와 중복되지 않는지 확인한다.

## 생성 절차

2. `custom_agent/skills/{skill-name}/` 디렉토리를 생성한다.

3. `SKILL.md` 파일을 아래 템플릿으로 생성한다:

```markdown
---
name: {skill-name}
description: "{한 줄 설명}"
---

# {Skill 제목}

## 사용 시점
{언제 이 skill을 사용해야 하는지}

## 절차
{구체적 단계}
```

4. 필요 시 하위 디렉토리를 추가한다:
   - `scripts/` — 헬퍼 스크립트
   - `examples/` — 참조 구현
   - `resources/` — 템플릿, 에셋 등

5. **의존성 설치 및 테스트**:
   - Python 스크립트 기반 스킬인 경우, 필요한 외부 패키지를 `custom_agent/pyproject.toml`에 `uv add {패키지명}`으로 추가한다.
   - 스크립트가 의도대로 실행되는지 `uv run python ...` 명령어로 직접 호출하여 테스트한다.

## 작성 원칙

- **간결함 우선**: SKILL.md는 핵심 절차만 담는다. 상세 내용은 하위 파일에 분리한다.
- **상호 참조**: 관련 rule이나 workflow가 있으면 명시적으로 참조한다.
