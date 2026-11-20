# Max Profit Problem

Algorithm assignment, solved in **C++**.

## Problem

Mr. X can build Theatres, Pubs and Commercial Parks, one at a time. A building starts earning money for every
unit of time it is operational. Given the total time `n`, find every mix of buildings that earns the most.

| Building | Build time | Earnings per time unit |
|---|---|---|
| Theatre (T) | 5 | $1500 |
| Pub (P) | 4 | $1000 |
| Commercial Park (C) | 10 | $2000 |

## Two versions

The only difference is how a building that finishes **exactly at time `n`** is treated. It is never
operational, so it earns $0.

| File | Rule | Use |
|---|---|---|
| `profits.cpp` / `profits.exe` | A building is only counted if it finishes before `n` and earns at least one unit. | **Main solution** |
| `profit_zero_earn.cpp` / `profit_zero_earn.exe` | Buildings that finish exactly at `n` (earning $0) are also listed, as long as the total is still the maximum. | Alternative interpretation |

Example for `n = 49` (maximum earnings $324000):

| profits | profit_zero_earn |
|---|---|
| T: 8 P: 2 C: 0<br>T: 9 P: 0 C: 0 | T: 8 P: 2 C: 0<br>T: 9 P: 0 C: 0<br>T: 9 P: 1 C: 0 |

In `T: 9 P: 1`, the pub is finished at time 49 and never earns anything.

## Approach

Bottom-up dynamic programming over time.

`dp[t]` holds the maximum profit possible with `t` time units, plus every building mix that reaches it.

For each `t`, try building each type first:
- it takes `d` time units to build, leaving `rem = t - d`
- it then earns `rate` for each of the `rem` remaining units
- the rest of the time is used in the best possible way, which is `dp[rem]`

```
dp[t] = max over buildings of ( rem * rate + dp[rem].profit )
```

When two choices give the same profit, both of their mixes are kept, so all optimal combinations are printed.
`long long` is used so large inputs don't overflow (for example `n = 1000000` earns $149999250001000).

The two versions differ in one condition: `profits.cpp` skips a building when `t <= d` (it would earn nothing),
`profit_zero_earn.cpp` only skips it when `t < d`.

## How to run

### Option 1: use the ready-made exe (Windows)

Both `.exe` files run on any Windows PC, with nothing to install. Double-click one, or run it from a terminal:

```bash
profits.exe
profit_zero_earn.exe
```

Type the time units when asked and press Enter.

### Option 2: compile it yourself

You need a C++ compiler, for example g++ (MinGW / MSYS2 on Windows; `build-essential` on Linux; Xcode tools on macOS).

```bash
g++ -o profits profits.cpp
./profits

g++ -o profit_zero_earn profit_zero_earn.cpp
./profit_zero_earn
```

## Test cases (profits)

| Input | Output |
|---|---|
| 7 | Earnings: $3000<br>T: 0 P: 1 C: 0<br>T: 1 P: 0 C: 0 |
| 8 | Earnings: $4500<br>T: 1 P: 0 C: 0 |
| 13 | Earnings: $16500<br>T: 2 P: 0 C: 0 |
| 49 | Earnings: $324000<br>T: 8 P: 2 C: 0<br>T: 9 P: 0 C: 0 |

Example run:

```
Enter time units : 49
Earnings: $324000
Solutions
T: 8 P: 2 C: 0
T: 9 P: 0 C: 0
```
