from multiprocessing import Queue
import keras
from keras.models import Input, Model
from keras.layers import LSTM, SimpleRNN, Dense, GRU, RNN
from keras.utils import to_categorical
from keras.optimizers import Adam
from keras.losses import categorical_crossentropy
import numpy as np

def _init():
    global _global_queue
    global _switch
    global _model
    _global_queue = Queue(maxsize=0)
    _switch = False

    # bulid RNN model
    input_layer = Input([128, 8])
    m = LSTM(128)(input_layer)
    m = Dense(8, activation = "softmax")(m)
    _model = Model(input_layer, m)
    _model.load_weights("weights.74-0.9977.hdf5")

def put_into_queue(value):
    # _global_queue.put(value)
    _global_queue.put_nowait(value)

def get_from_queue():
    global _global_queue
    try:
        # return _global_queue.get()
        return _global_queue.get_nowait()
    except Exception as e:
        return None

def get_queue_remainder():
    global _global_queue
    return _global_queue.qsize()

def store_on_switch():
    global _switch
    _switch = True

def store_off_switch():
    global _switch
    _switch = False

def get_switch():
    global _switch
    return _switch

def predict_label(input_data):
    global _model
    return _model.predict(input_data)

_init()