function createBoard(){
  const board = [];

  for(let x = 0; x < 8; x++){
    const row = [];
    for(let y = 0; y < 8; y++){
       const cell = getCell(x, y);
       row.push(cell);
    }
    board.push(row);
  }

  return board;
}

function getPossibleMoves(board, cell){
  const {x, y, isKing, player} = cell;
  const possibleMoves = [];
  const verticalDirections = [];
  if(player == CLASS_NAMES.LIGHT || isKing) verticalDirections.push(1);
  if(player == CLASS_NAMES.DARK || isKing) verticalDirections.push(-1);
  
  verticalDirections.forEach(xDir => {
    [1, -1].forEach(yDir => {
      const newX = x + xDir;
      const newY = y + yDir;
      if(existingCell(newX, newY)){
        const targetCell = board[newX][newY];
        if(!targetCell.player)
          possibleMoves.push({
            element: targetCell.element,
            remove: null
          });

        if(targetCell.player && existingCell(newX + xDir, newY + yDir)){  
          const jumpTargetCell = board[newX + xDir][newY + yDir];
          if(targetCell.player != player && !jumpTargetCell.player) 
            possibleMoves.push({
              element: jumpTargetCell.element,
              remove: targetCell
            });
        }
      }
    })
  })
  return possibleMoves;
}

function resetHighlighs(board){
  board.forEach(row => {
    row.forEach(cell => {
      cell.element.classList.remove(CLASS_NAMES.HIGHLIGHT);
      cell.element.classList.remove(CLASS_NAMES.SELECTED);
    })
  })  
}

function highlightMoves(moves){    
  moves.forEach(move => {
    move.element.classList.add(CLASS_NAMES.HIGHLIGHT);
  });
}

function hasWon(board, activePlayer){
  return noOppenentPiece(board, activePlayer) || noOppenentMoves(board, activePlayer);
}

function hasLosed(board, activePlayer){
  return board.every(row => {
    return row.every(cell => {
      if(cell.player == activePlayer)
        return getPossibleMoves(board, cell).length == 0;
      return true;
    })
  }) 
}

function noOppenentPiece(board, activePlayer){
  return !board.some(row => {
    return row.some(cell => {
     return cell.player && cell.player != activePlayer ;
    })
  }) 
}

function noOppenentMoves(board, activePlayer){
  return board.every(row => {
    return row.every(cell => {
      if(cell.player && cell.player != activePlayer)
        return getPossibleMoves(board, cell).length == 0;
      return true;
    })
  }) 
}

function existingCell(x, y){
  return x >= 0 && x < 8 && y >= 0 && y < 8
}

function getCell(x, y){
  return {
    x, 
    y, 
    element: getElement(x, y),
    get isKing(){
      return this.element.classList.contains(CLASS_NAMES.KING);
    },
    set isKing(value){
      if(value) this.element.classList.add(CLASS_NAMES.KING)
      else this.element.classList.remove(CLASS_NAMES.KING)
    },
    get player(){
      return this.element.dataset.player;
    },          
    set player(value){
      this.element.dataset.player = value;
    },
  }
}

function getElement(x, y){
  const element = document.createElement('div');
  element.classList.add('cell');

  if((x % 2 == 0 && y % 2==0) || (x % 2 && y % 2))
    element.classList.add('light');
  else {
    if(x < 3) element.dataset.player = CLASS_NAMES.LIGHT;
    if(x > 4) element.dataset.player = CLASS_NAMES.DARK;
  }

  return element;
}