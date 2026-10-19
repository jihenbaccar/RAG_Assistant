# RAG Assistant

A small Retrieval-Augmented Generation (RAG) project that extracts text from PDFs, chunks it, stores embeddings in PostgreSQL with pgvector, and answers questions using a language model via OpenRouter.

## Features

- PDF parsing with PyMuPDF
- Text cleaning and chunking
- Sentence embeddings with Sentence Transformers
- Semantic retrieval using cosine similarity
- PostgreSQL + pgvector for similarity search
- FastAPI backend for the question-answer API
- React + Vite frontend for the user interface

## Project structure

- `app/` — FastAPI backend and retrieval logic
- `frontend/` — React frontend
- `data/documents/` — source documents
- `notebooks/` — exploratory notebook for PDF extraction and RAG experimentation
- `docker-compose.yml` — PostgreSQL setup

## Prerequisites

- Python 3.10+
- Docker
- Node.js 18+
- An OpenRouter API key

## Setup

1. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`.

3. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. Start the backend:

   ```bash
   uvicorn app.main:app --reload
   ```

6. Start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Example API request

```bash
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What are climate models?"}'
```
