<?php
session_start();
include './classes/database.class.php';
include './classes/moves.class.php';

if(isset($_POST['room_id'])){
  $moves = Moves::getUnhandeledMoves($_POST['room_id'], $_SESSION['player_id']);
  if($moves){
    Moves::setMovesAsHandeled($_POST['room_id'], $_SESSION['player_id']);
    echo json_encode($moves);
  }
  else 
    echo json_encode(false);
}