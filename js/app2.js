/*-------------------------------- Constants --------------------------------*/
//fossiles shape and size
const FossilShapes = [
  { size: 1, shape: 'line', part: 'Plate1' },
  { size: 1, shape: 'line', part: 'Plate2' },
  { size: 1, shape: 'line', part: 'Plate3' },
  { size: 2, shape: 'line', part: 'Leg1' },
  { size: 3, shape: 'line', part: 'Leg2' },
  { size: 4, shape: 'line', part: 'Tail' },
  { size: 6, shape: 'rectangle', part: 'Head', rows: 2, cols: 3 },
  { size: 8, shape: 'rectangle', part: 'Body', rows: 2, cols: 4 }
]

//sum and total fossil sqr = 26
const HitsRequired = FossilShapes.reduce((sum, s) => sum + s.size, 0)

/*---------------------------- Variables (state) ----------------------------*/
let hitCount, FossilsSunk, Fossils
let computerHits, computerFossils, computerFossilsSunk
let computerUsedSquares=[]

/*------------------------ Cached Element References ------------------------*/
//get element by the id
//board
const userBoard = document.getElementById("user-board")
const computerBoard = document.getElementById("computer-board")
//status
const userStatusEl = document.getElementById("user-status")
const userScoreEl = document.getElementById("user-score")
//score
const computerStatusEl = document.getElementById("computer-status")
const computerScoreEl = document.getElementById("computer-score")

const hitImg = document.getElementById("hit-effect")
const RestartBtn = document.getElementById("restart-btn")


const hitSound = new Audio("./audio/click.mp4")
const sunkSound = new Audio("./audio/sunk.mp3")
const winSound = new Audio("./audio/win.mp3")
const loseSound = new Audio("./audio/lose.mp3")

/*-------------------------------- Functions --------------------------------*/
function SetupGame(){

  hitCount=0
  FossilsSunk=0
  computerHits= 0
  computerFossilsSunk = 0
  Fossils= []
  computerFossils= []
  computerUsedSquares= []

  userBoard.innerHTML = ""
  computerBoard.innerHTML = ""

//create 10x10 game board =100 sqr
  for (let i = 0; i < 100; i++){
//user board
    const userSquare = document.createElement("div")
    userSquare.classList.add("sqr")
    userSquare.id = `u${i}`
    userSquare.addEventListener("click", handleUserClick)
    userBoard.appendChild(userSquare)
//computer board
    const compSquare = document.createElement("div")
    compSquare.classList.add("sqr")
    compSquare.id = `c${i}`
    computerBoard.appendChild(compSquare)
  }

//placeing the fossil randomly for the user
  placeFossils(Fossils, 'u')
//placeing the fossil randomly for the computer
  placeFossils(computerFossils, 'c')

//user ststus & score
  userStatusEl.textContent = "Click to prospect!"
  userScoreEl.textContent = `Hits: 0 / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length}`
//computer ststus & score
  computerStatusEl.textContent = "Waiting..."
  computerScoreEl.textContent = `Hits: 0 / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length}`
  
  document.querySelectorAll('.check-overlay').forEach(overlay => {
    overlay.style.display = 'none'
  })
}

//place fossils on the board base in shape
function placeFossils(targetArray, prefix) {
  FossilShapes.forEach(Fossil=>{
    let placed = false
    while (!placed) {
      let start = Math.floor(Math.random() * 100)
      let row = Math.floor(start / 10)
      let col = start % 10
      let positions = []
// line shapr 
      if (Fossil.shape === "line") {
        if (col + Fossil.size > 10) continue
        for (let i = 0; i < Fossil.size; i++){
          let pos = start + i
          if (targetArray.some(s => s.positions.includes(pos))) {
            positions = []
            break
          }
          positions.push(pos)
        }

//rectangle shape
      } else if (Fossil.shape === "rectangle"){
        if (row + Fossil.rows > 10 || col + Fossil.cols > 10) continue;
        for (let r = 0; r < Fossil.rows; r++){
          for (let c = 0; c < Fossil.cols; c++){
            let pos = (row + r) * 10 + (col + c)
            if (targetArray.some(s => s.positions.includes(pos))) {
              positions = []
              break
            }
            positions.push(pos)
          }
        }
      }

//hiting the fossil -sunk-
      if (positions.length === Fossil.size){
        targetArray.push({ part: Fossil.part, positions, hits:[]})
        placed = true
      }
    }
  })
}

