"use strict";

var NS = "http://www.w3.org/2000/svg";
var SIZE = 8;
var levels = [
  [
    { cells: [[1, 1], [2, 1], [2, 2], [3, 2]], exit: "right" },
    { cells: [[6, 0], [6, 1], [5, 1], [5, 2], [4, 2]], exit: "left" },
    { cells: [[0, 6], [1, 6], [1, 5], [2, 5], [2, 4]], exit: "up" },
    { cells: [[7, 7], [6, 7], [6, 6], [5, 6]], exit: "left" },
    { cells: [[4, 7], [4, 6], [3, 6], [3, 5]], exit: "up" }
  ],
  [
    { cells: [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3]], exit: "down" },
    { cells: [[4, 0], [4, 1], [3, 1], [3, 2], [4, 2]], exit: "up" },
    { cells: [[7, 2], [6, 2], [6, 3], [5, 3], [5, 4]], exit: "right" },
    { cells: [[0, 6], [1, 6], [1, 5], [2, 5], [2, 4], [3, 4]], exit: "left" },
    { cells: [[7, 7], [6, 7], [6, 6], [5, 6], [5, 5]], exit: "down" },
    { cells: [[3, 7], [3, 6], [4, 6], [4, 5]], exit: "up" }
  ],
  [
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], exit: "left" },
    { cells: [[7, 0], [6, 0], [6, 1], [5, 1], [5, 2], [4, 2]], exit: "right" },
    { cells: [[0, 7], [0, 6], [1, 6], [1, 5], [2, 5], [2, 4]], exit: "down" },
    { cells: [[7, 7], [7, 6], [6, 6], [6, 5], [5, 5], [5, 4]], exit: "down" },
    { cells: [[3, 7], [3, 6], [3, 5], [4, 5], [4, 4], [4, 3]], exit: "up" },
    { cells: [[2, 7], [2, 6], [3, 6], [4, 6]], exit: "right" }
  ]
];

var board = document.getElementById("board");
var levelElement = document.getElementById("level");
var remainingElement = document.getElementById("remaining");
var heartsElement = document.getElementById("hearts");
var messageElement = document.getElementById("message");
var resultElement = document.getElementById("result");
var resultTitle = document.getElementById("result-title");
var resultText = document.getElementById("result-text");
var level = 0;
var hearts = 3;
var snakes = [];

var vector = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 },
  down: { x: 0, y: 1 }, left: { x: -1, y: 0 }
};
var glyph = { up: "↑", right: "→", down: "↓", left: "←" };

function svgElement(name, attrs) {
  var element = document.createElementNS(NS, name);
  Object.keys(attrs || {}).forEach(function (key) { element.setAttribute(key, attrs[key]); });
  return element;
}

function point(cell) { return (cell[0] + 0.5) * 100 + "," + (cell[1] + 0.5) * 100; }
function key(cell) { return cell[0] + ":" + cell[1]; }

function newLevel(index) {
  level = index;
  hearts = 3;
  snakes = levels[level].map(function (item, id) {
    return { id: id, cells: item.cells, exit: item.exit, leaving: false };
  });
  resultElement.hidden = true;
  messageElement.textContent = "Escolha uma cobrinha com a ponta livre e veja o caminho se desfazer.";
  render();
}

function occupiedByOther(snake, cell) {
  return snakes.some(function (other) {
    return other !== snake && !other.leaving && other.cells.some(function (item) { return key(item) === key(cell); });
  });
}

function canExit(snake) {
  var head = snake.cells[snake.cells.length - 1];
  var step = vector[snake.exit];
  var x = head[0] + step.x;
  var y = head[1] + step.y;
  while (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
    if (occupiedByOther(snake, [x, y])) return false;
    x += step.x;
    y += step.y;
  }
  return true;
}

function renderGrid(svg) {
  var grid = svgElement("g", { class: "grid-lines" });
  for (var i = 1; i < SIZE; i++) {
    grid.appendChild(svgElement("line", { x1: i * 100, y1: 0, x2: i * 100, y2: 800 }));
    grid.appendChild(svgElement("line", { x1: 0, y1: i * 100, x2: 800, y2: i * 100 }));
  }
  svg.appendChild(grid);
}

function renderSnake(svg, snake) {
  var free = canExit(snake);
  var group = svgElement("g", { class: "snake-group" + (free ? " free" : " blocked") });
  var path = svgElement("polyline", { class: "snake-body", points: snake.cells.map(point).join(" ") });
  var head = snake.cells[snake.cells.length - 1];
  var centerX = (head[0] + 0.5) * 100;
  var centerY = (head[1] + 0.5) * 100;
  var tip = { up: [centerX, centerY - 34], right: [centerX + 34, centerY], down: [centerX, centerY + 34], left: [centerX - 34, centerY] }[snake.exit];
  var arrow = svgElement("text", { class: "snake-arrow", x: tip[0], y: tip[1], "text-anchor": "middle", "dominant-baseline": "central" });
  arrow.textContent = glyph[snake.exit];
  var hit = svgElement("rect", { class: "snake-hit", x: 0, y: 0, width: 800, height: 800, fill: "transparent" });
  hit.addEventListener("click", function () { move(snake, group, path, arrow); });
  group.appendChild(path);
  group.appendChild(arrow);
  group.appendChild(hit);
  svg.appendChild(group);
}

function render() {
  var svg = svgElement("svg", { viewBox: "0 0 800 800", role: "img", "aria-label": "Tabuleiro com cobrinhas de setas" });
  renderGrid(svg);
  snakes.forEach(function (snake) { renderSnake(svg, snake); });
  board.replaceChildren(svg);
  levelElement.textContent = level + 1;
  remainingElement.textContent = snakes.length;
  heartsElement.textContent = "♥".repeat(hearts) + "♡".repeat(3 - hearts);
}

function move(snake, group, path, arrow) {
  if (snake.leaving) return;
  if (!canExit(snake)) {
    hearts -= 1;
    group.classList.add("shake");
    messageElement.textContent = hearts ? "A ponta está presa. Libere o caminho de outra cobrinha." : "Sem vidas — o nível será reiniciado.";
    if (!hearts) { setTimeout(function () { newLevel(level); }, 350); }
    render();
    return;
  }
  snake.leaving = true;
  group.classList.add("leaving");
  var length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  arrow.style.opacity = "0";
  setTimeout(function () {
    snakes = snakes.filter(function (item) { return item !== snake; });
    render();
    if (!snakes.length) finishLevel();
  }, 760);
}

function finishLevel() {
  resultTitle.textContent = level === levels.length - 1 ? "Fluxo perfeito" : "Nível concluído";
  resultText.textContent = level === levels.length - 1 ? "Você desenrolou todas as cobrinhas." : "O caminho ficou livre. Vamos aumentar o desafio?";
  document.getElementById("next-level").textContent = level === levels.length - 1 ? "Jogar novamente" : "Próximo nível";
  resultElement.hidden = false;
}

document.getElementById("new-game").addEventListener("click", function () { newLevel(level); });
document.getElementById("next-level").addEventListener("click", function () {
  newLevel(level === levels.length - 1 ? 0 : level + 1);
});

newLevel(0);
