// GLOBAL CONSTANTS
const TEAM_NAMES = {
  light: 'WHITE',
  dark: 'RED'
}
const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'  
}
const CLASS_NAMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGHLIGHT: 'highlight',
  SELECTED: 'selected',
  KING: 'king',
  WAITING: 'waiting',
  ENDED: 'ended'
}
const DEFAULT_START_PLAYER = 'dark';

// SELECTORS
const boardElement = document.querySelector('.board'); 
const nextPlayerText = document.querySelector('.nextplayer'); 
const overlay = document.querySelector('.overlay');
const localStartButton = document.querySelector('[data-local-start]');
const playerIdInput = document.querySelector('#player-id');
const resetButton = document.querySelector('[data-reset]');

// GLOBAL VARIABLES
const board = createBoard();
let possibleMoves = [];
let activePlayer = DEFAULT_START_PLAYER;
let gameType = GAME_TYPES.ONLINE;
let onlineMoveArray = [];
let tableBlock;
let opponentForfeited = false;

// EVENT LISTENERSS
board.forEach(row => {
  row.forEach(cell => {
    boardElement.append(cell.element);

    cell.element.addEventListener('click', () => {
      if(gameType == GAME_TYPES.ONLINE && tableBlock) return;

      const selectedCell = document.querySelector(`.${CLASS_NAMES.SELECTED}`);
      onlineMoveArray.push({x: cell.x, y: cell.y}); 
      handleCellClick(cell, selectedCell, activePlayer)
    })
  })
})

resetButton.addEventListener('click', () => location.reload());

localStartButton && localStartButton.addEventListener('click', () => {
  overlay.classList.add('hidden');
  gameType = GAME_TYPES.local;
  activePlayer = DEFAULT_START_PLAYER;
});

window.onresize = resizeBoard;
window.onbeforeunload = () => {
  if(typeof ROOM_ID === 'undefined') return;

  if(gameType == GAME_TYPES.ONLINE){
    let data = new FormData();
    data.append('room_id', ROOM_ID);
    
    navigator.sendBeacon('./end_game.php', data);
  }
}

// HELPER FUNCTIONS
function setup(){ 
  resizeBoard();
  updatePlayerText();
  if ( window.history.replaceState ) {
    window.history.replaceState( null, null, window.location.href );
  }
}

function resizeBoard() {
  const cell = board[0][0];
  const width = cell.element.getBoundingClientRect().width;
  boardElement.style.gridTemplateRows =  `repeat(8, ${width}px)`
}

function handleCellClick(cell, selectedCell, activePlayer){
  if(selectedCell == cell.element){
    cell.element.classList.remove(CLASS_NAMES.SELECTED)
    resetHighlighs(board);
  } 
  else if(cell.element.classList.contains(CLASS_NAMES.HIGHLIGHT)){
    changeCellContent(cell, selectedCell);
    makeKingIfNecessary(cell);
    resetHighlighs(board);    

    const isNextRemovingMove = removePlayer(cell);

    if(!gameEnded(activePlayer) && !isNextRemovingMove)
      changeActivePlayer();
    else if(gameEnded(activePlayer)){
      sendMoves();
      tableBlock = true;
      showEndScreen();
    }     
  } 
  else {
    resetHighlighs(board);
    if(cell.player && activePlayer == cell.player){
      possibleMoves = getPossibleMoves(board, cell);
      cell.element.classList.add(CLASS_NAMES.SELECTED)
      highlightMoves(possibleMoves);
    }
  }
}


function gameEnded(activePlayer){
  const playerWon = hasWon(board, activePlayer);
  const playerLost = hasLosed(board, activePlayer);

  return playerWon || playerLost;
}

function showEndScreen(){    
  if(hasLosed(board, activePlayer))
  activePlayer = (activePlayer == 'dark')? 'light' : 'dark';
  
  boardElement.classList.add(activePlayer);
  boardElement.classList.add(CLASS_NAMES.ENDED);
  boardElement.classList.remove(CLASS_NAMES.WAITING);
  
  const endScreenText = `${TEAM_NAMES[activePlayer]} HAS WON!`;
  boardElement.setAttribute('data-after-text', endScreenText);
}

