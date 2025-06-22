import os

def remove_migration_files(base_dir):
    for root, dirs, files in os.walk(base_dir):
        if os.path.basename(root) == "migrations":
            for file in files:
                if file != "__init__.py" and file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    os.remove(file_path)
                    print(f"Removed: {file_path}")

if __name__ == "__main__":
    # Set your project directory here
    project_dir = os.path.dirname(os.path.abspath(__file__))
    remove_migration_files(project_dir)

#     print(gettext("🔄 Cache and migration files removed successfully."))