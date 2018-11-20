"use strict";

var echarts = echarts,
    $ = $;
var ECSample = echarts.init(document.getElementById("divECSp"));
var json = { cnt: 0, trainNum: 5 };
var jsonSP = {};
var modName = "5-963636";

var optionSP = {
    title: { text: "模型", subtext: "" },
    tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        textStyle: { color: "#000" },
        position: function(pos, params, el, elRect, size) {
            var obj = { top: 10 };
            obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
            return obj;
        },
        extraCssText: "width: 170px"
    },
    grid: { show: true },
    legend: { data: [], left: "center" },
    toolbox: {
        show: true,
        feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: true },
            restore: { show: true },
            saveAsImage: { show: true }
        }
    },
    xAxis: [{ type: "log", boundaryGap: false, name: "Time(s)", nameLocation: "center", min: 30, max: 25000 }],
    dataZoom: [{ type: "slider", show: true, xAxisIndex: [0], }, { type: "inside", xAxisIndex: [0], },
        {
            type: "slider",
            show: true,
            yAxisIndex: [0],
            left: "93%",
        },
        {
            type: "inside",
            yAxisIndex: [0],
        }
    ],
    yAxis: [{ type: "value", name: "Accuracy", max: 1, min: 0 }],
    series: []
};

function transTime(m) {
    console.log(m[0].time);
    console.log(m[m.length - 1].time);
    var t;
    var t0 = new Date(m[0].time),
        a = [30];
    t0 = t0.getTime() / 1000;
    for (var i = 1; i < m.length; i++) {
        t = new Date(m[i].time);
        t = (t.getTime() / 1000 - t0).toFixed(0);
        a.push(Number(t));
    }
    //console.log(a);
    return a;
}

function getAjax(I) {
    $.ajax({
        url: "trainOK/" + (I + 1) + ".json",
        type: "GET",
        dataType: "json",
        success: function(m) { json[I] = eval(m); },
        error: function(m) {
            console.log(m);
            json[I] = eval("(" + m.responseText + ")");
        },
        complete: function() {
            console.log(json);
            var o = "";
            var W = json[I];

            if (W.multi === true) {
                var l = W.acc.length,
                    bcnt = 0,
                    tcnt = 0;
                W.t = [];
                o += "<tr><td rowspan='" + l + "' style='vertical-align: middle;'>" + (I + 1) + "</td><td rowspan='" + l + "' style='vertical-align: middle;'>" + W.captchaList + "</td>";
                for (var i = 0; i < l; i++) {
                    W.t[i] = transTime(W.train[i]);
                    if (i) { o += "<tr>"; }
                    o += "<td>" + W.acc[i] + "</td>";
                    bcnt += W.accStep[i] * W.accBatch[i] * W.train[i][W.train[i].length - 1].step;
                    o += "<td>" + (bcnt / 1000000) + " M</td>";
                    tcnt += W.t[i][W.train[i].length - 1];
                    o += "<td>" + (tcnt / 60).toFixed(1) + "min</td></tr>";

                }
            } else {
                W.t = transTime(W.train);
                o = "<tr><td>" + W.testNo + "</td><td><small>" + W.captchaList + "</small></td><td>" + W.acc + "</td><td>" + (W.accStep * W.accBatch * W.train[W.train.length - 1].step) / 1000000 + " M</td><td>" + (W.t[W.train.length - 1] / 60).toFixed(1) + "min</td></tr>";

            }
            W.html = o;
            if (++json.cnt === json.trainNum) { ajaxAllDone(); }
        }
    });
}

function ajaxAllDone() {
    var o = "",
        opt = {},
        arr = [],
        mod = [];
    for (var i = 0, j; i < json.trainNum; i++) {
        o += json[i].html;
        arr = [];
        if (json[i].multi) {
            for (var k = 0; k < json[i].train.length; k++) {
                var p = json[i].train[k];
                for (j = 0; j < p.length; j++) { arr[j] = [json[i].t[k][j], p[j].accuracy]; }
                opt = { name: "Mod" + json[i].testNo + "-" + (k + 1), type: "line", data: arr };
                optionSP.series.push(opt);
                optionSP.legend.data.push("Mod" + json[i].testNo + "-" + (k + 1));
                arr = [];
            }
            mod.push(json[i].testNo + "-" + json[i].acc[json[i].acc.length - 1].toFixed(6).replace(/^0\./g, ""));
        } else {
            for (j = 0; j < json[i].train.length; j++) { arr[j] = [json[i].t[j], json[i].train[j].accuracy]; }
            opt = {
                name: "Mod" + json[i].testNo,
                type: "line",
                data: arr
            };
            optionSP.series.push(opt);
            optionSP.legend.data.push("Mod" + json[i].testNo);
            if (json[i].captchaList === "NUMBER + LOW_CASE") {
                mod.push(json[i].testNo + "-" + json[i].acc.toFixed(6).replace(/^0\./g, ""));
            }

        }
    }
    $("#tabProf>tbody").html(o);
    $("#ulSelMod").html(mod.reduce(function(t, x) { return t + "<li><a href='javascript:void(0);'>" + x + "</a></li>"; }, ""));
    $("#ulSelMod").off().on("click", "li>a", function() {
        modName = $(this).html();
    });
    console.log(optionSP);
    ECSample.setOption(optionSP);
}

function initSP() {
    "use strict";
    $("#btnSPGen").on("click", function() {
        $.ajax({
            url: "captcha_cnn.py?captSize=" + $("#iptSize").val() + "&modelName=" + modName,
            type: "GET",
            dataType: "json",
            success: function(m) { jsonSP = eval(m); },
            error: function(m) {
                console.log("error");
                console.log(m);
                jsonSP = eval("(" + m.responseText + ")");
            },
            complete: function() {
                console.log(jsonSP);
                var o = "";
                var tcnt = 0,
                    ccnt = 0;
                for (var i = 0; i < jsonSP.text.length; i++) {
                    o += "<tr><td>" + (i + 1) + "</td>";
                    o += "<td><img alt='captcha' width='80' heigth='30' src='imgSave/-1/" + jsonSP.text[i] + ".png'></td>";
                    o += "<td><code>" + jsonSP.text[i] + "</code></td>";
                    o += "<td><code>" + jsonSP.predict[i] + "</code></td>";
                    var p = "";
                    var cnt = 0;
                    for (var j = 0; j < 4; j++) {
                        if (jsonSP.text[i][j] === jsonSP.predict[i][j]) {
                            cnt++;
                        } else {
                            p += "<code>" + jsonSP.text[i][j] + "</code> \u21d2 <code>" + jsonSP.predict[i][j] + "</code>&emsp;";
                        }
                    }
                    tcnt += cnt;
                    if (cnt === 4) { ccnt++; }
                    o += "<td><strong>" + (25 * cnt) + "</strong>%</td><td>" + p + "</td>";
                    o += "</tr>";
                }
                $("#codeTime").html(jsonSP.time * 1000);
                $("#codeCAcc").html((100 * ccnt / jsonSP.text.length).toFixed(3).replace(/\.?0+$/g, "") + "%");
                $("#codeAcc").html((25 * tcnt / jsonSP.text.length).toFixed(3).replace(/\.?0+$/g, "") + "%");
                $("#tabSP>tbody").html(o);
            }
        });
    });
    for (var i = 0; i < json.trainNum; i++) {
        getAjax(i);
    }
}

initSP();