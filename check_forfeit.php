<?php 
include './classes/database.class.php';
include './classes/room.class.php';

if(isset($_POST['room_id'])){
  echo Room::gameHasEnded($_POST['room_id']);
} 