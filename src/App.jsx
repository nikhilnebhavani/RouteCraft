import { useMemo, useState } from 'react';
import './App.css';
import {
  aStar,
  algorithmLookup,
  algorithmOptions,
  bfs,
  dfs,
  dijkstra,
  greedyBestFirst,
} from './algorithms';

const ROWS = 15;
const COLS = 31;
const DEFAULT_START = { row: Math.floor(ROWS / 2), col: 4 };
const DEFAULT_GOAL = { row: Math.floor(ROWS / 2), col: COLS - 6 };

const SPEEDS = [
  { id: 'fast', label: 'Fast', delay: 10 },
  { id: 'smooth', label: 'Smooth', delay: 22 },
  { id: 'slow', label: 'Chill', delay: 45 },
];

const brushOptions = [
  { id: 'wall', label: 'Walls' },
  { id: 'erase', label: 'Erase' },
  { id: 'start', label: 'Move Start' },
  { id: 'goal', label: 'Move Goal' },
];

const buildGrid = (start, goal) =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      let status = 'empty';
      if (row === start.row && col === start.col) status = 'start';
      if (row === goal.row && col === goal.col) status = 'goal';
      return { row, col, status };
    }),
  );

const serialize = (row, col) => `${row}-${col}`;

function App() {
  const [grid, setGrid] = useState(() => buildGrid(DEFAULT_START, DEFAULT_GOAL));
  const [start, setStart] = useState(DEFAULT_START);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [brush, setBrush] = useState('wall');
  const [algorithm, setAlgorithm] = useState('aStar');
  const [speed, setSpeed] = useState('smooth');
  const [isDragging, setIsDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(
    'Add walls, move start/end, then run a search.',
  );
  const [metrics, setMetrics] = useState({ visited: 0, path: 0 });

  const delay = useMemo(
    () => SPEEDS.find((s) => s.id === speed)?.delay ?? 22,
    [speed],
  );

  const algoRunner = useMemo(
    () => ({
      aStar,
      dijkstra,
      bfs,
      dfs,
      greedy: greedyBestFirst,
    }),
    [],
  );

  const updateCell = (row, col, status) =>
    setGrid((prev) =>
      prev.map((r, ri) =>
        r.map((cell, ci) => {
          if (ri === row && ci === col) return { ...cell, status };
          return cell;
        }),
      ),
    );

  const clearTrails = (wipeWalls = false) => {
    const cleaned = grid.map((r) =>
      r.map((cell) => {
        if (cell.status === 'start' || cell.status === 'goal') return cell;
        if (!wipeWalls && cell.status === 'wall') return cell;
        return { ...cell, status: 'empty' };
      }),
    );
    setGrid(cleaned);
    setMetrics({ visited: 0, path: 0 });
    return cleaned;
  };

  const resetBoard = () => {
    setStart(DEFAULT_START);
    setGoal(DEFAULT_GOAL);
    setGrid(buildGrid(DEFAULT_START, DEFAULT_GOAL));
    setStatus('Board reset.');
    setMetrics({ visited: 0, path: 0 });
  };

  const moveStart = (row, col) => {
    if (grid[row][col].status === 'goal') return;
    setStart({ row, col });
    setGrid((prev) =>
      prev.map((r) =>
        r.map((cell) => {
          if (cell.status === 'start') return { ...cell, status: 'empty' };
          if (cell.row === row && cell.col === col)
            return { ...cell, status: 'start' };
          return cell;
        }),
      ),
    );
  };

  const moveGoal = (row, col) => {
    if (grid[row][col].status === 'start') return;
    setGoal({ row, col });
    setGrid((prev) =>
      prev.map((r) =>
        r.map((cell) => {
          if (cell.status === 'goal') return { ...cell, status: 'empty' };
          if (cell.row === row && cell.col === col)
            return { ...cell, status: 'goal' };
          return cell;
        }),
      ),
    );
  };

  const applyBrush = (row, col, dragged = false) => {
    if (isRunning) return;
    const cell = grid[row][col];

    if (brush === 'start') return moveStart(row, col);
    if (brush === 'goal') return moveGoal(row, col);

    if (cell.status === 'start' || cell.status === 'goal') return;
    if (dragged && brush !== 'wall' && brush !== 'erase') return;

    if (brush === 'wall') {
      const nextStatus = cell.status === 'wall' ? 'empty' : 'wall';
      return updateCell(row, col, nextStatus);
    }

    if (brush === 'erase') return updateCell(row, col, 'empty');
  };

  const runAnimation = async (nodes, statusLabel) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const node of nodes) {
      if (
        (node.row === start.row && node.col === start.col) ||
        (node.row === goal.row && node.col === goal.col)
      ) {
        // don't overwrite start/goal styling
        // eslint-disable-next-line no-continue
        continue;
      }

      updateCell(node.row, node.col, statusLabel);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delay));
    }
  };

  const runVisualization = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatus(`Running ${algorithmLookup[algorithm]}...`);
    const prepared = clearTrails(false);

    const walls = new Set();
    prepared.forEach((row) =>
      row.forEach((cell) => {
        if (cell.status === 'wall') walls.add(serialize(cell.row, cell.col));
      }),
    );

    const runner = algoRunner[algorithm];
    if (!runner) {
      setStatus('Pick an algorithm to begin.');
      setIsRunning(false);
      return;
    }

    const { visitedOrder, path } = runner({
      rows: ROWS,
      cols: COLS,
      start,
      goal,
      walls,
    });

    await runAnimation(visitedOrder, 'visited');
    await runAnimation(path, 'path');

    const pathLength = path.length ? path.length - 1 : 0;
    setMetrics({ visited: visitedOrder.length, path: pathLength });
    setStatus(
      pathLength > 0
        ? `Path found in ${pathLength} steps using ${algorithmLookup[algorithm]}.`
        : 'No path found. Tweak the map and try again.',
    );
    setIsRunning(false);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Data Structures Lab</p>
          <h1>
            RouteCraft <span>· React</span>
          </h1>
          <p className="lede">
            Draw walls, pick an algorithm, and watch how each search strategy
            threads its way from A to B.
          </p>
          <div className="hero-actions">
            <label className="field">
              <span>Algorithm</span>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isRunning}
              >
                {algorithmOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Speed</span>
              <div className="pill-group">
                {SPEEDS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`pill ${speed === s.id ? 'active' : ''}`}
                    onClick={() => setSpeed(s.id)}
                    disabled={isRunning}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </label>
            <div className="actions">
              <button
                type="button"
                className="primary"
                onClick={runVisualization}
                disabled={isRunning}
              >
                {isRunning ? 'Animating...' : 'Find Path'}
              </button>
              <button
                type="button"
                onClick={() => clearTrails(false)}
                disabled={isRunning}
              >
                Clear Trails
              </button>
              <button
                type="button"
                onClick={() => clearTrails(true)}
                disabled={isRunning}
              >
                Clear Walls
              </button>
              <button type="button" onClick={resetBoard} disabled={isRunning}>
                Reset Board
              </button>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat">
            <p>Visited</p>
            <strong>{metrics.visited}</strong>
          </div>
          <div className="stat">
            <p>Path Length</p>
            <strong>{metrics.path}</strong>
          </div>
          <p className="status">{status}</p>
        </div>
      </header>

      <section className="board-controls">
        <div className="brushes">
          {brushOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`pill ghost ${brush === option.id ? 'active' : ''}`}
              onClick={() => setBrush(option.id)}
              disabled={isRunning}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="legend">
          <span className="chip start">Start</span>
          <span className="chip goal">Goal</span>
          <span className="chip wall">Wall</span>
          <span className="chip visited">Visited</span>
          <span className="chip path">Path</span>
        </div>
      </section>

      <section className="grid-shell">
        <div
          className="grid"
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {grid.map((row) =>
            row.map((cell) => (
              <button
                type="button"
                key={`${cell.row}-${cell.col}`}
                className={`cell ${cell.status}`}
                onMouseDown={() => {
                  setIsDragging(true);
                  applyBrush(cell.row, cell.col);
                }}
                onMouseEnter={() => applyBrush(cell.row, cell.col, isDragging)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              />
            )),
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
