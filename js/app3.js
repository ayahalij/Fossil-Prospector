/*-------------------------------- Constants --------------------------------*/
const FossilShapes = [
  { size: 1, shape: 'line', part: 'Plate1' },
  { size: 1, shape: 'line', part: 'Plate2' },
  { size: 1, shape: 'line', part: 'Plate3' },
  { size: 2, shape: 'line', part: 'Leg1' },
  { size: 3, shape: 'line', part: 'Leg2' },
  { size: 4, shape: 'line', part: 'Tail' },
  { size: 6, shape: 'rectangle', part: 'Head', rows: 2, cols: 3 },
  { size: 8, shape: 'rectangle', part: 'Body', rows: 2, cols: 4 }
];

const HitsRequired = FossilShapes.reduce((sum, s) => sum + s.size, 0);

/*---------------------------- Variables (state) ----------------------------*/
let currentPlayer, player1Hits, player2Hits, player1Sunk, player2Sunk;
let player1Fossils, player2Fossils;
let gameOver = false;

/*------------------------ Cached Element References ------------------------*/
const player1Board = document.getElementById("user-board");
const player2Board = document.getElementById("user2-board");

const player1Status = document.getElementById("user-status");
const player2Status = document.getElementById("user2-status");

const player1Score = document.getElementById("user-score");
const player2Score = document.getElementById("user2-score");

const hitImg = document.getElementById("hit-effect");
const restartBtn = document.getElementById("restart-btn");

const hitSound = new Audio("./audio/click.mp4");
const sunkSound = new Audio("./audio/sunk.mp3");
const winSound = new Audio("./audio/win.mp3");

/*-------------------------------- Functions --------------------------------*/
function SetupGame() {
  player1Hits = 0;
  player2Hits = 0;
  player1Sunk = 0;
  player2Sunk = 0;
  player1Fossils = [];
  player2Fossils = [];
  gameOver = false;
  currentPlayer = 1;

  player1Board.innerHTML = "";
  player2Board.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    const p1Square = document.createElement("div");
    p1Square.classList.add("sqr");
    p1Square.id = `p1-${i}`;
    // Player 1 board squares are NOT clickable (they are "defense")
    player1Board.appendChild(p1Square);

    const p2Square = document.createElement("div");
    p2Square.classList.add("sqr");
    p2Square.id = `p2-${i}`;
    p2Square.addEventListener("click", handlePlayerClick);
    player2Board.appendChild(p2Square);
  }

  placeFossils(player1Fossils, "p1");
  placeFossils(player2Fossils, "p2");

  updateStatus();
  updateScores();

  document.querySelectorAll('.check-overlay').forEach(overlay => {
    overlay.style.display = 'none';
  });

  // Remove player 2 board clicks until Player 1's turn
  disablePlayer2Board();

  // Add magnifying glass effect listeners
  addMagnifyingListeners();
}

function placeFossils(targetArray, prefix) {
  FossilShapes.forEach(fossil => {
    let placed = false;
    while (!placed) {
      let start = Math.floor(Math.random() * 100);
      let row = Math.floor(start / 10);
      let col = start % 10;
      let positions = [];

      if (fossil.shape === "line") {
        if (col + fossil.size > 10) continue;
        for (let i = 0; i < fossil.size; i++) {
          let pos = start + i;
          if (targetArray.some(s => s.positions.includes(pos))) {
            positions = [];
            break;
          }
          positions.push(pos);
        }
      } else {
        if (row + fossil.rows > 10 || col + fossil.cols > 10) continue;
        for (let r = 0; r < fossil.rows; r++) {
          for (let c = 0; c < fossil.cols; c++) {
            let pos = (row + r) * 10 + (col + c);
            if (targetArray.some(s => s.positions.includes(pos))) {
              positions = [];
              break;
            }
            positions.push(pos);
          }
        }
      }

      if (positions.length === fossil.size) {
        targetArray.push({ part: fossil.part, positions, hits: [] });
        placed = true;
      }
    }
  });
}

