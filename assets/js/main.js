import {
  createBoard, 
  resetHighlighs, 
  highlightMoves,
  CLASS_NAMES,
  getPossibleMoves,
  hasWon,
  hasLosed
} from './checker.js'

const TEAM_NAMES = {
  light: 'WHITE',
  dark: 'RED'
}

const boardElement = document.querySelector('.board'); 
const nextPlayerText = document.querySelector('.nextplayer'); 

const board = createBoard();
let possibleMoves = [];
let activePlayer = 'dark';

board.forEach(row => {
  row.forEach(cell => {
    boardElement.append(cell.element);
    cell.element.addEventListener('click', () => {
      let changeTeam = true;
      const selectedCell = document.querySelector(`.${CLASS_NAMES.SELECTED}`);
      
      if(selectedCell == cell.element){
        cell.element.classList.remove(CLASS_NAMES.SELECTED)
        resetHighlighs(board);
      } 
      else if(cell.element.classList.contains(CLASS_NAMES.HIGHLIGHT)){
        cell.player = selectedCell.dataset.player;
        selectedCell.dataset.player = "";

        if(selectedCell.classList.contains(CLASS_NAMES.KING)){
          cell.isKing = true;
          selectedCell.classList.remove(CLASS_NAMES.KING);
        }

        if(cell.player == CLASS_NAMES.DARK && cell.x == 0 ||
          cell.player == CLASS_NAMES.LIGHT && cell.x == 7)
            cell.element.classList.add(CLASS_NAMES.KING)

        const move = possibleMoves.find(move => move.element == cell.element)
        if(move.remove) {
          move.remove.player = '';
          let newMoves = getPossibleMoves(board, cell);
          newMoves = newMoves.filter(m => m.remove != null);
          changeTeam = newMoves.length == 0;
        }
        
        resetHighlighs(board);    

        if(hasWon(board, activePlayer)){
          alert(activePlayer + 'has won');
        } 
        else if(hasLosed(board, activePlayer)){
          alert(activePlayer + 'has losed');
        }
        else if(changeTeam) 
          changeActivePlayer()
      } 
      else {
        resetHighlighs(board);
        if(cell.player && activePlayer == cell.player){
          possibleMoves = getPossibleMoves(board, cell);
          cell.element.classList.add(CLASS_NAMES.SELECTED)
          highlightMoves(possibleMoves);
        }
      }
    })
  })
})


function changeActivePlayer(){
  activePlayer = (activePlayer == 'dark')? 'light' : 'dark';
  updatePlayerText();
}

function updatePlayerText(){
  nextPlayerText.innerText = TEAM_NAMES[activePlayer];

  nextPlayerText.classList.remove(CLASS_NAMES.LIGHT);
  nextPlayerText.classList.remove(CLASS_NAMES.DARK);
  nextPlayerText.classList.add(activePlayer);
}

function resizeBoard(){
  const cell = board[0][0];
  const width = cell.element.getBoundingClientRect().width;
  boardElement.style.gridTemplateRows =  `repeat(8, ${width}px)`
}

window.onresize = resizeBoard;


resizeBoard();
updatePlayerText();