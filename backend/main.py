from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


from .routers import dataset, model
from .db.mongodb_utils import close_mongo_connection, connect_to_mongo


client = MongoClient()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="backend/static"), name="static")


app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)


@app.get("/")
def read_root():
    return {"msg": "root url"}


app.include_router(dataset.router, prefix="/dataset", tags=["dataset"],)
app.include_router(model.router, prefix="/model", tags=["model"],)
