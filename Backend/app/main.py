from typing import Optional
from core.simulation import simulation
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def read_root():
    return {"message": "Bienvenido a la aplicación FastAPI"}

@app.post("/reportes")
def generate_simulation(hectares: float, tcs_per_hectare: float, insecticide_per_hectare: float, labor_cost_per_hectare: float, monitoring_cost_per_hectare: float, insecticide_eggs: bool | None, tramps:Optional[str] = Query(default=None), prev_larvaes:Optional[str] = Query(default=None)):
    if isinstance(prev_larvaes, str):
        prev_larvaes = 500 * hectares
    if isinstance(tramps, str):
        tramps = None
    data = simulation(hectares, tcs_per_hectare, insecticide_per_hectare, labor_cost_per_hectare, monitoring_cost_per_hectare, prev_larvaes, tramps, insecticide_eggs)
    print(f"Datos enviados: {data}")
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)