---
name: CeTZ FBD / Stress Element Drawing
description: Typst 내장 Cetz 패키지를 활용한 응력 요소 및 자유물체도(FBD) 그리기 가이드
---

# 자유물체도(FBD) 및 응력 요소 도식화

미소 면적($dA$)이나 미소 육면체 요소에 작용하는 법선 응력($\sigma$)과 전단 응력($\tau$)의 방향을 Typst 내장 그리기 패키지 `cetz`를 활용해 명확히 묘사하기 위한 스킬입니다.

## 적용 지침
1. **자유물체도(FBD) 우선 배치**: 내부력(Internal forces) 혹은 지지 반력을 분석하기 전, 반드시 평형 방정식을 세우기 위해 자유물체도를 그리는 영역을 배치합니다. 그림 확보 전에는 Placeholder 박스라도 생성합니다. (`#rect[Placeholder for FBD]`)
2. **부호 규약 준수**: 인장(Tension)을 (+)로, 압축(Compression)을 (-)로 하는 고체역학 부호 규약을 철저히 따릅니다.

## CeTZ 기반 사각형(2D 응력 상태) 예시코드
아래의 예시 코드를 참고하여 내부 응력을 시각적으로 설명할 때 Typst 문서 내에 직접 벡터를 렌더링하도록 합니다.

```typst
#import "@preview/cetz:0.2.2": canvas, draw

#align(center)[
  #canvas({
    import draw: *
    
    // 중앙 요소 사각형
    rect((0,0), (2,2), name: "el")
    
    // Sigma X (우측 인장)
    line("el.east", (3, 1), mark: (end: ">"))
    content((3.2, 1), [$sigma_x$])
    
    // Sigma Y (상단 인장)
    line("el.north", (1, 3), mark: (end: ">"))
    content((1, 3.2), [$sigma_y$])
    
    // Tau XY (우측면 위쪽 방향)
    line((2, 0.5), (2, 1.5), mark: (end: ">"))
    content((2.3, 1.5), [$tau_(x y)$])
  })
]
```
해당 스크립트는 컴파일될 경우 2D 요소의 주응력 방향을 일러스트레이터 없이도 깔끔하게 묘사해냅니다.
