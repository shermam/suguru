import { Game } from "./game.js";

const game = new Game(document.querySelector("#game"));
console.table(game.board.map((e) => e.map((e) => e.region?.number)));
console.log(game);
