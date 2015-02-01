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
	$tbFolder = $_POST ["folder"];
	
	$iterator = new RecursiveDirectoryIterator ( $_POST ["folder"] );
	$iterator = new RecursiveIteratorIterator ( $iterator );
	
	$mysqli = OpenDb ();
	foreach ( $iterator as $fileinfo ) { // $fileinfoはSplFiIeInfoオブジェクト
		if ($fileinfo->isFile ()) {
			if ($_REQUEST ["service"] == 1) {
				// 2005年までモード
				ReadBefore2005 ( $fileinfo->getRealPath (), $mysqli );
			} else if ($_REQUEST ["service"] == 2) {
				// 2005年までモード
				ReadAfter2006 ( $fileinfo->getRealPath (), $mysqli );
			} else if ($_REQUEST ["service"] == 3) {
				// 銘柄名だけ読むモード
				if ($fileinfo->getFileName () == "MNAME.CSV") {
					ReadMeigara ( $fileinfo->getRealPath (), $mysqli );
				}
			}
		}
	}
	$mysqli->close ();
}
function WriteLog($str) {
	echo $str;
	$fp = fopen ( "log.txt", "a" );
	$strLog = str_replace ( "<BR>", "\n", $str );
	fwrite ( $fp, $strLog );
	fclose ( $fp );
}
function ReadBefore2005($fileName, $mysqli) {
	$fp = fopen ( $fileName, "r" );
	while ( $line = fgets ( $fp ) ) {
		$line = mb_convert_encoding ( $line, "UTF-8", "SJIS" );
		$arr = preg_split ( '/,/', $line );
		$ymd = str_replace ( "/", "-", $arr [0] );
		$mname = trim ( $arr [2], "\"" );
		// レコード挿入
		// 仕様
		// 1 日足年月日 日付 yyyy/mm/dd
		// 2 銘柄コード 数値型
		// 3 銘柄名 文字型
		// 4 始値 数値型
		// 5 高値 数値型
		// 6 安値 数値型
		// 7 終値 数値型
		// 8 出来高 数値型
		// 9 市場区分 数値型
		$query = "INSERT INTO shhiashi (ymd, mcode, type, open, high, low, close, volume) VALUES (\"$ymd\", $arr[1], $arr[8], $arr[3], $arr[4], $arr[5], $arr[6], $arr[7])";
		$result = ExecQuery ( $mysqli, $query );
		
		// 銘柄名挿入
		$query = "SELECT * FROM shmeigara WHERE mcode=$arr[1]";
		$result = ExecQuery ( $mysqli, $query );
		if ($result->num_rows > 0) {
			// 銘柄名が存在したらアップデート
			$row = $result->fetch_assoc ();
			if ($row ['mname'] != $mname) {
				$query = "UPDATE shmeigara SET mname=\"$mname\" WHERE mcode=$arr[1]";
				$result = ExecQuery ( $mysqli, $query );
				WriteLog ( "銘柄更新 $arr[1]:$mname<BR>" );
			}
		} else {
			// 存在しなければ挿入
			$query = "INSERT INTO shmeigara (mcode, mname) VALUES ($arr[1], \"$mname\")";
			$result = ExecQuery ( $mysqli, $query );
			WriteLog ( "銘柄挿入 $arr[1]:$mname<BR>" );
		}
	}
	fclose ( $fp );
	WriteLog ( "$fileName 処理完了<BR>" );
}
function ReadAfter2006($fileName, $mysqli) {
	$fp = fopen ( $fileName, "r" );
	while ( $line = fgets ( $fp ) ) {
		$line = mb_convert_encoding ( $line, "UTF-8", "SJIS" );
		$arr = preg_split ( '/,/', $line );
		$ymd = str_replace ( "/", "-", $arr [0] );
		// レコード挿入
		// 仕様
		// 1 年月日 日付 yyyy/mm/dd
		// 2 銘柄コード 数値型
		// 3 市場区分 数値型
		// 4 始値 数値型
		// 5 高値 数値型
		// 6 安値 数値型
		// 7 終値 数値型
		// 8 出来高 数値型
		$query = "INSERT INTO shhiashi (ymd, mcode, type, open, high, low, close, volume) VALUES (\"$ymd\", $arr[1], $arr[2], $arr[3], $arr[4], $arr[5], $arr[6], $arr[7])";
		$result = ExecQuery ( $mysqli, $query );
	}
	fclose ( $fp );
	WriteLog ( "$fileName 処理完了<BR>" );
}
function ReadMeigara($fileName, $mysqli) {
	$fp = fopen ( $fileName, "r" );
	while ( $line = fgets ( $fp ) ) {
		$line = mb_convert_encoding ( $line, "UTF-8", "SJIS" );
		$arr = preg_split ( '/,/', $line );
		$mname = trim ( $arr [1], "\x22 \x27" );
		$mname = str_replace ( "\"", "", $mname );
		// レコード更新・挿入
		// 仕様
		// 1 銘柄コード 数値型
		// 2 銘柄名 文字型
		// 銘柄名挿入
		$query = "SELECT * FROM shmeigara WHERE mcode=$arr[0]";
		$result = ExecQuery ( $mysqli, $query );
		if ($result->num_rows > 0) {
			// 銘柄名が存在したらアップデート
			$row = $result->fetch_assoc ();
			if ($row ['mname'] != $mname) {
				$query = "UPDATE shmeigara SET mname=\"$mname\" WHERE mcode=$arr[0]";
				$result = ExecQuery ( $mysqli, $query );
				WriteLog ( "銘柄更新 $arr[0]:$mname<BR>" );
			}
		} else {
			// 存在しなければ挿入
			$query = "INSERT INTO shmeigara (mcode, mname) VALUES ($arr[0], \"$mname\")";
			$result = ExecQuery ( $mysqli, $query );
			WriteLog ( "銘柄挿入 $arr[0]:$mname<BR>" );
		}
	}
	fclose ( $fp );
	WriteLog ( "$fileName 処理完了<BR>" );
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>株価データインポート</title>
</head>

<body>
	<form id="tableForm" name="tableForm" action="" method="POST">
		<fieldset>
			<legend>日足データインポート</legend>
			対象フォルダ：<input type="text" id="folder" name="folder"
				value="<?php echo $tbFolder; ?>" /><BR> <BR> <input type="radio"
				id="before2005" name="service" value="1" checked>2005年まで <input
				type="radio" id="after2006" name="service" value="2">2006年以降 <input
				type="radio" id="meigara" name="service" value="3">銘柄名 <input
				type="submit" id="make" name="make" value="インポート"><BR>
		</fieldset>
	</form>
</body>

</html>