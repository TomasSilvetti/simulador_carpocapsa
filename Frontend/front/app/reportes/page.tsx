"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define the MockData type
type MockData = {
  acumulacionCarpogrados: Array<{
    mes: string;
    tempMin: number;
    tempMax: number;
    carpogradosDiarios: number;
    carpogradosAcumulados: number;
    diasMes: number;
  }>;
  aplicacionInsecticidas: Array<{
    fechaAplicacion: string;
    generacion: string;
    diasAplicados: number;
    reduccionEsperada: number;
    poblacionPreTratamiento: string;
    poblacionPostTratamiento: string;
  }>;
  analisisEconomico: Array<{
    concepto: string;
    costoPorHectarea: number;
    areaTratada: number;
    costoTotal: number;
    isTotal?: boolean;
    isLoss?: boolean;
    isSaving?: boolean;
  }>;
  eficaciaPrograma: Array<{
    metrica: string;
    sinControl: string;
    conControl: string;
    reduccion: string;
  }>;
};

const mockDataStatic = {
  acumulacionCarpogrados: [
    {
      mes: "Agosto",
      tempMin: 0.8,
      tempMax: 16.3,
      carpogradosDiarios: 8.55,
      carpogradosAcumulados: 265.05,
      diasMes: 31,
    },
    {
      mes: "Septiembre",
      tempMin: 3.3,
      tempMax: 19.4,
      carpogradosDiarios: 11.35,
      carpogradosAcumulados: 605.55,
      diasMes: 30,
    },
    {
      mes: "Octubre",
      tempMin: 6.8,
      tempMax: 22.8,
      carpogradosDiarios: 14.8,
      carpogradosAcumulados: 1064.35,
      diasMes: 31,
    },
    {
      mes: "Noviembre",
      tempMin: 9.7,
      tempMax: 26.4,
      carpogradosDiarios: 18.05,
      carpogradosAcumulados: 1606.85,
      diasMes: 30,
    },
    {
      mes: "Diciembre",
      tempMin: 12.3,
      tempMax: 29.3,
      carpogradosDiarios: 20.8,
      carpogradosAcumulados: 2251.65,
      diasMes: 31,
    },
    {
      mes: "Enero",
      tempMin: 13.4,
      tempMax: 30.7,
      carpogradosDiarios: 22.05,
      carpogradosAcumulados: 2935.2,
      diasMes: 31,
    },
    {
      mes: "Febrero",
      tempMin: 12.3,
      tempMax: 29.5,
      carpogradosDiarios: 20.9,
      carpogradosAcumulados: 3520.4,
      diasMes: 28,
    },
    {
      mes: "Marzo",
      tempMin: 9.6,
      tempMax: 26.3,
      carpogradosDiarios: 17.95,
      carpogradosAcumulados: 4076.85,
      diasMes: 31,
    },
  ],
  aplicacionInsecticidas: [
    {
      fechaAplicacion: "28-29 Agosto",
      generacion: "1ª",
      diasAplicados: 2,
      reduccionEsperada: 99.0,
      poblacionPreTratamiento: "2,508 larvas",
      poblacionPostTratamiento: "25 larvas",
    },
    {
      fechaAplicacion: "18-19 Septiembre",
      generacion: "2ª",
      diasAplicados: 2,
      reduccionEsperada: 99.0,
      poblacionPreTratamiento: "4,092 larvas",
      poblacionPostTratamiento: "41 larvas",
    },
    {
      fechaAplicacion: "12-13 Diciembre",
      generacion: "3ª",
      diasAplicados: 2,
      reduccionEsperada: 99.0,
      poblacionPreTratamiento: "8,398 larvas",
      poblacionPostTratamiento: "84 larvas",
    },
  ],
  analisisEconomico: [
    {
      concepto: "Trampas de Confusión (4 unidades)",
      costoPorHectarea: 45.0,
      areaTratada: 12,
      costoTotal: 540.0,
    },
    {
      concepto: "Insecticida (8 aplicaciones)",
      costoPorHectarea: 28.5,
      areaTratada: 12,
      costoTotal: 342.0,
    },
    {
      concepto: "Mano de obra aplicación",
      costoPorHectarea: 15.0,
      areaTratada: 12,
      costoTotal: 180.0,
    },
    {
      concepto: "Monitoreo semanal",
      costoPorHectarea: 8.0,
      areaTratada: 12,
      costoTotal: 96.0,
    },
    {
      concepto: "Total Inversión",
      costoPorHectarea: 96.5,
      areaTratada: 12,
      costoTotal: 1158.0,
      isTotal: true,
    },
    {
      concepto: "Pérdida estimada sin control",
      costoPorHectarea: 450.0,
      areaTratada: 12,
      costoTotal: 5400.0,
      isLoss: true,
    },
    {
      concepto: "Ahorro Neto",
      costoPorHectarea: 353.5,
      areaTratada: 12,
      costoTotal: 4242.0,
      isSaving: true,
    },
  ],
  eficaciaPrograma: [
    {
      metrica: "Población final de larvas",
      sinControl: "15,843",
      conControl: "276",
      reduccion: "98.3%",
    },
    {
      metrica: "Población final de adultos",
      sinControl: "4,483",
      conControl: "15",
      reduccion: "99.7%",
    },
    {
      metrica: "Frutos dañados estimados",
      sinControl: "1,267",
      conControl: "22",
      reduccion: "98.3%",
    },
    {
      metrica: "Cumplimiento umbral SENASA",
      sinControl: "15%",
      conControl: "85%",
      reduccion: "+70%",
    },
  ],
};

