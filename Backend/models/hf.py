from huggingface_hub import HfApi

api = HfApi()
api.upload_file(
    path_or_fileobj="Model.h5",                     # local file path
    path_in_repo="Model.h5",                        # where it appears in repo
    repo_id="Abhay1831/deepfake_v1",     # your HF repo name
    repo_type="model"
)
