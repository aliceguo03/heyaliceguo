# Responsive audit

Run: 2026-09-15T19:20:07.442Z

Headless Chromium, no touch emulation. Measure-only — no component code
changed as a result of this run. `.ticker-track` overflowing on every
page is expected (see the script's own header comment); it's clipped by
its parent's `overflow-hidden` and never shows up in the scrollWidth
delta.
## `/`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 375 | 0 | 2 |
| 375×667 | at rest | 375 | 375 | 0 | 2 |
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
  - `<a>` .group — width 152px, overflow +13px

**375×667, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1841px
  - `<a>` .group — width 152px, overflow +13px

**393×852, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1836px

**393×852, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1824px

**430×932, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1798px

**430×932, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1787px

**744×1133, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1956px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1941px

**820×1180, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1879px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1865px

**1024×1366, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1695px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1681px

**1180×820, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1539px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1525px

**1366×1024, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1354px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1339px

**1440×900, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1321px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1307px


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
  - `<div>` .ticker-track — width 3387px, overflow +2906px
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
  - `<div>` .ticker-track — width 4036px, overflow +3183px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 653px, overflow +459px
  - `<div>` .flex — width 868px, overflow +62px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3161px
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
  - `<div>` .ticker-track — width 4036px, overflow +3085px
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
  - `<div>` .ticker-track — width 4036px, overflow +2570px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2549px

**1440×900, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2517px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2496px


## `/work/f3global`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 801 | +426 | 4 |
| 375×667 | at rest | 375 | 801 | +426 | 4 |
| 393×852 | top | 393 | 801 | +408 | 4 |
| 393×852 | at rest | 393 | 801 | +408 | 4 |
| 430×932 | top | 430 | 801 | +371 | 4 |
| 430×932 | at rest | 430 | 801 | +371 | 4 |
| 744×1133 | top | 744 | 818 | +74 | 4 |
| 744×1133 | at rest | 744 | 818 | +74 | 4 |
| 820×1180 | top | 820 | 820 | 0 | 2 |
| 820×1180 | at rest | 820 | 820 | 0 | 2 |
| 1024×1366 | top | 1024 | 1024 | 0 | 2 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 2 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**744×1133, top:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 132px, overflow +74px
  - `<span>` .inline-grid — width 72px, overflow +14px

**744×1133, at rest:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 132px, overflow +74px
  - `<span>` .inline-grid — width 72px, overflow +14px

**820×1180, top:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 929px, overflow +210px

**820×1180, at rest:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 929px, overflow +210px

**1024×1366, top:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 929px, overflow +6px

**1024×1366, at rest:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 929px, overflow +6px

**1180×820, top:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1180×820, at rest:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1366×1024, top:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1366×1024, at rest:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px


## `/work/chase`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 801 | +426 | 3 |
| 375×667 | at rest | 375 | 801 | +426 | 3 |
| 393×852 | top | 393 | 801 | +408 | 3 |
| 393×852 | at rest | 393 | 801 | +408 | 3 |
| 430×932 | top | 430 | 801 | +371 | 3 |
| 430×932 | at rest | 430 | 801 | +371 | 3 |
| 744×1133 | top | 744 | 818 | +74 | 3 |
| 744×1133 | at rest | 744 | 818 | +74 | 3 |
| 820×1180 | top | 820 | 820 | 0 | 1 |
| 820×1180 | at rest | 820 | 820 | 0 | 1 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 0 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 0 |
| 1366×1024 | top | 1366 | 1366 | 0 | 0 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 0 |
| 1440×900 | top | 1440 | 1440 | 0 | 0 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 0 |

**375×667, top:**
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**375×667, at rest:**
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**393×852, top:**
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**393×852, at rest:**
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**430×932, top:**
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**430×932, at rest:**
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**744×1133, top:**
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 132px, overflow +74px
  - `<span>` .inline-grid — width 72px, overflow +14px

**744×1133, at rest:**
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 132px, overflow +74px
  - `<span>` .inline-grid — width 72px, overflow +14px

**820×1180, top:**
  - `<div>` .flex — width 929px, overflow +210px

**820×1180, at rest:**
  - `<div>` .flex — width 929px, overflow +210px

**1024×1366, top:**
  - `<div>` .flex — width 929px, overflow +6px

**1024×1366, at rest:**
  - `<div>` .flex — width 929px, overflow +6px


## `/work/geminicut`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 1043 | +668 | 4 |
| 375×667 | at rest | 375 | 1043 | +668 | 4 |
| 393×852 | top | 393 | 1043 | +650 | 4 |
| 393×852 | at rest | 393 | 1043 | +650 | 4 |
| 430×932 | top | 430 | 1043 | +613 | 4 |
| 430×932 | at rest | 430 | 1043 | +613 | 4 |
| 744×1133 | top | 744 | 1043 | +299 | 3 |
| 744×1133 | at rest | 744 | 1043 | +299 | 3 |
| 820×1180 | top | 820 | 1043 | +223 | 3 |
| 820×1180 | at rest | 820 | 1043 | +223 | 3 |
| 1024×1366 | top | 1024 | 1043 | +19 | 3 |
| 1024×1366 | at rest | 1024 | 1043 | +19 | 3 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 510px, overflow +668px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 510px, overflow +668px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 510px, overflow +650px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 510px, overflow +650px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 510px, overflow +613px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 510px, overflow +613px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**744×1133, top:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 510px, overflow +299px
  - `<div>` .flex — width 929px, overflow +286px

**744×1133, at rest:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 510px, overflow +299px
  - `<div>` .flex — width 929px, overflow +286px

**820×1180, top:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 510px, overflow +223px
  - `<div>` .flex — width 929px, overflow +210px

**820×1180, at rest:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 510px, overflow +223px
  - `<div>` .flex — width 929px, overflow +210px

**1024×1366, top:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 510px, overflow +19px
  - `<div>` .flex — width 929px, overflow +6px

**1024×1366, at rest:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 510px, overflow +19px
  - `<div>` .flex — width 929px, overflow +6px

**1180×820, top:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1180×820, at rest:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1366×1024, top:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1366×1024, at rest:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px


## `/work/blink`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 885 | +510 | 4 |
| 375×667 | at rest | 375 | 885 | +510 | 4 |
| 393×852 | top | 393 | 885 | +492 | 4 |
| 393×852 | at rest | 393 | 885 | +492 | 4 |
| 430×932 | top | 430 | 885 | +455 | 4 |
| 430×932 | at rest | 430 | 885 | +455 | 4 |
| 744×1133 | top | 744 | 885 | +141 | 5 |
| 744×1133 | at rest | 744 | 885 | +141 | 5 |
| 820×1180 | top | 820 | 885 | +65 | 3 |
| 820×1180 | at rest | 820 | 885 | +65 | 3 |
| 1024×1366 | top | 1024 | 1024 | 0 | 2 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 2 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 172px, overflow +330px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 172px, overflow +312px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 172px, overflow +275px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px

**744×1133, top:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 352px, overflow +141px
  - `<span>` .inline-grid — width 126px, overflow +68px
  - `<span>` .inline-grid — width 116px, overflow +57px

**744×1133, at rest:**
  - `<div>` .absolute — width 2395px, overflow +826px
  - `<div>` .flex — width 929px, overflow +286px
  - `<span>` .inline-grid — width 352px, overflow +141px
  - `<span>` .inline-grid — width 126px, overflow +68px
  - `<span>` .inline-grid — width 116px, overflow +57px

**820×1180, top:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 929px, overflow +210px
  - `<span>` .inline-grid — width 352px, overflow +65px

**820×1180, at rest:**
  - `<div>` .absolute — width 2395px, overflow +788px
  - `<div>` .flex — width 929px, overflow +210px
  - `<span>` .inline-grid — width 352px, overflow +65px

**1024×1366, top:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 929px, overflow +6px

**1024×1366, at rest:**
  - `<div>` .absolute — width 2395px, overflow +686px
  - `<div>` .flex — width 929px, overflow +6px

**1180×820, top:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1180×820, at rest:**
  - `<div>` .absolute — width 2395px, overflow +608px

**1366×1024, top:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1366×1024, at rest:**
  - `<div>` .absolute — width 2395px, overflow +515px

**1440×900, top:**
  - `<div>` .absolute — width 2395px, overflow +478px

**1440×900, at rest:**
  - `<div>` .absolute — width 2395px, overflow +478px
