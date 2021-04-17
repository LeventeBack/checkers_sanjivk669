<?php

class Moves  extends Database{

  public static function addMove($room_id, $player_id, $moves){
    $db = parent::db_connect();
    $sql = "INSERT INTO moves 
            (room_id, player_id, move_array) VALUES 
            ('$room_id', '$player_id', '$moves')";

    $success = $db->query($sql);
    return $success;
  }
  
  public static function getUnhandeledMoves($room_id, $player_id){
    $db = parent::db_connect();
    $sql = "SELECT move_array FROM moves 
            WHERE room_id = '$room_id' 
            AND handeled = '0'
            AND player_id != '$player_id'";

    $result = $db->query($sql);
    if($result->num_rows){
      while($row = $result->fetch_object()){
        $moves = json_decode($row->move_array);
        foreach($moves  as $move){
          $data[] = $move;
        }
      }
      return $data;
    } 
    return [];
  }

  public static function setMovesAsHandeled($room_id, $player_id){
    $db = parent::db_connect();
    $sql = "UPDATE moves 
            SET handeled = '1'
            WHERE room_id = '$room_id' 
            AND handeled = '0'
            AND player_id != '$player_id'"; 
    $db->query($sql);
  }
}