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
const HitsRequired = FossilShapes.reduce((sum, s) => sum + s.size, 0)


/*---------------------------- Variables (state) ----------------------------*/
let tries, hitCount, FossilsSunk, Fossils


/*------------------------ Cached Element References ------------------------*/
const board = document.getElementById("game-board")
const StatusText = document.getElementById("status")
const ScoreText = document.getElementById("score")
const RestartBtn = document.getElementById("restart-btn")


/*-------------------------------- Functions --------------------------------*/


/*----------------------------- Event Listeners -----------------------------*/

window.addEventListener("DOMContentLoaded", () => {
  RestartBtn.addEventListener("click", SetupGame)
  SetupGame()
})
