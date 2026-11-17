# EverQuint Assessment

Solutions to the EverQuint Full Stack interview assignments. Each project is in its own folder with its own README.

| Folder | Assignment | Tech |
|---|---|---|
| [`team-workflow-board/`](./team-workflow-board) | Frontend: Team Workflow Board | React, TypeScript, Vite |
| [`meeting-room-booking/`](./meeting-room-booking) | Backend: Meeting Room Booking Service | Python, Flask, SQLite |
| [`max-profit/`](./max-profit) | Algorithm: Max Profit | C++ |
| [`water-tank/`](./water-tank) | Algorithm: Water Tank | Vanilla JavaScript, HTML, CSS |

```bash
git clone https://github.com/surya-102/EverQuintAssesment.git
cd EverQuintAssesment
```

## Team Workflow Board

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
cd team-workflow-board
npm install
npm run dev      # open http://localhost:5173
npm test         # run the tests
npm run build    # type-check and build to dist/
```

Details: [team-workflow-board/README.md](./team-workflow-board/README.md)

## Meeting Room Booking Service

Requires Python 3.10 or newer.

```bash
cd meeting-room-booking
python -m venv .venv
.venv\Scripts\activate          # Windows  (macOS / Linux: source .venv/bin/activate)
pip install -r requirements.txt
python app.py                   # API at http://127.0.0.1:5000
pytest -v                       # run the tests
```

Details: [meeting-room-booking/README.md](./meeting-room-booking/README.md) and [DESIGN.md](./meeting-room-booking/DESIGN.md)

## Max Profit

On Windows, just run the included `max-profit/profits.exe` (no compiler needed) and enter the time units.

Or compile it yourself with a C++ compiler such as g++:

```bash
cd max-profit
g++ -o profits profits.cpp
./profits                       # enter 13 -> Earnings: $16500, T: 2 P: 0 C: 0
```

Details: [max-profit/README.md](./max-profit/README.md)

## Water Tank

No installation. Open `water-tank/index.html` in a browser, enter heights like `0,4,0,0,0,6,0,6,4,0` and click **Calculate**.

Details: [water-tank/README.md](./water-tank/README.md)
