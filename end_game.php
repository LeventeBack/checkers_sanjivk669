<?php 
include './classes/database.class.php';
include './classes/room.class.php';

if(isset($_POST['room_id'])){
  Room::endGame($_POST['room_id']);
}