# Frankenstein Game

A collaborative open-source game built one strange contribution at a time.

## The entire game right now

An empty room.

One hanging lightbulb.

You can walk up to it and turn it on or off.

That is the starting point.

## Play locally

No install step.

Clone or fork the repo and open `index.html` in a browser.

Controls:

- WASD / Arrow keys — move
- E — interact with the lightbulb

## Lighting

When the bulb is on, things cast soft shadows that move with them (`src/lighting.js`).
To make something you add cast a shadow, push it into `occluders`:

```js
import { occluders } from "./lighting.js";
occluders.push({ x: 300, y: 350, r: 20 });                              // circle
occluders.push({ points: [[600,300],[660,300],[660,340],[600,340]] });  // convex polygon
```

Push the object itself and its shadow will follow it as it moves.

## First contribution

Fork the repo and add **one thing**.

Anything.

A chair. A sound. A monster. A door. A window. A second room. A gun. A fish tank. A weather system. A dialogue box. A minigame. A shader. A weird painting.

Then open a pull request.

## Rules

- Don't delete other people's work just to make yours fit.
- Keep additions reasonably self-contained.
- Explain what you added and how to try it.
- Only submit assets we can legally redistribute.
- Weird is encouraged.
- Breaking the whole game is not.

There is no final design document.

The game becomes whatever everybody makes together.
