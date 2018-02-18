
<?php
$path = $_SERVER['DOCUMENT_ROOT'].'/proto/data/plants.txt';
echo $path;
$myfile = fopen($path, "r");
fread($myfile));
fclose($myfile);
?>
