"""
Ejemplos de Uso - Sistema Competitivo
=====================================

Este script demuestra todas las funciones competitivas
del sistema de recomendación.
"""

from recomendador_grasas_competitivo import RecomendadorGrasasCompetitivo


def ejemplo_1_buscar_rivales():
    """Buscar qué rivales compiten con nuestro producto"""
    print("\n" + "="*80)
    print("EJEMPLO 1: Buscar rivales similares a nuestro producto")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nBuscando rivales similares a 'Grasa_1'...\n")
    resultados = rec.buscar_rivales_similares('Grasa_1', top_n=5)
    print(resultados.to_string(index=False))


def ejemplo_2_comparacion_detallada():
    """Comparación uno a uno con rival"""
    print("\n" + "="*80)
    print("EJEMPLO 2: Comparación detallada con rival")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nComparando 'Grasa_1' vs 'Starplex EP 2'...\n")
    rec.comparar_con_rival('Grasa_1', 'Starplex EP 2')


def ejemplo_3_encontrar_competidor():
    """Encontrar nuestro mejor producto contra un rival"""
    print("\n" + "="*80)
    print("EJEMPLO 3: Encontrar mejor producto contra rival")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nBuscando mejor alternativa contra 'ANDEROL FGCS-2'...\n")
    resultados = rec.encontrar_competidor_directo('ANDEROL FGCS-2')
    print(resultados.to_string(index=False))


def ejemplo_4_benchmarking():
    """Benchmarking de propiedades"""
    print("\n" + "="*80)
    print("EJEMPLO 4: Benchmarking de temperatura máxima")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nAnalizando temperatura maxima: propios vs rivales...\n")
    rec.benchmarking_categoria('temp_max')


def ejemplo_5_gap_analysis():
    """Identificar oportunidades de mercado"""
    print("\n" + "="*80)
    print("EJEMPLO 5: Gap Analysis - Oportunidades de mercado")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nIdentificando gaps y oportunidades...\n")
    rec.gap_analysis()


def ejemplo_6_matriz_competitiva():
    """Ver posicionamiento en el mercado"""
    print("\n" + "="*80)
    print("EJEMPLO 6: Matriz Competitiva - Posicionamiento")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nAnalizando posicionamiento competitivo...\n")
    rec.matriz_competitiva()


def ejemplo_7_analisis_completo():
    """Análisis estratégico completo"""
    print("\n" + "="*80)
    print("EJEMPLO 7: Análisis Estratégico Completo")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    # 1. Listar rivales
    print("\n" + "="*80)
    print("PASO 1: Catálogo de Rivales")
    print("="*80)
    rec.listar_productos_rivales()
    
    # 2. Gap Analysis
    print("\n" + "="*80)
    print("PASO 2: Gap Analysis")
    print("="*80)
    rec.gap_analysis()
    
    # 3. Matriz Competitiva
    print("\n" + "="*80)
    print("PASO 3: Posicionamiento")
    print("="*80)
    rec.matriz_competitiva()
    
    # 4. Benchmarking de propiedades clave
    print("\n" + "="*80)
    print("PASO 4: Benchmarking - Temperatura")
    print("="*80)
    rec.benchmarking_categoria('temp_max')
    
    print("\n" + "="*80)
    print("PASO 5: Benchmarking - Viscosidad")
    print("="*80)
    rec.benchmarking_categoria('visc_40c')


