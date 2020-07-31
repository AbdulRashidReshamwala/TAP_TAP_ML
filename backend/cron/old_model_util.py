import keras
from keras.applications import MobileNetV2
from keras.layers import Input, Dense, GlobalAveragePooling2D
from keras import Model
from keras.optimizers import Adam
from keras.losses import CategoricalCrossentropy
from keras.preprocessing.image import ImageDataGenerator
import pickle

from tensorflow.compat.v1 import ConfigProto
from tensorflow.compat.v1 import InteractiveSession

config = ConfigProto()
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)

BATCH_SIZE = 32
BASE_DIR = '../static/'


def create_base_mn(img_size):
    return MobileNetV2(input_shape=(img_size, img_size, 3), weights='imagenet', include_top=False)


def create_final_model(base_model, img_size, num_classes):
    base_model.trainable = False
    inputs = Input(shape=(img_size, img_size, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    m = Model(inputs, outputs)
    m.compile(optimizer=Adam(),
              loss=CategoricalCrossentropy(), metrics=['acc'])
    return m


def create_data_generator(name, img_size):
    gen = ImageDataGenerator(validation_split=0.2)
    dir = f'{BASE_DIR}datasets/{name}'
    train = gen.flow_from_directory(directory=dir,
                                    target_size=(img_size, img_size),
                                    color_mode="rgb",
                                    class_mode="categorical",
                                    batch_size=BATCH_SIZE,
                                    shuffle=True,
                                    interpolation="nearest",
                                    subset='training'
                                    )
    validation = gen.flow_from_directory(directory=dir,
                                         target_size=(img_size, img_size),
                                         color_mode="rgb",
                                         class_mode="categorical",
                                         batch_size=BATCH_SIZE,
                                         shuffle=True,
                                         interpolation="nearest",
                                         subset='validation'
                                         )
    classes_mapping = train.class_indices
    return train, validation, classes_mapping


def train_model(model_name, dataset_name, img_size, epochs):
    base_model = create_base_mn(img_size)
    train_set, validation_set, encoder = create_data_generator(
        dataset_name, img_size)
    decoder = {v: k for k, v in encoder.items()}
    with open(f'{BASE_DIR}encoders/{model_name}.pkl', 'wb') as f:
        pickle.dump(decoder, f)
    model = create_final_model(base_model, img_size, len(encoder))
    history = model.fit(train_set, epochs=epochs,
                        validation_data=validation_set)
    data = history.history
    with open(f'{BASE_DIR}history/{model_name}.pkl', 'wb') as f:
        pickle.dump(data, f)
    model.save(f'{BASE_DIR}models/{model_name}.h5')
