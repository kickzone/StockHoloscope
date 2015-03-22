<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>SHChart</title>
    <link rel="stylesheet" href="app.css" type="text/css" />
    <script src="scripts/jquery-2.1.3.min.js"></script>
    <script src="scripts/easeljs-0.8.0.min.js"></script>
    <script src="shchart.js"></script>
    <style>
        #info {
            /* basic styling */
            width: 350px;
            height: 200px;
            font-size: 14px;
            border: 1px solid #555;
            white-space: pre-wrap;
        }

    </style>
</head>
<body>
    <h1>SHChart</h1>
    <div><?php echo $_GET['mcode']?></div>
    <H2 id="mname"></H2>
    <canvas id="chart"></canvas>
    <div id="info"></div>
    <script>
    var option = new SHChart.SimpleViewOption();
    var type = Number(<?php echo isset($_GET['type']) ? $_GET['type'] : 0  ?>);
    if(type){
        option.mainGraphType = type;
    }
    option.mcode = <?php echo $_GET['mcode']?>;
    var sta = Number(<?php echo isset($_GET['start']) ? $_GET['start'] : 0  ?>);
    if(sta){
        //YYYYMMDD形式で入っていることを仮定
        option.start = new Date(Math.floor(sta/10000), Math.floor((sta % 10000) / 100)-1, sta % 100);
    }else{
        option.start = new Date(2000, 1, 1);
    }
    var end = Number(<?php echo isset($_GET['end']) ? $_GET['end'] : 0  ?>);
    if(end){
        //YYYYMMDD形式で入っていることを仮定
        option.end = new Date(Math.floor(end/10000), Math.floor((end % 10000) / 100)-1, end % 100);
    }else{
    	option.end = new Date();
    }
    option.useSMA25 = false;
    option.useSMA75 = false;
    SHChart.SimpleView.View($("#chart")[0], $("#info")[0], $("#mname")[0], option);
    </script>
</body>
</html>
