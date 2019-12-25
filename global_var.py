from multiprocessing import Queue
import keras
from keras.models import Input, Model
from keras.layers import LSTM, SimpleRNN, Dense, GRU, RNN
from keras.utils import to_categorical
from keras.optimizers import Adam
from keras.losses import categorical_crossentropy
from tensorflow.python.keras.backend import set_session
import numpy as np
import tensorflow as tf

def _init():
    global _global_queue
    global _switch
    global _model
    global graph 
    global sess
    _global_queue = Queue(maxsize=0)
    _switch = False

    # bulid RNN model
    input_layer = Input([128, 8])
    m = LSTM(128)(input_layer)
    m = Dense(8, activation = "softmax")(m)
    _model = Model(input_layer, m)
    sess = tf.Session()
    graph = tf.get_default_graph()
    set_session(sess)
    _model.load_weights("weights.74-0.9977.hdf5")
    print(_model.summary())

def put_into_queue(value):
    _global_queue.put(value)
    # _global_queue.put_nowait(value)

def get_from_queue():
    global _global_queue
    try:
        return _global_queue.get()
        # return _global_queue.get_nowait()
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
    global graph
    global sess
    with graph.as_default():
        set_session(sess)
        return _model.predict(input_data)

_init()

if __name__ == "__main__":
    test_data = np.random.uniform(size=[16,128,8])
    result = predict_label(test_data * 5)
    result = np.argmax(result, axis=1)
    print(result) 