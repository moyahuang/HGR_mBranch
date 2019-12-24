from django.shortcuts import render
from django.http import JsonResponse, FileResponse
import json
from global_var import get_from_queue, get_queue_remainder, predict_label
from global_var import store_off_switch, store_on_switch, get_switch
import os
import time
import numpy as np
from fpga_server import start_fpga_server, temp_output, temp_server
from multiprocessing import Process
from threading import Thread

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
        "server_ip" : "192.168.1.102",
        "server_port" : 8080,
        "client_ip" : "192.168.1.100", 
        "client_port" : 8080,
    }
    fpga_server_thread = Thread(target=start_fpga_server, kwargs=args)
    fpga_server_thread.start()
    return render(request, 'demo2.html')


def query_data(request):
    dic = {}
    data = get_from_queue()

    # sample the data for display
    sampling_rate_for_display = 1
    data_for_display = data[:,::sampling_rate_for_display]
    
    # predict the label
    data_for_predict = None
    result = predict_label(data_for_predict)

    # build return value
    print(data.shape, get_queue_remainder())
    dic["data"] = data.tolist()
    print(data)
    json_dump = json.dumps(dic)
    
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