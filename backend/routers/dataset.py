from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from typing import Optional, List
from pydantic import BaseModel
from bson import ObjectId
from ..db.mongodb import get_database, MongoClient, convert_object_id
from ..core.config import DATABASE_NAME, DATASET_COLLECTION_NAME
from fastapi.responses import JSONResponse

router = APIRouter()


class DatasetQuery(BaseModel):
    name: str
    classes: List[str]
    num_images: int


@router.post('/create')
def create_new_dataset(query: DatasetQuery, db: MongoClient = Depends(get_database)):
    dataset = query.dict()
    res = db[DATABASE_NAME][DATASET_COLLECTION_NAME].find_one(
        {"name": query.name})
    if res:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'msg': 'name already taken'})
    dataset['status'] = 'queued'
    db[DATABASE_NAME][DATASET_COLLECTION_NAME].insert_one(dataset)
    return query


@router.get('/')
def get_all_dataset(db: MongoClient = Depends(get_database)):
    query_result = db[DATABASE_NAME][DATASET_COLLECTION_NAME].find()
    res = []
    for result in query_result:
        res.append(convert_object_id(result))
    return {"datasets": res}


@router.get('/status/{status}')
def get_all_dataset_with_status(status: str, db: MongoClient = Depends(get_database)):
    query_result = db[DATABASE_NAME][DATASET_COLLECTION_NAME].find(
        {"status": status})
    res = []
    for result in query_result:
        res.append(convert_object_id(result))
    return {"datasets": res}


@router.get('/{name}')
def get_dataset_by_name(name: str, db: MongoClient = Depends(get_database)):
    dataset = db[DATABASE_NAME][DATASET_COLLECTION_NAME].find_one({
                                                                  "name": name})
    dataset = convert_object_id(dataset)
    return dataset
