function calculateWater() {
    const input = document.getElementById("heights").value;
    const height = input.split(",").map(x => x.trim());
    if (height.length<3) {
        alert("Enter at least 3 valid integers.");
        return;
    }

    const arr = height.map(Number);
    const n = arr.length;
    const leftMax = new Array(n);
    leftMax[0] = arr[0];
    for (let i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i - 1],arr[i]);
    }

    const rightMax = new Array(n);
    rightMax[n - 1] = arr[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i + 1],arr[i]);
    }

    const water = [];
    let total = 0;
    for (let i = 0; i < n; i++) {
        const trapped = Math.max(0,Math.min(leftMax[i], rightMax[i]) - arr[i]);
        water.push(trapped);
        total += trapped;
    }


    document.getElementById("result").innerText = `Output: ${total} Units`;
    drawSVG(arr, water, leftMax, rightMax);
}


function drawSVG(arr, water, leftMax, rightMax) {

    const cellWidth = 55;
    const cellHeight = 20;
    const maxHeight = Math.max(...arr);
    const width = arr.length * cellWidth;
    const height = maxHeight * cellHeight;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" >`;

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < maxHeight; j++) {
            const x = i * cellWidth;
            const y = j * cellHeight;
            svg += `
                <rect
                    x="${x}"
                    y="${y}"
                    width="${cellWidth}"
                    height="${cellHeight}"
                    fill="white"
                    stroke="black"
                    stroke-width="0.7"
                />
            `;
        }
    }

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i]; j++) {
            const x = i * cellWidth;
            const y = height - (j + 1) * cellHeight;
            svg += `
                <rect
                    x="${x}"
                    y="${y}"
                    width="${cellWidth}"
                    height="${cellHeight}"
                    fill="#F5EA00"
                    stroke="black"
                    stroke-width="0.7"
                />
            `;
        }


        for (let j = 0; j < water[i]; j++) {
            const x = i * cellWidth;
            const y = height -
                (arr[i] + j + 1) * cellHeight;
            svg += `
                <rect
                    x="${x}"
                    y="${y}"
                    width="${cellWidth}"
                    height="${cellHeight}"
                    fill="#08A9DC"
                    stroke="black"
                    stroke-width="0.7"
                />
            `;
        }
    }

    svg += "</svg>";
    document.getElementById("visualization").innerHTML = svg;
}


calculateWater();