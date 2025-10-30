from huggingface_hub import HfApi
import os

api = HfApi()

repo_id = os.getenv("REPO_ID")


api.upload_file(
    path_or_fileobj="Model.h5",                     # local file path
    path_in_repo="Model.h5",                        # where it appears in repo
    repo_id=repo_id,     # your HF repo name
    repo_type="model"
)
