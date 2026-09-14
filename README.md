# Cube Brainiac

Cube Brainiac is a free browser app that helps you learn to solve a Rubik’s Cube or find moves for the cube in your hands.

[Open the live demo](https://manav-repo.github.io/Rubiks-Cube-easy/)

You can also run the complete app locally using the steps below.

## Why I built it

The goal is to help people, especially kids, understand the puzzle through active thinking: make a prediction, try an idea, and remember what worked. There’s also a quick-fix solver for the times you just want your real cube solved.

## Two ways to play

**Learn to Solve** breaks the puzzle into seven small stages. Try the goal yourself, ask for a clue when you need one, then repeat a fresh task from memory before moving on.

**Fix My Cube** lets you paint an unfolded cube to match your real one. It checks the colors and gives you a solution to follow one turn at a time.

You can rotate the 3D view, undo turns, and practice on a scramble. Progress stays on your device. Settings include light/dark mode, sticker letters, and a colorblind-friendly palette.

## How to use it

1. Open the app. Hold your cube with yellow on top and green facing you, then choose whether red or orange is on your right. You can revisit this in settings.
2. For **Learn to Solve**, answer the first question, explore the cube, and work toward the shown goal. Clues start small. Finish the task, repeat it from memory, and unlock the next stage.
3. For **Fix My Cube**, pick a color and tap each square to match your cube. Centers stay fixed. Once all squares are painted, click **Find my moves**.
4. Keep your real cube in the same position as the screen cube. Use **Next move** to see each turn and copy it. **Previous** takes you back one move.

Dragging changes your view, not the face names. Move captions explain each turn while looking straight at that face.

## Run locally

No install or build step is needed. With Git and Python installed:

```sh
git clone https://github.com/Manav-repo/Rubiks-Cube-easy.git
cd Rubiks-Cube-easy
python3 -m http.server 8000
```

Open [localhost:8000/dist/](http://localhost:8000/dist/) in your browser. Use the small local server rather than double-clicking the HTML file so the background solver can run.

## How it’s built

Plain HTML, CSS, and JavaScript, with CSS 3D transforms for the cube. The bundled [cubejs](https://github.com/ldez/cubejs) solver runs in a background worker. Fonts and assets are included locally; there are no runtime CDN dependencies, accounts, or tracking scripts.

The lessons use prepared practice positions, predictions, hints, and recall exercises. They’re a practice coach, not a guarantee that someone will master every cube after one session.

The main files are `dist/js/app.js` for the game flow, `dist/js/lessons.js` for lessons, `dist/js/cube-view.js` for the cube, and `dist/style.css` for layout and themes. Cube and lesson checks live in `tests/`.

## GitHub Pages

In **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**. The root page forwards to `dist/`. For other static hosts, publish `dist/` directly.

## Credits & connect

Built by Manav with Mcode. The current original app code is proprietary: source reuse, modification, redistribution and sale require written permission. You may use the official hosted app to learn and solve cubes. See [LICENSE](LICENSE). Third-party materials retain their own licenses; earlier MIT grants and GitHub platform rights are unaffected.

- [Support this project](https://buymeacoffee.com/manavbuilds)
- [X](https://x.com/Manavdoedits)
- [LinkedIn](https://www.linkedin.com/in/manavsharma-/)
