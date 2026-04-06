---
name: Solid Mechanics Mathematical Conventions
description: 고체역학의 텐서 표기, 행렬 형식, 평형 방정식 등 수식 렌더링 규약.
---

# 2. 수식 표기 및 유도 규약 (Mathematical Conventions)

고체역학의 핵심인 텐서와 미분 방정식을 명확하게 표현하기 위한 규칙입니다.

## 2.1 텐서 표기법 (Indicial Notation)
2차 텐서인 응력($\sigma_{ij}$)과 변형률($\epsilon_{ij}$)은 Typst의 수학 모드 `$ ... $`를 사용하여 일관되게 표기하고, 반복 인자에 대한 합 규약(Summation Convention)을 명시적으로 사용 또는 설명합니다.

## 2.2 행렬 형식 활용
3차원 응력 상태를 나타낼 때 $3 \times 3$ 행렬 형태를 적극 활용하여 응력 텐서의 대칭성(Symmetry)을 한눈에 보여줍니다.
- Typst 구현 예시:
```typst
$ mat(
  sigma_x, tau_(x y), tau_(x z);
  tau_(y x), sigma_y, tau_(y z);
  tau_(z x), tau_(z y), sigma_z
) $
```

## 2.3 미분 방정식 및 평형 방정식 가독성
평형 방정식(Equilibrium Equations) 유도 시 편미분 기호를 명확하게 배치하고, 각 항이 의미하는 물리량(체적력, 표면력 등)을 주석 문구로 보충하여 가독성을 극대화합니다.
- 수식 내 혹은 바로 아래 텍스트에서 각 표기 기호의 물리적 뜻을 반드시 해석합니다.
