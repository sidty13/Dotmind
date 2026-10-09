from rag_pipeline import load_or_build_index, ask

# 1. Build index for a repo (e.g., pallets/click)
load_or_build_index("https://github.com/pallets/click")

# 2. Ask test questions
questions = [
    "What is the main purpose of this repository?",
    "How do you create a CLI command in Click?",
]

for q in questions:
    print(f"\nQ: {q}")
    result = ask(q)
    print(f"A: {result['answer']}")
    print(f"Sources: {result['sources']}")
    print("-" * 60)