/*-------------------------------- Constants --------------------------------*/
//number of available tries
const TriesNum = 80

//fossiles shape and size
const FossilShapes = [
{size:1, shape:'line', part:'Plate1'},
{size:1, shape:'line', part:'Plate2'},
{size:1, shape:'line', part:'Plate3'},
{size:2, shape:'line', part:'Leg1'},
{size:3, shape:'line', part:'Leg2'},
{size:4, shape:'line', part:'Tail'},
{size:6, shape:'rectangle', part:'Head', rows: 2, cols: 3 },
{size:8, shape:'rectangle', part:'Body', rows: 2, cols: 4 }
]

//sum and total fossil sqr = 26
const HitsRequired = FossilShapes.reduce((sum, s)=> sum + s.size, 0)


/*---------------------------- Variables (state) ----------------------------*/
let tries, hitCount,FossilsSunk, Fossils,timeInt
let timerStarted = false;
let min=2, sec=0;


/*------------------------ Cached Element References ------------------------*/
//get element by the id
const board = document.getElementById("game-board")
const StatusText = document.getElementById("status")
const ScoreText = document.getElementById("score")
const RestartBtn = document.getElementById("restart-btn")
const TimerText = document.getElementById("timer")
const hitImg = document.getElementById("hit-effect")


const hitSound = new Audio("./audio/click.wav")
const sunkSound = new Audio("./audio/sunk.mp3")
const winSound = new Audio("./audio/win.mp3")
const loseSound = new Audio("./audio/lose.mp3")


/*-------------------------------- Functions --------------------------------*/
//setup the game
function SetupGame() {

const overlays = document.querySelectorAll('.check-overlay')
overlays.forEach(overlay => {
overlay.style.display = 'none'
})


//Reset time
clearInterval(timeInt)
timerStarted = false
min=2
sec=0
updateTimerDisplay()

board.innerHTML =""
tries= 0
hitCount= 0
FossilsSunk=0
Fossils=[]

//create 10x10 game board =100 sqr
for(let i=0; i < 100; i++){
  const square = document.createElement("div")
  square.classList.add("sqr")
  square.id =i
  square.addEventListener("click", HandleClicK)
  board.appendChild(square)
}

//place fossils on the board base in shape
FossilShapes.forEach((Fossil, index)=>{
  let placed = false
  while(!placed){
    let start = Math.floor(Math.random() * 100)
    let row = Math.floor(start / 10)
    let col = start % 10
    let positions = []
    
//line shape
    if (Fossil.shape === "line"){
      if (col + Fossil.size > 10) continue
      for (let i =0; i < Fossil.size; i++){
        let pos = start + i
        if (Fossils.some(s => s.positions.includes(pos))){
          positions = []
          break
        }
        positions.push(pos)
      }
    } 

//rectangle shape    
    else if (Fossil.shape === "rectangle"){
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

//hiting the fossil -sunk-
    if (positions.length === Fossil.size) {
      Fossils.push({ part: Fossil.part, positions, hits: [] })
      placed = true
    }
  }
})

//update the score
StatusText.textContent = "Click to prospect! You have 80 tries."
ScoreText.textContent = `Hits: 0 / ${HitsRequired}  ~  Tries Left: ${TriesNum}  ~  Fossils Remaining: ${FossilShapes.length}`
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

//while clicking show the img
document.getElementById("game-board").addEventListener("click", function(event) {
  const x = event.pageX
  const y = event.pageY
  showHitImg(x, y)
})

//handle click on the board and start timer
function HandleClicK(event) {
    if (!timerStarted) {
    startTimer()
    timerStarted = true
  }
  
const id = parseInt(event.target.id)
const square = event.target

//hitihg or missing = increase tries
if (square.classList.contains("hit") || square.classList.contains("miss") || tries >= TriesNum) return
tries++

//hiting fossil and sunk
for (let Fossil of Fossils) {
  if (Fossil.positions.includes(id)) {
    if (!Fossil.hits.includes(id)) {
      Fossil.hits.push(id)
      square.classList.add("hit")
      square.setAttribute("data-part", Fossil.part)
      hitCount++
      StatusText.textContent = `Hit on ${Fossil.part}✅`

      if (Fossil.hits.length === Fossil.positions.length) {
        Fossil.positions.forEach(pos => {
          const el = document.getElementById(pos)
          el.classList.add("sunk")
          el.setAttribute("data-part", Fossil.part)
        })

        FossilsSunk++
        StatusText.textContent = `You sunk the ${Fossil.part}🔍👏🏻`
        const partClass = `.check-${Fossil.part.toLowerCase()}`
        const overlay = document.querySelector(partClass)
        sunkSound.currentTime = 0
        sunkSound.play()
        if (overlay) {
        overlay.style.display = "block"
        }
      }

      hitSound.currentTime = 0
      hitSound.play()

      updateScore()
      return
    }
  }
}

//missing
square.classList.add("miss")
StatusText.textContent = "Miss❌"
hitSound.currentTime = 0
hitSound.play()
updateScore()
}

//score update
function updateScore() {
  ScoreText.textContent = `Hits: ${hitCount} / ${HitsRequired} ~ Tries Left: ${TriesNum - tries} ~ Fossils Remaining: ${FossilShapes.length - FossilsSunk}`

  //end of the game -wining or loseing-
  if (hitCount === HitsRequired){
    StatusText.textContent = "All the Fossils sunk! YOU WIN! 😍"
    clearInterval(timeInt)
    disableBoard()
    winSound.currentTime = 0
    winSound.play();
  } 
  else if (tries >= TriesNum){
    StatusText.textContent = "All tries used. Game Over 😣"
    clearInterval(timeInt)
    disableBoard()
    loseSound.currentTime = 0
    loseSound.play();
  }
}

//prevent further clicks after game ends
function disableBoard(){
  for (let i=0; i < 100; i++) {
    const square = document.getElementById(i)
    square.removeEventListener("click", HandleClicK)
  }
}

//update timer
function updateTimerDisplay() {
  let minStr = String(min).padStart(2, '0')
  let secStr = String(sec).padStart(2, '0')
  TimerText.textContent = `Time Left: ${minStr}:${secStr}`
}

//timer
function startTimer() {
  updateTimerDisplay() // show initial time

  timeInt = setInterval(()=>{
    if (sec === 0) {
      if (min === 0) {
        clearInterval(timeInt)
        StatusText.textContent = "Time`s up! Game Over 😣"
        disableBoard()
        loseSound.currentTime = 0;
        loseSound.play();
        return
      } 
      else {
        min--
        sec= 59
      }
    } 
    else {
      sec--
    }

    updateTimerDisplay()
  },1000)
}


/*----------------------------- Event Listeners -----------------------------*/
//When DOM is ready, initialize everything
window.addEventListener("DOMContentLoaded", () => {
RestartBtn.addEventListener("click", SetupGame)

//restart the game
SetupGame()
})
