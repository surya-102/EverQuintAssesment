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

Recursion with memoization (dynamic programming).

`build(used, value)`: `used` is the time spent so far and `value` is how much the finished buildings earn
per time unit.

At each step there are four choices:
- stop building, and earn `value` for the remaining time
- build a Theatre, a Pub or a Commercial Park, if it fits in the remaining time

During construction the existing buildings keep earning (`value * buildTime`), then the new building's
earnings are added to `value`. The best choice is returned, and results are cached in a map keyed on
`(used, value)` so each state is only solved once.

## How to run

You need a C++ compiler, for example g++ (MinGW / MSYS2 on Windows; `build-essential` on Linux; Xcode tools on macOS).

```bash
g++ -o profits profits.cpp
```

Run it and type the time units when prompted:

```bash
# Windows
profits.exe
# macOS / Linux
./profits
```

Or pass the input directly:

```bash
echo 13 | ./profits
```

## Test cases

| Input | Output |
|---|---|
| 7 | `Earnings: $3000` `T: 1 P: 0 C: 0` |
| 8 | `Earnings: $4500` `T: 1 P: 0 C: 0` |
| 13 | `Earnings: $16500` `T: 2 P: 0 C: 0` |

When several mixes give the same maximum earnings (for example `n = 7`, where `T: 1` and `P: 1` both earn
$3000), the program prints one of them.
