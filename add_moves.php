<?php
session_start();
include './classes/database.class.php';
include './classes/moves.class.php';

if(isset($_POST['moves']) && isset($_POST['room_id'])){
  echo Moves::addMove($_POST['room_id'], $_SESSION['player_id'], $_POST['moves']);
}