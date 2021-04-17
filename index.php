<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./assets/css/main.css">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
  <title>Online Checkers</title>
</head>
<body>
<?php
    include './classes/database.class.php';
    include './classes/room.class.php';
    session_start();
    if(!isset($_SESSION['player_id'])){
      $_SESSION['player_id'] = substr(md5(uniqid(rand(), true)), 0, 12);
    }
    
    $ROOM_ID = null;

    if(isset($_POST['online_start'])){
      $ROOM_ID = Room::createRoom($_SESSION['player_id']);
      $HOST_FIRST_MOVE = true;
    } 

    if(isset($_POST['online_join'])){
      $error_msg = Room::checkRoomAvailablity($_POST['room_id'], $_SESSION['player_id']);
      if(!$error_msg && Room::joinRoom($_POST['room_id'], $_SESSION['player_id'])){
          $ROOM_ID = $_POST['room_id'];
      } else {
        echo "<div class='message'>$error_msg</div>";
      }
    } 
  ?>
  <header class="header">
    <h1 class="header__title">Online Checkers</h1>
  </header>
  <div class="container">
    <div class="status">
      <?php if($ROOM_ID){ ?>
        <div class="status__roomid">Room ID: <?php echo $ROOM_ID?></div>
      <?php } ?>
      <div class="status__turn"><span class="nextplayer">dark</span>'s turn</div>
      <button class="status__restart" data-reset>Reset Game</button>
    </div>
    <div class="board" data-after-text="Waiting for the opponent"></div>
  </div>
  <?php if(!$ROOM_ID){ ?>
    <div class="overlay">
      <button class="overlay__button" data-local-start>Local game</button>
      <form action="" class="overlay__form" method="POST">
        <button class="overlay__button" name="online_start" type="submit">Start multiplayer game</button>
      </form>
      <form action="" class="overlay__form" method="POST">
        <input class="overlay__input" type="text" placeholder="Room code" name="room_id" required autocomplete="off">    
        <button class="overlay__button" name="online_join" type="submit">Join multiplayer game</button>
      </form>
    </div>
  <?php } else {?>
  <script>
     const ROOM_ID = "<?php echo $ROOM_ID; ?>";
  </script>
  <?php } ?>

  <script src="./assets/js/checker.js"></script>
  <script src="./assets/js/main.js"></script>

<script type='text/javascript'> 
<?php if($ROOM_ID && isset($HOST_FIRST_MOVE)) { ?>
    requsetForOpponent();
    setTableBlock(true);
<?php } else if($ROOM_ID) { ?>  
    setTableBlock(true);
    requestForMoves();
    checkForfeit();
<?php } ?>
  setup();
</script>

</body>
</html>