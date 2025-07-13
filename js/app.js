/*-------------------------------- Constants --------------------------------*/
//number of available tries
const TriesNum = 80

//fossiles shape
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

//total fossil sqr = 26
const HitsRequired = FossilShapes.reduce((sum, s)=> sum + s.size, 0)


/*---------------------------- Variables (state) ----------------------------*/
let tries, hitCount, FossilsSunk, Fossils


/*------------------------ Cached Element References ------------------------*/
const board = document.getElementById("game-board")
const StatusText = document.getElementById("status")
const ScoreText = document.getElementById("score")
const RestartBtn = document.getElementById("restart-btn")


/*-------------------------------- Functions --------------------------------*/
//setup the game
function SetupGame() {
board.innerHTML = ""
tries = 0
hitCount = 0
FossilsSunk = 0
Fossils = []

//create 10x10 game board =100 sqr
for (let i = 0; i < 100; i++) {
  const square = document.createElement("div")
  square.classList.add("sqr")
  square.id = i
  square.addEventListener("click", HandleClicK)
  board.appendChild(square)
}

//place fossils on the board base in shape
FossilShapes.forEach((Fossil, index) => {
  let placed = false
  while (!placed) {
    let start = Math.floor(Math.random() * 100)
    let row = Math.floor(start / 10)
    let col = start % 10
    let positions = []
    
//line shape
    if (Fossil.shape === "line") {
      if (col + Fossil.size > 10) continue
      for (let i = 0; i < Fossil.size; i++) {
        let pos = start + i
        if (Fossils.some(s => s.positions.includes(pos))) {
          positions = []
          break
        }
        positions.push(pos)
      }
    } 

//rectangle shape    
    else if (Fossil.shape === "rectangle") {
      if (row + Fossil.rows > 10 || col + Fossil.cols > 10) continue
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

//hiting the fossil
    if (positions.length === Fossil.size) {
      Fossils.push({ name: `Fossil-${index + 1}`, positions, hits: [] })
      placed = true
    }
  }
})

//update
StatusText.textContent = "Click to fire! You have 80 tries."
ScoreText.textContent = `Hits: 0 / ${HitsRequired}  ~  Tries Left: ${TriesNum}  ~  Fossils Remaining: ${FossilShapes.length}`
}

//handle click on the board
function HandleClicK(event) {
const id = parseInt(event.target.id)
const square = event.target

if (square.classList.contains("hit") || square.classList.contains("miss") || tries >= TriesNum) return
tries++

//hiting
for (let Fossil of Fossils) {
  if (Fossil.positions.includes(id)) {
    if (!Fossil.hits.includes(id)) {
      Fossil.hits.push(id);
      square.classList.add("hit")
      hitCount++
      StatusText.textContent = `Hit on ${Fossil.name}✅`

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

//missing
square.classList.add("miss")
StatusText.textContent = "Miss❌"
updateScore();
}

//score update
function updateScore() {
ScoreText.textContent = `Hits: ${hitCount} / ${HitsRequired} || Tries Left: ${TriesNum - tries} || Fossils Remaining: ${FossilShapes.length - FossilsSunk}`

//end of the game
if (hitCount === HitsRequired) {
  StatusText.textContent = "You sunk all the Fossils! YOU WIN! 😍"
  disableBoard()
} else if (tries >= TriesNum) {
  StatusText.textContent = "You've used all your tries. Game Over 😣"
  disableBoard()
}
}

//prevent further clicks after game ends
function disableBoard() {
for (let i = 0; i < 100; i++) {
  const square = document.getElementById(i)
  square.removeEventListener("click", HandleClicK)
}
}


/*----------------------------- Event Listeners -----------------------------*/

//When DOM is ready, initialize everything
window.addEventListener("DOMContentLoaded", () => {
RestartBtn.addEventListener("click", SetupGame)

//restart the game
SetupGame()
})
