from django.shortcuts import render
from django.http import JsonResponse, FileResponse
import json
from global_var import get_from_queue, get_queue_remainder, predict_label
from global_var import store_off_switch, store_on_switch, get_switch
import os
import time
import numpy as np
from fpga_server import start_fpga_server_new, temp_output, temp_server
from multiprocessing import Process
from threading import Thread
import time

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)

def display(request):
    global args
    args = {
        "server_ip" : "192.168.1.101",
        "server_port" : 8080,
        "client_ip" : "192.168.1.100", 
        "client_port" : 8080,
    }
    fpga_server_thread = Thread(target=start_fpga_server_new, kwargs=args)
    fpga_server_thread.start()
    return render(request, 'demo2.html')


def query_data(request):
    dic = {}
    data = get_from_queue() # data.shape => (8, 2048)

    # print("data:", data)

    # sample the data for display
    sampling_interval_for_display = 1024
    time_interval = 1 / 2048 * sampling_interval_for_display
    data_for_display = data[:,::sampling_interval_for_display]
    now_time = time.time()
    print("data for display", data_for_display)
    print(now_time)
    temp_display_dic = []
    for i in range(data_for_display.shape[0]):
        _temp_dic = []
        for j in range(data_for_display.shape[1]):
            _temp_dic.append({
                "x" : now_time + time_interval * j,
                "y" : data_for_display[i][j]
            })
        temp_display_dic.append(_temp_dic)
    dic["data"] = temp_display_dic
    print("data", temp_display_dic)
    
    # predict the label
    data_for_predict = data.T.reshape([-1, 128, 8])
    result = predict_label(data_for_predict)
    result = np.argmax(result, axis=1)
    print("predicted result",result)
    dic["label"] = result.tolist()

    # build return value
    json_dump = json.dumps(dic)

    return JsonResponse(json_dump, safe=False)

def query_data_new(request):
    temp_dic = get_from_queue()
    json_dump = json.dumps(temp_dic)
    return JsonResponse(json_dump, safe=False)

def temp_display(request):
    global args
    args = {
        "post_freq" : 1,
    }
    fpga_server_thread = Thread(target=temp_server, kwargs=args)
    fpga_server_thread.start()
    return render(request, 'demo2.html')

def temp_query_data(request):
    dic={}
    data=get_from_queue()
    print("query_data", data)
    dic['data']=data
    json_dump=json.dumps(dic, cls=NpEncoder)
    return JsonResponse(json_dump, safe=False)

def store_on(request):
    store_on_switch()
    dic = {}
    dic["success"] = True
    json_dump = json.dumps(dic)
    return JsonResponse(json_dump, safe=False)


def store_off(request):
    store_off_switch()
    dic = {}
    dic["success"] = True
    json_dump = json.dumps(dic)
    return JsonResponse(json_dump, safe=False)