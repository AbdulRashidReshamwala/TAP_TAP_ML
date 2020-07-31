from fastapi import APIRouter, Depends, status, UploadFile, File
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
from bson import ObjectId
from PIL import Image
import pickle
from ..db.mongodb import get_database, MongoClient, convert_object_id
from ..core.config import DATABASE_NAME, MODEL_COLLECTION_NAME, DATASET_COLLECTION_NAME
from fastapi.responses import JSONResponse
import os
import numpy as np
from keras.preprocessing.image import img_to_array
from tempfile import NamedTemporaryFile
from fastai.vision import open_image, load_learner

router = APIRouter()

os.environ["CUDA_VISIBLE_DEVICES"] = '-1'


class ModelQuery(BaseModel):
    arch: str
    dataset_name: str
    epochs: int
    img_size: int


@router.post('/create')
def create_new_model(query: ModelQuery, db: MongoClient = Depends(get_database)):
    model = query.dict()
    model['name'] = f'{model["dataset_name"]}-{model["arch"]}-{model["epochs"]:03d}-{model["img_size"]}x{model["img_size"]}'
    print(model['name'])
    res = db[DATABASE_NAME][MODEL_COLLECTION_NAME].find_one(
        {"name": model['name']})
    if res:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'msg': 'name already taken'})
    res = db[DATABASE_NAME][DATASET_COLLECTION_NAME].find_one(
        {"name": model['dataset_name']})
    if not res:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'msg': 'dataset not present'})
    model['status'] = 'queued'
    db[DATABASE_NAME][MODEL_COLLECTION_NAME].insert_one(model)
    return query


@router.get('/')
def get_all_models(db: MongoClient = Depends(get_database)):
    query_result = db[DATABASE_NAME][MODEL_COLLECTION_NAME].find(
        projection={'id': 1, 'name': 1, 'status': 1})
    res = []
    for result in query_result:
        res.append(convert_object_id(result))
    return {"models": res}


@router.get('/status/{status}')
def get_all_models_with_status(status, db: MongoClient = Depends(get_database)):
    query_result = db[DATABASE_NAME][MODEL_COLLECTION_NAME].find(
        {"status": status})
    res = []
    for result in query_result:
        res.append(convert_object_id(result))
    return {"models": res}


@router.get('/{name}')
def get_model_by_name(name: str, db: MongoClient = Depends(get_database)):
    model = db[DATABASE_NAME][MODEL_COLLECTION_NAME].find_one({
        "name": name})
    if not model:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'msg': 'name not found'})
    model = convert_object_id(model)
    return model


@router.post('/predict/{name}')
async def run_predictions_on_model(name: str, file: UploadFile = File(...), db: MongoClient = Depends(get_database)):
    model_data = db[DATABASE_NAME][MODEL_COLLECTION_NAME].find_one({
        "name": name})
    try:
        with NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            print(tmp.name)
            img = open_image(tmp.name)
        model = load_learner(f'backend/static/models/',
                             file=f'{model_data["name"]}.pkl')
        prediction, predict_id, output = model.predict(img)
        classes = model.data.classes
        output = [i.item() for i in output]
        predict_id = predict_id.item()
        return {"prob": output, "result": str(prediction), "classes": classes}
    except Exception as e:
        print(e)
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'msg': 'name not found'})