function handlePlayerClick(event) {
  if (gameOver || currentPlayer !== 1) return;

  const square = event.target;
  const id = parseInt(square.id.replace('p2-', ''));

  if (square.classList.contains("hit") || square.classList.contains("miss")) return;

  let hit = false;
  for (let fossil of player2Fossils) {
    if (fossil.positions.includes(id) && !fossil.hits.includes(id)) {
      fossil.hits.push(id);
      square.classList.add("hit");
      square.setAttribute("data-part", fossil.part);
      player1Hits++;
      player1Status.textContent = `Player 1 hit on ${fossil.part}! ✅`;

      if (fossil.hits.length === fossil.positions.length) {
        fossil.positions.forEach(pos => {
          const el = document.getElementById("p2-" + pos);
          el.classList.add("sunk");
        });
        player1Sunk++;
        const overlay = document.querySelector(`.check-${fossil.part.toLowerCase()}.user2-overlay`);
        if (overlay) overlay.style.display = "block";
        sunkSound.play();
      }

      hitSound.play();
      updateScores();

      if (player1Hits === HitsRequired) {
        player1Status.textContent = "Player 1 found all fossils! 🎉";
        player2Status.textContent = "Player 2 loses 😢";
        gameOver = true;
        winSound.play();
        return;
      }

      currentPlayer = 2;
      updateStatus();
      disablePlayer2Board();
      setTimeout(enablePlayer2Turn, 600);
      return;
    }
  }

  square.classList.add("miss");
  player1Status.textContent = "Player 1 missed ❌";
  hitSound.play();
  currentPlayer = 2;
  updateStatus();
  disablePlayer2Board();
  setTimeout(enablePlayer2Turn, 600);
}

function enablePlayer2Turn() {
  const squares = player1Board.querySelectorAll(".sqr");
  squares.forEach(sq => {
    sq.addEventListener("click", handlePlayer2Click);
  });
  player2Status.textContent = "Player 2's Turn 🔍";
  player1Status.textContent = "Waiting...";
}

function handlePlayer2Click(event) {
  if (gameOver || currentPlayer !== 2) return;

  const square = event.target;
  const id = parseInt(square.id.replace('p1-', ''));

  if (square.classList.contains("hit") || square.classList.contains("miss")) return;

  let hit = false;
  for (let fossil of player1Fossils) {
    if (fossil.positions.includes(id) && !fossil.hits.includes(id)) {
      fossil.hits.push(id);
      square.classList.add("hit");
      square.setAttribute("data-part", fossil.part);
      player2Hits++;
      player2Status.textContent = `Player 2 hit on ${fossil.part}! ✅`;

      if (fossil.hits.length === fossil.positions.length) {
        fossil.positions.forEach(pos => {
          const el = document.getElementById("p1-" + pos);
          el.classList.add("sunk");
        });
        player2Sunk++;
        const overlay = document.querySelector(`.check-${fossil.part.toLowerCase()}.user-overlay`);
        if (overlay) overlay.style.display = "block";
        sunkSound.play();
      }

      hitSound.play();
      updateScores();

      if (player2Hits === HitsRequired) {
        player2Status.textContent = "Player 2 found all fossils! 🎉";
        player1Status.textContent = "Player 1 loses 😢";
        gameOver = true;
        winSound.play();
        return;
      }

      currentPlayer = 1;
      updateStatus();
      disablePlayer2Board();
      return;
    }
  }

  square.classList.add("miss");
  player2Status.textContent = "Player 2 missed ❌";
  hitSound.play();
  currentPlayer = 1;
  updateStatus();
  disablePlayer2Board();
}

function disablePlayer2Board() {
  const squares = player1Board.querySelectorAll(".sqr");
  squares.forEach(sq => {
    sq.removeEventListener("click", handlePlayer2Click);
  });
}

function updateScores() {
  player1Score.textContent = `Hits: ${player1Hits} / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length - player1Sunk}`;
  player2Score.textContent = `Hits: ${player2Hits} / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length - player2Sunk}`;
}

function updateStatus() {
  if (gameOver) return;
  if (currentPlayer === 1) {
    player2Status.textContent = "Player 1's Turn 🔍";
    player1Status.textContent = "Waiting...";
  } else {
    player1Status.textContent = "Player 2's Turn 🔍";
    player2Status.textContent = "Waiting...";
  }
}

function showHitImg(x, y) {
  hitImg.style.left = x + 'px';
  hitImg.style.top = y + 'px';
  hitImg.style.display = 'block';
  setTimeout(() => {
    hitImg.style.display = 'none';
  }, 300);
}

function addMagnifyingListeners() {
  player2Board.addEventListener("click", (event) => {
    const x = event.pageX;
    const y = event.pageY;
    showHitImg(x, y);
  });

  player1Board.addEventListener("click", (event) => {
    const x = event.pageX;
    const y = event.pageY;
    showHitImg(x, y);
  });
}

/*----------------------------- Event Listeners -----------------------------*/
window.addEventListener("DOMContentLoaded", () => {
  restartBtn.addEventListener("click", SetupGame);
  SetupGame();
});
