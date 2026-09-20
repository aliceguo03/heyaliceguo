# Responsive audit

Run: 2026-09-20T18:37:23.528Z

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
  - `<div>` .ticker-track — width 2263px, overflow +1854px

**375×667, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1842px

**393×852, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1837px

**393×852, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1825px

**430×932, top:**
  - `<div>` .ticker-track — width 2263px, overflow +1800px

**430×932, at rest:**
  - `<div>` .ticker-track — width 2263px, overflow +1788px

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
  - `<div>` .ticker-track — width 2749px, overflow +1539px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1525px

**1366×1024, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1355px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1340px

**1440×900, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1321px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1307px


## `/about`

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
  - `<div>` .ticker-track — width 3387px, overflow +2922px

**375×667, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2903px

**393×852, top:**
  - `<div>` .ticker-track — width 3387px, overflow +2904px

**393×852, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2886px

**430×932, top:**
  - `<div>` .ticker-track — width 3387px, overflow +2866px

**430×932, at rest:**
  - `<div>` .ticker-track — width 3387px, overflow +2848px

**744×1133, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3183px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3162px

**820×1180, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3106px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3084px

**1024×1366, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2910px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2889px

**1180×820, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2753px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2732px

**1366×1024, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2568px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2547px

**1440×900, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2514px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2493px


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
| 375×667 | top | 375 | 375 | 0 | 0 |
| 375×667 | at rest | 375 | 375 | 0 | 0 |
| 393×852 | top | 393 | 393 | 0 | 0 |
| 393×852 | at rest | 393 | 393 | 0 | 0 |
| 430×932 | top | 430 | 430 | 0 | 0 |
| 430×932 | at rest | 430 | 430 | 0 | 0 |
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
