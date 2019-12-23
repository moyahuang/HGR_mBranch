 //图表颜色配置
 var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

//常用图表配置参数
var chartConfig = {
    duration: 8000, //窗口时间大小
    delay: 1000,
    sampleRate: 64, // 采样率
    postFreq: 2, // 每秒请求接口次数，
    min: 0, //y坐标最小值
    max: 2.5, //y坐标最大值
}

//是否打印日志
var PRINT_LOG=false;

$(function(){
    // $(".chart-box")[0].style.height='150px';
    // $(".chart-box")[0].style.width='150px';
})

function onStoreData(target){
    if(target.checked){
        $.ajax("/store/on",{
            cache: false,
            success: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
                $("#isStoreOn").html("开始");
            },
            error: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
            }
        })
    }else{
        $.ajax("/store/off",{
            cache: false,
            success: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
                $("#isStoreOn").html("停止");
            },
            error: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
            }
        });
        $("#isStoreOn").html("停止");
    }
}

function onSizeConfirm(){
    var size=$("#canvas-size").val();
    // $(".channels").css("flex",size+"%");
    $(".chart-box")[0].style.height='150px';
    console.log(size);
}

function onReceive(event) {
    event.data.forEach(
        function(item) {
            // debug用
            // if (event.index == 1) {
            //     console.log(item);
            // }
            window.myChart[event.index].config.data.datasets[0].data.push(item);
        }
    )
    window.myChart[event.index].update({
        preservation: false
    });
}

var timeoutIDs = [];
var tick = 0;
var returnData;

//获取数据接口
function getDataByInterval() {
    //todo;
    $.ajax("/query_data", {
        cache: false,
        dataType: "json",
        success: function(res) {
            res = JSON.parse(res);
            returnData = res.data;
            if(PRINT_LOG){
                console.log(returnData);
            }
            for (var i = 0; i < 8; i++) {
                var rawData = res.data[i];
                var data = [];
                var count = 0;
                var current_time = Date.now();
                // debug用
                // if (i == 0){
                //     console.log(res.data);  
                // }
                rawData.forEach(function(item) {
                    data.push({
                        x: current_time + (count++) * (1000 / chartConfig.sampleRate),
                        y: item
                    });
                });
                // debug用
                // console.log(data);
                onReceive({
                    index: i + 1,
                    data: data
                });
            }
        },
            
        error: function() {
            console.log("connection fail");
        }
    })
}
function startFeed() {
    // setInterval(function(){
    //     console.time();
    //     getDataByInterval();
    //     console.timeEnd();
    // }, 1000 / chartConfig.postFreq);
    // console.time();
    //因为布局暂时注释掉
    // getDataByInterval();
    
    setTimeout(startFeed, 1000/chartConfig.postFreq);
    // console.timeEnd();
}

// 停止输入数据 暂时没用
function stopFeed() {
    clearTimeout(timeoutIDs);
}

var color = Chart.helpers.color;

window.onload = function() {
    window.myChart = [];

        //配置工厂
        function produceConfig(index) {
            var config = {
            type: 'line',
            data: {
                datasets: [
                {
                    label: '采样点',
                    backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                    borderColor: chartColors.blue,
                    borderWidth: 1,
                    fill: false,
                    data: []
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Channel ' + index
                },
                elements:{
                    point:{
                        radius: 0
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'realtime',
                        realtime: {
                            duration: chartConfig.duration,
                            delay: chartConfig.delay,
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: '幅度/v'
                        },
                        ticks: {
                            min: chartConfig.min,
                            max: chartConfig.max
                        }
                    }]
                },
             }
            }
            return config;
        }
        
        //绘制八个通道的实时数据图表
        var ctx1 = document.getElementById('chart1').getContext('2d');
        window.myChart[1] = new Chart(ctx1, produceConfig(1));

        var ctx2 = document.getElementById('chart2').getContext('2d');
        window.myChart[2] = new Chart(ctx2, produceConfig(2));

        var ctx3 = document.getElementById('chart3').getContext('2d');
        window.myChart[3] = new Chart(ctx3, produceConfig(3));

        var ctx4 = document.getElementById('chart4').getContext('2d');
        window.myChart[4] = new Chart(ctx4, produceConfig(4));

        var ctx5 = document.getElementById('chart5').getContext('2d');
        window.myChart[5] = new Chart(ctx5, produceConfig(5));

        var ctx6 = document.getElementById('chart6').getContext('2d');
        window.myChart[6] = new Chart(ctx6, produceConfig(6));

        var ctx7 = document.getElementById('chart7').getContext('2d');
        window.myChart[7] = new Chart(ctx7, produceConfig(7));

        var ctx8 = document.getElementById('chart8').getContext('2d');
        window.myChart[8] = new Chart(ctx8, produceConfig(8));
    
    // startFeed();
    setTimeout( startFeed, 1000/chartConfig.postFreq);
    
};

// 没用到
var colorNames = Object.keys(chartColors);

// 控制通道图表显示
// function checkboxOnClick(checkbox, num) {
//     if (checkbox.checked == false) {
//         $("#chart" + num).parent().hide();
//     } else {
//         $("#chart" + num).parent().show();
//     }
// }

