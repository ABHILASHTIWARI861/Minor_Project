from fastapi import FastAPI, File, UploadFile 
from img_preprocess import preprocess_image
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from predict import predict_from_tensor
import json
from fastapi.responses import JSONResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def home():
    return JSONResponse(content='API is running')



@app.post('/predictImage')
async def predict_image(image: UploadFile = File(...)):
    # read image
    img_bytes = await image.read()

    # Convert bytes data to a temporary PIL Image and save to disk or process in-memory
    pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    temp_path = "temp_uploaded.jpg"
    pil_image.save(temp_path)

    img_tensor = preprocess_image(temp_path)
    predicted_label  , confidence = predict_from_tensor(img_tensor)

    os.remove(temp_path)
    
    return JSONResponse(content={"prediction": predicted_label, "confidence": confidence})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)