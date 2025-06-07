import math
import numpy as np
from core.exceptions import ApplyProduct, HighMalePercent
import core.generators as generators

def simulate_tramps(hectares: int):
    #Simulate the number of tramps in a given area of hectares.
    Tramps = 0
    hectare = 0
    while hectare <= hectares:
        Tramps = Tramps + 1
        u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
        distance_to_tramp = 2 + 2 * u["resultado"][0]
        u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
        hectare = hectare + ((distance_to_tramp * -1) * math.log(u["resultado"][0]))

def read_tramps(days: int, alarms: int, tramps: int | None = None, adults: int | None = None) -> int:
    # Read the number of tramps based on the number of days and adults.
    t = 0
    totals_cap = 0
    if (((days % 7) == 0) and adults > 2): # Si paso una semana y hay mas de un adulto
        while t < tramps:
            u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
            capt_percent = 40 + 10 * u["resultado"][0]
            male_capt = int((adults / tramps) * (capt_percent/100)) #El capt_percent es en relacion a la poblacion de adultos completa, pero solo capturamos los machos
            #Esta divison representa que de cada trampa se puede capturar solo un porcentaje de machos cercanos a esa trampa
            totals_cap +=  male_capt
            try:
                if male_capt > 5:
                    raise HighMalePercent()
            except HighMalePercent:
                print(f"Se ha capturado un alto porcentaje de machos en la trampa {t} ({male_capt}).")
                alarms += 1
            t += 1
    return totals_cap, alarms

def preventive_measures(larvaes: int, days_applied: int) -> int:
    #Representa al control de larvas mediante la aplicación de un producto preventivo.
    if days_applied < 2:
        print("Aplicar producto preventivo")
        larvaes = int(larvaes * 0.1)    
    print("Finalizar aplicación de producto preventivo")
    return larvaes

def egg_eclosion(eggs: int, insecticide_eggs: bool) -> int:
    # Simula la eclosion de huevos
    u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
    eclosion_percent_control = 5 + 5 * u["resultado"][0]
    eclosion_percent_wo_control = np.random.normal(loc=95, scale=2)
    return int((eggs * eclosion_percent_control) / 100),  int((eggs * eclosion_percent_wo_control) / 100)


def update_population(adults: int):
    # Actualiza la poblacion segun los huevos que pone cada hembra
    u = generators.parte_central_cuadrado(generators.get_seed(5), 5, 1)
    male_percent = 40 + 10 * u["resultado"][0]
    female = int(adults * (1 - male_percent / 100))
    H = 0
    eggs = 0
    if adults > 2:
        while H < female:
            egg_per_female = np.random.poisson(lam=44)
            eggs += egg_per_female
            H += 1
    return eggs