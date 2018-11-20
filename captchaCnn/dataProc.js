"use strict";

var Chance = Chance,
    echarts = echarts,
    $ = $;
var chance = new Chance(Math.random);
var ECDataProc = echarts.init(document.getElementById("divECDataProc"));
var statDP = [];
var btnActive = [false, false, false, false];

var optionDP = {
    title: { text: "随机样本", subtext: "CNN数据处理" },
    grid: { left: "4%", right: "7%", bottom: "4%", containLabel: true },
    tooltip: {
        showDelay: 0,
        formatter: function(p) {
            if (p.value.length > 1) {
                return "[" + p.value[2] + "](" + p.value[0].toFixed(6) + ", " + p.value[1].toFixed(6) + ")";
            } else {
                return p.seriesName ? (p.seriesName + " :<br/>") : "" + p.name + " : " + p.value;
            }
        },
        axisPointer: {
            show: true,
            type: "cross",
            lineStyle: { type: "dashed", width: 1 }
        }
    },
    toolbox: {
        feature: {
            dataView: { show: true, readOnly: true },
            restore: { show: true },
            saveAsImage: { show: true }
        }
    },
    legend: { data: ["Data"], left: "center" },
    xAxis: [{
        type: "value",
        minInterval: 2.5,
        splitLine: { show: false }
    }],
    yAxis: [{
        type: "value",
        minInterval: 2.5,
        splitLine: { show: false }
    }],
    series: [{
        name: "Data",
        type: "scatter",
        dimensions: ["cordX", "cordY"],
        data: [],
        markArea: {
            silent: true,
            itemStyle: {
                normal: {
                    color: "transparent",
                    borderWidth: 1,
                    borderType: "dotted"
                }
            },
            data: [
                [{ name: "分布区间", xAxis: "min", yAxis: "min" }, { xAxis: "max", yAxis: "max" }]
            ]
        },
        markLine: {
            precision: 4,
            lineStyle: { normal: { type: "solid" } },
            data: [
                { type: "average", name: "平均值" },
                { xAxis: 0, name: "平均值" }
            ]
        }
    }],
    visualMap: [{
        type: "continuous",
        min: 0,
        max: 0,
        show: false,
        inRange: {
            color: ["#FB9F9F", "#A60000"]
        }
    }]
};

function initArray(count) {
    statDP[0] = { x: [], y: [], n: count, sx: 0, sy: 0, sx2: 0, sy2: 0 };
    var i, num1, num2, num3;
    var sin = Math.sin(1),
        cos = Math.cos(1);
    var s = optionDP.series[0],
        o = statDP[0],
        list = [];
    s.data = [];
    for (i = 0; i < count; i++) {
        num1 = chance.integer({ min: -3, max: 3 }) * chance.normal({ mean: 3.5, dev: 2 });
        num2 = chance.floating({ min: -4, max: 2 });
        num3 = chance.floating({ min: -2, max: 0.2 });
        list[i] = [num1 * cos - num2 * sin - num3, num2 * sin + num1 * cos + num3];
    }
    list.sort(function(x, y) { return x[0] < y[0] ? (-1) : 1; });
    for (i = 0; i < count; i++) {
        o.x[i] = list[i][0];
        o.y[i] = list[i][1];
    }
    o.sx = o.x.reduce(function(total, x) { return total + x; }, 0);
    o.sy = o.y.reduce(function(total, x) { return total + x; }, 0);
    o.sx2 = o.x.reduce(function(total, x) { return total + x * x; }, 0);
    o.sy2 = o.y.reduce(function(total, x) { return total + x * x; }, 0);
    console.log(statDP);
    btnToggle(-1);
}

function zeroCenter(A, B) {
    // 去均值 A = B - B.avg
    console.log("zeroCenter(" + A + ", " + B + ")");
    if (!statDP[B]) { getDP(B); }
    var Q = statDP[B];
    statDP[A] = { x: [], y: [], n: Q.n, sx: 0, sy: 0, sx2: 0, sy2: 0 };
    var avgx = Q.sx / Q.n,
        avgy = Q.sy / Q.n;
    console.log(avgx);
    for (var i = 0; i < Q.n; i++) {
        statDP[A].x[i] = Q.x[i] - avgx;
        statDP[A].y[i] = Q.y[i] - avgy;
    }
    statDP[A].sx2 = statDP[A].x.reduce(function(total, x) { return total + x * x; }, 0);
    statDP[A].sy2 = statDP[A].y.reduce(function(total, x) { return total + x * x; }, 0);
    return statDP[A];
}

