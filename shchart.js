/// <reference path="scripts/typings/easeljs/easeljs.d.ts" />
var SHChart;
(function (SHChart) {
    var CandleStick = (function () {
        function CandleStick(parent, date, open, high, low, close) {
            this.parent = parent;
            this.date = date;
            this.open = open;
            this.high = high;
            this.low = low;
            this.close = close;
            this.allElements = [];
            this.dateNum = date.getTime();
            this.isYang = open < close;
            this.allElements.push(this);
        }
        CandleStick.prototype.getMax = function () {
            var max = 0;
            for (var i in this.allElements) {
                var val = this.allElements[i].high;
                if (i == 0 || max < val)
                    max = val;
            }
            return max;
        };
        CandleStick.prototype.getMin = function () {
            var min = 0;
            for (var i in this.allElements) {
                var val = this.allElements[i].low;
                if (i == 0 || min > val)
                    min = val;
            }
            return min;
        };
        CandleStick.prototype.getVal = function () {
            return this.allElements[this.allElements.length - 1].close;
        };
        CandleStick.prototype.getOpen = function () {
            return this.allElements[0].open;
        };
        CandleStick.prototype.getClose = function () {
            return this.getVal();
        };
        CandleStick.prototype.getX = function () {
            return this.paintX;
        };
        CandleStick.prototype.getY = function () {
            return this.paintY;
        };
        CandleStick.prototype.getAllElements = function () {
            return this.allElements;
        };
        CandleStick.prototype.initElements = function () {
            this.allElements = [];
            this.allElements.push(this);
        };
        CandleStick.prototype.addElement = function (element) {
            var candle = element;
            this.allElements.push(candle);
        };
        CandleStick.prototype.paint = function (stage, min, max, x, width, xmin, xmax, ymin, ymax) {
            //座標決定
            //ToDo:0.8でいいのか？
            var bodyWidth = width * 0.8;
            var bodyXmin = x - bodyWidth / 2;
            var bodyXmax = x + bodyWidth / 2;
            var bodyYmin = ymin + (ymax - ymin) * ((max - (this.isYang ? this.getClose() : this.getOpen())) / (max - min));
            var bodyYmax = ymin + (ymax - ymin) * ((max - (this.isYang ? this.getOpen() : this.getClose())) / (max - min));
            var uShadowYmin = ymin + (ymax - ymin) * ((max - this.getMax()) / (max - min));
            var lShadowYmax = ymin + (ymax - ymin) * ((max - this.getMin()) / (max - min));
            //本体描画
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.beginStroke("#000000");
            if (!this.isYang)
                g.beginFill("#000000");
            if (bodyYmin == bodyYmax) {
                //始値==終値の場合
                g.moveTo(bodyXmin, bodyYmin).lineTo(bodyXmax, bodyYmin).closePath();
            }
            else {
                g.drawRect(bodyXmin, bodyYmin, bodyXmax - bodyXmin, bodyYmax - bodyYmin);
            }
            this.body = new createjs.Shape(g);
            stage.addChild(this.body);
            //マウスイベント用の座標保存
            this.paintX = x;
            this.paintY = (this.isYang ? bodyYmin : bodyYmax);
            //ヒゲの描画
            if (uShadowYmin < bodyYmin) {
                g = new createjs.Graphics();
                //ToDo:色の変更
                g.beginStroke("#000000").moveTo(x, bodyYmin).lineTo(x, uShadowYmin).closePath();
                this.uShadow = new createjs.Shape(g);
                stage.addChild(this.uShadow);
            }
            if (lShadowYmax > bodyYmax) {
                g = new createjs.Graphics();
                //ToDo:色の変更
                g.beginStroke("#000000").moveTo(x, bodyYmax).lineTo(x, lShadowYmax).closePath();
                this.lShadow = new createjs.Shape(g);
                stage.addChild(this.lShadow);
            }
        };
        CandleStick.prototype.drop = function (stage) {
            if (this.body)
                stage.removeChild(this.body);
            if (this.uShadow)
                stage.removeChild(this.uShadow);
            if (this.lShadow)
                stage.removeChild(this.lShadow);
        };
        CandleStick.prototype.needDash = function () {
            return this.parent.needDash;
        };
        CandleStick.prototype.DateStr = function (date) {
            var w = ["日", "月", "火", "水", "木", "金", "土"];
            var str = date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" + date.getDate() + "(" + w[date.getDay()] + ")";
            return str;
        };
        CandleStick.prototype.infoStr = function () {
            var retStr;
            retStr = "始値: " + this.getOpen().toString();
            if (this.allElements.length > 1) {
                retStr += " [" + this.DateStr(this.allElements[0].date) + "]";
            }
            var max = this.getMax();
            retStr += "\n高値: " + max.toString();
            if (this.allElements.length > 1) {
                for (var i in this.allElements) {
                    if (this.allElements[i].high == max) {
                        retStr += " [" + this.DateStr(this.allElements[i].date) + "]";
                    }
                }
            }
            var min = this.getMin();
            retStr += "\n安値: " + min.toString();
            if (this.allElements.length > 1) {
                for (var i in this.allElements) {
                    if (this.allElements[i].low == min) {
                        retStr += " [" + this.DateStr(this.allElements[i].date) + "]";
                    }
                }
            }
            retStr += "\n終値: " + this.getClose().toString();
            if (this.allElements.length > 1) {
                retStr += " [" + this.DateStr(this.allElements[this.allElements.length - 1].date) + "]";
            }
            return retStr;
        };
        CandleStick.prototype.getParent = function () {
            return this.parent;
        };
        CandleStick.InputGraphByHiashi = function (aHiashi, graph) {
            for (var i in aHiashi) {
                var h = aHiashi[i];
                var ge = new SHChart.CandleStick(graph, new Date(h.ymd), Number(h.open), Number(h.high), Number(h.low), Number(h.close));
                graph.addData(ge);
            }
        };
        return CandleStick;
    })();
    SHChart.CandleStick = CandleStick;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    チャート全体
    グラフの集合体
    */
    var Chart = (function () {
        function Chart(canvas) {
            var _this = this;
            this.graphs = [];
            this.XAXIS_GAP = 100;
            this.YAXIS_GAP = 100;
            this.allDates = [];
            this.allDatesNum = [];
            this.XRANGE_MIN = 25;
            this.htn = 0 /* None */;
            this.SHU_DAYS = 250;
            this.TSUKI_DAYS = 1250;
            /**
            マウスカーソルに合わせた描画
            */
            this.CanvasMouseMove = function (e) {
                //ドラッグイベントの処理
                if (_this.dragEvents.onDrag) {
                    if (_this.dragEvents.currentX != e.pageX) {
                        var deltaX = (e.pageX - _this.dragEvents.currentX);
                        //xrangeのグラフ1つ分の幅より大きくなったらスクロールする
                        if (Math.abs(deltaX) > _this.xrange.xsize) {
                            var delta = Math.floor(deltaX / _this.xrange.xsize) * -1;
                            var startIdx = _this.allDateIdx(_this.xrange.start) + delta;
                            var endIdx = _this.allDateIdx(_this.xrange.end) + delta;
                            //グラフの端まで来た場合の調整
                            if (startIdx < 0) {
                                endIdx -= startIdx;
                                startIdx = 0;
                            }
                            else if (endIdx >= _this.allDates.length) {
                                startIdx -= (endIdx - (_this.allDates.length - 1));
                                endIdx = _this.allDates.length - 1;
                            }
                            //画面更新
                            if (_this.allDatesNum[startIdx] != _this.xrange.start.getTime()) {
                                _this.paint(_this.allDates[startIdx], _this.allDates[endIdx]);
                            }
                            _this.dragEvents.currentX = e.pageX;
                        }
                    }
                }
                //いったん削除
                _this.mi.drop();
                //clientXはウインドウ内の座標なので、canvas上の座標に変換
                var xCanvas = e.clientX - _this.canvas.offsetLeft;
                for (var i in _this.graphs) {
                    //描画
                    _this.graphs[i].paintMouseInfo(xCanvas, _this.mi);
                }
                _this.stage.update();
                //divタグ用に出力する情報
                if (_this.info) {
                    _this.info.innerHTML = "";
                    var str = "";
                    if (_this.htn == 1 /* Hiashi */)
                        str = "日足 ";
                    else if (_this.htn == 2 /* Shuashi */)
                        str = "週足 ";
                    else
                        str = "月足 ";
                    var date = _this.xrange.getDate(xCanvas);
                    if (date) {
                        var w = ["日", "月", "火", "水", "木", "金", "土"];
                        str += date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" + date.getDate() + "(" + w[date.getDay()] + ")";
                        for (var i in _this.graphs) {
                            var graphStr = _this.graphs[i].getInfoStr(date);
                            if (graphStr != "") {
                                str += "\n" + graphStr;
                            }
                        }
                        _this.info.innerHTML = str;
                    }
                }
            };
            //TypeScriptだと次のような書式で勝手に型付けしてくれる。すごい
            /**
            ドラッグ用情報
            */
            this.dragEvents = {
                onDrag: false,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0
            };
            /**
            クリック開始
            */
            this.CanvasMouseDown = function (e) {
                if (e.button == 0) {
                    _this.dragEvents.onDrag = true;
                    _this.dragEvents.startX = e.pageX;
                    _this.dragEvents.startY = e.pageY;
                    _this.dragEvents.currentX = e.pageX;
                    _this.dragEvents.currentY = e.pageY;
                }
            };
            /**
            クリック終了
            */
            this.CanvasMouseUp = function (e) {
                _this.dragEvents.onDrag = false;
            };
            /**
            ホイールで拡大・縮小
            */
            this.CanvasMouseWheel = function (e) {
                //暫定：拡大・縮小量は表示中のアイテムの大きさの5%
                var deltaSize = Math.ceil(_this.xrange.dates.length * 0.05);
                e.preventDefault();
                var delta = e.deltaY ? -(e.deltaY) : e.wheelDelta ? e.wheelDelta : -(e.detail);
                if (!delta) {
                    delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
                }
                if (delta > 0) {
                    //拡大
                    //右側から一つ減らす
                    if (_this.xrange.dates.length - deltaSize > _this.XRANGE_MIN) {
                        _this.paint(_this.xrange.dates[deltaSize], _this.xrange.end);
                    }
                }
                else {
                    //縮小
                    //右側に一つ加える、右端だったら左側に一つ加える
                    var startIdx = _this.allDateIdx(_this.xrange.start);
                    var newIdx = Math.max(_this.allDateIdx(_this.xrange.start) - deltaSize, 0);
                    if (startIdx != newIdx) {
                        _this.paint(_this.allDates[newIdx], _this.xrange.end);
                    }
                    else {
                        var endIdx = _this.allDateIdx(_this.xrange.end);
                        newIdx = Math.min(endIdx + deltaSize, _this.allDates.length - 1);
                        if (endIdx != newIdx) {
                            _this.paint(_this.xrange.start, _this.allDates[newIdx]);
                        }
                    }
                }
                return false;
            };
            this.canvas = canvas;
            //stageを作成
            this.stage = new createjs.Stage(canvas);
            this.xaxis = new SHChart.XAxis(0, canvas.width - this.YAXIS_GAP, canvas.height - this.XAXIS_GAP);
            //ToDo:100、を他の場所で決定するべき
            this.yaxis = new SHChart.YAxis(canvas.width - this.YAXIS_GAP, 100, canvas.height - this.XAXIS_GAP);
            //マウスイベント作成
            canvas.addEventListener("mousemove", this.CanvasMouseMove, false);
            canvas.addEventListener("mousedown", this.CanvasMouseDown, false);
            canvas.addEventListener("mouseup", this.CanvasMouseUp, false);
            canvas.addEventListener("mousewheel", this.CanvasMouseWheel, false);
            var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
            $("canvas").on(mousewheelevent, this.CanvasMouseWheel);
            this.mi = new SHChart.MouseInfo(this.stage, 0, canvas.width - this.YAXIS_GAP, 100, canvas.height - this.XAXIS_GAP);
        }
        /**
        * グラフ追加
        */
        Chart.prototype.addGraph = function (graph) {
            this.graphs.push(graph);
            if (this.allDates.length == 0) {
                this.UpdateAllDates();
            }
        };
        Chart.prototype.setInfo = function (info) {
            this.info = info;
        };
        Chart.prototype.UpdateAllDates = function () {
            //allDatesをアップデート
            this.allDates = [];
            this.allDatesNum = [];
            var graph = this.graphs[0];
            for (var i in graph.elements) {
                var element = graph.elements[i];
                this.allDates.push(element.date);
            }
            this.allDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
            for (var i in this.allDates) {
                this.allDatesNum.push(this.allDates[i].getTime());
            }
        };
        Chart.prototype.paint = function (start, end) {
            //描画単位決定
            var htn = this.decideHTN(start, end);
            if (htn != this.htn) {
                for (var i in this.graphs) {
                    var graph = this.graphs[i];
                    graph.convertScale(htn);
                }
                this.htn = htn;
                this.UpdateAllDates();
            }
            //グループごとのmin, maxを得る
            //全グラフから範囲内の日付の配列も得る
            var min = [];
            var max = [];
            var dates = [];
            var trueDateNum = 0;
            for (var i in this.graphs) {
                var graph = this.graphs[i];
                for (var j in graph.elements) {
                    var element = graph.elements[j];
                    //期間内のものだけ対象にする
                    if (start <= element.date && element.date <= end) {
                        if (min[graph.group] == undefined || min[graph.group] > element.getMin())
                            min[graph.group] = element.getMin();
                        if (max[graph.group] == undefined || max[graph.group] < element.getMax())
                            max[graph.group] = element.getMax();
                        if (i == 0) {
                            //var bFindDate: boolean = false;
                            //for (var j in dates) {
                            //    if (element.date.getTime() == dates[j].getTime()) {
                            //        bFindDate = true;
                            //        break;
                            //    }
                            //}
                            //if (!bFindDate) dates.push(element.date);
                            dates.push(element.date);
                            trueDateNum += element.getAllElements().length;
                        }
                    }
                }
            }
            dates.sort(function (a, b) { return a.getTime() - b.getTime(); });
            var canvas = this.stage.canvas;
            this.xrange = new SHChart.XRange(dates, 0, canvas.width - this.YAXIS_GAP, trueDateNum);
            //X軸描画
            this.xaxis.paint(this.stage, this.xrange);
            //Y軸描画
            //ToDo:minとmaxの取得方法
            this.yaxis.paint(this.stage, min[1], max[1]);
            for (var i in this.graphs) {
                var graph = this.graphs[i];
                graph.paint(this.stage, this.xrange, min[graph.group], max[graph.group], this.htn);
            }
            //更新
            this.stage.update();
        };
        /**
        日足、週足、月足のどれを使うか
        */
        Chart.prototype.decideHTN = function (start, end) {
            var datesNum = 0;
            for (var i in this.graphs[0].elements) {
                var element = this.graphs[0].elements[i];
                if (start <= element.date && element.date <= end) {
                    datesNum += element.getAllElements().length;
                }
            }
            if (datesNum < this.SHU_DAYS) {
                return 1 /* Hiashi */;
            }
            else if (datesNum < this.TSUKI_DAYS) {
                return 2 /* Shuashi */;
            }
            return 3 /* Tsukiashi */;
        };
        Chart.prototype.allDateIdx = function (date) {
            var targetTime = date.getTime();
            for (var i = 0; i < this.allDatesNum.length; i++) {
                if (this.allDatesNum[i] == targetTime) {
                    return i;
                }
            }
            return -1;
        };
        return Chart;
    })();
    SHChart.Chart = Chart;
    /**
    日足、週足、月足
    */
    (function (HTN) {
        HTN[HTN["None"] = 0] = "None";
        HTN[HTN["Hiashi"] = 1] = "Hiashi";
        HTN[HTN["Shuashi"] = 2] = "Shuashi";
        HTN[HTN["Tsukiashi"] = 3] = "Tsukiashi";
    })(SHChart.HTN || (SHChart.HTN = {}));
    var HTN = SHChart.HTN;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    日付と値の組
    */
    var DateVal = (function () {
        function DateVal() {
        }
        return DateVal;
    })();
    SHChart.DateVal = DateVal;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    グラフ1つ分を表すクラス
    */
    var Graph = (function () {
        /**
        @param group {number} - グループ番号、min:maxの値の範囲を決める時に使用する。例えば株価と移動平均を同一グループにする、出来高は別グループにする、など。
        @param ymin {number} - y座標の最小値
        @param ymax {number} - y座標の最大値
        */
        function Graph(title, group, ymin, ymax, needDash) {
            this.title = title;
            this.group = group;
            this.ymin = ymin;
            this.ymax = ymax;
            this.needDash = needDash;
            /**
            全要素
            */
            this.elements = [];
            /**
            現在有効な要素
            */
            this.validElements = [];
            this.htn = 0 /* None */;
        }
        /**
        データ追加
        */
        Graph.prototype.addData = function (element) {
            this.elements.push(element);
        };
        /**
        描画
        */
        Graph.prototype.paint = function (stage, xrange, min, max, htn) {
            this.xrange = xrange;
            for (var i in this.validElements) {
                this.validElements[i].drop(stage);
            }
            this.validElements = [];
            for (var i in this.elements) {
                var element = this.elements[i];
                if (element.date >= xrange.start && element.date <= xrange.end) {
                    this.validElements.push(element);
                }
            }
            for (var i in this.validElements) {
                var element = this.validElements[i];
                element.paint(stage, min, max, xrange.GetX(element.date), xrange.xsize, xrange.xmin, xrange.xmax, this.ymin, this.ymax);
            }
        };
        /**
        日足、週足、月足を変換する
        */
        Graph.prototype.convertScale = function (htn) {
            if (htn == this.htn)
                return;
            this.htn = htn;
            //展開
            var allElements = [];
            for (var i in this.elements) {
                var elements = this.elements[i].getAllElements();
                for (var j in elements) {
                    allElements.push(elements[j]);
                }
            }
            //日、週、月にまとめる
            var prevElement;
            var currentElement;
            this.elements = [];
            switch (htn) {
                case 1 /* Hiashi */:
                    for (var i in allElements) {
                        currentElement = allElements[i];
                        currentElement.initElements();
                        this.elements.push(currentElement);
                        //折れ線グラフ対応
                        var l = currentElement;
                        if (l.prev) {
                            l.prev = prevElement;
                        }
                        prevElement = currentElement;
                    }
                    break;
                case 2 /* Shuashi */:
                case 3 /* Tsukiashi */:
                    currentElement = allElements[0];
                    currentElement.initElements();
                    this.elements.push(currentElement);
                    prevElement = currentElement;
                    for (var i in allElements) {
                        if (i == 0)
                            continue;
                        var thisElement = allElements[i];
                        var stChange = false;
                        switch (htn) {
                            case 2 /* Shuashi */:
                                //週が変わった
                                if (prevElement.date.getDay() >= thisElement.date.getDay())
                                    stChange = true;
                                break;
                            case 3 /* Tsukiashi */:
                                //月が変わった
                                if (prevElement.date.getMonth() < thisElement.date.getMonth() || prevElement.date.getFullYear() < thisElement.date.getFullYear())
                                    stChange = true;
                                break;
                        }
                        if (stChange) {
                            //折れ線グラフ対応
                            var l = currentElement;
                            if (l.prev && this.elements.length > 1) {
                                l.prev = this.elements[this.elements.length - 2];
                            }
                            currentElement = thisElement;
                            currentElement.initElements();
                            this.elements.push(currentElement);
                        }
                        else {
                            currentElement.addElement(thisElement);
                        }
                        prevElement = thisElement;
                    }
                    break;
            }
        };
        /**
        マウス連動情報描画
        */
        Graph.prototype.paintMouseInfo = function (x, mi) {
            var date = this.xrange.getDate(x);
            if (!date)
                return;
            var dateNum = date.getTime();
            if (date == null)
                return;
            for (var i in this.elements) {
                var element = this.elements[i];
                if (element.dateNum == dateNum) {
                    mi.paint(element);
                }
            }
        };
        /**
        情報出力用の文字列を得る GraphElementに尋ねる
        */
        Graph.prototype.getInfoStr = function (date) {
            var dateNum = date.getTime();
            for (var i in this.elements) {
                var element = this.elements[i];
                if (element.dateNum == dateNum) {
                    return element.infoStr();
                }
            }
            return "";
        };
        return Graph;
    })();
    SHChart.Graph = Graph;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    * グラフの種類
    */
    (function (GraphType) {
        /**
        * 線グラフ
        */
        GraphType[GraphType["Line"] = 0] = "Line";
        /**
        * ローソク図
        */
        GraphType[GraphType["CandleStick"] = 1] = "CandleStick";
        /**
        * 棒グラフ
        */
        GraphType[GraphType["Bar"] = 2] = "Bar";
    })(SHChart.GraphType || (SHChart.GraphType = {}));
    var GraphType = SHChart.GraphType;
})(SHChart || (SHChart = {}));
/// <reference path="scripts/typings/easeljs/easeljs.d.ts" />
var SHChart;
(function (SHChart) {
    /**
    折れ線グラフ
    */
    var LineChart = (function () {
        function LineChart(parent, date, val, color, prev) {
            this.parent = parent;
            this.date = date;
            this.val = val;
            this.color = color;
            this.prev = prev;
            this.allElements = [];
            this.dateNum = date.getTime();
            this.allElements.push(this);
        }
        LineChart.prototype.getMax = function () {
            return this.val;
        };
        LineChart.prototype.getMin = function () {
            return this.val;
        };
        LineChart.prototype.getVal = function () {
            return this.allElements[this.allElements.length - 1].val;
        };
        LineChart.prototype.getX = function () {
            return this.paintX;
        };
        LineChart.prototype.getY = function () {
            return this.paintY;
        };
        LineChart.prototype.getAllElements = function () {
            return this.allElements;
        };
        LineChart.prototype.initElements = function () {
            this.allElements = [];
            this.allElements.push(this);
        };
        LineChart.prototype.addElement = function (element) {
            var line = element;
            this.allElements.push(line);
        };
        LineChart.prototype.paint = function (stage, min, max, x, width, xmin, xmax, ymin, ymax) {
            //直前の要素が設定されていなければ、線が引けないので何もしない
            if (!this.prev)
                return;
            var prevX = x - width;
            var thisY = ymin + (ymax - ymin) * ((max - this.getVal()) / (max - min));
            var prevY = ymin + (ymax - ymin) * ((max - this.prev.getVal()) / (max - min));
            this.paintX = x;
            this.paintY = thisY;
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.beginStroke(this.color).moveTo(prevX, prevY).lineTo(x, thisY).closePath();
            this.line = new createjs.Shape(g);
            stage.addChild(this.line);
        };
        LineChart.prototype.drop = function (stage) {
            stage.removeChild(this.line);
        };
        LineChart.prototype.needDash = function () {
            return this.parent.needDash;
        };
        LineChart.prototype.infoStr = function () {
            var retStr;
            retStr = this.parent.title + ": " + this.val.toString();
            return retStr;
        };
        LineChart.prototype.getParent = function () {
            return this.parent;
        };
        LineChart.InputGraphByDateVal = function (aDv, color, graph) {
            var prevLc;
            for (var i in aDv) {
                var dv = aDv[i];
                var lc = new SHChart.LineChart(graph, dv.date, dv.val, color, prevLc);
                prevLc = lc;
                graph.addData(lc);
            }
        };
        LineChart.InputGraphByHiashi = function (aDv, color, graph) {
            var prevLc;
            for (var i in aDv) {
                var dv = aDv[i];
                var lc = new SHChart.LineChart(graph, new Date(dv.ymd), Number(dv.close), color, prevLc);
                prevLc = lc;
                graph.addData(lc);
            }
        };
        return LineChart;
    })();
    SHChart.LineChart = LineChart;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    マウスに連動した情報描画担当クラス
    */
    var MouseInfo = (function () {
        function MouseInfo(stage, xmin, xmax, ymin, ymax) {
            this.stage = stage;
            this.xmin = xmin;
            this.xmax = xmax;
            this.ymin = ymin;
            this.ymax = ymax;
            this.DASH_LEN = 5;
        }
        MouseInfo.prototype.paint = function (ge) {
            //破線を引く
            if (ge.needDash()) {
                if (this.dashX) {
                    this.stage.removeChild(this.dashX);
                    this.dashX = null;
                }
                if (this.dashY) {
                    this.stage.removeChild(this.dashY);
                    this.dashY = null;
                }
                this.createDashX(ge.getX());
                this.createDashY(ge.getY());
            }
        };
        MouseInfo.prototype.createDashX = function (x) {
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.setStrokeStyle(1).beginStroke("#000000");
            //破線の数(*2)を計算
            var dashes = (this.ymax - this.ymin) / this.DASH_LEN;
            for (var y = this.ymin, q = 0; q < dashes; y += this.DASH_LEN, q++) {
                if (q % 2 == 0)
                    g.moveTo(x, y);
                else
                    g.lineTo(x, y);
            }
            this.dashX = new createjs.Shape(g);
            this.stage.addChild(this.dashX);
        };
        MouseInfo.prototype.createDashY = function (y) {
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.setStrokeStyle(1).beginStroke("#000000");
            //破線の数(*2)を計算
            var dashes = (this.xmax - this.xmin) / this.DASH_LEN;
            for (var x = this.xmin, q = 0; q < dashes; x += this.DASH_LEN, q++) {
                if (q % 2 == 0)
                    g.moveTo(x, y);
                else
                    g.lineTo(x, y);
            }
            this.dashY = new createjs.Shape(g);
            this.stage.addChild(this.dashY);
        };
        MouseInfo.prototype.drop = function () {
            if (this.dashX) {
                this.stage.removeChild(this.dashX);
                this.dashX = null;
            }
            if (this.dashY) {
                this.stage.removeChild(this.dashY);
                this.dashY = null;
            }
        };
        return MouseInfo;
    })();
    SHChart.MouseInfo = MouseInfo;
})(SHChart || (SHChart = {}));
/// <reference path="scripts/typings/jquery/jquery.d.ts" />
var SHChart;
(function (SHChart) {
    var SimpleView = (function () {
        function SimpleView() {
        }
        SimpleView.View = function (canvas, info, title, option) {
            canvas.width = 800;
            canvas.height = 600;
            var chart = new SHChart.Chart(canvas);
            chart.setInfo(info);
            //銘柄情報、日足をゲット
            var meigara;
            $.ajax({
                async: false,
                type: "POST",
                url: "ajax_getmeigara.php",
                data: { mcode: option.mcode }
            }).done(function (msg) {
                meigara = eval("(" + msg + ")");
            });
            //meigara = odakyuStock;
            title.innerHTML = meigara.mname;
            var sma25DV = SHChart.Stats.CalcSMA(meigara.hiashi, 25);
            var sma75DV = SHChart.Stats.CalcSMA(meigara.hiashi, 75);
            var gHiashi;
            //日足 or 終値
            if (option.mainGraphType == 0)
                gHiashi = new SHChart.Graph("日足", 1, 100, 500, true);
            else
                gHiashi = new SHChart.Graph("終値", 1, 100, 500, true);
            var gSma25 = new SHChart.Graph("25日移動平均", 1, 100, 500, false);
            var gSma75 = new SHChart.Graph("75日移動平均", 1, 100, 500, false);
            var sma25Prev;
            var sma75Prev;
            if (option.mainGraphType == 0)
                SHChart.CandleStick.InputGraphByHiashi(meigara.hiashi, gHiashi);
            else
                SHChart.LineChart.InputGraphByHiashi(meigara.hiashi, "#000000", gHiashi);
            if (option.useSMA25)
                SHChart.LineChart.InputGraphByDateVal(sma25DV, "#228b22", gSma25);
            if (option.useSMA75)
                SHChart.LineChart.InputGraphByDateVal(sma75DV, "#4169e1", gSma75);
            chart.addGraph(gHiashi);
            if (option.useSMA25)
                chart.addGraph(gSma25);
            if (option.useSMA75)
                chart.addGraph(gSma75);
            //日付の指定がない場合は、100日間を表示
            if (!option.start) {
                option.end = chart.allDates[chart.allDates.length - 1];
                option.start = chart.allDates[Math.max(chart.allDates.length - 101, 0)];
            }
            chart.paint(option.start, option.end);
        };
        return SimpleView;
    })();
    SHChart.SimpleView = SimpleView;
    var SimpleViewOption = (function () {
        function SimpleViewOption() {
            this.mainGraphType = 0;
            this.useSMA25 = true;
            this.useSMA75 = true;
        }
        return SimpleViewOption;
    })();
    SHChart.SimpleViewOption = SimpleViewOption;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    統計用の静的関数ライブラリ
    */
    var Stats = (function () {
        function Stats() {
        }
        /**
        n日移動平均を求める
        */
        Stats.CalcSMA = function (hiashiArr, days) {
            var retArr = [];
            var currentSum = 0;
            for (var i in hiashiArr) {
                var hiashi = hiashiArr[i];
                var dv = new SHChart.DateVal;
                dv.date = new Date(hiashi.ymd);
                currentSum += Number(hiashi.close);
                if (i >= days) {
                    var nPrevHiashi = hiashiArr[i - days];
                    currentSum -= Number(nPrevHiashi.close);
                    dv.val = currentSum / days;
                }
                else {
                    dv.val = currentSum / (Number(i) + 1);
                }
                retArr[i] = dv;
            }
            return retArr;
        };
        return Stats;
    })();
    SHChart.Stats = Stats;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    X軸を表す
    */
    var XAxis = (function () {
        function XAxis(xmin, xmax, y) {
            this.xmin = xmin;
            this.xmax = xmax;
            this.y = y;
            /**
            解像度決定用テーブル
            ～30日 1週毎 ～6本
            31～50日 2週毎 3～6本
            51～100日 1月毎 3～6本
            101～150日 2月毎 3～5本
            151～250日 3月毎 3～6本
            251～500日 6月毎 3～6本？
            501日～    1年毎
            */
            this.SCALE_TABLE = [
                { rangeMin: 0, rangeMax: 30, wm: 1, interval: 1 },
                { rangeMin: 31, rangeMax: 50, wm: 1, interval: 2 },
                { rangeMin: 51, rangeMax: 150, wm: 2, interval: 1 },
                { rangeMin: 151, rangeMax: 200, wm: 2, interval: 2 },
                { rangeMin: 201, rangeMax: 500, wm: 2, interval: 3 },
                { rangeMin: 501, rangeMax: 1000, wm: 2, interval: 6 },
                { rangeMin: 1001, rangeMax: 2000, wm: 2, interval: 12 },
                { rangeMin: 2001, rangeMax: 99999, wm: 2, interval: 24 },
            ];
        }
        /**
        目盛に使用する日付一覧をゲット
        */
        XAxis.prototype.DecideScale = function (xrange) {
            //どの解像度を使うか決定する
            var st;
            for (var i in this.SCALE_TABLE) {
                if (this.SCALE_TABLE[i].rangeMin <= xrange.trueDateNum && xrange.trueDateNum <= this.SCALE_TABLE[i].rangeMax) {
                    st = this.SCALE_TABLE[i];
                    break;
                }
            }
            var ret = [];
            var prevDate;
            var currentInterval = 0;
            for (var i in xrange.dates) {
                var date = xrange.dates[i];
                if (!prevDate) {
                    prevDate = date;
                    continue;
                }
                if (st.wm == 1) {
                    //週ごと
                    if (prevDate.getDay() > date.getDay())
                        currentInterval++;
                }
                else if (st.wm == 2) {
                    //月ごと
                    if (prevDate.getMonth() != date.getMonth())
                        currentInterval++;
                }
                //解像度に達したら、目盛を追加
                if (currentInterval == st.interval) {
                    ret.push(date);
                    currentInterval = 0;
                }
                prevDate = date;
            }
            return ret;
        };
        /**
        描画
        */
        XAxis.prototype.paint = function (stage, xrange) {
            //x軸を描いていなければ作成する
            if (!this.axis) {
                var g = new createjs.Graphics();
                //ToDo:色の変更
                g.beginStroke("#000000").moveTo(this.xmin, this.y).lineTo(this.xmax, this.y).closePath();
                this.axis = new createjs.Shape(g);
                stage.addChild(this.axis);
            }
            for (var i in this.scales) {
                this.scales[i].drop(stage);
            }
            this.scales = [];
            //作成するscalesを決定、描画
            var scaleDates = this.DecideScale(xrange);
            for (var i in scaleDates) {
                var date = scaleDates[i];
                //ToDo: 100をどこかで決定する必要がある
                var scale = new SHChart.XAxisScale(xrange.GetX(date), 100, this.y, date);
                scale.paint(stage);
                this.scales.push(scale);
            }
        };
        return XAxis;
    })();
    SHChart.XAxis = XAxis;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    X軸の目盛1つ分
    */
    var XAxisScale = (function () {
        function XAxisScale(x, ymin, ymax, date) {
            this.x = x;
            this.ymin = ymin;
            this.ymax = ymax;
            this.date = date;
        }
        XAxisScale.prototype.drop = function (stage) {
            stage.removeChild(this.axisScale);
            stage.removeChild(this.textScale);
        };
        XAxisScale.prototype.paint = function (stage) {
            //目盛本体
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.beginStroke("#dfdfdf").moveTo(this.x, this.ymin).lineTo(this.x, this.ymax).closePath();
            this.axisScale = new createjs.Shape(g);
            stage.addChild(this.axisScale);
            //文字
            var str = this.date.getFullYear().toString() + "/" + (this.date.getMonth() + 1).toString() + "/" + this.date.getDate();
            var t = new createjs.Text(str, "12px Arial", "#000000");
            t.x = this.x + 5;
            t.y = this.ymax + 10;
            stage.addChild(t);
            this.textScale = t;
        };
        return XAxisScale;
    })();
    SHChart.XAxisScale = XAxisScale;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    X軸の日付の範囲、描画位置を表す
    複数のグラフで共通に使用する
    */
    var XRange = (function () {
        function XRange(dates, xmin, xmax, trueDateNum) {
            this.dates = dates;
            this.xmin = xmin;
            this.xmax = xmax;
            this.trueDateNum = trueDateNum;
            this.xpos = [];
            this.dateNum = [];
            //開始日、終了日
            this.start = dates[0];
            this.end = dates[dates.length - 1];
            //xmin, xmaxと要素の数から幅を決定
            this.xsize = (xmax - xmin) / this.dates.length;
            for (var i in this.dates) {
                this.xpos.push(this.xsize * i + this.xsize / 2);
                this.dateNum.push(this.dates[i].getTime());
            }
        }
        XRange.prototype.GetX = function (date) {
            var dateNum = date.getTime();
            for (var i in this.dates) {
                if (this.dateNum[i] == dateNum) {
                    return this.xpos[i];
                }
            }
            return 0;
        };
        XRange.prototype.getDate = function (x) {
            for (var i in this.xpos) {
                var xmin = this.xpos[i] - this.xsize / 2;
                var xmax = this.xpos[i] + this.xsize / 2;
                if (xmin <= x && x < xmax)
                    return this.dates[i];
            }
            return null;
        };
        return XRange;
    })();
    SHChart.XRange = XRange;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    Y軸を表す
    */
    var YAxis = (function () {
        function YAxis(x, ymin, ymax) {
            this.x = x;
            this.ymin = ymin;
            this.ymax = ymax;
            /**
            Y軸目盛の目安本数
            */
            this.YAXIS_BASE_NUM = 4;
        }
        /**
        目盛に使用する数値一覧を算出
        */
        YAxis.prototype.DecideScale = function (min, max) {
            //数値の幅を目安本数で割って、大体の間隔を算出
            var range = max - min;
            var intervalBase = range / this.YAXIS_BASE_NUM;
            //キリのいい数に揃える 22→20、158→200など
            var keta = Math.floor(Math.log(intervalBase) / Math.log(10) + 1);
            var interval = Math.round(intervalBase / Math.pow(10, keta - 1)) * Math.pow(10, keta - 1);
            //intervalで割り切れる数を返す
            var minBase = Math.ceil(min / interval);
            var maxBase = Math.floor(max / interval);
            var ret = [];
            for (var i = minBase; i <= maxBase; i++) {
                ret.push(i * interval);
            }
            return ret;
        };
        /**
        描画
        */
        YAxis.prototype.paint = function (stage, min, max) {
            //Y軸を描いていなければ作成する
            if (!this.axis) {
                var g = new createjs.Graphics();
                //ToDo:色の変更
                g.beginStroke("#000000").moveTo(this.x, this.ymin).lineTo(this.x, this.ymax).closePath();
                this.axis = new createjs.Shape(g);
                stage.addChild(this.axis);
            }
            for (var i in this.scales) {
                this.scales[i].drop(stage);
            }
            this.scales = [];
            //作成するscalesを決定、描画
            var scaleNumbers = this.DecideScale(min, max);
            for (var i in scaleNumbers) {
                var num = scaleNumbers[i];
                var y = this.ymin + (this.ymax - this.ymin) * ((max - num) / (max - min));
                var scale = new SHChart.YAxisScale(0, this.x, y, num);
                scale.paint(stage);
                this.scales.push(scale);
            }
        };
        return YAxis;
    })();
    SHChart.YAxis = YAxis;
})(SHChart || (SHChart = {}));
var SHChart;
(function (SHChart) {
    /**
    Y軸の目盛1つ分
    */
    var YAxisScale = (function () {
        function YAxisScale(xmin, xmax, y, num) {
            this.xmin = xmin;
            this.xmax = xmax;
            this.y = y;
            this.num = num;
        }
        YAxisScale.prototype.drop = function (stage) {
            stage.removeChild(this.axisScale);
            stage.removeChild(this.textScale);
        };
        YAxisScale.prototype.paint = function (stage) {
            //目盛本体
            var g = new createjs.Graphics();
            //ToDo:色の変更
            g.beginStroke("#dfdfdf").moveTo(this.xmin, this.y).lineTo(this.xmax, this.y).closePath();
            this.axisScale = new createjs.Shape(g);
            stage.addChild(this.axisScale);
            //文字
            var str = this.num.toString();
            var t = new createjs.Text(str, "12px Arial", "#000000");
            t.x = this.xmax + 3;
            t.y = this.y;
            stage.addChild(t);
            this.textScale = t;
        };
        return YAxisScale;
    })();
    SHChart.YAxisScale = YAxisScale;
})(SHChart || (SHChart = {}));
//# sourceMappingURL=SHChart.js.map