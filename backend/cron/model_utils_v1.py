
from keras.preprocessing.image import ImageDataGenerator
import pickle
import requests
import numpy as np
from keras.models import load_model
from keras.preprocessing import image
import cv2
from PIL import Image
from keras.applications import VGG19, MobileNetV2, DenseNet201, InceptionV3, ResNet50, Xception
import tensorflow.keras as keras
from keras.optimizers import Adam, RMSprop, Adagrad, SGD, Adamax
from keras_preprocessing.image import ImageDataGenerator
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.compat.v1 import ConfigProto
from tensorflow.compat.v1 import InteractiveSession

config = ConfigProto()
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)

def transferlearning(modelname, learning_rate, image_shape, training_path, epoch):
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2)

    train_generator = train_datagen.flow_from_directory(
        training_path,
        target_size=(image_shape, image_shape),
        batch_size=16,
        class_mode='categorical',
        subset='training',
        shuffle=True)

    validation_generator = train_datagen.flow_from_directory(
        training_path,
        target_size=(image_shape, image_shape),
        batch_size=16,
        class_mode='categorical',
        subset='validation')

    num_classes = train_generator.num_classes

    if modelname == 'VGG19':
        base_model = VGG19(input_shape=(image_shape, image_shape, 3),
                           include_top=False, weights='imagenet')
    elif modelname == 'MobileNetV2':
        base_model = MobileNetV2(
            input_shape=(image_shape, image_shape, 3), include_top=False, weights='imagenet')
    elif modelname == 'DenseNet201':
        base_model = DenseNet201(
            input_shape=(image_shape, image_shape, 3), include_top=False, weights='imagenet')
    elif modelname == 'InceptionV3':
        base_model = InceptionV3(
            input_shape=(image_shape, image_shape, 3), include_top=False, weights='imagenet')
    elif modelname == 'ResNet50':
        base_model = ResNet50(input_shape=(image_shape, image_shape, 3),
                              include_top=False, weights='imagenet')
    elif modelname == 'Xception':
        base_model = Xception(input_shape=(image_shape, image_shape, 3),
                              include_top=False, weights='imagenet')

    global_layer = keras.layers.GlobalAveragePooling2D()(base_model.output)
    prediction_layer = keras.layers.Dense(
        num_classes, activation='softmax')(global_layer)
    model = keras.models.Model(
        inputs=base_model.input, outputs=prediction_layer)
    model.summary()
    model.compile(optimizer=Adam(lr=learning_rate),
                  loss='categorical_crossentropy', metrics=["acc"])
    history = model.fit(
        
        train_generator,
        steps_per_epoch=5,
        epochs=epoch,
        validation_data=validation_generator,
        validation_steps=1)

    return history


if __name__ == "__main__":
    history = transferlearning('MobileNetV2', learning_rate=0.001, image_shape=128,
                               training_path='../static/datasets/test', epoch=3)
    acc = history.history['acc']
    val_acc = history.history['val_acc']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    print(acc, val_acc, loss, val_loss)