export default function ReportesPage() {
  const [mockData, setMockData] = useState<MockData | null>(null);

  useEffect(() => {
    // Cambiado de localStorage a sessionStorage
    const dataString = sessionStorage.getItem("resultadoSimulacion");
    if (dataString) {
      try {
        const parsed = JSON.parse(dataString) as MockData;
        setMockData(parsed);
      } catch (e) {
        console.error("Error al parsear JSON:", e);
        // Si hay error, usar datos estáticos como fallback
        setMockData(mockDataStatic);
      }
    } else {
      // Si no hay datos en sessionStorage, usar datos estáticos
      setMockData(mockDataStatic);
    }
  }, []);

  if (!mockData) {
    return (
      <main className="container">
        <p>Cargando datos del reporte...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="header">
        <Link href="/" className="back-button">
          ← Volver
        </Link>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h1>Reporte de Simulación - Plaga de Carpocapsa</h1>
          <p>Período de Simulación: 1 de Agosto 2024 - 31 de Marzo 2025</p>
        </div>
      </div>

      {/* Tablas */}
      <div className="card">
        <h2>Acumulación de Carpogrados por Mes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Temp. Min (°C)</th>
                <th>Temp. Max (°C)</th>
                <th>Carpogrados Diarios</th>
                <th>Carpogrados Acumulados</th>
                <th>Días del Mes</th>
              </tr>
            </thead>
            <tbody>
              {mockData?.acumulacionCarpogrados?.map((row, index) => (
                <tr key={index}>
                  <td className="bold">{row.mes}</td>
                  <td>{row.tempMin}</td>
                  <td>{row.tempMax}</td>
                  <td>{row.carpogradosDiarios}</td>
                  <td className="bold">{row.carpogradosAcumulados}</td>
                  <td>{row.diasMes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Aplicaciones de Insecticidas</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha Aplicación</th>
                <th>Generación</th>
                <th>Días Aplicados</th>
                <th>Reducción Esperada (%)</th>
                <th>Población Pre-Tratamiento</th>
                <th>Población Post-Tratamiento</th>
              </tr>
            </thead>
            <tbody>
              {mockData?.aplicacionInsecticidas?.map((row, index) => (
                <tr key={index}>
                  <td className="bold">{row.fechaAplicacion}</td>
                  <td>{row.generacion}</td>
                  <td>{row.diasAplicados}</td>
                  <td>
                    <span className="chip">{row.reduccionEsperada}%</span>
                  </td>
                  <td>{row.poblacionPreTratamiento}</td>
                  <td className="success bold">
                    {row.poblacionPostTratamiento}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Análisis Económico del Control</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Costo por Hectárea (USD)</th>
                <th>Área Tratada (ha)</th>
                <th>Costo Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {mockData?.analisisEconomico?.map((row, index) => (
                <tr
                  key={index}
                  className={
                    row.isTotal
                      ? "total-row"
                      : row.isLoss
                      ? "loss-row"
                      : row.isSaving
                      ? "saving-row"
                      : ""
                  }
                >
                  <td className="bold">{row.concepto}</td>
                  <td>${row.costoPorHectarea.toFixed(2)}</td>
                  <td>{row.areaTratada}</td>
                  <td
                    className={`${
                      row.isSaving ? "success" : row.isLoss ? "error" : ""
                    } bold`}
                  >
                    ${row.costoTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Eficacia del Programa de Control</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Sin Control</th>
                <th>Con Control</th>
                <th>Reducción (%)</th>
              </tr>
            </thead>
            <tbody>
              {mockData?.eficaciaPrograma?.map((row, index) => (
                <tr key={index}>
                  <td className="bold">{row.metrica}</td>
                  <td className="error">{row.sinControl}</td>
                  <td className="success bold">{row.conControl}</td>
                  <td>
                    <span className="chip">{row.reduccion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f5f5f5;
          min-height: 100vh;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
          text-align: center;
        }
        h1 {
          color: #2e7d32;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }
        .back-button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #2e7d32;
          color: #2e7d32;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
        }
        h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }
        .card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        h2 {
          margin-top: 0;
          color: #333;
          font-size: 1.5rem;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f9f9f9;
          font-weight: 600;
        }
        .bold {
          font-weight: 600;
        }
        .success {
          color: #2e7d32;
        }
        .error {
          color: #d32f2f;
        }
        .chip {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 0.25rem 0.5rem;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .total-row {
          background-color: #e3f2fd;
        }
        .loss-row {
          background-color: #ffebee;
        }
        .saving-row {
          background-color: #e8f5e8;
        }
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </main>
  );
}