import os

import psycopg2
from dotenv import load_dotenv
from openai import OpenAI
from sentence_transformers import SentenceTransformer

load_dotenv()


def get_db_config():
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5433")),
        "database": os.getenv("DB_NAME", "rag_assistant"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "rag_password"),
    }


def get_connection():
    return psycopg2.connect(**get_db_config())


def get_model():
    return SentenceTransformer(os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))


def get_client():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not set. Add it to your .env file.")

    return OpenAI(
        base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
        api_key=api_key,
    )


def retrieve_from_db(query, top_k=3, similarity_threshold=0.50):
    model = get_model()
    query_embedding = model.encode([query])[0]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            content,
            source,
            page,
            embedding <=> %s::vector AS distance
        FROM document_chunks
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
        """,
        (
            query_embedding.tolist(),
            query_embedding.tolist(),
            top_k,
        ),
    )

    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    results = []

    for row in rows:
        similarity = 1 - row[4]

        if similarity >= similarity_threshold:
            results.append({
                "chunk_id": row[0],
                "text": row[1],
                "source": row[2],
                "page": row[3],
                "similarity": similarity,
            })

    return results


def rag_answer(query):
    results = retrieve_from_db(query)

    if not results:
        return {
            "answer": "L'information n'est pas disponible dans les documents.",
            "sources": [],
        }

    context = "\n\n".join(
        f"[Source: {result['source']}, Page: {result['page']}]\n{result['text']}"
        for result in results
    )

    prompt = f"""
Tu es un assistant qui répond aux questions en utilisant uniquement
les informations fournies dans le contexte.

Si la réponse n'est pas présente dans le contexte,
dis que l'information n'est pas disponible dans les documents.

Contexte :
{context}

Question :
{query}

Réponse :
"""

    client = get_client()
    response = client.chat.completions.create(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/free"),
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": [
            {
                "source": result["source"],
                "page": result["page"],
                "similarity": round(result["similarity"], 3),
            }
            for result in results
        ],
    }