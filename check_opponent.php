<?php 
include './classes/database.class.php';
include './classes/room.class.php';

if(isset($_POST['room_id'])){
  echo Room::isOpponent($_POST['room_id']);
}