<?php
/* 1銘柄のデータをゲット */
require_once 'funcs.php';

$mysqli = OpenDb ();
$query = "SELECT * FROM shmeigara WHERE mcode=" . $_POST ["mcode"];
$result = ExecQuery ( $mysqli, $query );
$row = $result->fetch_assoc ();

$meigara = new Meigara ( $_POST ["mcode"], $row ["mname"] );

$query = "SELECT * FROM shhiashi WHERE mcode=" . $_POST ["mcode"] . " AND open>0 ORDER BY ymd ASC";
$result = ExecQuery ( $mysqli, $query );

while ( $row = $result->fetch_assoc () ) {
	$meigara->hiashi [] = array (
			'ymd' => $row ['ymd'],
			'type' => $row ['type'],
			'open' => $row ['open'],
			'high' => $row ['high'],
			'low' => $row ['low'],
			'close' => $row ['close'],
			'volume' => $row ['volume'] 
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