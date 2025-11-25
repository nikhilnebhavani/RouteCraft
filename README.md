<<<<<<< HEAD
#  RouteCraft (React)
=======
# RouteCraft (React)
>>>>>>> 0192d4d (rename)

An interactive React app that visualizes classic pathfinding algorithms. Draw obstacles, move start/goal, choose an algorithm, and watch the search animate step by step.

## Quick start

```bash
npm install
npm run dev
```

Open the dev server URL from the terminal output. For a production bundle, run `npm run build`.

## Features

- Five algorithms: A* Search, Dijkstra, Breadth-First Search, Depth-First Search, Greedy Best-First.
- Click/drag brushes to add walls, erase, or move start/goal.
- Adjustable animation speeds.
- Live stats: visited node count and resulting path length.
- One-click clear trails, clear walls, or full reset.

## Controls

- **Algorithm** dropdown: pick the search strategy.
- **Speed** pills: set animation delay (Fast/Smooth/Chill).
- **Brushes**: Walls (toggle obstacles), Erase, Move Start, Move Goal.
- **Find Path**: run the chosen algorithm and animate visited nodes then the shortest path it discovered.
- **Clear Trails**: remove visited/path colors but keep walls.
- **Clear Walls**: wipe obstacles but keep start/goal.
- **Reset Board**: return to the default grid and positions.

## Algorithms

- **A\***: Uses g + heuristic (Manhattan) for optimal shortest paths with informed guidance.
- **Dijkstra**: Weighted-uniform search; optimal on unweighted grids, explores evenly.
- **BFS**: Layered exploration; finds the shortest path on unweighted grids.
- **DFS**: Depth-first probing; not guaranteed to find the shortest path but shows backtracking behavior.
- **Greedy Best-First**: Follows the heuristic only; fast but not guaranteed optimal.

## Tech stack

- React + Vite
- Custom animation/state logic; no canvas or external UI libraries

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