def ejemplo_8_caso_ventas():
    """Caso de uso real: Preparar presentación de ventas"""
    print("\n" + "="*80)
    print("EJEMPLO 8: Caso Real - Preparar Presentación de Ventas")
    print("="*80)
    print("\nESCENARIO: Cliente usa 'Delo Grease EP 2' y quieres ganarle")
    print("-"*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    rival_cliente = 'Delo Grease EP 2'
    
    # Paso 1: Encontrar tu mejor alternativa
    print(f"\nPASO 1: Cual de nuestros productos es mejor contra '{rival_cliente}'?")
    print("-"*80)
    mejores = rec.encontrar_competidor_directo(rival_cliente)
    print(mejores.head(3).to_string(index=False))
    
    # Asumir que Grasa_X es el mejor (ajustar según resultados reales)
    nuestro_producto = mejores.iloc[0]['codigoGrasa'] if not mejores.empty else 'Grasa_1'
    
    # Paso 2: Hacer comparación detallada
    print(f"\nPASO 2: Comparacion detallada '{nuestro_producto}' vs '{rival_cliente}'")
    print("-"*80)
    rec.comparar_con_rival(nuestro_producto, rival_cliente)
    
    print("\nRESULTADO: Tienes presentacion completa con ventajas tecnicas!")


def ejemplo_9_benchmarking_multiple():
    """Benchmarking de múltiples propiedades"""
    print("\n" + "="*80)
    print("EJEMPLO 9: Benchmarking Múltiple de Propiedades")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    propiedades = ['temp_max', 'visc_40c', 'soldadura_4bolas', 'carga_timken']
    
    for prop in propiedades:
        print(f"\nBenchmarking: {prop}")
        print("-"*80)
        rec.benchmarking_categoria(prop)
        input("\n[Presiona Enter para continuar...]")


def ejemplo_10_monitoreo_competencia():
    """Monitoreo sistemático de la competencia"""
    print("\n" + "="*80)
    print("EJEMPLO 10: Monitoreo Sistemático de Competencia")
    print("="*80)
    
    rec = RecomendadorGrasasCompetitivo(
        'datos_grasas_Tec.csv',
        'Grasas_Consolidado_Total.csv'
    )
    
    print("\nAnalizando principales productos propios contra competencia...")
    
    # Lista de productos propios a monitorear
    productos_clave = ['Grasa_1', 'Grasa_5', 'Grasa_10']
    
    for producto in productos_clave:
        print(f"\n{'='*80}")
        print(f"ANÁLISIS: {producto}")
        print('='*80)
        
        # Buscar rivales similares
        print(f"\nRivales similares a {producto}:")
        rivales = rec.buscar_rivales_similares(producto, top_n=3)
        if not rivales.empty:
            print(rivales.to_string(index=False))
        
        input("\n[Presiona Enter para continuar...]")


def main():
    """Menú de ejemplos"""
    print("\n" + "="*80)
    print("EJEMPLOS DE USO - SISTEMA COMPETITIVO")
    print("="*80)
    
    ejemplos = {
        '1': ('Buscar rivales similares', ejemplo_1_buscar_rivales),
        '2': ('Comparación detallada', ejemplo_2_comparacion_detallada),
        '3': ('Encontrar mejor competidor', ejemplo_3_encontrar_competidor),
        '4': ('Benchmarking de propiedad', ejemplo_4_benchmarking),
        '5': ('Gap Analysis', ejemplo_5_gap_analysis),
        '6': ('Matriz competitiva', ejemplo_6_matriz_competitiva),
        '7': ('Análisis estratégico completo', ejemplo_7_analisis_completo),
        '8': ('Caso: Preparar ventas', ejemplo_8_caso_ventas),
        '9': ('Benchmarking múltiple', ejemplo_9_benchmarking_multiple),
        '10': ('Monitoreo de competencia', ejemplo_10_monitoreo_competencia),
        '11': ('Ejecutar todos', None)
    }
    
    print("\nSelecciona qué ejemplo ejecutar:")
    for key, (desc, _) in ejemplos.items():
        print(f"  {key}. {desc}")
    print("  0. Salir")
    
    while True:
        seleccion = input("\nIngresa el numero (0-11): ").strip()
        
        if seleccion == '0':
            print("\nHasta luego!\n")
            break
        elif seleccion == '11':
            # Ejecutar todos
            for i in range(1, 11):
                ejemplos[str(i)][1]()
                input("\n[Presiona Enter para continuar al siguiente...]")
        elif seleccion in ejemplos and seleccion != '11':
            ejemplos[seleccion][1]()
        else:
            print("\nOpcion no valida")
        
        if seleccion != '0':
            input("\n[Presiona Enter para volver al menú...]")


if __name__ == "__main__":
    main()
