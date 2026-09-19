# Responsive audit

Run: 2026-09-18T19:40:24.564Z

Headless Chromium, no touch emulation. Measure-only — no component code
changed as a result of this run. `.ticker-track` overflowing on every
page is expected (see the script's own header comment); it's clipped by
its parent's `overflow-hidden` and never shows up in the scrollWidth
delta.
## `/`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 375 | 0 | 1 |
| 375×667 | at rest | 375 | 375 | 0 | 1 |
| 393×852 | top | 393 | 393 | 0 | 1 |
| 393×852 | at rest | 393 | 393 | 0 | 1 |
| 430×932 | top | 430 | 430 | 0 | 1 |
| 430×932 | at rest | 430 | 430 | 0 | 1 |
| 744×1133 | top | 744 | 744 | 0 | 1 |
| 744×1133 | at rest | 744 | 744 | 0 | 1 |
| 820×1180 | top | 820 | 820 | 0 | 1 |
| 820×1180 | at rest | 820 | 820 | 0 | 1 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1853px

**375×667, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1841px

**393×852, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1837px

**393×852, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1825px

**430×932, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1800px

**430×932, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1789px

**744×1133, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1957px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1943px

**820×1180, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1881px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1867px

**1024×1366, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1697px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1682px

**1180×820, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1540px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1525px

**1366×1024, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1355px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1341px

**1440×900, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1321px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1306px


## `/about`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 622 | +247 | 14 |
| 375×667 | at rest | 375 | 622 | +247 | 14 |
| 393×852 | top | 393 | 631 | +238 | 14 |
| 393×852 | at rest | 393 | 631 | +238 | 14 |
| 430×932 | top | 430 | 649 | +219 | 14 |
| 430×932 | at rest | 430 | 649 | +219 | 14 |
| 744×1133 | top | 744 | 806 | +62 | 8 |
| 744×1133 | at rest | 744 | 806 | +62 | 8 |
| 820×1180 | top | 820 | 844 | +24 | 8 |
| 820×1180 | at rest | 820 | 844 | +24 | 8 |
| 1024×1366 | top | 1024 | 1024 | 0 | 7 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 7 |
| 1180×820 | top | 1180 | 1180 | 0 | 7 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 7 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .ticker-track — width 3387px, overflow +2924px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 868px, overflow +247px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px

**375×667, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2906px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 653px, overflow +828px
  - `<div>` .flex — width 868px, overflow +247px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px
  - `<div>` .shrink-0 — width 480px, overflow +175px

**393×852, top:**
  - `<div>` .ticker-track — width 3387px, overflow +2905px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 868px, overflow +238px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px

**393×852, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2888px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 653px, overflow +810px
  - `<div>` .flex — width 868px, overflow +238px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px
  - `<div>` .shrink-0 — width 480px, overflow +157px

**430×932, top:**
  - `<div>` .ticker-track — width 3387px, overflow +2869px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 868px, overflow +219px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px

**430×932, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2851px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 653px, overflow +773px
  - `<div>` .flex — width 868px, overflow +219px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px
  - `<div>` .shrink-0 — width 480px, overflow +120px

**744×1133, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3184px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 868px, overflow +62px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3162px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 868px, overflow +62px

**820×1180, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3107px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 868px, overflow +24px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3086px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 653px, overflow +383px
  - `<div>` .flex — width 868px, overflow +24px

**1024×1366, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2913px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2891px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px
  - `<div>` .flex — width 653px, overflow +189px

**1180×820, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2757px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2736px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px
  - `<div>` .flex — width 653px, overflow +33px

**1366×1024, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2571px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2550px

**1440×900, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2517px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2495px


## `/work/f3global`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 375 | 0 | 0 |
| 375×667 | at rest | 375 | 375 | 0 | 0 |
| 393×852 | top | 393 | 393 | 0 | 0 |
| 393×852 | at rest | 393 | 393 | 0 | 0 |
| 430×932 | top | 430 | 430 | 0 | 0 |
| 430×932 | at rest | 430 | 430 | 0 | 0 |
| 744×1133 | top | 744 | 744 | 0 | 1 |
| 744×1133 | at rest | 744 | 744 | 0 | 1 |
| 820×1180 | top | 820 | 820 | 0 | 1 |
| 820×1180 | at rest | 820 | 820 | 0 | 1 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**744×1133, top:**
  - `<div>` .absolute — width 1813px, overflow +535px

**744×1133, at rest:**
  - `<div>` .absolute — width 1813px, overflow +535px

**820×1180, top:**
  - `<div>` .absolute — width 1813px, overflow +497px

**820×1180, at rest:**
  - `<div>` .absolute — width 1813px, overflow +497px

**1024×1366, top:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1024×1366, at rest:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1180×820, top:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1180×820, at rest:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1366×1024, top:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1366×1024, at rest:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px


## `/work/chase`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 375 | 0 | 1 |
| 375×667 | at rest | 375 | 375 | 0 | 1 |
| 393×852 | top | 393 | 393 | 0 | 1 |
| 393×852 | at rest | 393 | 393 | 0 | 1 |
| 430×932 | top | 430 | 430 | 0 | 1 |
| 430×932 | at rest | 430 | 430 | 0 | 1 |
| 744×1133 | top | 744 | 744 | 0 | 0 |
| 744×1133 | at rest | 744 | 744 | 0 | 0 |
| 820×1180 | top | 820 | 820 | 0 | 0 |
| 820×1180 | at rest | 820 | 820 | 0 | 0 |
| 1024×1366 | top | 1024 | 1024 | 0 | 0 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 0 |
| 1180×820 | top | 1180 | 1180 | 0 | 0 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 0 |
| 1366×1024 | top | 1366 | 1366 | 0 | 0 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 0 |
| 1440×900 | top | 1440 | 1440 | 0 | 0 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 0 |

**375×667, top:**
  - `<div>` .flex — width 620px, overflow +286px

**375×667, at rest:**
  - `<div>` .flex — width 620px, overflow +286px

**393×852, top:**
  - `<div>` .flex — width 620px, overflow +268px

**393×852, at rest:**
  - `<div>` .flex — width 620px, overflow +268px

**430×932, top:**
  - `<div>` .flex — width 620px, overflow +231px

**430×932, at rest:**
  - `<div>` .flex — width 620px, overflow +231px


## `/work/geminicut`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 375 | 0 | 0 |
| 375×667 | at rest | 375 | 375 | 0 | 0 |
| 393×852 | top | 393 | 393 | 0 | 0 |
| 393×852 | at rest | 393 | 393 | 0 | 0 |
| 430×932 | top | 430 | 430 | 0 | 0 |
| 430×932 | at rest | 430 | 430 | 0 | 0 |
| 744×1133 | top | 744 | 744 | 0 | 1 |
| 744×1133 | at rest | 744 | 744 | 0 | 1 |
| 820×1180 | top | 820 | 820 | 0 | 1 |
| 820×1180 | at rest | 820 | 820 | 0 | 1 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**744×1133, top:**
  - `<div>` .absolute — width 1813px, overflow +535px

**744×1133, at rest:**
  - `<div>` .absolute — width 1813px, overflow +535px

**820×1180, top:**
  - `<div>` .absolute — width 1813px, overflow +497px

**820×1180, at rest:**
  - `<div>` .absolute — width 1813px, overflow +497px

**1024×1366, top:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1024×1366, at rest:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1180×820, top:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1180×820, at rest:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1366×1024, top:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1366×1024, at rest:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px


## `/work/blink`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 390 | +15 | 2 |
| 375×667 | at rest | 375 | 390 | +15 | 2 |
| 393×852 | top | 393 | 399 | +6 | 2 |
| 393×852 | at rest | 393 | 399 | +6 | 2 |
| 430×932 | top | 430 | 430 | 0 | 1 |
| 430×932 | at rest | 430 | 430 | 0 | 1 |
| 744×1133 | top | 744 | 744 | 0 | 2 |
| 744×1133 | at rest | 744 | 744 | 0 | 2 |
| 820×1180 | top | 820 | 820 | 0 | 1 |
| 820×1180 | at rest | 820 | 820 | 0 | 1 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .flex — width 692px, overflow +358px
  - `<span>` .inline-grid — width 352px, overflow +15px

**375×667, at rest:**
  - `<div>` .flex — width 692px, overflow +358px
  - `<span>` .inline-grid — width 352px, overflow +15px

**393×852, top:**
  - `<div>` .flex — width 692px, overflow +340px
  - `<span>` .inline-grid — width 352px, overflow +6px

**393×852, at rest:**
  - `<div>` .flex — width 692px, overflow +340px
  - `<span>` .inline-grid — width 352px, overflow +6px

**430×932, top:**
  - `<div>` .flex — width 692px, overflow +303px

**430×932, at rest:**
  - `<div>` .flex — width 692px, overflow +303px

**744×1133, top:**
  - `<div>` .absolute — width 1813px, overflow +535px
  - `<div>` .flex — width 692px, overflow +49px

**744×1133, at rest:**
  - `<div>` .absolute — width 1813px, overflow +535px
  - `<div>` .flex — width 692px, overflow +49px

**820×1180, top:**
  - `<div>` .absolute — width 1813px, overflow +497px

**820×1180, at rest:**
  - `<div>` .absolute — width 1813px, overflow +497px

**1024×1366, top:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1024×1366, at rest:**
  - `<div>` .absolute — width 1813px, overflow +395px

**1180×820, top:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1180×820, at rest:**
  - `<div>` .absolute — width 1813px, overflow +317px

**1366×1024, top:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1366×1024, at rest:**
  - `<div>` .absolute — width 1813px, overflow +224px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px
