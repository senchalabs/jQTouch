<?php
$theaters = array("Los Gatos Cinema","Cinelux Plaza Theatre","Camera 7");
$movies = array("Transformers","Knocked Up","Live Free Die Hard");
$title = "-";
if ($_POST["zip"]) {
    $title = "Zip " . $_POST['zip'];
} else {
    $title = $_POST['movie'];
}
?>
<div id="post">
  <div class="toolbar">
    <h1><?php echo $title ?></h1>
    <a href="#" class="button back">Back</a>
  </div>
  <ul class="edgetoedge">
<?php
  if ($_POST['zip']) {
    foreach ($theaters as $theater) {
      echo '<li><a href="#theater">' . $theater . '</a></li>';
    }
  } else {
    foreach ($movies as $movie) {
      echo '<li><a href="#movie">' . $movie . '</a></li>';
    }
  }
?>
  </ul>
  <form action="ajax_post.php" method="POST">
    <ul class="rounded">
      <li><input type="text" name="zip" value="" placeholder="Live post event test" /></li>
    </ul>
    <a style="margin:0 10px;color:rgba(0,0,0,.9)" href="#" class="submit whiteButton">Submit</a>
  </form>
</div>
<div></div>
