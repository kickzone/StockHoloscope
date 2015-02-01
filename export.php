<?php
require_once 'funcs.php';

// 初期値
$message = "";
$tbFolder = 'C:\\data\\stock\\';

if (isset ( $_POST ["make"] )) {
	// 無制限一本勝負
	set_time_limit ( 0 );
	
	echo '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
	// テキストボックスの値をそのままにする
	$year = $_POST ["year"];
	
	$mysqli = OpenDb ();
	$fp = fopen ( $tbFolder . "\\" . $year . ".csv", "w" );
	for($month = 1; $month <= 12; $month ++) {
		if ($month < 10)
			$smonth = "0" . $month;
		else
			$smonth = "" . $month;
		$query = "SELECT * FROM shhiashi WHERE ymd >= '$year-$smonth-01' AND ymd <= '$year-$smonth-31'";
		$result = ExecQuery ( $mysqli, $query );
		while ( $row = $result->fetch_assoc () ) {
			$line = $row ['ymd'] . "," . $row ['mcode'] . "," . $row ['type'] . "," . $row ['open'] . "," . $row ['high'] . "," . $row ['low'] . "," . $row ['close'] . "," . $row ['volume'] . "\n";
			fwrite ( $fp, $line );
		}
		$result->free ();
	}
	fclose ( $fp );
	$mysqli->close ();
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>株価データエクスポート</title>
</head>

<body>
	<form id="tableForm" name="tableForm" action="" method="POST">
		<fieldset>
			<legend>日足データエクスポート</legend>
			年度：<input type="text" id="year" name="year" value="2000" /><BR> <BR>
			<input type="submit" id="make" name="make" value="エクスポート"><BR>
		</fieldset>
	</form>
</body>

</html>