"""
Sistema de Recomendación de Grasas Industriales con Análisis Competitivo
========================================================================
Este sistema implementa múltiples algoritmos de recomendación y análisis:
1. Recomendador Simple: Basado en popularidad y características generales
2. Recomendador Basado en Contenido: Usa TF-IDF sobre descripciones
3. Filtrado por Características: Búsqueda por rangos de propiedades técnicas
4. NUEVO: Análisis Competitivo - Comparación con productos rivales
5. NUEVO: Benchmarking - Análisis de ventajas competitivas
6. NUEVO: Búsqueda de Alternativas - Productos propios vs rivales
7. NUEVO: Gap Analysis - Identificar oportunidades de mercado

Autor: Yose
Fecha: 2024
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings

warnings.filterwarnings('ignore')


class RecomendadorGrasasCompetitivo:
    """
    Sistema completo de recomendación con análisis competitivo.
    """
    
    def __init__(self, ruta_csv_propios, ruta_csv_rivales):
        """
        Inicializa el recomendador con productos propios y rivales.
        
        Args:
            ruta_csv_propios (str): Ruta al CSV de productos propios
            ruta_csv_rivales (str): Ruta al CSV de productos rivales
        """
        print("=" * 80)
        print("SISTEMA DE RECOMENDACIÓN CON ANÁLISIS COMPETITIVO")
        print("=" * 80)
        print("\nCargando catalogos...")
        
        # Cargar datos propios
        self.df_propios = pd.read_csv(ruta_csv_propios, encoding='utf-8-sig')
        self._preparar_datos_propios()
        
        # Cargar datos rivales
        self.df_rivales = pd.read_csv(ruta_csv_rivales, encoding='utf-8-sig')
        self._preparar_datos_rivales()
        
        # Crear dataset combinado para análisis
        self._crear_dataset_combinado()
        
        # Crear matrices TF-IDF
        self._crear_matrices_tfidf()
        
        print(f"\nProductos propios cargados: {len(self.df_propios)}")
        print(f"Productos rivales cargados: {len(self.df_rivales)}")
        print(f"Total en analisis: {len(self.df_combinado)}")
        print("=" * 80)
    
    def _preparar_datos_propios(self):
        """Prepara datos de productos propios."""
        # Renombrar columnas
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
        self.df_propios = self.df_propios.rename(columns=renombres)
        self.df_propios['origen'] = 'propio'
        
        # Convertir numéricas
        for col in self.df_propios.columns:
            if col not in ['codigoGrasa', 'Aceite Base', 'Espesante', 'categoria', 
                          'subtitulo', 'descripcion', 'beneficios', 'aplicaciones', 
                          'color', 'textura', 'origen']:
                self.df_propios[col] = pd.to_numeric(self.df_propios[col], errors='coerce')
        
        # Crear texto completo
        self._crear_texto_full(self.df_propios)
    
    def _preparar_datos_rivales(self):
        """Prepara datos de productos rivales."""
        # Renombrar columnas para consistencia
        renombres = {
            "Viscosidad del Aceite Base a 40°C. cSt": "visc_40c",
            "Temperatura de Servicio °C, min": "temp_min",
            "Temperatura de Servicio °C, max": "temp_max",
            "Penetración de Cono a 25°C, 0.1mm": "penetracion",
            "Punto de Gota, °C": "punto_gota",
            "Punto de Soldadura Cuatro Bolas, kgf": "soldadura_4bolas",
            "Desgaste Cuatro Bolas, mm": "desgaste_4bolas",
            "Carga Timken Ok, lb": "carga_timken"
        }
        self.df_rivales = self.df_rivales.rename(columns=renombres)
        self.df_rivales['origen'] = 'rival'
        
        # Convertir numéricas
        for col in self.df_rivales.columns:
            if col not in ['codigoGrasa', 'Aceite Base', 'Espesante', 'Color', 
                          'Textura', 'descripcion', 'beneficios', 'aplicaciones',
                          'Descripcion', 'Beneficios', 'Aplicaciones', 'origen']:
                self.df_rivales[col] = pd.to_numeric(self.df_rivales[col], errors='coerce')
        
        # Crear texto completo
        self._crear_texto_full_rivales()
    
    def _crear_texto_full(self, df):
        """Crea campo de texto completo para productos propios."""
        campos_texto = []
        for campo in ['Aceite Base', 'Espesante', 'categoria', 'subtitulo', 
                     'descripcion', 'beneficios', 'aplicaciones', 'color', 'textura']:
            if campo in df.columns:
                campos_texto.append(df[campo].fillna(''))
        
        df['texto_full'] = campos_texto[0]
        for campo in campos_texto[1:]:
            df['texto_full'] = df['texto_full'] + ' ' + campo
        
        df['texto_full'] = df['texto_full'].str.lower()
        df['texto_full'] = df['texto_full'].str.replace('@', ' ')
        df['texto_full'] = df['texto_full'].str.replace('\n', ' ')
    
    def _crear_texto_full_rivales(self):
        """Crea campo de texto completo para productos rivales."""
        campos_texto = []
        
        # Los rivales tienen campos con nombres diferentes
        for campo in ['Aceite Base', 'Espesante', 'Color', 'Textura', 
                     'descripcion', 'beneficios', 'aplicaciones',
                     'Descripcion', 'Beneficios', 'Aplicaciones']:
            if campo in self.df_rivales.columns:
                campos_texto.append(self.df_rivales[campo].fillna(''))
        
        self.df_rivales['texto_full'] = campos_texto[0]
        for campo in campos_texto[1:]:
            self.df_rivales['texto_full'] = self.df_rivales['texto_full'] + ' ' + campo
        
        self.df_rivales['texto_full'] = self.df_rivales['texto_full'].str.lower()
        self.df_rivales['texto_full'] = self.df_rivales['texto_full'].str.replace('\n', ' ')
    
    def _crear_dataset_combinado(self):
        """Crea dataset combinado para análisis competitivo."""
        # Columnas comunes para análisis
        columnas_comunes = ['codigoGrasa', 'visc_40c', 'temp_min', 'temp_max', 
                           'penetracion', 'punto_gota', 'soldadura_4bolas', 
                           'desgaste_4bolas', 'carga_timken', 'Aceite Base', 
                           'Espesante', 'texto_full', 'origen']
        
        # Filtrar solo columnas que existan en ambos
        cols_propios = [c for c in columnas_comunes if c in self.df_propios.columns]
        cols_rivales = [c for c in columnas_comunes if c in self.df_rivales.columns]
        
        # Usar columnas que están en ambos
        cols_finales = list(set(cols_propios) & set(cols_rivales))
        
        # Combinar
        df_propios_subset = self.df_propios[cols_finales].copy()
        df_rivales_subset = self.df_rivales[cols_finales].copy()
        
        self.df_combinado = pd.concat([df_propios_subset, df_rivales_subset], 
                                     ignore_index=True)
    
    def _crear_matrices_tfidf(self):
        """Crea matrices TF-IDF para análisis de similitud."""
        print("\nCreando matrices de similitud...")
        
        stop_words_es = [
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
            'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'lo', 'todo',
            'pero', 'más', 'hacer', 'o', 'poder', 'este', 'ir', 'otro', 'ese',
            'al', 'del', 'los', 'las', 'una', 'unos', 'unas'
        ]
        
        self.tfidf = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 2),
            min_df=1,
            stop_words=stop_words_es,
            max_features=1000
        )
        
        # Matriz combinada
        self.tfidf_matrix_combinado = self.tfidf.fit_transform(
            self.df_combinado['texto_full']
        )
        self.cosine_sim_combinado = cosine_similarity(
            self.tfidf_matrix_combinado, 
            self.tfidf_matrix_combinado
        )
        
        print("Matrices creadas exitosamente")
    
    # ==================== FUNCIONES ORIGINALES ====================
    
    def recomendar_por_contenido_propios(self, codigo_grasa, top_n=10):
        """Busca productos propios similares a uno dado."""
        if codigo_grasa not in self.df_propios['codigoGrasa'].values:
            print(f"No se encontro el producto '{codigo_grasa}' en catalogo propio")
            return pd.DataFrame()
        
        # Buscar en dataset combinado
        idx_combinado = self.df_combinado[
            (self.df_combinado['codigoGrasa'] == codigo_grasa) & 
            (self.df_combinado['origen'] == 'propio')
        ].index[0]
        
        # Obtener similitudes
        sim_scores = list(enumerate(self.cosine_sim_combinado[idx_combinado]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Filtrar solo productos propios (excluir el mismo)
        resultados = []
        for idx, score in sim_scores[1:]:
            if self.df_combinado.iloc[idx]['origen'] == 'propio':
                resultados.append((idx, score))
            if len(resultados) >= top_n:
                break
        
        if not resultados:
            return pd.DataFrame()
        
        indices = [i[0] for i in resultados]
        scores = [i[1] for i in resultados]
        
        resultado = self.df_combinado.iloc[indices].copy()
        resultado['similitud'] = scores
        
        columnas = ['codigoGrasa', 'Aceite Base', 'Espesante', 'similitud']
        columnas = [c for c in columnas if c in resultado.columns]
        
        return resultado[columnas]
    
    # ==================== FUNCIONES COMPETITIVAS NUEVAS ====================
    
    def buscar_rivales_similares(self, codigo_grasa_propio, top_n=10):
        """
        Encuentra productos rivales similares a un producto propio.
        
        Args:
            codigo_grasa_propio (str): Código del producto propio
            top_n (int): Número de rivales similares
            
        Returns:
            pd.DataFrame: Rivales más similares
        """
        if codigo_grasa_propio not in self.df_propios['codigoGrasa'].values:
            print(f"No se encontro '{codigo_grasa_propio}' en catalogo propio")
            return pd.DataFrame()
        
        # Buscar en dataset combinado
        idx_combinado = self.df_combinado[
            (self.df_combinado['codigoGrasa'] == codigo_grasa_propio) & 
            (self.df_combinado['origen'] == 'propio')
        ].index[0]
        
        # Obtener similitudes
        sim_scores = list(enumerate(self.cosine_sim_combinado[idx_combinado]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Filtrar solo productos rivales
        resultados = []
        for idx, score in sim_scores:
            if self.df_combinado.iloc[idx]['origen'] == 'rival':
                resultados.append((idx, score))
            if len(resultados) >= top_n:
                break
        
        if not resultados:
            print("No se encontraron rivales similares")
            return pd.DataFrame()
        
        indices = [i[0] for i in resultados]
        scores = [i[1] for i in resultados]
        
        resultado = self.df_combinado.iloc[indices].copy()
        resultado['similitud'] = scores
        
        columnas = ['codigoGrasa', 'Aceite Base', 'Espesante', 'temp_min', 
                   'temp_max', 'similitud']
        columnas = [c for c in columnas if c in resultado.columns]
        
        return resultado[columnas]
    
    def comparar_con_rival(self, codigo_propio, codigo_rival):
        """
        Comparación detallada entre un producto propio y uno rival.
        
        Args:
            codigo_propio (str): Código del producto propio
            codigo_rival (str): Código del producto rival
        """
        # Obtener productos
        if codigo_propio not in self.df_propios['codigoGrasa'].values:
            print(f"No se encontro '{codigo_propio}' en catalogo propio")
            return
        
        if codigo_rival not in self.df_rivales['codigoGrasa'].values:
            print(f"No se encontro '{codigo_rival}' en catalogo rival")
            return
        
        propio = self.df_propios[
            self.df_propios['codigoGrasa'] == codigo_propio
        ].iloc[0]
        rival = self.df_rivales[
            self.df_rivales['codigoGrasa'] == codigo_rival
        ].iloc[0]
        
        print("\n" + "=" * 80)
        print(f"COMPARACIÓN: {codigo_propio} vs {codigo_rival}")
        print("=" * 80)
        
        # Información básica
        print("\nINFORMACION BASICA:")
        print(f"\n  {codigo_propio} (NUESTRO):")
        if 'Aceite Base' in propio and pd.notna(propio['Aceite Base']):
            print(f"    • Aceite Base: {propio['Aceite Base']}")
        if 'Espesante' in propio and pd.notna(propio['Espesante']):
            print(f"    • Espesante: {propio['Espesante']}")
        
        print(f"\n  {codigo_rival} (RIVAL):")
        if 'Aceite Base' in rival and pd.notna(rival['Aceite Base']):
            print(f"    • Aceite Base: {rival['Aceite Base']}")
        if 'Espesante' in rival and pd.notna(rival['Espesante']):
            print(f"    • Espesante: {rival['Espesante']}")
        
        # Comparación de propiedades numéricas
        print("\nCOMPARACION DE PROPIEDADES:")
        
        propiedades = ['visc_40c', 'temp_min', 'temp_max', 'penetracion', 
                      'punto_gota', 'soldadura_4bolas', 'desgaste_4bolas', 
                      'carga_timken']
        
        comparaciones = []
        for prop in propiedades:
            if prop in propio and prop in rival:
                val_propio = propio[prop]
                val_rival = rival[prop]
                
                if pd.notna(val_propio) and pd.notna(val_rival):
                    diferencia = val_propio - val_rival
                    porcentaje = (diferencia / val_rival * 100) if val_rival != 0 else 0
                    
                    ventaja = "+" if diferencia > 0 else "-" if diferencia < 0 else "="
                    
                    comparaciones.append({
                        'Propiedad': prop,
                        'Nuestro': f"{val_propio:.2f}",
                        'Rival': f"{val_rival:.2f}",
                        'Diferencia': f"{diferencia:+.2f}",
                        'Ventaja': ventaja
                    })
        
        if comparaciones:
            df_comp = pd.DataFrame(comparaciones)
            print("\n" + df_comp.to_string(index=False))
        
        # Análisis de ventajas
        ventajas_nuestras = sum(1 for c in comparaciones if c['Ventaja'] == '+')
        ventajas_rival = sum(1 for c in comparaciones if c['Ventaja'] == '-')
        
        print(f"\nRESUMEN:")
        print(f"  • Ventajas nuestras: {ventajas_nuestras}/{len(comparaciones)}")
        print(f"  • Ventajas del rival: {ventajas_rival}/{len(comparaciones)}")
        
        print("=" * 80)
    
    def benchmarking_categoria(self, propiedad, categoria_filtro=None):
        """
        Benchmarking de una propiedad: propios vs rivales.
        
        Args:
            propiedad (str): Propiedad a analizar (ej: 'temp_max', 'visc_40c')
            categoria_filtro (str): Filtro opcional por categoría
        """
        if propiedad not in self.df_combinado.columns:
            print(f"Propiedad '{propiedad}' no disponible")
            return
        
        print("\n" + "=" * 80)
        print(f"BENCHMARKING: {propiedad}")
        print("=" * 80)
        
        # Filtrar por categoría si aplica
        df_analisis = self.df_combinado.copy()
        if categoria_filtro:
            # Intentar filtrar (esto puede variar según tus datos)
            pass
        
        # Calcular estadísticas
        stats_propios = df_analisis[
            (df_analisis['origen'] == 'propio') & 
            (df_analisis[propiedad].notna())
        ][propiedad]
        
        stats_rivales = df_analisis[
            (df_analisis['origen'] == 'rival') & 
            (df_analisis[propiedad].notna())
        ][propiedad]
        
        print(f"\nESTADISTICAS DE {propiedad}:")
        print("\n  NUESTROS PRODUCTOS:")
        if len(stats_propios) > 0:
            print(f"    • Mínimo: {stats_propios.min():.2f}")
            print(f"    • Máximo: {stats_propios.max():.2f}")
            print(f"    • Promedio: {stats_propios.mean():.2f}")
            print(f"    • Productos: {len(stats_propios)}")
        else:
            print("    • Sin datos disponibles")
        
        print("\n  PRODUCTOS RIVALES:")
        if len(stats_rivales) > 0:
            print(f"    • Mínimo: {stats_rivales.min():.2f}")
            print(f"    • Máximo: {stats_rivales.max():.2f}")
            print(f"    • Promedio: {stats_rivales.mean():.2f}")
            print(f"    • Productos: {len(stats_rivales)}")
        else:
            print("    • Sin datos disponibles")
        
        # Análisis competitivo
        if len(stats_propios) > 0 and len(stats_rivales) > 0:
            print("\nANALISIS COMPETITIVO:")
            
            if stats_propios.max() > stats_rivales.max():
                print(f"  [+] Tenemos productos superiores (max: {stats_propios.max():.2f} vs {stats_rivales.max():.2f})")
            else:
                print(f"  [!] Los rivales tienen productos superiores (max: {stats_rivales.max():.2f} vs {stats_propios.max():.2f})")

            if stats_propios.mean() > stats_rivales.mean():
                print(f"  [+] Nuestro promedio es mejor ({stats_propios.mean():.2f} vs {stats_rivales.mean():.2f})")
            else:
                print(f"  [!] El promedio rival es mejor ({stats_rivales.mean():.2f} vs {stats_propios.mean():.2f})")
        
        print("=" * 80)
    
    def gap_analysis(self):
        """
        Identifica gaps: qué tienen los rivales que nosotros no.
        """
        print("\n" + "=" * 80)
        print("GAP ANALYSIS - OPORTUNIDADES DE MERCADO")
        print("=" * 80)
        
        # Analizar rangos de propiedades
        propiedades = ['temp_max', 'visc_40c', 'soldadura_4bolas', 'carga_timken']
        
        gaps = []
        
        for prop in propiedades:
            if prop not in self.df_combinado.columns:
                continue
            
            # Rangos propios
            propios_data = self.df_combinado[
                (self.df_combinado['origen'] == 'propio') & 
                (self.df_combinado[prop].notna())
            ][prop]
            
            # Rangos rivales
            rivales_data = self.df_combinado[
                (self.df_combinado['origen'] == 'rival') & 
                (self.df_combinado[prop].notna())
            ][prop]
            
            if len(propios_data) > 0 and len(rivales_data) > 0:
                # Identificar si rivales tienen valores que nosotros no
                max_propio = propios_data.max()
                max_rival = rivales_data.max()
                min_propio = propios_data.min()
                min_rival = rivales_data.min()
                
                if max_rival > max_propio:
                    gaps.append({
                        'Propiedad': prop,
                        'Tipo': 'Límite Superior',
                        'Nuestro': f"{max_propio:.2f}",
                        'Rival': f"{max_rival:.2f}",
                        'Gap': f"{max_rival - max_propio:.2f}",
                        'Oportunidad': 'Desarrollar productos de mayor rendimiento'
                    })
                
                if min_rival < min_propio:
                    gaps.append({
                        'Propiedad': prop,
                        'Tipo': 'Límite Inferior',
                        'Nuestro': f"{min_propio:.2f}",
                        'Rival': f"{min_rival:.2f}",
                        'Gap': f"{min_propio - min_rival:.2f}",
                        'Oportunidad': 'Expandir hacia aplicaciones de menor especificación'
                    })
        
        if gaps:
            print("\nGAPS IDENTIFICADOS:\n")
            for i, gap in enumerate(gaps, 1):
                print(f"{i}. {gap['Propiedad']} ({gap['Tipo']}):")
                print(f"   - Nuestro rango: {gap['Nuestro']}")
                print(f"   - Rango rival: {gap['Rival']}")
                print(f"   - Diferencia: {gap['Gap']}")
                print(f"   - {gap['Oportunidad']}\n")
        else:
            print("\nNo se identificaron gaps significativos")
        
        print("=" * 80)
    
    def encontrar_competidor_directo(self, codigo_rival):
        """
        Encuentra cuál de nuestros productos compite mejor contra un rival.
        
        Args:
            codigo_rival (str): Código del producto rival
            
        Returns:
            pd.DataFrame: Nuestros productos más competitivos
        """
        if codigo_rival not in self.df_rivales['codigoGrasa'].values:
            print(f"No se encontro '{codigo_rival}' en catalogo rival")
            return pd.DataFrame()
        
        # Buscar en dataset combinado
        idx_combinado = self.df_combinado[
            (self.df_combinado['codigoGrasa'] == codigo_rival) & 
            (self.df_combinado['origen'] == 'rival')
        ].index[0]
        
        # Obtener similitudes
        sim_scores = list(enumerate(self.cosine_sim_combinado[idx_combinado]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Filtrar solo productos propios
        resultados = []
        for idx, score in sim_scores:
            if self.df_combinado.iloc[idx]['origen'] == 'propio':
                resultados.append((idx, score))
            if len(resultados) >= 10:
                break
        
        if not resultados:
            print("No se encontraron productos propios similares")
            return pd.DataFrame()
        
        indices = [i[0] for i in resultados]
        scores = [i[1] for i in resultados]
        
        resultado = self.df_combinado.iloc[indices].copy()
        resultado['match_score'] = scores
        
        columnas = ['codigoGrasa', 'Aceite Base', 'Espesante', 'temp_min', 
                   'temp_max', 'match_score']
        columnas = [c for c in columnas if c in resultado.columns]
        
        return resultado[columnas]
    
    def listar_productos_rivales(self):
        """Lista todos los productos rivales disponibles."""
        print("\n" + "=" * 80)
        print("CATÁLOGO DE PRODUCTOS RIVALES")
        print("=" * 80)
        
        print(f"\nTotal de productos rivales: {len(self.df_rivales)}\n")
        
        for idx, row in self.df_rivales.iterrows():
            print(f"• {row['codigoGrasa']}")
            if 'Aceite Base' in row and pd.notna(row['Aceite Base']):
                print(f"  └─ Aceite: {row['Aceite Base']}")
            if 'Espesante' in row and pd.notna(row['Espesante']):
                print(f"  └─ Espesante: {row['Espesante']}")
            if 'temp_max' in row and pd.notna(row['temp_max']):
                print(f"  └─ Temp máx: {row['temp_max']}°C")
            print()
        
        print("=" * 80)
    
    def matriz_competitiva(self):
        """
        Crea una matriz competitiva mostrando posicionamiento.
        """
        print("\n" + "=" * 80)
        print("MATRIZ COMPETITIVA - POSICIONAMIENTO")
        print("=" * 80)
        
        # Analizar por temperatura y viscosidad (ejes comunes de diferenciación)
        if 'temp_max' in self.df_combinado.columns and 'visc_40c' in self.df_combinado.columns:
            
            print("\nSEGMENTACION: Temperatura Maxima vs Viscosidad\n")
            
            # Segmentos
            segmentos = {
                'Alta Temp + Alta Visc': (
                    self.df_combinado['temp_max'] > 180,
                    self.df_combinado['visc_40c'] > 400
                ),
                'Alta Temp + Baja Visc': (
                    self.df_combinado['temp_max'] > 180,
                    self.df_combinado['visc_40c'] <= 400
                ),
                'Baja Temp + Alta Visc': (
                    self.df_combinado['temp_max'] <= 180,
                    self.df_combinado['visc_40c'] > 400
                ),
                'Baja Temp + Baja Visc': (
                    self.df_combinado['temp_max'] <= 180,
                    self.df_combinado['visc_40c'] <= 400
                )
            }
            
            for nombre_seg, (cond_temp, cond_visc) in segmentos.items():
                # Aplicar condiciones
                mask = cond_temp & cond_visc & self.df_combinado['temp_max'].notna() & self.df_combinado['visc_40c'].notna()
                segmento = self.df_combinado[mask]
                
                n_propios = len(segmento[segmento['origen'] == 'propio'])
                n_rivales = len(segmento[segmento['origen'] == 'rival'])
                
                print(f"  {nombre_seg}:")
                print(f"    • Nuestros productos: {n_propios}")
                print(f"    • Productos rivales: {n_rivales}")
                
                if n_propios > n_rivales:
                    print(f"    [+] Ventaja competitiva")
                elif n_rivales > n_propios:
                    print(f"    [!] Oportunidad de crecimiento")
                else:
                    print(f"    [=] Paridad competitiva")
                print()
        
        print("=" * 80)


def menu_competitivo():
    """Menú interactivo con funciones competitivas."""
    try:
        rec = RecomendadorGrasasCompetitivo(
            'datos_grasas_Tec.csv',
            'Grasas_Consolidado_Total.csv'
        )
    except FileNotFoundError as e:
        print(f"Error: No se encontro algun archivo necesario")
        print(f"Detalles: {e}")
        return
    
    while True:
        print("\n" + "=" * 80)
        print("MENÚ PRINCIPAL - ANÁLISIS COMPETITIVO")
        print("=" * 80)
        print("\nFUNCIONES PROPIAS:")
        print("  1. Buscar productos propios similares")

        print("\nANALISIS COMPETITIVO:")
        print("  2. Buscar rivales similares a mi producto")
        print("  3. Comparar mi producto vs rival especifico")
        print("  4. Encontrar mejor producto propio vs rival")
        print("  5. Listar todos los productos rivales")

        print("\nBENCHMARKING:")
        print("  6. Benchmarking de propiedad (propios vs rivales)")
        print("  7. Gap Analysis (oportunidades de mercado)")
        print("  8. Matriz competitiva (posicionamiento)")

        print("\n9. Salir")
        print("\n" + "=" * 80)
        
        opcion = input("\nSelecciona una opcion (1-9): ").strip()
        
        if opcion == '1':
            print("\nBUSCAR PRODUCTOS PROPIOS SIMILARES")
            print("-" * 80)
            codigo = input("Código del producto propio: ").strip()
            n = input("¿Cuántos similares? (default 5): ").strip()
            n = int(n) if n.isdigit() else 5
            
            resultados = rec.recomendar_por_contenido_propios(codigo, top_n=n)
            if not resultados.empty:
                print("\n" + resultados.to_string(index=False))
        
        elif opcion == '2':
            print("\nBUSCAR RIVALES SIMILARES")
            print("-" * 80)
            codigo = input("Código del producto propio: ").strip()
            n = input("¿Cuántos rivales? (default 5): ").strip()
            n = int(n) if n.isdigit() else 5
            
            resultados = rec.buscar_rivales_similares(codigo, top_n=n)
            if not resultados.empty:
                print("\n" + resultados.to_string(index=False))
        
        elif opcion == '3':
            print("\nCOMPARACION DETALLADA")
            print("-" * 80)
            codigo_propio = input("Código producto propio: ").strip()
            codigo_rival = input("Código producto rival: ").strip()
            
            rec.comparar_con_rival(codigo_propio, codigo_rival)
        
        elif opcion == '4':
            print("\nENCONTRAR COMPETIDOR DIRECTO")
            print("-" * 80)
            codigo_rival = input("Código del producto rival: ").strip()
            
            resultados = rec.encontrar_competidor_directo(codigo_rival)
            if not resultados.empty:
                print("\nNuestros productos mas competitivos:\n")
                print(resultados.to_string(index=False))
        
        elif opcion == '5':
            rec.listar_productos_rivales()
        
        elif opcion == '6':
            print("\nBENCHMARKING DE PROPIEDAD")
            print("-" * 80)
            print("Propiedades disponibles:")
            props = ['visc_40c', 'temp_max', 'temp_min', 'penetracion', 
                    'punto_gota', 'soldadura_4bolas', 'carga_timken']
            for i, p in enumerate(props, 1):
                print(f"  {i}. {p}")
            
            prop_idx = input("\nSelecciona número: ").strip()
            if prop_idx.isdigit() and 1 <= int(prop_idx) <= len(props):
                propiedad = props[int(prop_idx) - 1]
                rec.benchmarking_categoria(propiedad)
        
        elif opcion == '7':
            rec.gap_analysis()
        
        elif opcion == '8':
            rec.matriz_competitiva()
        
        elif opcion == '9':
            print("\nHasta luego!")
            break
        
        else:
            print("\nOpcion no valida")
        
        input("\n[Presiona Enter para continuar...]")


if __name__ == "__main__":
    menu_competitivo()
