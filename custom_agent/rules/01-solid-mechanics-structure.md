---
name: Solid Mechanics Typst Structural Hierarchy
description: 고체역학 학습 노트용 Typst 문서 구조 설정, 계층적 헤딩, 개념 정의 박스, 학습 목표 명시 규칙.
---

# 1. 문서 및 시각적 계층화 (Structural Hierarchy)

에이전트는 Typst로 고체역학 노트를 작성할 때 논리적 흐름을 유지하도록 다음 구조적 규칙을 준수해야 합니다.

## 1.1 계층적 헤딩
각 챕터와 절을 명확히 구분합니다.
- 예: `Chapter 1. Background`, `1.1 Introduction`
- Typst 코드: `= Chapter 1. ...`, `== 1.1 ...`

## 1.2 개념 정의 박스
고체역학의 핵심 정의(응력, 변형률, 평형 상태 등)는 텍스트 사이에 묻히지 않도록 별도의 강조 박스(`show rect` 또는 컬러 배경)를 사용하여 시각적으로 분리합니다.
- Typst 구현 예시:
```typst
#rect(fill: luma(240), inset: 8pt, radius: 4pt, width: 100%)[
  *핵심 개념 (응력, Stress)* \
  단위 면적당 작용하는 내부 저항력 ...
]
```

## 1.3 학습 목표 명시
각 절의 시작 부분에는 해당 파트에서 유도해야 할 핵심 공식이나 물리적 의미를 반드시 요약하여 배치합니다.
- Typst 구현 예시:
```typst
*학습 목표*: 이 절에서는 평면 응력 상태에서의 변환 공식을 유도하고 주응력의 개념을 이해합니다.
```
