# config_loader.py
import os
from decouple import Config, RepositoryEnv

ENV_FILE = os.getenv("ENV_FILE", ".env")  # الافتراضي: .env
config = Config(RepositoryEnv(ENV_FILE))
