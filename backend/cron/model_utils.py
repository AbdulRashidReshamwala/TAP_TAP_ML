import warnings
import os
from fastai.vision import cnn_learner, ImageDataBunch, get_transforms, error_rate, accuracy, r2_score, ClassificationInterpretation, load_learner, open_image
from fastai.vision.models import resnet18, resnet34, resnet50, resnet101, resnet152, squeezenet1_0, squeezenet1_1, densenet121, densenet169, vgg16_bn, vgg19_bn

warnings.filterwarnings("ignore")

BATCH_SIZE = 32
BASE_DIR = '../static/'

model_mapping = {'vgg_16': vgg16_bn, 'squeezenet': squeezenet1_1, 'resnet_18': resnet18,
                 'resnet_34': resnet34, 'resnet_101': resnet101, 'resnet_152': resnet152, 'densenet_121': densenet121, 'donsenet_169': densenet169, 'vgg_19': vgg16_bn}


def train_model(model_name, dataset_name, arch, img_size, epochs):
    data = ImageDataBunch.from_folder(f'{BASE_DIR}datasets/{dataset_name}',
                                      valid_pct=0.2,
                                      ds_tfms=get_transforms(),
                                      size=img_size,
                                      num_workers=6,
                                      bs=BATCH_SIZE)
    arch = model_mapping[arch]
    learner = cnn_learner(data, arch, metrics=[error_rate, accuracy])
    learner.fit_one_cycle(epochs)
    learner.export(os.path.join(os.getcwd(), '..',
                                'static', 'models', model_name+'.pkl'))
    meta = {}
    meta['metrics'] = [[i.item() for i in e]for e in learner.recorder.metrics]
    meta['loss'] = [i.item() for i in learner.recorder.losses]
    meta['lr'] = [i.item() for i in learner.recorder.lrs]
    return meta
