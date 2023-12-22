---
title: KaTeX
date: 2023-12-22 02:02:15
updated: 2023-12-22 02:02:15
toc: true
categories:
  - examples
katex: true
---

## [$\KaTeX$](https://katex.org/)

- <https://katex.org/docs/autorender.html>
- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- [KaTeX Support Table](https://katex.org/docs/support_table.html)

### 行内公式

$\{x | Ax = b\}$

```md
$\{x | Ax = b\}$
```

$\mathcal{X}_{c^*}<1, \mathcal{X}_{q^*}<1$

$E = mc^2$

$\frac{\partial}{\partial t}$

```latex
$E = mc^2$
$\frac{\partial}{\partial t}$
```

### 行间公式

$$ E = mc^2 $$

```latex
$$ E = mc^2 $$
```

---

$$ \vec a=\frac{d\vec v}{dt}=\frac{d(\frac{dr}{dt}\vec e*{i}+r\frac{d\theta}{dt}\vec e*{j})}{dt}=\frac{d^2r}{dt^2}\vec e*{i}+\frac{dr}{dt}\frac{d\vec e*{i}}{dt}+\frac{dr}{dt}\frac{d\theta}{dt}\vec e*{j}+r\frac{d^2\theta}{dt^2}\vec e*{j}+r\frac{d\theta}{dt}\frac{d\vec e\_{j}}{dt} $$

```latex
$$ \vec a=\frac{d\vec v}{dt}=\frac{d(\frac{dr}{dt}\vec e_{i}+r\frac{d\theta}{dt}\vec e_{j})}{dt}=\frac{d^2r}{dt^2}\vec e_{i}+\frac{dr}{dt}\frac{d\vec e_{i}}{dt}+\frac{dr}{dt}\frac{d\theta}{dt}\vec e_{j}+r\frac{d^2\theta}{dt^2}\vec e_{j}+r\frac{d\theta}{dt}\frac{d\vec e_{j}}{dt} $$
```

$$ m_t=g_t $$

$$ V_t=1 $$

```latex
$$ m_t=g_t $$
$$ V_t=1 $$
```

$$ \eta_t=lr*{\frac {m_t}{\sqrt V_t}}=lr*g_t $$

$$ w\_{t+1}=w_t-\eta_t=w_t-lr*{\frac {m_t}{\sqrt V_t}}=w_t-lr*g_t $$

<div text="red">

$$
q''_s = -k \left.\frac{\partial }{\partial x} (T_1+T_2) \right|_{x=0} = \underbrace{-k \left.\frac{\partial T_1}{\partial x} \right|_{x=0}}_{q''_s}  -k \left.\frac{\partial T_2}{\partial x} \right|_{x=0} \rightarrow \boxed{0 = -k \left.\frac{\partial T_2}{\partial x} \right|_{x=0}}
$$

</div>

```latex
$$ \eta_t=lr*{\frac {m_t}{\sqrt V_t}}=lr*g_t $$
$$ w_{t+1}=w_t-\eta_t=w_t-lr*{\frac {m_t}{\sqrt V_t}}=w_t-lr*g_t $$

<div text="red">

$$
q''_s = -k \left.\frac{\partial }{\partial x} (T_1+T_2) \right|_{x=0} = \underbrace{-k \left.\frac{\partial T_1}{\partial x} \right|_{x=0}}_{q''_s}  -k \left.\frac{\partial T_2}{\partial x} \right|_{x=0} \rightarrow \boxed{0 = -k \left.\frac{\partial T_2}{\partial x} \right|_{x=0}}
$$

</div>
```

$$
\begin{bmatrix}
  a & b \\
  c & d
\end{bmatrix}
$$

```latex
$$
\begin{bmatrix}
  a & b \\
  c & d
\end{bmatrix}
$$
```

$$
\begin{equation}
  \left\{
    \begin{aligned}
      x=a\cos\theta\\
      y=b\sin\theta\\
    \end{aligned}
  \right.
\end{equation}
$$

```latex
$$
\begin{equation}
  \left\{
    \begin{aligned}
      x=a\cos\theta\\
      y=b\sin\theta\\
    end{aligned}
  \right.
\end{equation}
$$
```
