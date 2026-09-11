"use strict";

var SIZE = 8;
var levels = [
  [
    [1, 1, "right"], [3, 1, "down"], [6, 1, "left"],
    [2, 3, "up"], [5, 3, "right"], [0, 5, "up"],
    [4, 5, "down"], [7, 6, "left"], [2, 7, "up"]
  ],
  [
    [0, 0, "down"], [3, 0, "right"], [6, 0, "down"],
    [1, 2, "left"], [4, 2, "up"], [7, 3, "left"],
    [2, 4, "down"], [5, 5, "right"], [0, 7, "up"],
    [4, 7, "left"], [7, 7, "up"]
  ],
  [
    [2, 0, "down"], [5, 0, "left"], [7, 1, "down"],
    [0, 2, "right"], [3, 2, "up"], [6, 3, "left"],
    [1, 5, "down"], [4, 5, "right"], [7, 5, "up"],
    [3, 7, "left"], [5, 7, "up"]
  ]
];

var boardElement = document.getElementById("board");
var levelElement = document.getElementById("level");
var remainingElement = document.getElementById("remaining");
var heartsElement = document.getElementById("hearts");
var messageElement = document.getElementById("message");
var resultElement = document.getElementById("result");
var resultTitle = document.getElementById("result-title");
var resultText = document.getElementById("result-text");
var level = 0;
var hearts = 3;
var arrows = [];

var arrowGlyph = { up: "↑", right: "→", down: "↓", left: "←" };
var vector = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 },
  down: { x: 0, y: 1 }, left: { x: -1, y: 0 }
};

function newLevel(index) {
  level = index;
  hearts = 3;
  arrows = levels[level].map(function (item, id) {
    return { id: id, x: item[0], y: item[1], direction: item[2], leaving: false };
  });
  resultElement.hidden = true;
  messageElement.textContent = "Escolha uma seta com caminho livre até a borda.";
  render();
}

function arrowAt(x, y) {
  return arrows.find(function (arrow) { return arrow.x === x && arrow.y === y && !arrow.leaving; });
}

function canExit(arrow) {
  var step = vector[arrow.direction];
  var x = arrow.x + step.x;
  var y = arrow.y + step.y;
  while (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
    if (arrowAt(x, y)) return false;
    x += step.x;
    y += step.y;
  }
  return true;
}

function render() {
  boardElement.replaceChildren();
  arrows.forEach(function (arrow) {
    var cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.style.gridColumn = String(arrow.x + 1);
    cell.style.gridRow = String(arrow.y + 1);
    var button = document.createElement("button");
    button.className = "arrow" + (canExit(arrow) ? "" : " blocked");
    button.type = "button";
    button.textContent = arrowGlyph[arrow.direction];
    button.setAttribute("aria-label", canExit(arrow) ? "Seta com caminho livre" : "Seta bloqueada");
    button.addEventListener("click", function () { move(arrow); });
    cell.appendChild(button);
    boardElement.appendChild(cell);
  });
  levelElement.textContent = level + 1;
  remainingElement.textContent = arrows.length;
  heartsElement.textContent = "♥".repeat(hearts) + "♡".repeat(3 - hearts);
}

function move(arrow) {
  if (arrow.leaving) return;
  if (!canExit(arrow)) {
    hearts -= 1;
    messageElement.textContent = hearts ? "Essa seta ainda está bloqueada. Escolha outra." : "Sem vidas — tente o nível novamente.";
    if (!hearts) { newLevel(level); return; }
    render();
    return;
  }
  arrow.leaving = true;
  var button = boardElement.querySelector("[style*=\"" + (arrow.x + 1) + "\"]");
  var step = vector[arrow.direction];
  arrows = arrows.filter(function (item) { return item !== arrow; });
  render();
  if (button) {
    button.style.setProperty("--dx", step.x * 70 + "px");
    button.style.setProperty("--dy", step.y * 70 + "px");
    button.classList.add("exit");
  }
  if (!arrows.length) finishLevel();
}

function finishLevel() {
  resultTitle.textContent = level === levels.length - 1 ? "Você dominou o fluxo" : "Nível concluído";
  resultText.textContent = level === levels.length - 1 ? "Todos os caminhos foram liberados." : "O tabuleiro ficou limpo. Pronto para o próximo desafio?";
  document.getElementById("next-level").textContent = level === levels.length - 1 ? "Jogar novamente" : "Próximo nível";
  resultElement.hidden = false;
}

document.getElementById("new-game").addEventListener("click", function () { newLevel(level); });
document.getElementById("next-level").addEventListener("click", function () {
  newLevel(level === levels.length - 1 ? 0 : level + 1);
});

newLevel(0);
