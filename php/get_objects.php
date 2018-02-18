
<?php
$path = $_SERVER['DOCUMENT_ROOT'].$_POST['path'];
$myfile = fopen($path, "r") or die("Unable to open file!");
echo fread($myfile));
fclose($myfile);
?>
