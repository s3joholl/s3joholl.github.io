---
title: "Interaction Effects with Instrumental Variables"
description: "Why conventional instrumental variable estimates of interaction effects can be misleading when treatment effects are heterogeneous, with interactive simulations."
summary: "Why 2SLS estimates of interaction effects can be misleading when treatment effects are heterogeneous, and how marginal treatment effects address this."
date: 2026-10-21
math: true
bodyClass: insight
paper:
  title: Gene–Environment Interactions with Essential Heterogeneity
  url: https://doi.org/10.1093/ej/ueag010
  coauthors: Hendrik Schmitz and Matthias Westphal
---

Here, I go over the intuition for why conventional instrumental variable estimates of interaction effects can be misleading when treatment effects are heterogeneous. I use the example from our paper [“Gene–Environment Interactions with Essential Heterogeneity”](https://doi.org/10.1093/ej/ueag010) (with Hendrik Schmitz and Matthias Westphal): how education and genetic predisposition interact in determining cognitive ability in old age.

## Setup

Gene–environment interaction models are typically specified as

$$Y_i = \beta_0 + \beta_1 E_i + \beta_2 G_i + \beta_3\, G_i \times E_i + \varepsilon_i.$$

Suppose that

- $Y_i$ is a continuous outcome, here cognitive ability in old age, measured as the number of words an individual recalls in a cognitive test,
- $E_i \in \{0, 1\}$ is binary education, here whether an individual stayed in school until at least age 15, and
- $G_i \in \{0, 1\}$ is a binary pre-determined genetic predisposition, here whether an individual has a high polygenic index for educational attainment.

We are interested in the interaction effect $\beta_3$, which tells us how the effect of education on cognitive ability varies with genetic predisposition.

Education is an endogenous choice. It is therefore instrumented by a valid binary instrument $Z$, here exposure to a compulsory schooling reform in the UK that raised the minimum school-leaving age from 14 to 15 for cohorts born from 1933 onwards. With heterogeneous effects of education, instrumental variable estimation identifies only the average effect for compliers, that is, for individuals who stay in school longer only because of the reform (the local average treatment effect; Imbens and Angrist, 1994). Two-stage least squares (2SLS) estimation computes $\hat\beta_3$ as the difference between two such effects,

$$\hat\beta_3 = \mathrm{E}\big[Y_i^1(1) - Y_i^0(1) \mid C(G_i = 1)\big] - \mathrm{E}\big[Y_i^1(0) - Y_i^0(0) \mid C(G_i = 0)\big],$$

where $Y_i^e(g)$ is the potential outcome of individual $i$ with education $E_i = e$ and genetic predisposition $G_i = g$, and $C(G_i = 1)$ and $C(G_i = 0)$ denote the compliers within the groups $G_i = 1$ and $G_i = 0$, respectively. The first term is the effect of education on cognitive ability among compliers with a high genetic predisposition, and the second term is the effect of education on cognitive ability among compliers with a low genetic predisposition. The 2SLS estimate of $\beta_3$ therefore combines effects from two potentially different groups.

If two features that are common in real-world settings hold simultaneously, this estimate can differ from the true interaction effect.

1. Compliers have different unobserved characteristics across levels of genetic predisposition, leading to differences in the first stage (the effect of the reform on education) by $G$.
2. The effects of education exhibit essential heterogeneity. Unobserved resistance to education is correlated with heterogeneity in the effect of education, which means that individuals select into education based on unobserved gains or losses.

In that case, 2SLS estimation cannot cleanly separate the interaction effect from shifts in the latent complier groups along the interaction variable. If only one of the two features is present, the 2SLS estimate coincides with the true interaction effect.

## Simulation model

To visualize how these two features, at different strengths, affect the 2SLS interaction estimate, I set up a simple illustrative simulation model using Claude.

Individuals fall into three types. Always-takers stay in school longer regardless of the reform, never-takers leave school earlier regardless of the reform, and compliers stay in school longer only if they are exposed to the reform. The horizontal axis orders individuals by their unobserved resistance to education, $U$, that is, how reluctant they are to stay in school longer. The width of each segment is the type's share within the group.

The two sliders let you manipulate the strengths of the two features. Increasing the first-stage gradient makes individuals with a high genetic predisposition, $G = 1$, more eager to stay in school. More of them become always-takers who stay in school even without the reform, and fewer remain compliers who stay in school only because of the reform. The selection-on-gains slider sets how steeply the effect of education on cognitive ability declines in $U$, so that individuals who are more willing to stay in school also gain more from it in terms of cognitive ability in old age. When either slider is at zero, the 2SLS estimate equals the true interaction effect.

<div class="sim">
  <div class="sim-controls">
    <div class="sim-slider">
      <label for="d"><span>First-stage gradient by $G$</span><output id="d-o"></output></label>
      <span class="hint">How strongly genetic predisposition shifts who complies with the reform</span>
      <input type="range" id="d" min="0" max="0.4" step="0.01" value="0">
    </div>
    <div class="sim-slider">
      <label for="s"><span>Selection on gains</span><output id="s-o"></output></label>
      <span class="hint">Heterogeneity in the effect of education by unobserved resistance to education, $U$</span>
      <input type="range" id="s" min="0" max="10" step="0.5" value="0">
    </div>
  </div>
  <div class="sim-legend">
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:8;stroke-opacity:.45"/><circle cx="14" cy="6" r="5" style="fill:var(--sim-g1);stroke:var(--theme);stroke-width:1.5"/></svg><span>Effect of education on cognitive ability for $G = 1$ compliers</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:8;stroke-opacity:.45"/><circle cx="14" cy="6" r="5" style="fill:var(--sim-g0);stroke:var(--theme);stroke-width:1.5"/></svg><span>Effect of education on cognitive ability for $G = 0$ compliers</span></span>
  </div>
  <div class="sim-chart" id="sim" role="img" aria-label="Effects of education on cognitive ability for G = 1 and G = 0 compliers, with the complier populations below on a shared axis of unobserved resistance to education"></div>
  <div class="sim-readout" id="readout"></div>
</div>

## A solution

A solution is to compare the effect of education on cognitive ability between the two groups for individuals with the same unobserved resistance to education. The marginal treatment effect (MTE) is the effect of education on cognitive ability for individuals with resistance $U_i = u$ in group $G_i = g$,

$$\mathrm{MTE}(u, g) = \mathrm{E}\big[Y_i^1(g) - Y_i^0(g) \mid U_i = u\big].$$

The interaction effect is the vertical difference between the MTE curves of the two groups at the same $u$. Averaging this difference over the range of $U$ where compliers from both groups are present keeps the estimate comparable to 2SLS and avoids extrapolation to always-takers and never-takers.

<div class="sim">
  <div class="sim-controls">
    <div class="sim-slider">
      <label for="d2"><span>First-stage gradient by $G$</span><output id="d2-o"></output></label>
      <span class="hint">How strongly genetic predisposition shifts who complies with the reform</span>
      <input type="range" id="d2" min="0" max="0.4" step="0.01" value="0">
    </div>
    <div class="sim-slider">
      <label for="s2"><span>Selection on gains</span><output id="s2-o"></output></label>
      <span class="hint">Heterogeneity in the effect of education by unobserved resistance to education, $U$</span>
      <input type="range" id="s2" min="0" max="10" step="0.5" value="0">
    </div>
  </div>
  <div class="sim-legend sim-legend-2col">
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:2"/></svg><span>MTE curve for $G = 1$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:2"/></svg><span>MTE curve for $G = 0$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:8;stroke-opacity:.45"/></svg><span>Complier share in $G = 1$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:8;stroke-opacity:.45"/></svg><span>Complier share in $G = 0$</span></span>
  </div>
  <div class="sim-chart" id="sol" role="img" aria-label="Effects of education on cognitive ability for G = 1 and G = 0 compliers, compared vertically within the range of U where compliers from both groups are present"></div>
  <div class="sim-readout" id="readout2"></div>
</div>

## In the paper

In the paper, we study how education and a polygenic index for educational attainment interact in determining cognitive ability in old age. Instead of a binary $G$, we use quintiles of the polygenic index. We use data from the English Longitudinal Study of Ageing and the compulsory schooling reform in the UK as the instrument. The MTE estimates show a clear complementarity, with the returns to schooling rising substantially with the polygenic index. 2SLS understates this interaction because both features described above are present.

We show how to estimate informative bounds on interaction effects by fitting flexible MTE curves that reproduce the data, following Mogstad, Santos and Torgovitsky (2018).

## References

- Hollenbach, J., Schmitz, H., and Westphal, M. (2026). Gene–Environment Interactions with Essential Heterogeneity. *The Economic Journal*. <https://doi.org/10.1093/ej/ueag010>
- Imbens, G. W., and Angrist, J. D. (1994). Identification and Estimation of Local Average Treatment Effects. *Econometrica*, 62(2), 467–475. <https://doi.org/10.2307/2951620>
- Mogstad, M., Santos, A., and Torgovitsky, A. (2018). Using Instrumental Variables for Inference About Policy Relevant Treatment Parameters. *Econometrica*, 86(5), 1589–1619. <https://doi.org/10.3982/ECTA15463>
