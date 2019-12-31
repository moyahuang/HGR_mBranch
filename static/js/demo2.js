var PRINT_LOG=true;
var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(139, 119, 101)',
    fire: 'rgba(178, 34, 34)',
    transparent: 'rgb(0,0,0,0)'
};
//图表配置参数
var chartConfig = {
    duration: 10000, //窗口时间大小
    delay: 2000, //初始数据延时时间，用以保证线条顺滑显示
    sampleRate: 64, // 采样率
    postFreq: 2, // 每秒请求接口次数，
    min: 0, //y坐标最小值
    max: 2.5, //y坐标最大值
    frameRate: 30,
    feedInterval: 1000
}
var color = Chart.helpers.color;
function lineBaseConfig(index){
    var num=index+1;
    return {
        label: 'Channel '+num,
        backgroundColor: color(chartColors[Object.keys(chartColors)[index]]).alpha(0.5).rgbString(),
        borderColor: chartColors[Object.keys(chartColors)[index]],
        borderWidth: 1,
        fill: false,
        cubicInterpolationMode: 'monotone',
        data: []
    }
}

function randomScalingFactor() {
    return Math.round(Math.random()*2);
}

function onReceive(event) {
    // window.myChart.config.data.datasets[event.index].data.push(event.data);
    window.myChart.config.data.datasets[event.index].data.push({
        x: Math.round(event.data.x*1000),
        y: event.data.y
    });

    window.myChart.update({
        preservation: true
    });
}

var timeoutIDs = [];

function startFeed(index) {
    timeoutIDs[index]=setInterval(getDataByInterval, chartConfig.feedInterval);
    //因为布局暂时注释掉
    // var receive = function() {
    //     getDataByInterval();
    //     // onReceive({
    //     //     index: index,
    //     //     timstamp: Date.now(),
    //     //     value: randomScalingFactor()
    //     // });
    //     timeoutIDs[index] = setTimeout(receive, 1000);
    // }
    // timeoutIDs[index] = setTimeout(receive, 1000);

}

function stopFeed(index) {
    clearTimeout(timeoutIDs[index]);
}
function showLine(index){
    config.data.datasets[index].backgroundColor=color(chartColors[Object.keys(chartColors)[index]]).alpha(0.5).rgbString();
    config.data.datasets[index].borderColor=chartColors[Object.keys(chartColors)[index]];
}
function hideLine(index){
    //todo;
    config.data.datasets[index].backgroundColor=color(chartColors[Object.keys(chartColors)[8]]).alpha(0.5).rgbString();
    config.data.datasets[index].borderColor=chartColors[Object.keys(chartColors)[8]];
}

var color = Chart.helpers.color;
var config = {
    type: 'line',
    data: {
        datasets: [
            lineBaseConfig(0), 
            lineBaseConfig(1),
            lineBaseConfig(2),
            lineBaseConfig(3), 
            lineBaseConfig(4),
            lineBaseConfig(5),
            lineBaseConfig(6),
            lineBaseConfig(7),
        ]
    },
    options: {        
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Live Streaming Data'
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
                    labelString: 'voltage / v'
                },
                ticks: {
                    min: chartConfig.min,
                    max: chartConfig.max
                }
            }]
        },
        tooltips: {
            mode: 'nearest',
            intersect: false
        },
        hover: {
            duration: 0,
            // mode: 'nearest',
            // intersect: false
        },
        animation: {
            duration: 0
        },
        responsiveAnimationDuration: 0,
        plugins: {
            streaming: {
                frameRate: chartConfig.frameRate
            }
        }
    }
};



window.onload = function() {
    var ctx = document.getElementById('myChart').getContext('2d');
    window.myChart = new Chart(ctx, config);
    window.myChart.canvas.parentNode.style.height = '450px';
    startFeed(0);
    // startFeed(1);
    // startFeed(2);
    // startFeed(3);
    // startFeed(4);
    // startFeed(5);
    // startFeed(6);
    // startFeed(7);
};

// document.getElementById('randomizeData').addEventListener('click', function() {
//     config.data.datasets.forEach(function(dataset) {
//         dataset.data.forEach(function(dataObj) {
//             dataObj.y = randomScalingFactor();
//         });
//     });
//     window.myChart.update();
// });

