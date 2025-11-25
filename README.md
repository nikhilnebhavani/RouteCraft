# Pathfinding Studio (React)

A small React app that visualizes multiple pathfinding algorithms on a grid. Drop walls, move the start/goal, choose an algorithm, and watch the search animate.

## Getting started

```bash
npm install
npm run dev
```

Open the dev server URL from the terminal. Use `npm run build` for a production bundle.

## How to use

- Pick an algorithm (A*, Dijkstra, BFS, DFS, Greedy Best-First) and a speed.
- Choose a brush to draw walls, erase, or move the start/goal.
- Click/drag on the grid to set up your map, then hit **Find Path** to watch the animation.
- Use **Clear Trails** to remove visited/path highlights, **Clear Walls** to wipe obstacles, or **Reset Board** for a fresh grid.

The stat card shows how many nodes were visited and the resulting path length (in steps).