function removePlayer(cell){
  const move = possibleMoves.find(move => move.element == cell.element)
  if(!move.remove) return false; 

  move.remove.player = '';
  move.remove.isKing = false;

  let newMoves = getPossibleMoves(board, cell);
  newMoves = newMoves.filter(m => m.remove != null);
  return newMoves.length != 0;
}

function setTableBlock(state){
  tableBlock = state;
  if(tableBlock)
    boardElement.classList.add(CLASS_NAMES.WAITING);
  else
    boardElement.classList.remove(CLASS_NAMES.WAITING)
}

function makeKingIfNecessary(cell){
  if( cell.player == CLASS_NAMES.DARK && cell.x == 0 || 
      cell.player == CLASS_NAMES.LIGHT && cell.x == 7 )
    cell.element.classList.add(CLASS_NAMES.KING)
}

function changeCellContent(cell, selectedCell){
  cell.player = selectedCell.dataset.player;
  selectedCell.dataset.player = "";
  cell.isKing = selectedCell.classList.contains(CLASS_NAMES.KING);
  selectedCell.classList.remove(CLASS_NAMES.KING);
}

function changeActivePlayer(){
  activePlayer = (activePlayer == 'dark')? 'light' : 'dark';
  updatePlayerText();
  sendMoves();
}

function updatePlayerText(){
  nextPlayerText.innerText = TEAM_NAMES[activePlayer];
  
  nextPlayerText.classList.remove(CLASS_NAMES.LIGHT);
  nextPlayerText.classList.remove(CLASS_NAMES.DARK);
  nextPlayerText.classList.add(activePlayer);
}

function sendMoves(){
  if(gameType != GAME_TYPES.ONLINE || tableBlock) return;

  $.ajax({
    type: "POST",
    url: "./add_moves.php",
    data: {
      moves: JSON.stringify(onlineMoveArray),
      room_id: ROOM_ID
    },
    error: (err) => {
      console.error(err)
    }
  });

  setTableBlock(true);
  requestForMoves();
  onlineMoveArray.splice(0, onlineMoveArray.length);
}

function requestForMoves(){
  if(opponentForfeited) return;

  $.ajax({
    type: "POST",
    url: "./get_moves.php",
    data: {room_id: ROOM_ID},
    dataType: 'json',
    success: (moves) => {
      if(moves){
        moves.forEach(move => {
          const {x, y} = move;
          const cell = board[x][y];
          const selectedCell = document.querySelector(`.${CLASS_NAMES.SELECTED}`);
          handleCellClick(cell, selectedCell, activePlayer);
        })
        setTableBlock(false);
      }
      else
        setTimeout(requestForMoves, 500);
    },
    error: (err) => {
      console.error(err)
    }
  });
}

function requsetForOpponent(){
  boardElement.setAttribute('data-after-text', "Waiting for the opponent to join");
  $.ajax({
    type: "POST",
    url: "./check_opponent.php",
    data: {room_id: ROOM_ID},
    success: (opponent) => {
      if(opponent){          
        setTableBlock(false);        
        boardElement.setAttribute('data-after-text', "Waiting for the opponent");
        checkForfeit();
      } 
      else
        setTimeout(requsetForOpponent, 500);
    },
    error: (err) => {
      console.error(err)
    }
  });
}

function checkForfeit(){
  $.ajax({
    type: "POST",
    url: "./check_forfeit.php",
    data: {room_id: ROOM_ID},
    success: (forfeit) => {
      if(forfeit){     
        if(!gameEnded(activePlayer)){
          opponentForfeited = true;
          setTableBlock(true);
          boardElement.classList.add(CLASS_NAMES.ENDED);
          boardElement.classList.remove(CLASS_NAMES.WAITING);
          boardElement.setAttribute('data-after-text', "YOU WON! Your opponent forfeited!");
        }     
      } 
      else
        setTimeout(checkForfeit, 500);
    },
    error: (err) => {
      console.error(err)
    }
  });
}