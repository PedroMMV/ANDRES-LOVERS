"""
Ejemplos de Uso del Sistema de Recomendación de Grasas
======================================================

Este script muestra cómo usar el sistema programáticamente
sin necesidad del menú interactivo.
"""

from recomendador_grasas import RecomendadorGrasas

def ejemplo_1_buscar_similares():
    """Ejemplo 1: Buscar grasas similares a una específica"""
    print("\n" + "="*80)
    print("EJEMPLO 1: Buscar grasas similares")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Buscar grasas similares a Grasa_1
    print("\nBuscando grasas similares a 'Grasa_1'...\n")
    resultados = recomendador.recomendar_por_contenido('Grasa_1', top_n=5)
    print(resultados)

def ejemplo_2_filtro_temperatura():
    """Ejemplo 2: Filtrar por rango de temperatura"""
    print("\n" + "="*80)
    print("EJEMPLO 2: Filtrar por temperatura máxima")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Buscar grasas con temperatura máxima entre 150 y 250°C
    print("\nBuscando grasas con temp_max entre 150C y 250C...\n")
    resultados = recomendador.recomendar_por_rango('temp_max', 150, 250, top_n=10)
    print(resultados)

def ejemplo_3_busqueda_caracteristicas():
    """Ejemplo 3: Búsqueda por características específicas"""
    print("\n" + "="*80)
    print("EJEMPLO 3: Búsqueda por características")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Buscar grasas con aceite mineral y temperatura min < -20°C
    print("\nBuscando grasas con aceite Mineral y temp_min < -20C...\n")
    resultados = recomendador.buscar_por_caracteristicas(
        aceite_base='Mineral',
        temp_min=-20
    )
    print(resultados)

def ejemplo_4_recomendacion_hibrida():
    """Ejemplo 4: Recomendación híbrida"""
    print("\n" + "="*80)
    print("EJEMPLO 4: Recomendación híbrida")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Buscar grasas similares a Grasa_5 pero con filtros de temperatura
    print("\nBuscando similares a 'Grasa_5' con filtros adicionales...\n")
    
    filtros = {
        'temp_max': (150, 250),  # Temperatura máxima entre 150-250°C
        'visc_40c': (400, 800)   # Viscosidad entre 400-800 cSt
    }
    
    resultados = recomendador.recomendar_hibrido('Grasa_5', 
                                                  filtros_numericos=filtros, 
                                                  top_n=5)
    print(resultados)

def ejemplo_5_info_detallada():
    """Ejemplo 5: Ver información detallada"""
    print("\n" + "="*80)
    print("EJEMPLO 5: Información detallada de una grasa")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Ver información completa de una grasa
    recomendador.mostrar_info_grasa('Grasa_1')

def ejemplo_6_grasas_completas():
    """Ejemplo 6: Listar grasas más completas"""
    print("\n" + "="*80)
    print("EJEMPLO 6: Grasas con más datos técnicos")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Obtener las 10 grasas con más información técnica
    print("\nTop 10 grasas con mas datos tecnicos disponibles...\n")
    resultados = recomendador.recomendar_por_popularidad(top_n=10)
    print(resultados)

def ejemplo_7_opciones_catalogo():
    """Ejemplo 7: Listar opciones del catálogo"""
    print("\n" + "="*80)
    print("EJEMPLO 7: Opciones disponibles en el catálogo")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Ver todas las opciones disponibles
    recomendador.listar_opciones()

def ejemplo_8_filtro_viscosidad():
    """Ejemplo 8: Filtro por viscosidad"""
    print("\n" + "="*80)
    print("EJEMPLO 8: Filtrar por viscosidad")
    print("="*80)
    
    recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    
    # Buscar grasas con viscosidad entre 400 y 700 cSt
    print("\nBuscando grasas con viscosidad (40C) entre 400 y 700 cSt...\n")
    resultados = recomendador.recomendar_por_rango('visc_40c', 400, 700, top_n=8)
    print(resultados)

def main():
    """Ejecuta todos los ejemplos"""
    print("\n" + "="*80)
    print("EJEMPLOS DE USO - SISTEMA DE RECOMENDACIÓN DE GRASAS")
    print("="*80)
    print("\nEste script demuestra las diferentes funcionalidades del sistema.")
    print("Puedes ejecutar ejemplos individuales o todos a la vez.")
    print("\n" + "="*80)
    
    opciones = {
        '1': ('Buscar grasas similares', ejemplo_1_buscar_similares),
        '2': ('Filtrar por temperatura', ejemplo_2_filtro_temperatura),
        '3': ('Búsqueda por características', ejemplo_3_busqueda_caracteristicas),
        '4': ('Recomendación híbrida', ejemplo_4_recomendacion_hibrida),
        '5': ('Información detallada', ejemplo_5_info_detallada),
        '6': ('Grasas más completas', ejemplo_6_grasas_completas),
        '7': ('Opciones del catálogo', ejemplo_7_opciones_catalogo),
        '8': ('Filtrar por viscosidad', ejemplo_8_filtro_viscosidad),
        '9': ('Ejecutar todos los ejemplos', None)
    }
    
    print("\nSelecciona qué ejemplo ejecutar:")
    for key, (desc, _) in opciones.items():
        print(f"  {key}. {desc}")
    print("  0. Salir")
    
    while True:
        seleccion = input("\nIngresa el numero del ejemplo (0-9): ").strip()
        
        if seleccion == '0':
            print("\nHasta luego!\n")
            break
        elif seleccion == '9':
            # Ejecutar todos
            for i in range(1, 9):
                opciones[str(i)][1]()
                input("\n[Presiona Enter para continuar al siguiente ejemplo...]")
        elif seleccion in opciones and seleccion != '9':
            opciones[seleccion][1]()
        else:
            print("\nOpcion no valida")
        
        if seleccion != '0':
            input("\n[Presiona Enter para volver al menú...]")

if __name__ == "__main__":
    main()
