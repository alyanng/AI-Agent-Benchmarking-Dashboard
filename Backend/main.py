from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import upload_ai_data


app = FastAPI(title="Backend API")

origins = [
    "http://localhost:5173",
     "http://localhost:5174",
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],          # allow all HTTP methods
    allow_headers=["*"],          # allow all headers
)


app.include_router(upload_ai_data.router)