function normalize(A, B) {
    // 归一化 A = B / B.dif
    console.log("normalize(" + A + ", " + B + ")");
    if (!statDP[B]) { getDP(B); }
    var Q = statDP[B];
    statDP[A] = { x: [], y: [], n: Q.n, sx: 0, sy: 0, sx2: 0, sy2: 0 };
    var R = function(x, y) { return Math.sqrt(x * x + y * y); };
    var i, r;
    var mr = R(Q.x[0], Q.y[0]);
    for (i = 1; i < Q.n; i++) {
        r = R(Q.x[i], Q.y[i]);
        if (mr < r) { mr = r; }
    }
    for (i = 0; i < statDP[B].n; i++) {
        statDP[A].x[i] = Q.x[i] / mr;
        statDP[A].y[i] = Q.y[i] / mr;
    }
    statDP[A].sx = Q.sx / mr;
    statDP[A].sy = Q.sy / mr;
    statDP[A].sx2 = Q.sx2 / (mr * mr);
    statDP[A].sy2 = Q.sy2 / (mr * mr);
    return statDP[A];
}

function decorrelate(A, B) {
    // 去相关 y = a*(x-b)
    console.log("decorrelate(" + A + ", " + B + ")");
    if (!statDP[B]) { getDP(B); }
    var Q = statDP[B];
    statDP[A] = { x: [], y: [], n: Q.n, sx: 0, sy: 0, sx2: 0, sy2: 0 };
    var i, a, b;
    var avgx = Q.sx / Q.n,
        avgy = Q.sy / Q.n,
        sxy = 0;
    for (i = 0; i < Q.n; i++) { sxy += Q.x[i] * Q.y[i]; }
    a = (sxy - Q.sx * avgy) / (Q.sx2 - Q.sx * avgx);
    b = avgy - avgx / a;
    console.log("y =" + a + "(x-" + b + ")");
    a = Math.atan(a);

    for (i = 0; i < Q.n; i++) {
        statDP[A].x[i] = (Q.x[i] - avgx) * Math.cos(a) + (Q.y[i] - avgy) * Math.sin(a) + avgx;
        statDP[A].y[i] = (Q.y[i] - avgy) * Math.cos(a) - (Q.x[i] - avgx) * Math.sin(a) + avgy;
    }
    statDP[A].sx = statDP[A].x.reduce(function(total, x) { return total + x; }, 0);
    statDP[A].sy = statDP[A].y.reduce(function(total, x) { return total + x; }, 0);
    statDP[A].sx2 = statDP[A].x.reduce(function(total, x) { return total + x * x; }, 0);
    statDP[A].sy2 = statDP[A].y.reduce(function(total, x) { return total + x * x; }, 0);
    return statDP[A];
}

function whiten(A, B) {
    // 白化 A = B[i] / B[i].dif
    console.log("normalize(" + A + ", " + B + ")");
    if (!statDP[B]) { getDP(B); }
    var Q = statDP[B];
    statDP[A] = { x: [], y: [], n: Q.n, sx: 0, sy: 0, sx2: 0, sy2: 0 };
    var i, mx, my;
    mx = Math.abs(Q.x[0]);
    my = Math.abs(Q.y[0]);
    for (i = 1; i < Q.n; i++) {
        if (mx < Math.abs(Q.x[i])) { mx = Math.abs(Q.x[i]); }
        if (my < Math.abs(Q.y[i])) { my = Math.abs(Q.y[i]); }
    }
    for (i = 0; i < statDP[B].n; i++) {
        statDP[A].x[i] = Q.x[i] / mx;
        statDP[A].y[i] = Q.y[i] / my;
    }
    statDP[A].sx = Q.sx / mx;
    statDP[A].sy = Q.sy / my;
    statDP[A].sx2 = Q.sx2 / (mx * mx);
    statDP[A].sy2 = Q.sy2 / (my * my);
    return statDP[A];
}

function getDP(flag) {
    if (statDP[flag]) { return statDP[flag]; }
    if (flag > 0) {
        if (flag < 2) { zeroCenter(flag, flag - 1); } else if (flag < 4) { normalize(flag, flag - 2); } else if (flag < 8) { decorrelate(flag, flag - 4); } else { whiten(flag, flag - 8); }
    }
    return statDP[flag];
}

function btnToggle(idx) {
    if (idx >= 0) btnActive[idx] = !btnActive[idx];
    var i, flag = 0;
    for (i = 0; i < btnActive.length; i++) {
        if (btnActive[i]) {
            flag += 1 << i;
        }
    }
    console.log("flag: " + flag);
    flag = getDP(flag);
    optionDP.series[0].data = [];
    for (i = 0; i < flag.n; i++) {
        optionDP.series[0].data[i] = [flag.x[i], flag.y[i], i];
    }
    optionDP.series[0].markLine.data[1].xAxis = flag.sx / flag.n;
    optionDP.visualMap[0].max = flag.n - 1;
    ECDataProc.setOption(optionDP);
}

function initDP() {
    "use strict";
    initArray(300);
    ECDataProc.setOption(optionDP);
}

initDP();