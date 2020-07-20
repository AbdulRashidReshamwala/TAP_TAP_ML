from tensorflow.compat.v1 import InteractiveSession
from tensorflow.compat.v1 import ConfigProto
from keras.preprocessing.image import ImageDataGenerator
from keras.applications import VGG16, MobileNetV2
import pickle
import keras

available_models = {'vgg16': VGG16, 'mobilenetv2': MobileNetV2}

config = ConfigProto()
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)


def train_model(dataset_name, model_name, arch, image_shape, epochs):
    gen = ImageDataGenerator(
        rescale=1./255,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )

    train_generator = gen.flow_from_directory(
        f'../static/datasets/{dataset_name}', shuffle=True)

    validation_generator = gen.flow_from_directory(
        f'../static/datasets/{dataset_name}',
        target_size=(image_shape, image_shape),
        batch_size=16,
        class_mode='categorical',
        subset='validation')

    with open(f'../static/encoders/{model_name}.plk', 'wb') as f:
        pickle.dump(train_generator.classes, f)

    num_classes = train_generator.num_classes

    base_model_arch = available_models[arch]
    base_model = base_model_arch(
        input_shape=(image_shape, image_shape, 3), include_top=False, weights='imagenet')
    global_layer = keras.layers.GlobalAveragePooling2D()(base_model.output)
    prediction_layer = keras.layers.Dense(
        num_classes, activation='softmax')(global_layer)
    model = keras.models.Model(
        inputs=base_model.input, outputs=prediction_layer)
    model.summary()
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy', metrics=["acc"])
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=1)
    data = history.history
    with open(f'../static/history/{model_name}.plk', 'wb') as f:
        pickle.dump(data, f)
    model.save(f'../static/models/{model_name}.h5')


train_model('test', '123', 'mobilenetv2', 224, 5)
