import os
import json
import pickle
from typing import Generator
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI
import faiss

from repo_loader import clone_repo, load_files
from chunker import chunk_all_files
from embeddings import embed_chunks, build_faiss_index, save_index, load_index
from retrieval import retrieve

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = "gpt-4o-mini"

_index = None
_chunks = None


def format_context(chunks: list[dict]) -> str:
    """Formats retrieved code chunks into a readable context string."""
    context_parts = []
    for chunk in chunks:
        lines = ""
        if "start_line" in chunk and "end_line" in chunk:
            lines = f" (Lines {chunk['start_line']}-{chunk['end_line']})"
        context_parts.append(f"--- File: {chunk['path']}{lines} ---\n{chunk['content']}")
    return "\n\n".join(context_parts)


def build_messages(context_chunks: list[dict], question: str, chat_history: list[dict] = None) -> list[dict]:
    context = format_context(context_chunks)

    system_prompt = (
        "You are an expert software developer and code assistant analyzing a GitHub repository.\n"
        "Answer questions accurately based on the provided code context and conversation history.\n"
        "Guidelines:\n"
        "1. Always reference the relevant files and line numbers when explaining.\n"
        "2. If the context does not contain enough info, state that clearly.\n"
        "3. Provide clean code snippets when helpful."
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

    user_prompt = f"Code Context:\n{context}\n\nQuestion: {question}"
    messages.append({"role": "user", "content": user_prompt})
    return messages


def generate_answer(context_chunks: list[dict], question: str, chat_history: list[dict] = None) -> str:
    """Synchronous answer generation."""
    messages = build_messages(context_chunks, question, chat_history)
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.2,
    )
    return response.choices[0].message.content


def generate_answer_stream(
    context_chunks: list[dict], 
    question: str, 
    chat_history: list[dict] = None
) -> Generator[str, None, None]:
    """Token-by-token streaming generator using OpenAI."""
    messages = build_messages(context_chunks, question, chat_history)
    stream = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.2,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta