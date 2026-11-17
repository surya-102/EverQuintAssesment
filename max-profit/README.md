# Max Profit Problem

Algorithm assignment, solved in **C++**.

## Problem

Mr. X can build Theatres, Pubs and Commercial Parks, one at a time. A building starts earning money for every
unit of time it is operational. Given the total time `n`, find the mix of buildings that earns the most.

| Building | Build time | Earnings per time unit |
|---|---|---|
| Theatre (T) | 5 | $1500 |
| Pub (P) | 4 | $1000 |
| Commercial Park (C) | 10 | $2000 |

## Approach

Bottom-up dynamic programming over time.

`dp[t]` holds the maximum profit possible with `t` time units left, plus every building mix that reaches it.

For each `t`, try building each type first:
- it takes `d` time units to build, leaving `rem = t - d`
- it then earns `rate` for each of the `rem` remaining units
- the rest of the time is used in the best possible way, which is `dp[rem]`

```
dp[t] = max over buildings of ( rem * rate + dp[rem].profit )
```

A building that finishes exactly at the end (`t == d`) never earns anything, so it is skipped.
When two choices give the same profit, both of their mixes are kept, so **all optimal solutions are printed**.

Time complexity is O(n) states with 3 choices each.

## How to run

### Option 1: use the ready-made exe (Windows)

`profits.exe` is included and runs on any Windows PC, with nothing to install. Double-click it, or run it
from a terminal:

```bash
profits.exe
```

Type the time units when asked and press Enter.

### Option 2: compile it yourself

You need a C++ compiler, for example g++ (MinGW / MSYS2 on Windows; `build-essential` on Linux; Xcode tools on macOS).

```bash
g++ -o profits profits.cpp
./profits
```

## Test cases

| Input | Output |
|---|---|
| 7 | Earnings: $3000<br>T: 0 P: 1 C: 0<br>T: 1 P: 0 C: 0 |
| 8 | Earnings: $4500<br>T: 1 P: 0 C: 0 |
| 13 | Earnings: $16500<br>T: 2 P: 0 C: 0 |

Example run:

```
Enter time units : 7
Earnings: $3000
Solutions
T: 0 P: 1 C: 0
T: 1 P: 0 C: 0
```