// var colorNames = Object.keys(chartColors);
// document.getElementById('addDataset').addEventListener('click', function() {
//     var colorName = colorNames[config.data.datasets.length % colorNames.length];
//     var newColor = chartColors[colorName];
//     var newDataset = {
//         label: 'Channel ' + (config.data.datasets.length + 1),
//         backgroundColor: color(newColor).alpha(0.5).rgbString(),
//         borderColor: newColor,
//         borderWidth: 1,
//         fill: false,
//         cubicInterpolationMode: 'monotone',
//         // lineTension: 0,
//         data: []
//     };

//     config.data.datasets.push(newDataset);
//     window.myChart.update();
//     startFeed(config.data.datasets.length - 1);
// });

// document.getElementById('removeDataset').addEventListener('click', function() {
//     stopFeed(config.data.datasets.length - 1);
//     config.data.datasets.pop();
//     window.myChart.update();
// });

// document.getElementById('addData').addEventListener('click', function() {
//     config.data.datasets.forEach(function(dataset) {
//         dataset.data.push({
//             x: Date.now(),
//             y: randomScalingFactor()
//         });
//     });
//     window.myChart.update();
// });

function getDataByInterval() {
    //todo;
    $.ajax("/query_data", {
        cache: false,
        dataType: "json",
        success: function(res) {
            res=JSON.parse(res);
            //label consists of 16 predicted result for 2s data
            console.log("labels", res.label);
            var labels=res.label;
            var labelCounter=[0,0,0,0,0,0,0,0];
            //将labels每8个数据为一个间隔分段进行计数
            for(var j=0; j<labels.length/8; j++){
                //1. 对每一部分的值频率进行统计
                for(var i=j*8;i<(j+1)*8; i++){
                    labelCounter[labels[i]]+=1;
                }
                //2. 找出频率最高的值并打印
                var maxPos=0;
                for(var i=1;i<8;i++){
                    if(labelCounter[i]>labelCounter[maxPos]){
                        maxPos=i;
                    }
                }
                //todo;这里用于显示相应的手势结果在前端页面上
                //若最大计数结果为0时 则显示无手势识别结果
                if(labelCounter[maxPos]==0){
                    console.log("label","None");
                }
                console.log("label:", maxPos);
                var handImg=document.getElementById("handGesture");
                var gestureWrapper=document.getElementById("gestureWrapper");
                // gestureWrapper.innerHTML="<img src='/static/img/"+maxPos+".png?t="+Math.random()+"' alt='gesture' width='300px' height='300px'>";
                // handImg.src="/static/img/"+maxPos+".png?t="+Math.random();
                gestureWrapper.innerHTML="<h1>"+maxPos+"</h1>";
                // return false;
                //3. 重置频率计数器
                labelCounter=[0,0,0,0,0,0,0,0];
            }
            
            for (var i = 0; i < 8; i++) {
               
                //res.data[i] stands for the channel one data
                var rawData = res.data[i];
                // debug用
                if(PRINT_LOG){
                    console.log("channel"+i+":",rawData);
                }
                //rawData is an array of {'x': timestamp,'y': voltage}
                for(var j=0; j<rawData.length; j++){
                    onReceive({
                        index: i,
                        data: rawData[j]
                    });
                }
            }
        },
            
        error: function() {
            console.log("connection fail");
        }
    })
}

function onStoreData(isOn){
    if(isOn){
        $.ajax("/store_on",{
            cache: false,
            success: function(res){
                if(PRINT_LOG){
                    console.log("start storing data",res);
                }
                // $("#isStoreOn").html("开始");
            },
            error: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
            }
        })
    }else{
        $.ajax("/store_off",{
            cache: false,
            success: function(res){
                if(PRINT_LOG){
                    console.log(res);
                }
                $("#isStoreOn").html("停止");
            },
            error: function(res){
                if(PRINT_LOG){
                    console.log("stop storing data",res);
                }
            }
        });
        $("#isStoreOn").html("停止");
    }
}