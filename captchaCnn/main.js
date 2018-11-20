"use strict";

var echarts = echarts,
    ECConv = ECConv,
    ECDataProc = ECDataProc,
    ECSample = ECSample,
    optionDP = optionDP,
    optionCV = optionCV,
    optionSP = optionSP,
    $ = $;
var themeName = ["default", "dark", "infographic", "macarons", "roma", "shine", "vintage"];

function setTheme(th) {
    console.log("set theme :" + th);
    th = th ? th : themeName[0];

    ECConv.dispose();
    ECConv = echarts.init(document.getElementById("divECConv"), th);
    ECConv.setOption(optionCV);

    ECDataProc.dispose();
    ECDataProc = echarts.init(document.getElementById("divECDataProc"), th);
    ECDataProc.setOption(optionDP);

    ECSample.dispose();
    ECSample = echarts.init(document.getElementById("divECSp"), th);
    ECSample.setOption(optionSP);
}

function initMain() {
    var i;
    for (i = 0; i < themeName.length; i++) {
        $("#ulTheme").off().on("click", "li>button", function() {
            setTheme($(this).html());
        });
        $("#ulTheme").append($("<li></li>").append($("<button class='btn btn-warning btn-block'>" + themeName[i] + "</button>")).css("margin-top", "3px"));
    }
}



initMain();