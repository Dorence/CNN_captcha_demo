"use strict";

var Chance = Chance,
    echarts = echarts,
    $ = $;
var chance = new Chance(Math.random);
var ECConv = echarts.init(document.getElementById("divECConv"), "dark");
var datCV = [];
var convCV = {
    curr: 0,
    c: [{
            name: "uniform filter",
            d: [
                [1 / 9, 1 / 9, 1 / 9],
                [1 / 9, 1 / 9, 1 / 9],
                [1 / 9, 1 / 9, 1 / 9]
            ]
        }, {
            name: "low-pass filter",
            d: [
                [1 / 16, 1 / 8, 1 / 16],
                [1 / 8, 1 / 4, 1 / 8],
                [1 / 16, 1 / 8, 1 / 16]
            ]
        }, {
            name: "high-pass filter",
            d: [
                [4 / 25, 2 / 25, 4 / 25],
                [2 / 25, 1 / 25, 2 / 25],
                [4 / 25, 2 / 25, 4 / 25]
            ]
        },
        {
            name: "left-vertical",
            d: [
                [2 / 9, 2 / 9, 2 / 9],
                [1 / 9, 1 / 9, 1 / 9],
                [0, 0, 0]
            ]
        }, {
            name: "left-horizontal",
            d: [
                [2 / 9, 1 / 9, 0],
                [2 / 9, 1 / 9, 0],
                [2 / 9, 1 / 9, 0]
            ]
        }, {
            name: "gradient",
            d: [
                [-1 / 3, 0, -1 / 3],
                [0, 7 / 3, 0],
                [-1 / 3, 0, -1 / 3]
            ]
        }
    ]

};

var optionCV = {
    title: { text: "随机样本", subtext: "CNN卷积计算" },
    toolbox: {
        feature: {
            dataView: { show: true, readOnly: true },
            restore: { show: true },
            saveAsImage: { show: true }
        }
    },
    grid3D: {
        axisLine: { lineStyle: { color: "#fff" } },
        axisPointer: { lineStyle: { color: "#fff" } },
        viewControl: {
            // autoRotate: true
        },
        light: {
            main: { shadow: true, quality: "ultra", intensity: 1.5 }
        }
    },
    xAxis3D: { type: "value" },
    yAxis3D: { type: "value" },
    zAxis3D: { type: "value", max: 7, min: 2 },
    series: [{
        name: "Data",
        type: "bar3D",
        shading: "realistic",
        bevelSize: 0.2,
        dimensions: ["cordX", "cordY"],
        data: []
    }],
    visualMap: [{
        type: "continuous",
        min: 3,
        max: 6,
        calculable: true,
        precision: 1,
        inRange: {
            color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]
        }
    }]
};

function initMatrix(widthX, widthY) {
    var i, j, num1, num2, num3;
    var list = [];
    for (i = 0; i < widthX; i++) {
        for (j = 0; j < widthY; j++) {
            num1 = 0.7 * Math.sin(i / 2 - j / 3) + 0.9 * Math.cos(i / 4 - j / 2);
            num2 = chance.floating({ min: -0.3, max: 0.3 });
            num3 = chance.floating({ min: 4.4, max: 4.6 });
            num3 = Math.min(Math.max(num1 + num2 + num3, 3), 6);
            list.push([i, j, Number(num3.toFixed(6))]);
        }
    }
    datCV[0] = list;
    datCV[0].x = widthX, datCV[0].y = widthY;
    datCV[0].b = list.reduce(function(total, x) { return total + x[2]; }, 0) / widthX / widthY;
    console.log(datCV[0]);
    controlCV(0);
}

function randerTableConv(idx) {
    convCV.curr = idx;
    datCV = [datCV[0]];
    var P = convCV.c[idx].d,
        o = "";
    for (var i = 0; i < P.length; i++) {
        o += "<tr>";
        for (var j = 0; j < P[i].length; j++) {
            o += "<td>" + P[j][i].toFixed(6).replace(/\.?0+$/g, "") + "</td>";
        }
        o += "</tr>";
    }
    console.log(o);
    $("#tabMatConv").html(o);
}

function controlCV(idx) {
    optionCV.series[0].data = calcCV(idx);
    ECConv.setOption(optionCV);
}

function calcCV(step) {
    if (datCV[step]) { return datCV[step]; }
    datCV[step] = [];
    var i, j, ii, jj, ci, cj, ti, tj, tmp;
    var dat = convCV.c[convCV.curr].d,
        lx = dat.length,
        dx = (lx - 1) / 2,
        ly = dat[0].length,
        dy = (ly - 1) / 2,
        LX = datCV[0].x,
        LY = datCV[0].y;
    //忽略 step > 1 后 padding
    ci = 0;
    for (i = 0; i < LX; i += step) {
        cj = 0;
        for (j = 0; j < LY; j += step) {
            tmp = 0;
            for (ii = -dx; ii <= dx; ii++) {
                for (jj = -dy; jj <= dy; jj++) {
                    ti = Math.min(Math.max(i + ii, 0), LX - 1);
                    tj = Math.min(Math.max(j + jj, 0), LY - 1);
                    //console.log(dat[ii + dx][jj + dy] + " " + datCV[0][ti * LX + tj][2]);
                    tmp += dat[ii + dx][jj + dy] * datCV[0][ti * LX + tj][2];
                }
            }
            console.log([ci, cj, tmp]);
            datCV[step].push([ci, cj, tmp]);
            cj++;
        }
        ci++;
    }
    console.log("get step " + step);
    console.log(datCV[step]);
    return datCV[step];
}

function initCV() {
    "use strict";
    initMatrix(30, 30);
    randerTableConv(0);
    $("#btnCV").on("click", function() {
        var r = Number($("#iptStep").val());
        r = (r < 0) ? 1 : r;
        controlCV(r);
    });
    var o = "";
    for (var i = 0; i < convCV.c.length; i++) {
        o += "<li><a href='javascript:void(0);' onclick='randerTableConv(" + i + ");'>" + convCV.c[i].name + "</a></li>";
    }
    $("#ulSelConv").html(o);
}

initCV();