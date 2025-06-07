"use client";

import type React from "react";
import { useState } from "react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    hectares: "",
    tcs_per_hectare: "",
    insecticide_per_hectare: "",
    labor_cost_per_hectare: "",
    monitoring_per_hectare: "",
    tramps: "",
    prev_larvaes: "",
    tipoTratamiento: "",
    incluirAnalisisEconomico: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    // Aquí se enviarían los datos al backend
  };

  return (
    <main className="container">
      <h1>Simulador Carpocapsa</h1>
      <p>Ingresa los datos para la simulación de control de plagas</p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="hectares">Hectáreas</label>
          <input
            type="number"
            id="hectares"
            name="hectares"
            value={formData.hectares}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tcs_per_hectare">Costo de las TCS por Hectárea</label>
          <input
            type="number"
            id="tcs_per_hectare"
            name="tcs_per_hectare"
            value={formData.tcs_per_hectare}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="insecticide_per_hectare">
            Costo de Insecticida por Hectárea
          </label>
          <input
            type="number"
            id="insecticide_per_hectare"
            name="insecticide_per_hectare"
            value={formData.insecticide_per_hectare}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="labor_cost_per_hectare">
            Costo de Mano de Obra por Hectárea
          </label>
          <input
            type="number"
            id="labor_cost_per_hectare"
            name="labor_cost_per_hectare"
            value={formData.labor_cost_per_hectare}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="monitoring_per_hectare">
            Costo de Monitoreo por Hectárea
          </label>
          <input
            type="number"
            id="monitoring_per_hectare"
            name="monitoring_per_hectare"
            value={formData.monitoring_per_hectare}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tramps">
            Trampas (Si no lo definió aún se simula segun especificaciones de
            SENASA y sus hectareas)
          </label>
          <input
            type="number"
            id="tramps"
            name="tramps"
            value={formData.tramps}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="prev_larvaes">
            Larvas Diapausantes (Si no lo conoce se simula según sus hectareas)
          </label>
          <input
            type="number"
            id="prev_larvaes"
            name="prev_larvaes"
            value={formData.prev_larvaes}
            onChange={handleInputChange}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="button primary"
            onClick={async (e) => {
              e.preventDefault();
              // Enviar datos al backend
              const params = new URLSearchParams({
                hectares: formData.hectares,
                tcs_per_hectare: formData.tcs_per_hectare,
                insecticide_per_hectare: formData.insecticide_per_hectare,
                labor_cost_per_hectare: formData.labor_cost_per_hectare,
                monitoring_cost_per_hectare: formData.monitoring_per_hectare,
                tramps: formData.tramps,
                insecticide_eggs: "0",
                prev_larvaes: formData.prev_larvaes,
              });
              // Mostrar un mensaje de "Cargando..." mientras espera la respuesta
              const loadingDiv = document.createElement("div");
              loadingDiv.textContent = "Simulando, por favor espere...";
              loadingDiv.style.position = "fixed";
              loadingDiv.style.top = "0";
              loadingDiv.style.left = "0";
              loadingDiv.style.width = "100vw";
              loadingDiv.style.height = "100vh";
              loadingDiv.style.background = "rgba(255,255,255,0.8)";
              loadingDiv.style.display = "flex";
              loadingDiv.style.alignItems = "center";
              loadingDiv.style.justifyContent = "center";
              loadingDiv.style.fontSize = "2rem";
              loadingDiv.style.zIndex = "9999";
              document.body.appendChild(loadingDiv);
              await fetch(
                `https://simulador-carpocapsa.onrender.com/reportes?${params.toString()}`,
                {
                  method: "POST",
                }
              ).then((res) =>
                res.json().then((data) => {
                  console.log("Datos reales del backend:", data);
                  sessionStorage.setItem(
                    "resultadoSimulacion",
                    JSON.stringify(data)
                  );
                })
              );

              window.location.href = "/reportes";
            }}
          >
            Generar Simulación
          </button>
        </div>
      </form>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          color: #2e7d32;
          margin-bottom: 0.5rem;
        }
        .form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        input,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .checkbox {
          display: flex;
          align-items: center;
        }
        .checkbox input {
          width: auto;
          margin-right: 0.5rem;
        }
        .checkbox label {
          margin-bottom: 0;
        }
        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          flex: 1;
        }
        .primary {
          background-color: #2e7d32;
          color: white;
        }
        .secondary {
          background-color: white;
          border: 1px solid #2e7d32;
          color: #2e7d32;
        }
      `}</style>
    </main>
  );
}