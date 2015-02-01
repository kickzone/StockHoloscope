<?php
/* 1銘柄のデータをゲット */
require_once 'funcs.php';

$mysqli = OpenDb ();

//銘柄名ゲット
$query = "SELECT * FROM shmeigara WHERE mcode=" . $_POST ["mcode"];
$result = ExecQuery ( $mysqli, $query );
$row = $result->fetch_assoc ();
$meigara = new Meigara ( $_POST ["mcode"], $row ["mname"] );


//分割情報ゲット
$query = "SELECT * FROM shdivide WHERE mcode=" . $_POST ["mcode"]. " ORDER BY ymd DESC";
$resultDivide = ExecQuery ( $mysqli, $query );

//株価情報ゲット
$query = "SELECT * FROM shhiashi WHERE mcode=" . $_POST ["mcode"] . " AND open>0 ORDER BY ymd ASC";
$result = ExecQuery ( $mysqli, $query );

while ( $row = $result->fetch_assoc () ) {

	$open = $row ['open'];
	$high = $row ['high'];
	$low = $row['low'];
	$close = $row['close'];
	$volume = $row['volume'];

	//分割情報があったら、価格はその値で割り、取引量はその値を掛ける
	$resultDivide->data_seek(0);
	while($rowD = $resultDivide->fetch_assoc()){
		if($rowD['ymd'] >= $row['ymd']){
			$open /= $rowD['rate'];
			$high /= $rowD['rate'];
			$low /= $rowD['rate'];
			$close /= $rowD['rate'];
			$volume *= $rowD['rate'];
		}
	}

	$meigara->hiashi [] = array (
			'ymd' => $row ['ymd'],
			'type' => $row ['type'],
			'open' => $open,
			'high' => $high,
			'low' => $low,
			'close' => $close,
			'volume' => $volume
	);
}

$mysqli->close ();

echo json_encode ( $meigara );
class Meigara {
	public $mcode, $mname, $hiashi;
	function __construct($mcode, $mname) {
		$this->mcode = $mcode;
		$this->mname = $mname;
		$this->hiashi = array ();
	}
}
?>