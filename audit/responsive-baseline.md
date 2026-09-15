# Responsive audit

Run: 2026-09-15T01:25:47.241Z

Headless Chromium, no touch emulation. Measure-only — no component code
changed as a result of this run. `.ticker-track` overflowing on every
page is expected (see the script's own header comment); it's clipped by
its parent's `overflow-hidden` and never shows up in the scrollWidth
delta.
## `/`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 519 | +144 | 9 |
| 375×667 | at rest | 375 | 519 | +144 | 9 |
| 393×852 | top | 393 | 528 | +135 | 9 |
| 393×852 | at rest | 393 | 528 | +135 | 9 |
| 430×932 | top | 430 | 546 | +116 | 8 |
| 430×932 | at rest | 430 | 546 | +116 | 8 |
| 744×1133 | top | 744 | 744 | 0 | 5 |
| 744×1133 | at rest | 744 | 744 | 0 | 5 |
| 820×1180 | top | 820 | 820 | 0 | 5 |
| 820×1180 | at rest | 820 | 820 | 0 | 5 |
| 1024×1366 | top | 1024 | 1024 | 0 | 1 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 1 |
| 1180×820 | top | 1180 | 1180 | 0 | 1 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 1 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .ticker-track — width 2749px, overflow +2332px
  - `<div>` .relative — width 686px, overflow +155px
  - `<div>` .relative — width 665px, overflow +145px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<section>` .my-auto — width 657px, overflow +141px
  - `<div>` .relative — width 625px, overflow +125px
  - `<div>` .relative — width 605px, overflow +115px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +2318px
  - `<div>` .relative — width 686px, overflow +155px
  - `<div>` .relative — width 665px, overflow +145px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<section>` .my-auto — width 657px, overflow +141px
  - `<div>` .relative — width 625px, overflow +125px
  - `<div>` .relative — width 605px, overflow +115px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .ticker-track — width 2749px, overflow +2317px
  - `<div>` .relative — width 686px, overflow +146px
  - `<div>` .relative — width 665px, overflow +136px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<section>` .my-auto — width 657px, overflow +132px
  - `<div>` .relative — width 625px, overflow +116px
  - `<div>` .relative — width 605px, overflow +106px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +2302px
  - `<div>` .relative — width 686px, overflow +146px
  - `<div>` .relative — width 665px, overflow +136px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<section>` .my-auto — width 657px, overflow +132px
  - `<div>` .relative — width 625px, overflow +116px
  - `<div>` .relative — width 605px, overflow +106px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .ticker-track — width 2749px, overflow +2282px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<section>` .my-auto — width 657px, overflow +114px
  - `<div>` .flex — width 162px, overflow +26px

**430×932, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +2267px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .relative — width 863px, overflow +433px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<section>` .my-auto — width 657px, overflow +114px
  - `<div>` .flex — width 162px, overflow +26px

**744×1133, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1964px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1949px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px
  - `<div>` .relative — width 863px, overflow +119px

**820×1180, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1888px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1873px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px
  - `<div>` .relative — width 863px, overflow +43px

**1024×1366, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1682px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1668px

**1180×820, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1525px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1510px

**1366×1024, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1340px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1326px

**1440×900, top:**
  - `<div>` .ticker-track — width 2749px, overflow +1271px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 2749px, overflow +1257px


## `/about`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 622 | +247 | 17 |
| 375×667 | at rest | 375 | 622 | +247 | 17 |
| 393×852 | top | 393 | 631 | +238 | 7 |
| 393×852 | at rest | 393 | 631 | +238 | 7 |
| 430×932 | top | 430 | 649 | +219 | 6 |
| 430×932 | at rest | 430 | 649 | +219 | 6 |
| 744×1133 | top | 744 | 806 | +62 | 3 |
| 744×1133 | at rest | 744 | 806 | +62 | 3 |
| 820×1180 | top | 820 | 844 | +24 | 3 |
| 820×1180 | at rest | 820 | 844 | +24 | 3 |
| 1024×1366 | top | 1024 | 1024 | 0 | 2 |
| 1024×1366 | at rest | 1024 | 1024 | 0 | 2 |
| 1180×820 | top | 1180 | 1180 | 0 | 2 |
| 1180×820 | at rest | 1180 | 1180 | 0 | 2 |
| 1366×1024 | top | 1366 | 1366 | 0 | 1 |
| 1366×1024 | at rest | 1366 | 1366 | 0 | 1 |
| 1440×900 | top | 1440 | 1440 | 0 | 1 |
| 1440×900 | at rest | 1440 | 1440 | 0 | 1 |

**375×667, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3579px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 868px, overflow +247px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3557px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 653px, overflow +858px
  - `<div>` .flex — width 868px, overflow +247px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .shrink-0 — width 480px, overflow +205px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3564px
  - `<div>` .flex — width 653px, overflow +840px
  - `<div>` .flex — width 868px, overflow +238px
  - `<div>` data-testid="about-text-window" — width 480px, overflow +187px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3543px
  - `<div>` .flex — width 653px, overflow +840px
  - `<div>` .flex — width 868px, overflow +238px
  - `<div>` data-testid="about-text-window" — width 480px, overflow +187px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3526px
  - `<div>` .flex — width 653px, overflow +803px
  - `<div>` .flex — width 868px, overflow +219px
  - `<div>` data-testid="about-text-window" — width 480px, overflow +150px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` .flex — width 162px, overflow +26px

**430×932, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3505px
  - `<div>` .flex — width 653px, overflow +803px
  - `<div>` .flex — width 868px, overflow +219px
  - `<div>` data-testid="about-text-window" — width 480px, overflow +150px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` .flex — width 162px, overflow +26px

**744×1133, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3211px
  - `<div>` .flex — width 653px, overflow +489px
  - `<div>` .flex — width 868px, overflow +62px

**744×1133, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3190px
  - `<div>` .flex — width 653px, overflow +489px
  - `<div>` .flex — width 868px, overflow +62px

**820×1180, top:**
  - `<div>` .ticker-track — width 4036px, overflow +3135px
  - `<div>` .flex — width 653px, overflow +413px
  - `<div>` .flex — width 868px, overflow +24px

**820×1180, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +3113px
  - `<div>` .flex — width 653px, overflow +413px
  - `<div>` .flex — width 868px, overflow +24px

**1024×1366, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2929px
  - `<div>` .flex — width 653px, overflow +209px

**1024×1366, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2907px
  - `<div>` .flex — width 653px, overflow +209px

**1180×820, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2771px
  - `<div>` .flex — width 653px, overflow +53px

**1180×820, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2750px
  - `<div>` .flex — width 653px, overflow +53px

**1366×1024, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2585px

**1366×1024, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2564px

**1440×900, top:**
  - `<div>` .ticker-track — width 4036px, overflow +2517px

**1440×900, at rest:**
  - `<div>` .ticker-track — width 4036px, overflow +2496px


## `/work/f3global`

| viewport | pass | clientWidth | scrollWidth | delta | offenders |
|---|---|---|---|---|---|
| 375×667 | top | 375 | 818 | +443 | 7 |
| 375×667 | at rest | 375 | 818 | +443 | 7 |
| 393×852 | top | 393 | 818 | +425 | 7 |
| 393×852 | at rest | 393 | 818 | +425 | 7 |
| 430×932 | top | 430 | 818 | +388 | 6 |
| 430×932 | at rest | 430 | 818 | +388 | 6 |
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
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

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
| 375×667 | top | 375 | 818 | +443 | 6 |
| 375×667 | at rest | 375 | 818 | +443 | 6 |
| 393×852 | top | 393 | 818 | +425 | 6 |
| 393×852 | at rest | 393 | 818 | +425 | 6 |
| 430×932 | top | 430 | 818 | +388 | 5 |
| 430×932 | at rest | 430 | 818 | +388 | 5 |
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
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

**430×932, at rest:**
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

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
| 375×667 | top | 375 | 1043 | +668 | 7 |
| 375×667 | at rest | 375 | 1043 | +668 | 7 |
| 393×852 | top | 393 | 1043 | +650 | 7 |
| 393×852 | at rest | 393 | 1043 | +650 | 7 |
| 430×932 | top | 430 | 1043 | +613 | 6 |
| 430×932 | at rest | 430 | 1043 | +613 | 6 |
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
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +90px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 510px, overflow +668px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +90px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 510px, overflow +650px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +72px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 510px, overflow +650px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +72px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 510px, overflow +613px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +35px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 510px, overflow +613px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +35px

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
| 375×667 | top | 375 | 885 | +510 | 7 |
| 375×667 | at rest | 375 | 885 | +510 | 7 |
| 393×852 | top | 393 | 885 | +492 | 7 |
| 393×852 | at rest | 393 | 885 | +492 | 7 |
| 430×932 | top | 430 | 885 | +455 | 6 |
| 430×932 | at rest | 430 | 885 | +455 | 6 |
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
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**375×667, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1010px
  - `<div>` .flex — width 929px, overflow +655px
  - `<div>` .flex — width 206px, overflow +364px
  - `<div>` .absolute — width 663px, overflow +144px
  - `<div>` data-info-panel="true" — width 383px, overflow +108px
  - `<div>` .flex — width 162px, overflow +81px
  - `<p>` .text-mono — width 119px, overflow +22px

**393×852, top:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**393×852, at rest:**
  - `<div>` .absolute — width 2395px, overflow +1001px
  - `<div>` .flex — width 929px, overflow +637px
  - `<div>` .flex — width 206px, overflow +346px
  - `<div>` .absolute — width 663px, overflow +135px
  - `<div>` data-info-panel="true" — width 383px, overflow +90px
  - `<div>` .flex — width 162px, overflow +63px
  - `<p>` .text-mono — width 119px, overflow +4px

**430×932, top:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

**430×932, at rest:**
  - `<div>` .absolute — width 2395px, overflow +983px
  - `<div>` .flex — width 929px, overflow +600px
  - `<div>` .flex — width 206px, overflow +309px
  - `<div>` .absolute — width 663px, overflow +116px
  - `<div>` data-info-panel="true" — width 383px, overflow +53px
  - `<div>` .flex — width 162px, overflow +26px

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
