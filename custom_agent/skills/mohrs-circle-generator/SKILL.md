---
name: Mohr's Circle Generator
description: 주응력 계산 및 모어 원 시각화 템플릿 코드 포함 스킬
---

# 모어 원(Mohr's Circle) 시각화 및 자동 생성

이 스킬은 응력 변환 공식(`Stress Transformation`)에 따라 주응력($\sigma_1, \sigma_2$)과 최대 전단 응력($\tau_{max}$)을 자동 계산하고, 이를 그래프로 나타내는 시각화 파이프라인을 다룹니다.

## Python 시각화 Snippet
에이전트는 주응력/모어 원 개념이 들어간 문서를 작성할 때, 독자의 이해를 돕기 위해 아래의 Python 코드를 문서의 코드 블록으로 제시하거나 내부 변환을 위해 활용하도록 권장받습니다.

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_mohrs_circle(sigma_x, sigma_y, tau_xy):
    # Center and Radius
    C = (sigma_x + sigma_y) / 2
    R = np.sqrt(((sigma_x - sigma_y) / 2)**2 + tau_xy**2)
    
    # Principal Stresses
    sigma_1 = C + R
    sigma_2 = C - R
    tau_max = R
    
    theta = np.linspace(0, 2 * np.pi, 200)
    x = C + R * np.cos(theta)
    y = R * np.sin(theta)
    
    plt.figure(figsize=(6, 6))
    plt.plot(x, y, label="Mohr's Circle")
    plt.plot([sigma_x, sigma_y], [-tau_xy, tau_xy], 'ro-', label="Pointers A, B")
    plt.axvline(x=0, color='k', linestyle='--')
    plt.axhline(y=0, color='k', linestyle='--')
    
    # Annotations
    plt.annotate(f'$\\sigma_1$={sigma_1:.1f}', (sigma_1, 0), textcoords="offset points", xytext=(0,10), ha='center')
    plt.annotate(f'$\\sigma_2$={sigma_2:.1f}', (sigma_2, 0), textcoords="offset points", xytext=(0,10), ha='center')
    plt.annotate(f'$\\tau_{{max}}$={tau_max:.1f}', (C, tau_max), textcoords="offset points", xytext=(0,10), ha='center')
    
    plt.grid(True)
    plt.axis('equal')
    plt.xlabel('Normal Stress ($\\sigma$)')
    plt.ylabel('Shear Stress ($\\tau$)')
    plt.title("Mohr's Circle Evaluation")
    plt.legend()
    plt.savefig('mohrs_circle.png', dpi=150)
    plt.close()
```

## 적용 지침
모어 원을 다루는 장(응력 변환 파트)에서는 해당 코드를 첨부하여 계산의 알고리즘 과정을 실습해볼 수 있도록 안내합니다. 이를 통해 공식을 외우지 않고 모델을 이해할 수 있습니다.
