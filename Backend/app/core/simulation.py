from core.MEF.mef import MEF
import core.utilities as utilities
import core.generators as generators
import numpy as np
import json

def simulation(hectares: float, 
               tcs_per_hectare: float, 
               insecticide_per_hectare: float,
               labor_cost_per_hectare: float,
               monitoring_cost_per_hectare: float,
               tramps:int | None = None, 
               insecticide_eggs: bool = True, 
               prev_larvaes: int = None) -> str:
    """
    Simulate the number of tramps in a given area of hectares.

    :param hectares: The number of hectares to simulate.
    :param tramps: The number of tramps to simulate, if known.
    :return: The simulation result as a JSON string.
    """
    days_to_simulate = 243 #Represents 8 months, from August to March
    day = 1
    acumulated_carpogrades = 0
    larvaes = prev_larvaes if prev_larvaes is not None else 500 * hectares
    larvaes_wo_control = 0
    adults = 0
    adults_wo_control = 0
    eggs = 0
    alarms = 0
    measures_read = 0
    eggs_wo_control = 0
    days_applied = 0
    totals_cap = 0
    evolute_poblation = True
    generation = 0
    cost_per_hectare = 0.5  
    total_hectare_cost = hectares * cost_per_hectare
    plague_state = "Larvas diapausantes"
    act_month = ""    
    prev_month = ""
    months = 0
    data = {
        "aplicacionInsecticidas": [],
        "acumulacionCarpogrados": [],
        "analisisEconomico": [],
        "eficaciaPrograma": [],
    }

    # Simulate the carpogrades to start the third-generation moths
    u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
    third_generation_carpogrades = 750 + 100 * u["resultado"][0]

    mean_temperatures_table = {
        #(Estado, evento) : (Estado siguiente, accion)
        ("Agosto", 31) : ("Septiembre", 3.3, 19.4),
        ("Septiembre", 61) : ("Octubre", 6.8, 22.8),
        ("Octubre", 92) : ("Noviembre", 9.7, 26.4),
        ("Noviembre", 122) : ("Diciembre", 12.3, 29.3),
        ("Diciembre", 153) : ("Enero", 13.4, 30.7),
        ("Enero", 184) : ("Febrero", 12.3, 29.5),
        ("Febrero", 212) : ("Marzo", 9.6, 26.3),
        ("Marzo", 244) : ("Agosto", 0.8, 16.3),
    }

    # Lambda function to activate evolute_poblation, lambda por que es en una sola linea
    toggle_evolute_poblation = lambda: not evolute_poblation

    carpogrades_table = {
        ("Larvas diapausantes", 90): ("Vuelos", toggle_evolute_poblation),
        ("Vuelos", 250): ("Larvas", toggle_evolute_poblation),
        ("Larvas", 450): ("Vuelos", toggle_evolute_poblation),
        ("Vuelos", third_generation_carpogrades): ("Larvas", toggle_evolute_poblation),
        ("Larvas", 1750): ("Vuelos", toggle_evolute_poblation),
    }

    # If tramps is not provided, simulate the number of tramps
    if tramps is None:
        tramps = utilities.simulate_tramps(hectares)

    mean_temperatures_mef = MEF("Agosto", mean_temperatures_table, 9.6, 26.3)
    carpogrades_mef = MEF("Larvas diapausantes", carpogrades_table)
    prev_month = mean_temperatures_mef.state

    # Main simulation loop
    while day <= days_to_simulate:

        max_temp_daily = 0
        min_temp_daily = 0
        
        #MEF to get the mean temperatures whitout using ifs
        mean_temperatures_mef.transition(day)
        act_month = mean_temperatures_mef.state
        if act_month != prev_month:
            data["acumulacionCarpogrados"].append(    {
                "mes": act_month,
                "tempMin": mean_temperatures_mef.min_mean,
                "tempMax": mean_temperatures_mef.max_mean,
                "carpogradosDiarios": round((acumulated_carpogrades / 31), 2),
                "carpogradosAcumulados": round(acumulated_carpogrades),
                "diasMes": 31
                })
            prev_month = act_month
            months += 1

        #Durante el dia mido tres veces la temperatura
        for i in range(3):
            max_temp_daily += np.random.normal(loc=mean_temperatures_mef.max_mean, scale=5)
            min_temp_daily += np.random.normal(loc=mean_temperatures_mef.min_mean, scale=5)

        #Carpogrades calculus
        #Promedio
        max_temp = max_temp_daily / 3
        min_temp = min_temp_daily / 3

        #Calculo de carpogrados
        carpogrados = (max_temp - min_temp) - 10

        if carpogrados > 0:
            acumulated_carpogrades += carpogrados

        if acumulated_carpogrades > 90:
            plague_state = "Vuelos"
        if acumulated_carpogrades > 250:
            plague_state = "Larvas"
        if acumulated_carpogrades > 450:
            plague_state = "Vuelos"
        if acumulated_carpogrades > third_generation_carpogrades:
            plague_state = "Larvas"
        if acumulated_carpogrades > 1750:
            plague_state = "Vuelos"

        #MEF to get the poblation state
        carpogrades_mef.transition(acumulated_carpogrades)

        #Evolute poblation 
        if plague_state == "Vuelos":
            days_applied = 0
            if evolute_poblation:
                adults = larvaes
                adults_wo_control = larvaes_wo_control
                evolute_poblation = False
            totals_cap = 0
            if adults > 0:
                measures_read += 1
                totals_cap, alarms = utilities.read_tramps(day, alarms, tramps, adults) #Solo si hay adultos y todos los dias
                adults = adults - totals_cap

        if plague_state == "Larvas":
            if days_applied == 0:
                larvaes = adults
                larvaes_wo_control = adults_wo_control
                eggs = utilities.update_population(adults)
                larvaes, larvaes_wo_control = utilities.egg_eclosion(eggs, insecticide_eggs)
                generation += 1
            if days_applied < 2:
                prev_larvaes = larvaes
                larvaes = utilities.preventive_measures(larvaes, days_applied)
                
                data["aplicacionInsecticidas"].append(    {
                        "fechaAplicacion": f"{day - (months * 30)} de {mean_temperatures_mef.state}",
                        "generacion": generation,
                        "diasAplicados": days_applied + 1,
                        "reduccionEsperada": 90.0,
                        "poblacionPreTratamiento": prev_larvaes,
                        "poblacionPostTratamiento": larvaes,
                        })
                days_applied += 1
                evolute_poblation = True
            
        # if plague_state == "Larvas":   
        #     print(f"day: {day}, carpogrades: {round(carpogrados, 2)}, carpogrados acumulados {round(acumulated_carpogrades, 2)}, state: {plague_state}, month: {mean_temperatures_mef.state}, larvaes: {larvaes}, adults: {adults}, eggs: {eggs}, tramps: {tramps}, totals_cap: {totals_cap}, generation: {generation}, days_applied: {days_applied}, evolute_poblation: {evolute_poblation}")
        # else:
        #     print(f"day: {day}, state: {plague_state}, generation: {generation}")
        # input("Press Enter to continue...")
        day += 1

        data["analisisEconomico"] = [
    { "concepto": "Trampas de Confusión", "costoPorHectarea": tcs_per_hectare, "areaTratada": hectares, "costoTotal": hectares * tcs_per_hectare },
    { "concepto": "Insecticida", "costoPorHectarea": insecticide_per_hectare, "areaTratada": hectares, "costoTotal": hectares * insecticide_per_hectare },
    { "concepto": "Mano de obra aplicación", "costoPorHectarea": labor_cost_per_hectare, "areaTratada": hectares, "costoTotal": hectares * labor_cost_per_hectare },
    { "concepto": "Monitoreo semanal", "costoPorHectarea": monitoring_cost_per_hectare, "areaTratada": hectares, "costoTotal": hectares * monitoring_cost_per_hectare },
    { "concepto": "Total Inversión", "costoPorHectarea": tcs_per_hectare + insecticide_per_hectare + labor_cost_per_hectare + monitoring_cost_per_hectare, "areaTratada": hectares, "costoTotal": hectares * (tcs_per_hectare + insecticide_per_hectare + labor_cost_per_hectare + monitoring_cost_per_hectare), "isTotal": True },
    {
      "concepto": "Pérdida estimada sin control",
      "costoPorHectarea": 30 * 0.05 * 2, #Kilos de fruta (Estimacion para 1000 arboles/ha) * frutos afectados por carpocapsa sin control * precio kg de manzana en jumbo
      "areaTratada": hectares,
      "costoTotal": (30 * 0.05 * 2) * hectares, #Kilos de fruta (Estimacion para 1000 arboles/ha) * frutos afectados por carpocapsa sin control * precio kg de manzana en jumbo * hectareas
      "isLoss": True,
    },
    { "concepto": "Ahorro Neto", "costoPorHectarea": (30 * 0.05 * 2) - (tcs_per_hectare + insecticide_per_hectare + labor_cost_per_hectare + monitoring_cost_per_hectare), "areaTratada": hectares, "costoTotal": ((30 * 0.05 * 2) - (tcs_per_hectare + insecticide_per_hectare + labor_cost_per_hectare + monitoring_cost_per_hectare)) * hectares, "isSaving": True },
  ]

    data["eficaciaPrograma"] = [
    { "metrica": "Población final de larvas diapausantes estimado", "sinControl": (larvaes_wo_control if larvaes_wo_control else (adults_wo_control * 44)), "conControl": larvaes, "reduccion": round(((larvaes_wo_control - larvaes) / larvaes_wo_control * 100), 2) if larvaes_wo_control > 0 else (adults_wo_control * 44) - larvaes / (adults_wo_control * 44) * 100 },
    { "metrica": "Población final de adultos", "sinControl": adults_wo_control, "conControl": adults, "reduccion": round(((adults_wo_control - adults) / adults_wo_control * 100), 2) if adults_wo_control > 0 else 0 },
    { "metrica": "Frutos dañados estimados", "sinControl": larvaes_wo_control * 0.75, "conControl": larvaes * 0.75, "reduccion": round(((larvaes_wo_control * 0.75 - larvaes * 0.75) / (larvaes_wo_control * 0.75) * 100), 2) if (larvaes_wo_control * 0.75) > 0 else 0 },
    { "metrica": "Cumplimiento umbral SENASA", "sinControl": 100, "conControl": round((alarms/(measures_read * tramps)), 2), "reduccion": round(((1 - (alarms / (measures_read * tramps)) * 100)), 2) if (measures_read * tramps) > 0 else 0 },
    ]

    return data
