import os
import shutil
import sys

import django
from django.conf import settings
from django.core.cache import cache

#This ensures the parent directory (the project root) is in the Python path.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'optics_tenant.settings')

django.setup()

from django.utils.translation import gettext

# ...existing code...

# -*- coding: utf-8 -*-
"""
This script clears Django cache, removes cache-related files, and deletes migration files except __init__.py.
"""

DJANGO_SETTINGS_MODULE = 'optics_tenant.settings'

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def remove_cache_files(path):
    """Remove __pycache__ directories and .pyc files recursively."""
    for root, dirs, files in os.walk(path):
        # Remove __pycache__ directories
        if '__pycache__' in dirs:
            pycache_dir = os.path.join(root, '__pycache__')
            shutil.rmtree(pycache_dir, ignore_errors=True)
            print(gettext(f"🗑️ Removed: {pycache_dir}"))
        # Remove .pyc files
        for file in files:
            if file.endswith('.pyc'):
                pyc_file = os.path.join(root, file)
                try:
                    os.remove(pyc_file)
                    print(gettext(f"🗑️ Removed: {pyc_file}"))
                except Exception as e:
                    print(gettext(f"⚠️ Could not remove {pyc_file}: {e}"))

def remove_migration_files(path):
    """Remove all migration files except __init__.py in each migrations directory."""
    for root, dirs, files in os.walk(path):
        if os.path.basename(root) == 'migrations':
            for file in files:
                if file != '__init__.py' and file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                        print(gettext(f"🗑️ Removed migration: {file_path}"))
                    except Exception as e:
                        print(gettext(f"⚠️ Could not remove {file_path}: {e}"))

def clear_all_cache():
    """Clear Django cache, remove cache files, and migration files in the project."""
    print(gettext("🔄 Start removing cache and migration files..."))
    if not settings.DEBUG:
        print(gettext("❌ This operation is only allowed in DEBUG mode."))
        return
    cache.clear()
    remove_cache_files(PROJECT_DIR)
    remove_migration_files(PROJECT_DIR)
    print(gettext("✅ All cache and migration files have been cleared successfully."))

clear_all_cache()
# This script is designed to be run in a Django environment where the settings module is properly configured.
# It will clear the cache, remove cache-related files, and delete migration files except for __init__.py.
