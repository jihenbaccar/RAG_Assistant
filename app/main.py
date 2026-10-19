from fastapi import FastAPI
from pydantic import BaseModel

from app.rag import rag_answer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAG Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "RAG Assistant API"}


@app.post("/ask")
def ask(request: QuestionRequest):
    return rag_answer(request.question)