---
description: custom_agent 구성(rules, skills, workflows)을 체계적으로 수정하기 위한 에이전트 행동 지침 및 판단 기준
---

이 워크플로우는 에이전트 자신이 스스로의 설정(`custom_agent` 디렉토리 내의 `rules`, `skills`, `workflows`)을 변경하거나 새로운 기능을 확장할 때 반드시 준수해야 하는 메타-지침(Meta-guideline)입니다. 
지나친 메모리(Context/Token) 낭비를 막고, 재사용성을 갖춘 모듈식 확장을 보장하기 위해 사용됩니다.

## 1단계: 기존 시스템 파악 (Context Discovery)
새로운 룰, 스킬, 혹은 워크플로우를 생성하기 전, **반드시 기존에 유사한 기능이 존재하는지 먼저 확인**해야 합니다.
1. `/list-agent-config` 워크플로우를 실행하거나 직접 폴더 목록(`list_dir`)을 조회하여 기존 파일들을 확인합니다.
2. 이미 동일하거나 유사한 목적을 가진 Skill이나 Rule이 존재한다면, 완전히 새로 작성하지 않고 **해당 파일에 살을 붙이는 방식(Update)**으로 피드백을 수용합니다.

## 2단계: 기능 분배 결정 행렬 (Decision Matrix)
새로운 요구사항을 어떤 형태로 구현할지 결정할 때, 다음의 기준을 절대적으로 따릅니다:

### A. 일반 규칙 (Rules)
* **저장 위치**: `custom_agent/rules/` 하위 마크다운
* **등록 기준**: 모든 대화와 모든 프로젝트 상황에서 **언제나(Always) 보편적으로 적용**되어야 하는 원칙. (예: "명령어는 반드시 `uv run python` 사용", "파이썬 네이밍 컨벤션").
* **작성 지침**: 컨텍스트 낭비를 막기 위해 **최대한 짧고 명결하게** 작성합니다. 너무 구체적인 코드를 담아선 안 됩니다.

### B. 도구 보관소 (Skills)
* **저장 위치**: `custom_agent/skills/<skill_name>/SKILL.md` 와 도구 스크립트 파일들(e.g., Python 스크립트).
* **등록 기준**: 정규표현식, 복잡한 파이썬 스크립트, API 호출 등 **특정한 작업을 수행하기 위해 필요한 도구나 라이브러리성 로직**. (예: `run_idf_simulation`, `build_educational_package`).
* **작성 지침**: 워크플로우나 룰셋 내부에 수백 줄의 코드를 직접 박아넣지 마세요(Hardcoding 금지). 복잡한 로직은 전부 `skills` 내부의 별도 모듈로 분리하고, 스킬 설명서(`SKILL.md`)에 사용 방법만을 기록해야 합니다.

### C. 실행 흐름 (Workflows)
* **저장 위치**: `custom_agent/workflows/` 하위 마크다운
* **등록 기준**: 특정 목표를 달성하기 위한 **일련의 단계적 절차(Step-by-step sequences)**. (예: `/generate-project-archive`).
* **작성 지침**: 절차(Step 1, Step 2...)를 명확히 작성하고, 실행을 위해 어떤 `Skill`들을 어떤 순서로 호출해야 하는지 명시합니다.

## 3단계: 수정 및 생성 (Modification & Coding)
결정된 기준에 따라 파일을 수정/생성합니다. 이때 하위 지침을 따르세요:
- **종속성 유지(Backward Compatibility)**: 파이썬 스크립트 기능(`Skill`)의 매개변수(Arguments) 구조를 변경한다면, 해당 스크립트를 호출하는 다른 기존 `Workflow`들도 전부 구동될 수 있도록 코드를 업데이트해야 합니다.
- **주석 최소화 (Workflow 한정)**: Workflow 내부 마크다운 지시는 파이썬 코드를 통째로 포함하기보다는 `uv run python custom_agent/skills/xxx/script.py --args` 형태로 깔끔하게 스크립트를 재사용하게끔 지시해야 합니다.

## 4단계: 검증 테스트 (Validation Run)
변경 코드를 저장했다면, 실제 적용 전에 정상 동작 여부(Syntax Error, File Not Found 등)를 반드시 CLI 상에서 단일 실행해봅니다.
- **에러 핸들링**: 에러가 발생한 경우 원래의 사용자 요청을 진행하기 전에, 반드시 에러의 원인을 찾고 `custom_agent` 파일들에 대한 자가 수정 조치를 취해야 합니다.
