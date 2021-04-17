<?php

class Database {
  protected function db_connect(){
    $host = 'localhost';
    $name = 'root';
    $password = '';
    $database = 'online_checkers';
    
    return new mysqli($host, $name, $password, $database);
  }
}