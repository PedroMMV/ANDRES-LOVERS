"""
Sistema de Recomendación de Grasas Industriales
================================================
Este sistema implementa múltiples algoritmos de recomendación:
1. Recomendador Simple: Basado en popularidad y características generales
2. Recomendador Basado en Contenido: Usa TF-IDF sobre descripciones y características
3. Filtrado por Características: Permite búsqueda por rangos de propiedades técnicas
4. Recomendador Híbrido: Combina similitud de contenido con filtros técnicos

Autor: Yose
Fecha: 2024
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings

warnings.filterwarnings('ignore')


class RecomendadorGrasas:
    """
    Clase principal para el sistema de recomendación de grasas industriales.
    """
    
    def __init__(self, ruta_csv):
        """
        Inicializa el recomendador cargando y preparando los datos.
        
        Args:
            ruta_csv (str): Ruta al archivo CSV con los datos de grasas
        """
        print("=" * 80)
        print("SISTEMA DE RECOMENDACIÓN DE GRASAS INDUSTRIALES")
        print("=" * 80)
        print("\nCargando datos...")
        
        # Cargar datos
        self.df = pd.read_csv(ruta_csv, encoding='utf-8-sig')
        self.df_original = self.df.copy()
        
        # Renombrar columnas para facilitar el acceso
        self._renombrar_columnas()
        
        # Preparar datos
        self._preparar_datos()
        
        # Crear matriz TF-IDF para recomendaciones basadas en contenido
        self._crear_matriz_tfidf()
        
        print(f"Datos cargados exitosamente: {len(self.df)} grasas en el catálogo")
        print("=" * 80)
    
    def _renombrar_columnas(self):
        """Renombra columnas para facilitar el manejo."""
        renombres = {
            "Viscosidad del Aceite Base a 40°C. cSt": "visc_40c",
            "Temperatura de Servicio °C, min": "temp_min",
            "Temperatura de Servicio °C, max": "temp_max",
            "Penetración de Cono a 25°C, 0.1mm": "penetracion",
            "Punto de Gota, °C": "punto_gota",
            "Punto de Soldadura Cuatro Bolas, kgf": "soldadura_4bolas",
            "Desgaste Cuatro Bolas, mm": "desgaste_4bolas",
            "Carga Timken Ok, lb": "carga_timken",
            "Presion de Flujo a -30°C, mbar": "presion_flujo",
            "Viscosidad Dinámica a 25°C, cP": "visc_dinamica"
        }
        
        self.df = self.df.rename(columns=renombres)
    
    def _preparar_datos(self):
        """Prepara los datos para el análisis."""
        # Convertir columnas numéricas
        for col in self.df.columns:
            if col not in ['codigoGrasa', 'Aceite Base', 'Espesante', 'categoria', 
                          'subtitulo', 'descripcion', 'beneficios', 'aplicaciones', 
                          'color', 'textura']:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
        
        # Crear campo de texto completo para TF-IDF
        self._crear_texto_full()
        
        # Identificar columnas numéricas disponibles
        self.columnas_numericas = [
            col for col in self.df.columns 
            if pd.api.types.is_numeric_dtype(self.df[col])
        ]
        
        # Columnas principales para análisis
        self.columnas_principales = [
            col for col in [
                'visc_40c', 'penetracion', 'punto_gota', 'soldadura_4bolas',
                'desgaste_4bolas', 'carga_timken', 'presion_flujo', 
                'visc_dinamica', 'temp_min', 'temp_max'
            ] if col in self.df.columns
        ]
    
    def _crear_texto_full(self):
        """Crea un campo de texto completo concatenando información relevante."""
        campos_texto = []
        
        # Añadir campos de texto disponibles
        for campo in ['Aceite Base', 'Espesante', 'categoria', 'subtitulo', 
                     'descripcion', 'beneficios', 'aplicaciones', 'color', 'textura']:
            if campo in self.df.columns:
                campos_texto.append(self.df[campo].fillna(''))
        
        # Concatenar todo
        self.df['texto_full'] = campos_texto[0]
        for campo in campos_texto[1:]:
            self.df['texto_full'] = self.df['texto_full'] + ' ' + campo
        
        # Limpiar texto
        self.df['texto_full'] = self.df['texto_full'].str.lower()
        self.df['texto_full'] = self.df['texto_full'].str.replace('@', ' ')
        self.df['texto_full'] = self.df['texto_full'].str.replace('\n', ' ')
    
    def _crear_matriz_tfidf(self):
        """Crea la matriz TF-IDF para similitud de contenido."""
        print("\nCreando matriz TF-IDF para análisis de similitud...")
        
        # Stop words comunes en español
        stop_words_es = [
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
            'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
            'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
            'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy',
            'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo',
            'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero',
            'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella',
            'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa',
            'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte',
            'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar',
            'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'algo', 'solo',
            'decir', 'mundo', 'país', 'fin', 'llamar', 'vez', 'grupo', 'vez', 'al',
            'del', 'los', 'las', 'una', 'unos', 'unas'
        ]
        
        self.tfidf = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 2),
            min_df=1,
            stop_words=stop_words_es,
            max_features=1000
        )
        
        self.tfidf_matrix = self.tfidf.fit_transform(self.df['texto_full'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        
        print("Matriz TF-IDF creada exitosamente")
    
    def recomendar_por_popularidad(self, top_n=10, filtro_categoria=None):
        """
        Recomendador simple basado en disponibilidad de datos técnicos.
        
        Args:
            top_n (int): Número de recomendaciones
            filtro_categoria (str): Categoría específica para filtrar
            
        Returns:
            pd.DataFrame: Top recomendaciones
        """
        df_temp = self.df.copy()
        
        # Filtrar por categoría si se especifica
        if filtro_categoria and 'categoria' in df_temp.columns:
            df_temp = df_temp[df_temp['categoria'].str.contains(
                filtro_categoria, case=False, na=False
            )]
        
        # Calcular score basado en completitud de datos
        df_temp['score_completitud'] = df_temp[self.columnas_principales].notna().sum(axis=1)
        
        # Ordenar por score
        df_temp = df_temp.sort_values('score_completitud', ascending=False)
        
        # Seleccionar columnas para mostrar
        columnas_mostrar = ['codigoGrasa', 'Aceite Base', 'Espesante', 
                           'categoria', 'subtitulo']
        columnas_mostrar = [c for c in columnas_mostrar if c in df_temp.columns]
        columnas_mostrar.append('score_completitud')
        
        return df_temp[columnas_mostrar].head(top_n)
    
    def recomendar_por_contenido(self, codigo_grasa, top_n=10):
        """
        Recomendador basado en similitud de contenido usando TF-IDF.
        
        Args:
            codigo_grasa (str): Código de la grasa de referencia
            top_n (int): Número de recomendaciones
            
        Returns:
            pd.DataFrame: Grasas similares
        """
        # Buscar índice de la grasa
        if codigo_grasa not in self.df['codigoGrasa'].values:
            print(f"No se encontro la grasa '{codigo_grasa}'")
            return pd.DataFrame()
        
        idx = self.df[self.df['codigoGrasa'] == codigo_grasa].index[0]
        
        # Obtener scores de similitud
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Excluir la primera (es la misma grasa)
        sim_scores = sim_scores[1:top_n+1]
        
        # Obtener índices
        indices = [i[0] for i in sim_scores]
        scores = [i[1] for i in sim_scores]
        
        # Crear DataFrame de resultados
        resultado = self.df.iloc[indices].copy()
        resultado['similitud'] = scores
        
        # Seleccionar columnas
        columnas_mostrar = ['codigoGrasa', 'Aceite Base', 'Espesante', 
                           'subtitulo', 'similitud']
        columnas_mostrar = [c for c in columnas_mostrar if c in resultado.columns]
        
        return resultado[columnas_mostrar]
    
    def recomendar_por_rango(self, nombre_columna, vmin, vmax, top_n=10):
        """
        Filtro por rango en una columna numérica específica.
        
        Args:
            nombre_columna (str): Nombre de la columna a filtrar
            vmin (float): Valor mínimo del rango
            vmax (float): Valor máximo del rango
            top_n (int): Número máximo de resultados
            
        Returns:
            pd.DataFrame: Grasas que cumplen el criterio
        """
        if nombre_columna not in self.df.columns:
            print(f"La columna '{nombre_columna}' no existe")
            print(f"Columnas disponibles: {', '.join(self.columnas_principales)}")
            return pd.DataFrame()
        
        # Filtrar por rango
        serie = pd.to_numeric(self.df[nombre_columna], errors='coerce')
        mask = serie.notna() & (serie >= vmin) & (serie <= vmax)
        candidatos = self.df[mask].copy()
        
        if candidatos.empty:
            print(f"No se encontraron grasas con {nombre_columna} entre {vmin} y {vmax}")
            return candidatos
        
        # Calcular distancia al centro del rango
        centro = (vmin + vmax) / 2.0
        candidatos['dist_centro'] = np.abs(serie[mask] - centro)
        candidatos = candidatos.sort_values('dist_centro')
        
        # Columnas a mostrar
        columnas_mostrar = ['codigoGrasa', 'Aceite Base', 'Espesante', 
                           'temp_min', 'temp_max', 'subtitulo', nombre_columna]
        columnas_mostrar = [c for c in columnas_mostrar if c in candidatos.columns]
        
        return candidatos[columnas_mostrar].head(top_n)
    
    def recomendar_hibrido(self, codigo_grasa, filtros_numericos=None, top_n=10):
        """
        Recomendador híbrido que combina similitud de contenido con filtros numéricos.
        
        Args:
            codigo_grasa (str): Código de la grasa de referencia
            filtros_numericos (dict): Diccionario con filtros {'columna': (min, max)}
            top_n (int): Número de recomendaciones
            
        Returns:
            pd.DataFrame: Recomendaciones personalizadas
        """
        # Primero obtener similares por contenido
        similares = self.recomendar_por_contenido(codigo_grasa, top_n=50)
        
        if similares.empty:
            return pd.DataFrame()
        
        # Aplicar filtros numéricos si existen
        if filtros_numericos:
            for columna, (vmin, vmax) in filtros_numericos.items():
                if columna in self.df.columns:
                    codigos_validos = self.df[
                        (self.df[columna] >= vmin) & 
                        (self.df[columna] <= vmax)
                    ]['codigoGrasa'].values
                    
                    similares = similares[
                        similares['codigoGrasa'].isin(codigos_validos)
                    ]
        
        return similares.head(top_n)
    
    def buscar_por_caracteristicas(self, aceite_base=None, espesante=None, 
                                   temp_min=None, temp_max=None, top_n=10):
        """
        Búsqueda por características específicas.
        
        Args:
            aceite_base (str): Tipo de aceite base
            espesante (str): Tipo de espesante
            temp_min (float): Temperatura mínima de servicio
            temp_max (float): Temperatura máxima de servicio
            top_n (int): Número de resultados
            
        Returns:
            pd.DataFrame: Grasas que cumplen los criterios
        """
        df_temp = self.df.copy()
        
        # Aplicar filtros
        if aceite_base and 'Aceite Base' in df_temp.columns:
            df_temp = df_temp[
                df_temp['Aceite Base'].str.contains(aceite_base, case=False, na=False)
            ]
        
        if espesante and 'Espesante' in df_temp.columns:
            df_temp = df_temp[
                df_temp['Espesante'].str.contains(espesante, case=False, na=False)
            ]
        
        if temp_min is not None and 'temp_min' in df_temp.columns:
            df_temp = df_temp[df_temp['temp_min'] <= temp_min]
        
        if temp_max is not None and 'temp_max' in df_temp.columns:
            df_temp = df_temp[df_temp['temp_max'] >= temp_max]
        
        # Columnas a mostrar
        columnas_mostrar = ['codigoGrasa', 'Aceite Base', 'Espesante', 
                           'temp_min', 'temp_max', 'subtitulo']
        columnas_mostrar = [c for c in columnas_mostrar if c in df_temp.columns]
        
        return df_temp[columnas_mostrar].head(top_n)
    
    def mostrar_info_grasa(self, codigo_grasa):
        """
        Muestra información detallada de una grasa específica.
        
        Args:
            codigo_grasa (str): Código de la grasa
        """
        if codigo_grasa not in self.df['codigoGrasa'].values:
            print(f"No se encontro la grasa '{codigo_grasa}'")
            return
        
        grasa = self.df[self.df['codigoGrasa'] == codigo_grasa].iloc[0]
        
        print("\n" + "=" * 80)
        print(f"INFORMACIÓN DETALLADA: {codigo_grasa}")
        print("=" * 80)
        
        # Información básica
        print("\nINFORMACION BASICA:")
        if 'Aceite Base' in grasa and pd.notna(grasa['Aceite Base']):
            print(f"  • Aceite Base: {grasa['Aceite Base']}")
        if 'Espesante' in grasa and pd.notna(grasa['Espesante']):
            print(f"  • Espesante: {grasa['Espesante']}")
        if 'categoria' in grasa and pd.notna(grasa['categoria']):
            print(f"  • Categoría: {grasa['categoria']}")
        if 'subtitulo' in grasa and pd.notna(grasa['subtitulo']):
            print(f"  • Descripción: {grasa['subtitulo']}")
        
        # Propiedades técnicas
        print("\nPROPIEDADES TECNICAS:")
        for col in self.columnas_principales:
            if col in grasa and pd.notna(grasa[col]):
                print(f"  • {col}: {grasa[col]}")
        
        # Aplicaciones
        if 'aplicaciones' in grasa and pd.notna(grasa['aplicaciones']):
            print("\nAPLICACIONES:")
            aplicaciones = grasa['aplicaciones'].split('@')
            for app in aplicaciones:
                if app.strip():
                    print(f"  • {app.strip()}")
        
        # Beneficios
        if 'beneficios' in grasa and pd.notna(grasa['beneficios']):
            print("\nBENEFICIOS:")
            beneficios = grasa['beneficios'].split('@')
            for ben in beneficios:
                if ben.strip():
                    print(f"  • {ben.strip()}")
        
        print("=" * 80)
    
    def listar_opciones(self):
        """Lista opciones disponibles en el catálogo."""
        print("\n" + "=" * 80)
        print("OPCIONES DISPONIBLES EN EL CATÁLOGO")
        print("=" * 80)
        
        # Aceites base
        if 'Aceite Base' in self.df.columns:
            aceites = self.df['Aceite Base'].dropna().unique()
            print(f"\nACEITES BASE ({len(aceites)}):")
            for aceite in sorted(aceites):
                print(f"  • {aceite}")
        
        # Espesantes
        if 'Espesante' in self.df.columns:
            espesantes = self.df['Espesante'].dropna().unique()
            print(f"\nESPESANTES ({len(espesantes)}):")
            for esp in sorted(espesantes):
                print(f"  • {esp}")
        
        # Rangos de temperatura
        if 'temp_min' in self.df.columns and 'temp_max' in self.df.columns:
            temp_min_global = self.df['temp_min'].min()
            temp_max_global = self.df['temp_max'].max()
            print(f"\nRANGO DE TEMPERATURA:")
            print(f"  • Mínima disponible: {temp_min_global}°C")
            print(f"  • Máxima disponible: {temp_max_global}°C")
        
        print("=" * 80)


def menu_interactivo():
    """
    Menú interactivo para el sistema de recomendación.
    """
    # Inicializar recomendador
    try:
        recomendador = RecomendadorGrasas('datos_grasas_Tec.csv')
    except FileNotFoundError:
        print("Error: No se encontro el archivo 'datos_grasas_Tec__1_.csv'")
        print("Por favor, asegúrate de que el archivo esté en el mismo directorio.")
        return
    
    while True:
        print("\n" + "=" * 80)
        print("MENÚ PRINCIPAL - SISTEMA DE RECOMENDACIÓN")
        print("=" * 80)
        print("\n1. Mostrar grasas mas completas (por disponibilidad de datos)")
        print("2. Buscar grasas similares a una especifica")
        print("3. Filtrar por rango de propiedad tecnica")
        print("4. Buscar por caracteristicas especificas")
        print("5. Recomendacion hibrida (similitud + filtros)")
        print("6. Ver informacion detallada de una grasa")
        print("7. Listar opciones disponibles")
        print("8. Salir")
        print("\n" + "=" * 80)
        
        opcion = input("\nSelecciona una opcion (1-8): ").strip()
        
        if opcion == '1':
            print("\nGRASAS MAS COMPLETAS")
            print("-" * 80)
            n = input("¿Cuántas grasas quieres ver? (default 10): ").strip()
            n = int(n) if n.isdigit() else 10
            
            resultados = recomendador.recomendar_por_popularidad(top_n=n)
            print("\n" + resultados.to_string(index=False))
        
        elif opcion == '2':
            print("\nBUSCAR GRASAS SIMILARES")
            print("-" * 80)
            codigo = input("Ingresa el código de la grasa (ej: Grasa_1): ").strip()
            n = input("¿Cuántas recomendaciones? (default 10): ").strip()
            n = int(n) if n.isdigit() else 10
            
            resultados = recomendador.recomendar_por_contenido(codigo, top_n=n)
            if not resultados.empty:
                print("\n" + resultados.to_string(index=False))
        
        elif opcion == '3':
            print("\nFILTRAR POR RANGO")
            print("-" * 80)
            print("Columnas disponibles:")
            for i, col in enumerate(recomendador.columnas_principales, 1):
                print(f"  {i}. {col}")
            
            col_idx = input("\nSelecciona el número de columna: ").strip()
            if col_idx.isdigit() and 1 <= int(col_idx) <= len(recomendador.columnas_principales):
                columna = recomendador.columnas_principales[int(col_idx) - 1]
                
                vmin = input(f"Valor mínimo para {columna}: ").strip()
                vmax = input(f"Valor máximo para {columna}: ").strip()
                
                try:
                    vmin = float(vmin)
                    vmax = float(vmax)
                    n = input("¿Cuántos resultados? (default 10): ").strip()
                    n = int(n) if n.isdigit() else 10
                    
                    resultados = recomendador.recomendar_por_rango(columna, vmin, vmax, top_n=n)
                    if not resultados.empty:
                        print("\n" + resultados.to_string(index=False))
                except ValueError:
                    print("Error: Los valores deben ser numericos")
        
        elif opcion == '4':
            print("\nBUSCAR POR CARACTERISTICAS")
            print("-" * 80)
            aceite = input("Aceite base (Enter para omitir): ").strip() or None
            espesante = input("Espesante (Enter para omitir): ").strip() or None
            temp_min = input("Temperatura mínima °C (Enter para omitir): ").strip()
            temp_max = input("Temperatura máxima °C (Enter para omitir): ").strip()
            
            temp_min = float(temp_min) if temp_min else None
            temp_max = float(temp_max) if temp_max else None
            
            resultados = recomendador.buscar_por_caracteristicas(
                aceite_base=aceite,
                espesante=espesante,
                temp_min=temp_min,
                temp_max=temp_max
            )
            if not resultados.empty:
                print("\n" + resultados.to_string(index=False))
            else:
                print("\nNo se encontraron grasas con esas caracteristicas")
        
        elif opcion == '5':
            print("\nRECOMENDACION HIBRIDA")
            print("-" * 80)
            codigo = input("Código de la grasa base (ej: Grasa_1): ").strip()
            
            aplicar_filtros = input("¿Deseas aplicar filtros adicionales? (s/n): ").strip().lower()
            
            filtros = None
            if aplicar_filtros == 's':
                filtros = {}
                agregar = 's'
                while agregar == 's':
                    print("\nColumnas disponibles:")
                    for i, col in enumerate(recomendador.columnas_principales, 1):
                        print(f"  {i}. {col}")
                    
                    col_idx = input("\nSelecciona columna: ").strip()
                    if col_idx.isdigit() and 1 <= int(col_idx) <= len(recomendador.columnas_principales):
                        columna = recomendador.columnas_principales[int(col_idx) - 1]
                        vmin = float(input(f"Valor mínimo: "))
                        vmax = float(input(f"Valor máximo: "))
                        filtros[columna] = (vmin, vmax)
                    
                    agregar = input("¿Agregar otro filtro? (s/n): ").strip().lower()
            
            resultados = recomendador.recomendar_hibrido(codigo, filtros_numericos=filtros)
            if not resultados.empty:
                print("\n" + resultados.to_string(index=False))
        
        elif opcion == '6':
            print("\nINFORMACION DETALLADA")
            print("-" * 80)
            codigo = input("Ingresa el código de la grasa: ").strip()
            recomendador.mostrar_info_grasa(codigo)
        
        elif opcion == '7':
            recomendador.listar_opciones()
        
        elif opcion == '8':
            print("\nHasta luego!")
            break
        
        else:
            print("\nOpcion no valida. Por favor selecciona un numero del 1 al 8.")
        
        input("\n[Presiona Enter para continuar...]")


if __name__ == "__main__":
    menu_interactivo()
