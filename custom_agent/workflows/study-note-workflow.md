---
description: 고체역학 강의 자료를 기반으로 Typst 학습용 요약 노트(핵심 내용, 수식, 모어원 시각화 포함)를 자동 생성하고 최종 PDF로 렌더링하는 워크플로우
---

# Solid Mechanics Study Note Workflow

이 워크플로우는 `00 material/original/` 경로에 있는 고체역학 PDF 강의 자료들을 분석하여, `custom_agent/rules/` 및 `custom_agent/skills/`의 고체역학 특화 규칙들을 철저히 준수하는 최적의 학습용 Typst 노트(`.typ`)를 생성합니다.

## Prerequisites
- `original/` 폴더에 분석할 `.pdf` 파일들이 존재해야 합니다.
- 시스템의 `.agent/skills/pdf-reader/scripts/parse_pdf_multimodal.py` 사용이 가능해야 합니다.
- **[필수]** Agent는 `custom_agent/rules/` (구조화, 텐서/수식 포맷, Typst 자동화 규칙) 및 `custom_agent/skills/` (모어원 시각화, Cetz 자유물체도 생성 스킬)의 내용들을 확실히 참조 및 준수해야 합니다.

---

## Steps

// turbo-all

### 1. PDF 분석 타겟 설정 및 이미지/마크다운 추출
각 PDF 파일에 대해 고화질 이미지를 추출하고, 멀티모달 LLM으로 전체 마크다운 텍스트를 파악합니다. 아래 스크립트에서 `PDF_NAME`을 처리하고자 하는 파일명(확장자 제외)으로 변경하여 실행합니다.

```bash
export PDF_NAME="01-Solid Mechanics-Chap.01"
export PDF_PATH="00 material/original/${PDF_NAME}.pdf"
export MD_OUT=".agent/tmp/${PDF_NAME}_extracted.md"

# 멀티모달 파서를 사용하여 PDF 전체를 Markdown 텍스트로 추출
uv run --no-project --with pymupdf --with python-dotenv python3 \
  .agent/skills/pdf-reader/scripts/parse_pdf_multimodal.py \
  --pdf "${PDF_PATH}" --output "${MD_OUT}" --dpi 150
```

### 2. Typst 콘텐츠 기획 및 조판 (Rule Compliance)
Agent는 추출된 `${MD_OUT}` 파일 경로(예: `.agent/tmp/01-Solid Mechanics-Chap.01_extracted.md`)를 읽은 후, Typst 문서 문맥을 기획합니다. 작성 시 다음의 규칙과 스킬을 반드시 적용해야 합니다:

1. **(`01-solid-mechanics-structure.md`) 문서 구조화**:
   - `== 1.1` 등 계층적 헤딩 사용.
   - 각 챕터의 도입부에 `*학습 목표*:` 요약 기재.
   - 핵심 개념 및 정의는 `#rect(fill: luma(240))` 등의 강조 박스로 감싸 식별력 증대.
2. **(`02-mathematical-conventions.md`) 수식 표기 규약**:
   - $\sigma_{ij}$ 및 응력 성분 표기, 3x3 평형/응력 행렬 표기(Typst `$ mat( ... ) $`) 사용.
   - 평형 방정식의 체적력/표면력 각 항의 의미에 대한 텍스트 주석 추가.
3. **(`03-typst-automation.md`) 자동화 기능 보장**:
   - 잦은 심볼(`sig_x`, `tau_xy`)은 `#let`으로 매크로화, 상호 참조를 위한 `@라벨` 할당.
4. **(`skills/cetz-fbd-generator/SKILL.md`) 자유물체도(FBD)**:
   - 요소 내 응력 분포를 다루는 챕터는 Typst의 `cetz` 모듈 코드를 삽입하여 직관적인 2D 벡터 이미지 제시.
5. **(`skills/mohrs-circle-generator/SKILL.md`) 모어 원(Mohr's Circle)**:
   - 주응력 파트는 Python Mohr's Circle 코드를 마크다운 코드 블록으로 제시하여 검증 편의 제공.

### 3. Typst 노트 파일 생성
위 2번 항목에서 정리된 텍스트와 레이아웃을 바탕으로, `00 material/refined/` 폴더 아래에 Typst(`.typ`) 문서를 생성합니다.

### 4. Typst 렌더링 및 검증 (PDF 생성)
생성된 `.typ` 파일을 컴파일하여 최종 PDF 학습 자료를 산출합니다. 렌더링 시 프로젝트 폴더 구조 및 타임아웃 규칙에 맞춰 아래와 같이 실행합니다.

```bash
# 생성된 파일명에 맞춰 컴파일 실행 (예시)
export TYP_OUT="00 material/refined/${PDF_NAME}.typ"
timeout 15 typst compile --root . --font-path 98_Assets/fonts "${TYP_OUT}"
```
컴파일 에러 발생 시, 에러 메시지를 진단해 문법 오류를 교정하고 재컴파일합니다.

### 5. 반복 수행
필요한 경우 `original/` 폴더 내의 다수 파일들에 대해서도 일괄 처리를 진행합니다. 문서를 생성할 때는 동일한 양식을 유지하여 통일감 있게 작성합니다.
