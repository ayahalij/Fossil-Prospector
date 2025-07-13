/*-------------------------------- Constants --------------------------------*/
const TriesNum = 80
const FossilShapes = [
  {size:1, shape:'line', part:'Plate'},
  {size:1, shape:'line', part:'Plate'},
  {size:1, shape:'line', part:'Plate'},
  {size:2, shape:'line', part:'Leg'},
  {size:3, shape:'line', part:'Leg'},
  {size:4, shape:'line', part:'Tail'},
  {size:6, shape:'rectangle', part:'Head', rows: 2, cols: 3 },
  {size:8, shape:'rectangle', part:'Body', rows: 2, cols: 4 }
]
const HitsRequired = FossilShapes.reduce((sum, s)=> sum + s.size, 0)


/*---------------------------- Variables (state) ----------------------------*/
let tries, hitCount, FossilsSunk, Fossils


/*------------------------ Cached Element References ------------------------*/
const board = document.getElementById("game-board")
const StatusText = document.getElementById("status")
const ScoreText = document.getElementById("score")
const RestartBtn = document.getElementById("restart-btn")


/*-------------------------------- Functions --------------------------------*/

// Initialize and set up the game
function SetupGame() {
  board.innerHTML = ""
  tries = 0
  hitCount = 0
  FossilsSunk = 0
  Fossils = []

  // Create the 10x10 game board
  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div")
    square.classList.add("sqr")
    square.id = i
    square.addEventListener("click", HandleClicK)
    board.appendChild(square)
  }

  // Place Fossils on the board
  FossilShapes.forEach((Fossil, index) => {
    let placed = false
    while (!placed) {
      let start = Math.floor(Math.random() * 100)
      let row = Math.floor(start / 10)
      let col = start % 10
      let positions = []

      if (Fossil.shape === "line") {
        if (col + Fossil.size > 10) continue;
        for (let i = 0; i < Fossil.size; i++) {
          let pos = start + i
          if (Fossils.some(s => s.positions.includes(pos))) {
            positions = []
            break
          }
          positions.push(pos)
        }
      } else if (Fossil.shape === "rectangle") {
        if (row + Fossil.rows > 10 || col + Fossil.cols > 10) continue;
        for (let r = 0; r < Fossil.rows; r++) {
          for (let c = 0; c < Fossil.cols; c++) {
            let pos = (row + r) * 10 + (col + c)
            if (Fossils.some(s => s.positions.includes(pos))) {
              positions = []
              break
            }
            positions.push(pos)
          }
        }
      }

      if (positions.length === Fossil.size) {
        Fossils.push({ name: `Fossil-${index + 1}`, positions, hits: [] })
        placed = true
      }
    }
  })

  StatusText.textContent = "Click to fire! You have 80 tries."
  ScoreText.textContent = `Hits: 0 / ${HitsRequired} || Tries Left: ${TriesNum} || Fossils Remaining: ${FossilShapes.length}`
}

// Handle user clicks on the board
function HandleClicK(event) {
  const id = parseInt(event.target.id)
  const square = event.target

  if (square.classList.contains("hit") || square.classList.contains("miss") || tries >= TriesNum) return

  tries++
  for (let Fossil of Fossils) {
    if (Fossil.positions.includes(id)) {
      if (!Fossil.hits.includes(id)) {
        Fossil.hits.push(id);
        square.classList.add("hit")
        hitCount++
        StatusText.textContent = `HIT on ${Fossil.name}✅`

        if (Fossil.hits.length === Fossil.positions.length) {
          Fossil.positions.forEach(pos => {
            document.getElementById(pos).classList.add("sunk")
          })
          FossilsSunk++
          StatusText.textContent = `You sunk ${Fossil.name}🔍👏🏻`
        }

        updateScore()
        return
      }
    }
  }

  square.classList.add("miss")
  StatusText.textContent = "Miss❌"
  updateScore();
}

// Update game status and score display
function updateScore() {
  ScoreText.textContent = `Hits: ${hitCount} / ${HitsRequired} || Tries Left: ${TriesNum - tries} || Fossils Remaining: ${FossilShapes.length - FossilsSunk}`

  if (hitCount === HitsRequired) {
    StatusText.textContent = "You sunk all the Fossils! YOU WIN! 😍"
    disableBoard()
  } else if (tries >= TriesNum) {
    StatusText.textContent = "You've used all your tries. Game Over 😣"
    disableBoard()
  }
}

// Prevent further clicks after game ends
function disableBoard() {
  for (let i = 0; i < 100; i++) {
    const square = document.getElementById(i)
    square.removeEventListener("click", HandleClicK)
  }
}


/*----------------------------- Event Listeners -----------------------------*/

// When DOM is ready, initialize everything
window.addEventListener("DOMContentLoaded", () => {
  RestartBtn.addEventListener("click", SetupGame)
  SetupGame()// Start game on page load
})
