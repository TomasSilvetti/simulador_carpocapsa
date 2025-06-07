from core.simulation import simulation
from fastapi import FastAPI
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
def generate_simulation(hectares: float, tcs_per_hectare: float, insecticide_per_hectare: float, labor_cost_per_hectare: float, monitoring_cost_per_hectare: float, tramps: int, insecticide_eggs: bool | None, prev_larvaes: int | None):
    data = simulation(hectares, tcs_per_hectare, insecticide_per_hectare, labor_cost_per_hectare, monitoring_cost_per_hectare, tramps, insecticide_eggs, prev_larvaes)
    print(f"Datos enviados: {data}")
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)