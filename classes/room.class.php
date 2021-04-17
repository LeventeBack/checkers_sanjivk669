<?php

class Room extends Database {

  public static function createRoom($host_player){
    $db = parent::db_connect();
    do {
      $room_id = substr(md5(uniqid(rand(), true)), 0, 8);
    } while(!self::isIdUnique($room_id));

    $sql = "INSERT INTO rooms (id, host_player) VALUES ('$room_id', '$host_player')";

    $success = $db->query($sql);

    return ($success)? $room_id : false;
  }

  public static function checkRoomAvailablity($room_id, $player_id){
    $db = parent::db_connect();
    $sql = "SELECT * FROM rooms WHERE id = '$room_id'";
    $result = $db->query($sql);

    if($result->num_rows == 0)
      return 'Room not found!';    
    $room = $result->fetch_object();

    if($room->has_ended)
      return 'The game has already ended!';

    if($room->host_player == $player_id)
      return "Select Local Game if you want to play locally.";

    if($room->guest_player == null || $room->guest_player == $player_id)
        return NULL;
    else 
      return 'The room is full!';
  }

  public function gameHasEnded($room_id){
    $db = parent::db_connect();
    $sql = "SELECT has_ended FROM rooms WHERE id = '$room_id'";
    $result = $db->query($sql);
    $room = $result->fetch_object();
    return $room->has_ended == '1';
  }

  private static function isIdUnique($id){
    $db = parent::db_connect();
    $sql = "SELECT * FROM rooms WHERE id = '$id'";
    $result = $db->query($sql);
    return $result->num_rows == 0;
  }

  public static function joinRoom($room_id, $player_id){
    $db = parent::db_connect();
    $sql = "UPDATE rooms 
        SET guest_player = '$player_id' 
        WHERE id = '$room_id'";
    $succes = $db->query($sql);
    return $succes;
  }

  public static function endGame($room_id){
    $db = parent::db_connect();
    $sql = "UPDATE rooms 
        SET has_ended = '1' 
        WHERE id = '$room_id'";
    $db->query($sql);
  }

  public static function isOpponent($room_id){
    $db = parent::db_connect();
    $sql = "SELECT * FROM rooms WHERE id = '$room_id'";
    $result = $db->query($sql);
    $room = $result->fetch_object();
    return $room->guest_player != NULL;
  }
}