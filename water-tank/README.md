# Water Tank Problem

Frontend algorithm assignment, built with **vanilla JavaScript, HTML and CSS** (no libraries, no build step).

## Problem

Given an array of block heights (each `>= 0`), compute how many units of water are trapped between the
blocks, and draw the result.

Example: `[0,4,0,0,0,6,0,6,4,0]` gives **18 units**.

## How to run

No installation needed. Open `index.html` in any browser (double-click the file).

1. Enter block heights separated by commas, for example `0,4,0,0,0,6,0,6,4,0`
2. Click **Calculate**
3. The total trapped water is shown, and an SVG grid draws the blocks in **yellow** and the water in **blue**

## Approach

For each position, the water above it is:

```
water[i] = min(tallest block on the left, tallest block on the right) - height[i]
```

- `leftMax[i]`: tallest block from the start up to `i`
- `rightMax[i]`: tallest block from `i` to the end
- total = sum of `water[i]`

This runs in O(n) time with two passes to build `leftMax` and `rightMax`.

The drawing is generated as an SVG: one cell per unit of height, with each column showing its block cells
followed by its water cells.

## Files

```
index.html   page layout and input
script.js    calculation (calculateWater) and drawing (drawSVG)
style.css    styling
```
