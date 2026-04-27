import os

def remove_migration_files(base_dir, dry_run=True):
    # Folders to exclude to prevent traversing into virtual environments or system folders
    exclude_dirs = {'.git', '.venv', 'venv', 'env', 'node_modules', '__pycache__', 'site-packages', '__pypackages__'}

    found_files = []

    for root, dirs, files in os.walk(base_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        if os.path.basename(root) == "migrations":
            for file in files:
                if file != "__init__.py" and file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    found_files.append(file_path)

    if not found_files:
        print("✅ No migration files found to remove.")
        return

    if dry_run:
        print(f"🔍 Found {len(found_files)} migration files (DRY RUN - No files deleted):")
        for f in found_files:
            print(f"  - {f}")
        print("\n⚠️  To delete these files, run the script and confirm the prompt.")
    else:
        print(f"🗑️  Deleting {len(found_files)} files...")
        for file_path in found_files:
            try:
                os.remove(file_path)
                print(f"Removed: {file_path}")
            except Exception as e:
                print(f"❌ Error removing {file_path}: {e}")
        print("✅ Cleanup complete.")

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"📂 Scanning: {project_dir}")
    
    # First, run in dry_run mode to show what will happen
    remove_migration_files(project_dir, dry_run=True)
    
    # Safety confirmation
    confirm = input("\n🔴 Are you sure you want to PERMANENTLY delete these files? (yes/no): ")
    if confirm.lower() == 'yes':
        remove_migration_files(project_dir, dry_run=False)
    else:
        print("❌ Operation cancelled. No files were deleted.")
