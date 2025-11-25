const serialize = (row, col) => `${row}-${col}`;
const deserialize = (key) => {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
};

const isSame = (a, b) => a.row === b.row && a.col === b.col;

const neighbors = (node, rows, cols) => {
  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return deltas
    .map(([dr, dc]) => ({ row: node.row + dr, col: node.col + dc }))
    .filter((n) => n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols);
};

const reconstructPath = (parent, startKey, goalKey) => {
  if (startKey !== goalKey && !parent.has(goalKey)) {
    return [];
  }

  const path = [];
  let current = goalKey;

  while (current) {
    path.push(deserialize(current));
    if (current === startKey) break;
    current = parent.get(current);
  }

  return path.reverse();
};

const manhattan = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

const popBest = (list) => {
  let bestIndex = 0;

  for (let i = 1; i < list.length; i += 1) {
    if (list[i].priority < list[bestIndex].priority) {
      bestIndex = i;
    }
  }

  return list.splice(bestIndex, 1)[0];
};

export const algorithmOptions = [
  { id: 'aStar', label: 'A* Search' },
  { id: 'dijkstra', label: 'Dijkstra' },
  { id: 'bfs', label: 'Breadth-First Search' },
  { id: 'dfs', label: 'Depth-First Search' },
  { id: 'greedy', label: 'Greedy Best-First' },
];

export const algorithmLookup = Object.fromEntries(
  algorithmOptions.map((opt) => [opt.id, opt.label]),
);

const baseArgs = (args) => ({
  rows: args.rows,
  cols: args.cols,
  walls: args.walls ?? new Set(),
  start: args.start,
  goal: args.goal,
});

export function bfs(args) {
  const { rows, cols, walls, start, goal } = baseArgs(args);
  const startKey = serialize(start.row, start.col);
  const goalKey = serialize(goal.row, goal.col);

  const queue = [start];
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  while (queue.length) {
    const current = queue.shift();
    const key = serialize(current.row, current.col);
    if (visited.has(key)) continue;

    visited.add(key);
    visitedOrder.push(current);

    if (key === goalKey) break;

    neighbors(current, rows, cols).forEach((next) => {
      const nextKey = serialize(next.row, next.col);
      if (visited.has(nextKey) || walls.has(nextKey)) return;
      if (!parent.has(nextKey)) parent.set(nextKey, key);
      queue.push(next);
    });
  }

  return {
    visitedOrder,
    path: reconstructPath(parent, startKey, goalKey),
  };
}

export function dfs(args) {
  const { rows, cols, walls, start, goal } = baseArgs(args);
  const startKey = serialize(start.row, start.col);
  const goalKey = serialize(goal.row, goal.col);

  const stack = [start];
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  while (stack.length) {
    const current = stack.pop();
    const key = serialize(current.row, current.col);
    if (visited.has(key)) continue;

    visited.add(key);
    visitedOrder.push(current);
    if (key === goalKey) break;

    neighbors(current, rows, cols)
      .reverse() // prefer straighter paths visually
      .forEach((next) => {
        const nextKey = serialize(next.row, next.col);
        if (visited.has(nextKey) || walls.has(nextKey)) return;
        if (!parent.has(nextKey)) parent.set(nextKey, key);
        stack.push(next);
      });
  }

  return {
    visitedOrder,
    path: reconstructPath(parent, startKey, goalKey),
  };
}

export function dijkstra(args) {
  const { rows, cols, walls, start, goal } = baseArgs(args);
  const startKey = serialize(start.row, start.col);
  const goalKey = serialize(goal.row, goal.col);

  const dist = new Map([[startKey, 0]]);
  const parent = new Map();
  const visited = new Set();
  const visitedOrder = [];
  const frontier = [{ key: startKey, cost: 0 }];

  while (frontier.length) {
    frontier.sort((a, b) => a.cost - b.cost);
    const { key, cost } = frontier.shift();
    if (visited.has(key)) continue;

    visited.add(key);
    visitedOrder.push(deserialize(key));
    if (key === goalKey) break;

    neighbors(deserialize(key), rows, cols).forEach((next) => {
      const nextKey = serialize(next.row, next.col);
      if (walls.has(nextKey)) return;

      const nextCost = cost + 1;
      if (nextCost < (dist.get(nextKey) ?? Infinity)) {
        dist.set(nextKey, nextCost);
        parent.set(nextKey, key);
        frontier.push({ key: nextKey, cost: nextCost });
      }
    });
  }

  return {
    visitedOrder,
    path: reconstructPath(parent, startKey, goalKey),
  };
}

export function aStar(args) {
  const { rows, cols, walls, start, goal } = baseArgs(args);
  const startKey = serialize(start.row, start.col);
  const goalKey = serialize(goal.row, goal.col);

  const gScore = new Map([[startKey, 0]]);
  const parent = new Map();
  const visited = new Set();
  const visitedOrder = [];
  const frontier = [
    { key: startKey, priority: manhattan(start, goal), g: 0 },
  ];

  while (frontier.length) {
    const current = popBest(frontier);
    if (visited.has(current.key)) continue;
    visited.add(current.key);
    const currentNode = deserialize(current.key);
    visitedOrder.push(currentNode);

    if (current.key === goalKey) break;

    neighbors(currentNode, rows, cols).forEach((next) => {
      const nextKey = serialize(next.row, next.col);
      if (walls.has(nextKey)) return;

      const tentativeG = current.g + 1;
      if (tentativeG < (gScore.get(nextKey) ?? Infinity)) {
        gScore.set(nextKey, tentativeG);
        parent.set(nextKey, current.key);
        frontier.push({
          key: nextKey,
          g: tentativeG,
          priority: tentativeG + manhattan(next, goal),
        });
      }
    });
  }

  return {
    visitedOrder,
    path: reconstructPath(parent, startKey, goalKey),
  };
}

export function greedyBestFirst(args) {
  const { rows, cols, walls, start, goal } = baseArgs(args);
  const startKey = serialize(start.row, start.col);
  const goalKey = serialize(goal.row, goal.col);

  const parent = new Map();
  const visited = new Set();
  const visitedOrder = [];
  const frontier = [
    { key: startKey, priority: manhattan(start, goal) },
  ];

  while (frontier.length) {
    const current = popBest(frontier);
    if (visited.has(current.key)) continue;
    visited.add(current.key);
    const node = deserialize(current.key);
    visitedOrder.push(node);
    if (current.key === goalKey) break;

    neighbors(node, rows, cols).forEach((next) => {
      const nextKey = serialize(next.row, next.col);
      if (walls.has(nextKey) || visited.has(nextKey)) return;
      if (!parent.has(nextKey)) parent.set(nextKey, current.key);
      frontier.push({
        key: nextKey,
        priority: manhattan(next, goal),
      });
    });
  }

  return {
    visitedOrder,
    path: reconstructPath(parent, startKey, goalKey),
  };
}

export const algorithms = {
  aStar,
  dijkstra,
  bfs,
  dfs,
  greedy: greedyBestFirst,
};

