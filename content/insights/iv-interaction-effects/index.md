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

Here, I go over the intuition for why conventional instrumental variable estimates of interaction effects can be misleading when treatment effects are heterogeneous. We study this problem in our paper [“Gene–Environment Interactions with Essential Heterogeneity”](https://doi.org/10.1093/ej/ueag010) (with Hendrik Schmitz and Matthias Westphal).

## Setup

Interaction models are typically specified as

$$Y_i = \beta_0 + \beta_1 D_i + \beta_2 I_i + \beta_3\, D_i \times I_i + \varepsilon_i.$$

Suppose that

- $D_i \in \{0, 1\}$ is a binary treatment, and
- $I_i \in \{0, 1\}$ is a binary pre-determined interaction variable.

We are interested in the interaction effect $\beta_3$, which tells us how the effect of $D$ on $Y$ varies with $I$.

Treatment is often endogenous and is therefore instrumented by a valid binary instrument $Z$. With heterogeneous treatment effects, instrumental variable estimation identifies only the average effect for compliers, that is, for individuals who take the treatment only because of the instrument (the local average treatment effect; Imbens and Angrist, 1994). Two-stage least squares (2SLS) estimation therefore computes $\hat\beta_3$ as the difference between two such effects,

$$\hat\beta_3 = \mathrm{E}\big[Y_i^1(1) - Y_i^0(1) \mid C(I_i = 1)\big] - \mathrm{E}\big[Y_i^1(0) - Y_i^0(0) \mid C(I_i = 0)\big],$$

where $Y_i^d(k)$ is the potential outcome of individual $i$ with treatment $D_i = d$ and interaction variable $I_i = k$, and $C(I_i = 1)$ and $C(I_i = 0)$ denote the compliers within the groups $I_i = 1$ and $I_i = 0$, respectively. The first term is the effect of $D$ on $Y$ among compliers with $I_i = 1$, and the second term is the effect of $D$ on $Y$ among compliers with $I_i = 0$. The 2SLS estimate of $\beta_3$ therefore combines effects from two potentially different groups.

If two features that are common in real-world settings hold simultaneously, this estimate can differ from the true interaction effect.

1. Compliers have different unobserved characteristics across strata of the interaction variable, leading to differences in the first stage (the effect of $Z$ on $D$) by $I$.
2. Treatment effects exhibit essential heterogeneity. Unobserved resistance to treatment is correlated with treatment effect heterogeneity, which means that individuals select into treatment based on unobserved gains or losses.

In that case, 2SLS estimation cannot cleanly separate the interaction effect from shifts in the latent complier groups along the interaction variable. If only one of the two features is present, the 2SLS estimate coincides with the true interaction effect.

## Simulation model

To visualize how these two features, at different strengths, affect the 2SLS interaction estimate, I set up a simple illustrative simulation model using Claude.

Individuals fall into three types. Always-takers take the treatment regardless of the instrument, never-takers never take it, and compliers take it only if $Z_i = 1$. The horizontal axis orders individuals by their unobserved resistance to taking the treatment, $U$. The width of each segment is the type's share within the subgroup.

The two sliders let you manipulate the strengths of the two features. Increasing the first-stage gradient makes individuals with $I = 1$ more eager to take the treatment. More of them become always-takers, and fewer remain compliers who take the treatment only because of the instrument. The selection-on-gains slider sets how steeply the effect of $D$ on $Y$ declines in $U$, so that individuals who are more willing to take the treatment also gain more from it. When either slider is at zero, the 2SLS estimate equals the true interaction effect.

<div class="sim">
  <div class="sim-controls">
    <div class="sim-slider">
      <label for="d"><span>First-stage gradient by $I$</span><output id="d-o"></output></label>
      <span class="hint">How strongly $I$ shifts who complies</span>
      <input type="range" id="d" min="0" max="0.4" step="0.01" value="0">
    </div>
    <div class="sim-slider">
      <label for="s"><span>Selection on gains</span><output id="s-o"></output></label>
      <span class="hint">Treatment effect heterogeneity by unobserved resistance to taking the treatment, $U$</span>
      <input type="range" id="s" min="0" max="10" step="0.5" value="0">
    </div>
  </div>
  <div class="sim-legend">
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:8;stroke-opacity:.45"/><circle cx="14" cy="6" r="5" style="fill:var(--sim-g1);stroke:var(--theme);stroke-width:1.5"/></svg><span>Effect of $D$ on $Y$ for $I = 1$ compliers</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:8;stroke-opacity:.45"/><circle cx="14" cy="6" r="5" style="fill:var(--sim-g0);stroke:var(--theme);stroke-width:1.5"/></svg><span>Effect of $D$ on $Y$ for $I = 0$ compliers</span></span>
  </div>
  <div class="sim-chart" id="sim" role="img" aria-label="Effects of D on Y for I = 1 and I = 0 compliers, with the complier populations below on a shared axis of unobserved resistance to taking the treatment"></div>
  <div class="sim-readout" id="readout"></div>
</div>

## A solution

A solution is to compare the effect of $D$ on $Y$ between the two groups for individuals with the same unobserved resistance to taking the treatment. The marginal treatment effect (MTE) is the effect of $D$ on $Y$ for individuals with resistance $U_i = u$ in group $I_i = k$,

$$\mathrm{MTE}(u, k) = \mathrm{E}\big[Y_i^1(k) - Y_i^0(k) \mid U_i = u\big].$$

The interaction effect is the vertical difference between the MTE curves of the two groups at the same $u$. Averaging this difference over the range of $U$ where compliers from both groups are present keeps the estimate comparable to 2SLS and avoids extrapolation to always-takers and never-takers.

<div class="sim">
  <div class="sim-controls">
    <div class="sim-slider">
      <label for="d2"><span>First-stage gradient by $I$</span><output id="d2-o"></output></label>
      <span class="hint">How strongly $I$ shifts who complies</span>
      <input type="range" id="d2" min="0" max="0.4" step="0.01" value="0">
    </div>
    <div class="sim-slider">
      <label for="s2"><span>Selection on gains</span><output id="s2-o"></output></label>
      <span class="hint">Treatment effect heterogeneity by unobserved resistance to taking the treatment, $U$</span>
      <input type="range" id="s2" min="0" max="10" step="0.5" value="0">
    </div>
  </div>
  <div class="sim-legend sim-legend-2col">
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:2"/></svg><span>MTE curve for $I = 1$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:2"/></svg><span>MTE curve for $I = 0$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g1);stroke-width:8;stroke-opacity:.45"/></svg><span>Complier share in $I = 1$</span></span>
    <span><svg width="28" height="12" aria-hidden="true"><line x1="0" x2="28" y1="6" y2="6" style="stroke:var(--sim-g0);stroke-width:8;stroke-opacity:.45"/></svg><span>Complier share in $I = 0$</span></span>
  </div>
  <div class="sim-chart" id="sol" role="img" aria-label="Effects of D on Y for I = 1 and I = 0 compliers, compared vertically within the range of U where compliers from both groups are present"></div>
  <div class="sim-readout" id="readout2"></div>
</div>

## In the paper

In the paper, we study how education and a polygenic index for educational attainment interact in determining memory in old age. We use data from the English Longitudinal Study of Ageing and a compulsory schooling reform in the UK as the instrument. The MTE estimates show a clear complementarity, with the returns to schooling rising substantially with the polygenic index. 2SLS understates this interaction because both features described above are present.

We show how to estimate informative bounds on interaction effects by fitting flexible MTE curves that reproduce the data, following Mogstad, Santos and Torgovitsky (2018).

## References

- Hollenbach, J., Schmitz, H., and Westphal, M. (2026). Gene–Environment Interactions with Essential Heterogeneity. *The Economic Journal*. <https://doi.org/10.1093/ej/ueag010>
- Imbens, G. W., and Angrist, J. D. (1994). Identification and Estimation of Local Average Treatment Effects. *Econometrica*, 62(2), 467–475. <https://doi.org/10.2307/2951620>
- Mogstad, M., Santos, A., and Torgovitsky, A. (2018). Using Instrumental Variables for Inference About Policy Relevant Treatment Parameters. *Econometrica*, 86(5), 1589–1619. <https://doi.org/10.3982/ECTA15463>