//click sqr
function handleUserClick(event) {
  const id = parseInt(event.target.id.replace('u', ''))
  const square = event.target

  if (square.classList.contains("hit") || square.classList.contains("miss")) return

  let hit = false

//hiting fossil and sunk
  for (let Fossil of Fossils) {
    if (Fossil.positions.includes(id) && !Fossil.hits.includes(id)) {

      Fossil.hits.push(id)
      square.classList.add("hit")
      square.setAttribute("data-part", Fossil.part)
      hitCount++;
      userStatusEl.textContent = `Hit on ${Fossil.part} ✅`

      if (Fossil.hits.length === Fossil.positions.length){
        Fossil.positions.forEach(pos=>{
          const el = document.getElementById('u' + pos)
          el.classList.add("sunk")
          el.setAttribute("data-part", Fossil.part)
        })

        FossilsSunk++

        userStatusEl.textContent = `You sunk the ${Fossil.part} 🔍👏🏻`
        const overlay = document.querySelector(`.check-${Fossil.part.toLowerCase()}.user-overlay`)
        if (overlay) overlay.style.display = "block"
        sunkSound.play()
      }

      hitSound.play()
      updateScore()

      setTimeout(computerTurn, 800)
      return
    }
  }

  square.classList.add("miss")
  userStatusEl.textContent = "Miss ❌"
  hitSound.play()
  updateScore()
  setTimeout(computerTurn, 800)

}

//temporory magnifying img
function showHitImg(x, y) {
  hitImg.style.left= x + 'px'
  hitImg.style.top= y + 'px'
  hitImg.style.display = 'block'
//show only for 0.3 sec
setTimeout(()=>{
    hitImg.style.display = 'none'
  },300)
}

//while clicking show the img in the user board
document.getElementById("user-board").addEventListener("click", function(event) {
  const x = event.pageX
  const y = event.pageY
  showHitImg(x, y)
})


function computerTurn() {
  let id
  do {
    id = Math.floor(Math.random() * 100)
  } while (computerUsedSquares.includes(id))

  computerUsedSquares.push(id)
  const square = document.getElementById('c' + id)

  let hit = false
  for (let Fossil of computerFossils){
    if (Fossil.positions.includes(id) && !Fossil.hits.includes(id)){
      Fossil.hits.push(id)
      square.classList.add("hit")
      square.setAttribute("data-part", Fossil.part)
      computerHits++

      computerStatusEl.textContent = `Hit on ${Fossil.part} ✅`

      if (Fossil.hits.length === Fossil.positions.length){
        Fossil.positions.forEach(pos=>{
          const el = document.getElementById('c' + pos)
          el.classList.add("sunk")
          el.setAttribute("data-part", Fossil.part)
        })

        computerFossilsSunk++
        const overlay = document.querySelector(`.check-${Fossil.part.toLowerCase()}.computer-overlay`)
        if (overlay) overlay.style.display = "block"
        sunkSound.play()
      }

      hit = true
      break

    }
  }

  if (!hit) {
    square.classList.add("miss")
    computerStatusEl.textContent = "Miss ❌"
  }

  updateComputerScore()

  if (computerHits === HitsRequired) {
    computerStatusEl.textContent = "Computer got all fossils! YOU LOSE 😣"
    disableBoard()
    loseSound.play()
  }
}


function updateScore(){
  userScoreEl.textContent=`Hits: ${hitCount} / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length - FossilsSunk}`

  if (hitCount === HitsRequired) {
    userStatusEl.textContent = "All the Fossils sunk! YOU WIN! 😍"
    disableBoard()
    winSound.play()
  }

}

function updateComputerScore() {
  computerScoreEl.textContent = `Hits: ${computerHits} / ${HitsRequired} ~ Fossils Remaining: ${FossilShapes.length - computerFossilsSunk}`
}

function disableBoard(){
  for (let i = 0; i < 100; i++){
    const square = document.getElementById('u' + i)
    square.removeEventListener("click", handleUserClick)
  }
}

/*----------------------------- Event Listeners -----------------------------*/
//When DOM is ready, initialize everything
window.addEventListener("DOMContentLoaded",()=>{
  RestartBtn.addEventListener("click", SetupGame)
//restart the game
  SetupGame()
})
