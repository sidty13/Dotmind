import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(context_chunks: list[dict], query: str) -> str:
    context = "\n\n---\n\n".join([c["content"] for c in context_chunks])

    prompt = f"""You are an expert code assistant analyzing a GitHub repository.
Answer the question using ONLY the code context below.
If the answer isn't in the context, say "This info isn't in the provided code."
Always mention the file name your answer comes from.

Context:
{context}

Question: {query}

Answer:"""

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    return response.choices[0].message.content