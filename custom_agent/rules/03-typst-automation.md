---
name: Typst Automation and References
description: 고체역학 노트에서의 전역 변수 심볼 정의, 상호 참조, 코드 블록 삽입 규칙.
---

# 3. Typst 특화 기능 및 자동화 (Automation)

Habin 연구원의 효율적인 학습을 위해 Typst의 프로그래밍 기능을 다음과 같이 활용합니다.

## 3.1 심볼 커스텀 정의
자주 사용하는 기호($\sigma_{x'}$, $\tau_{x'y'}$, $\theta_p$ 등)를 문서 상단에 `#let`으로 선언하여 코드의 일관성을 유지하고 타이핑 생산성을 높입니다.
- 예시:
```typst
#let sigx = $sigma_x$
#let sigy = $sigma_y$
#let tauxy = $tau_(x y)$
```

## 3.2 참조 및 링크 설정
수식 번호(`Eq. 1.1` 등)와 그림 번호를 자동 매칭하여 문서 내 상호 참조가 가능하게 설정합니다.
- 수식과 그림 뒤에 `<label_name>`을 할당하고 본문에서 `@label_name` 꼴로 호출하여 하이퍼링크를 연결합니다.

## 3.3 코드 블록 활용
필요한 경우, 수치 해석을 위한 파이썬(NumPy, Pandas 등) 코드 스니펫이나 스크립트를 문서 하단에 첨부하거나 별도 블록으로 작성하여 이론과 실습(시각화)을 연결할 수 있도록 구성합니다.
```typst
```python
import numpy as np
# ...
```
```
