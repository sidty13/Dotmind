from repo_loader import clone_repo, load_files

# Test with a small public repo
repo_url = "https://github.com/pallets/click"

repo_path = clone_repo(repo_url)
files = load_files(repo_path)

print(f"\nTotal files loaded: {len(files)}")
print("\nFirst 5 files found:")
for f in files[:5]:
    print(f"  {f['path']} ({len(f['content'])} chars)")