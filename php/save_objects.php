
<?php
$path = $_SERVER['DOCUMENT_ROOT'].$_POST['path'];
//echo "path: ".$path."\n";
//echo "data: ".$_POST['data']."\n";
$myfile = fopen($path, "w");
fwrite($myfile, $_POST['data']);
fclose($myfile);
?>
