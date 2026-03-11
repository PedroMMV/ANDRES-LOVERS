"""
Backend FastAPI para el Sistema de Recomendación de Grasas
=========================================================
Expone los modelos de recomendación como API REST.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
import sys
import os

# Añadir path de los modelos
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modelos', 'recomendador'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modelos', 'regresor'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modelos', 'cluster'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modelos', 'factorial'))

from recomendador_grasas import RecomendadorGrasas
from recomendador_grasas_competitivo import RecomendadorGrasasCompetitivo
from regresor_grasas import RegresorGrasas
from cluster_grasas import ClusterGrasas
from factorial_grasas import FactorialGrasas

app = FastAPI(
    title="Interlub Grease Recommender API",
    description="API para el sistema de recomendación de grasas industriales",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas a los CSVs
BASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'modelos', 'recomendador')
CSV_INTERLUB = os.path.join(BASE_PATH, 'datos_grasas_Tec.csv')
CSV_RIVALES = os.path.join(BASE_PATH, 'Grasas_Consolidado_Total.csv')
# Dataset sintetico para el regresor
CSV_SINTETICO = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'datos_sinteticos_1200.csv')

# Inicializar recomendadores (lazy loading)
recomendador_normal: Optional[RecomendadorGrasas] = None
recomendador_competitivo: Optional[RecomendadorGrasasCompetitivo] = None
regresor: Optional[RegresorGrasas] = None
clusterizador: Optional[ClusterGrasas] = None
factorial: Optional[FactorialGrasas] = None


def get_recomendador_normal():
    global recomendador_normal
    if recomendador_normal is None:
        recomendador_normal = RecomendadorGrasas(CSV_INTERLUB)
    return recomendador_normal


def get_recomendador_competitivo():
    global recomendador_competitivo
    if recomendador_competitivo is None:
        recomendador_competitivo = RecomendadorGrasasCompetitivo(CSV_INTERLUB, CSV_RIVALES)
    return recomendador_competitivo


def get_regresor():
    global regresor
    if regresor is None:
        regresor = RegresorGrasas(CSV_SINTETICO)
    return regresor


def get_clusterizador():
    global clusterizador
    if clusterizador is None:
        clusterizador = ClusterGrasas(CSV_SINTETICO)
    return clusterizador


def get_factorial():
    global factorial
    if factorial is None:
        factorial = FactorialGrasas(CSV_SINTETICO)
    return factorial


def sanitize_value(val, default=''):
    """Convierte NaN/None a un valor seguro para JSON."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return default
    if pd.isna(val):
        return default
    return val


def sanitize_numeric(val):
    """Convierte NaN/None numérico a None para JSON."""
    if val is None:
        return None
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return None
    if pd.isna(val):
        return None
    return float(val)


# ==================== Schemas ====================

class RecommendationQuery(BaseModel):
    aceite_base: Optional[str] = None
    espesante: Optional[str] = None
    nlgi_grade: Optional[float] = None
    viscosidad_40c: Optional[float] = None
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    top_k: int = 10
    only_active: bool = True


class ContentBasedQuery(BaseModel):
    codigo_grasa: str
    top_k: int = 10


class RangeQuery(BaseModel):
    columna: str
    valor_min: float
    valor_max: float
    top_k: int = 10


class HybridQuery(BaseModel):
    codigo_grasa: str
    filtros: Optional[Dict[str, List[float]]] = None  # {"columna": [min, max]}
    top_k: int = 10


class CompareQuery(BaseModel):
    codigo_propio: str
    codigo_rival: str


# ==================== Regression Schemas ====================

class RegressionTrainQuery(BaseModel):
    target_variable: str
    predictor_features: Optional[List[str]] = None  # Si None, usa correlacionados
    test_size_percent: float = 20.0


class RegressionPredictQuery(BaseModel):
    target_variable: str
    input_features: Dict[str, float]


class RegressionRecommendQuery(BaseModel):
    input_features: Dict[str, float]
    variables_similitud: Optional[List[str]] = None
    top_k: int = 5


# ==================== Clustering Schemas ====================

class ClusterTrainQuery(BaseModel):
    n_clusters: int = 5
    variables: Optional[List[str]] = None
    scale: bool = True


class ClusterRecommendQuery(BaseModel):
    input_features: Dict[str, float]
    top_k: int = 5


# ==================== Factor Analysis Schemas ====================

class FactorialTrainQuery(BaseModel):
    n_factors: int = 3
    variables: Optional[List[str]] = None
    scale: bool = True


class FactorialRecommendQuery(BaseModel):
    input_features: Dict[str, float]
    top_k: int = 5


# ==================== Health Check ====================

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API funcionando correctamente"}


# ==================== Dataset Endpoints ====================

@app.get("/api/dataset/overview")
def get_dataset_overview():
    """Obtiene resumen del dataset de Interlub."""
    try:
        df = pd.read_csv(CSV_INTERLUB, encoding='utf-8-sig')

        # Calcular estadísticas
        total_records = len(df)
        total_features = len(df.columns)

        # Separar tipos de columnas
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

        # Calcular missing data por columna
        missing_data = []
        for col in df.columns:
            missing_pct = (df[col].isna().sum() / len(df)) * 100
            col_type = 'numeric' if col in numeric_cols else 'categorical'

            missing_data.append({
                "name": col,
                "type": col_type,
                "missing_percentage": round(missing_pct, 2),
                "non_null_count": int(df[col].notna().sum())
            })

        return {
            "total_records": total_records,
            "total_features": total_features,
            "numeric_features": len(numeric_cols),
            "categorical_features": len(categorical_cols),
            "features": missing_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dataset/overview/rivals")
def get_dataset_overview_rivals():
    """Obtiene resumen del dataset de rivales."""
    try:
        df = pd.read_csv(CSV_RIVALES, encoding='utf-8-sig')

        total_records = len(df)
        total_features = len(df.columns)

        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

        missing_data = []
        for col in df.columns:
            missing_pct = (df[col].isna().sum() / len(df)) * 100
            col_type = 'numeric' if col in numeric_cols else 'categorical'

            missing_data.append({
                "name": col,
                "type": col_type,
                "missing_percentage": round(missing_pct, 2),
                "non_null_count": int(df[col].notna().sum())
            })

        return {
            "total_records": total_records,
            "total_features": total_features,
            "numeric_features": len(numeric_cols),
            "categorical_features": len(categorical_cols),
            "features": missing_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dataset/overview/expanded")
def get_dataset_overview_expanded():
    """Obtiene resumen del dataset expandido (sintético)."""
    try:
        df = pd.read_csv(CSV_SINTETICO, encoding='utf-8-sig')

        total_records = len(df)
        total_features = len(df.columns)

        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

        missing_data = []
        for col in df.columns:
            missing_pct = (df[col].isna().sum() / len(df)) * 100
            col_type = 'numeric' if col in numeric_cols else 'categorical'

            missing_data.append({
                "name": col,
                "type": col_type,
                "missing_percentage": round(missing_pct, 2),
                "non_null_count": int(df[col].notna().sum())
            })

        return {
            "total_records": total_records,
            "total_features": total_features,
            "numeric_features": len(numeric_cols),
            "categorical_features": len(categorical_cols),
            "features": missing_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dataset/categorical-options")
def get_categorical_options():
    """Obtiene valores únicos de campos categóricos."""
    try:
        df = pd.read_csv(CSV_INTERLUB, encoding='utf-8-sig')

        options = {
            "aceites_base": sorted(df['Aceite Base'].dropna().unique().tolist()),
            "espesantes": sorted(df['Espesante'].dropna().unique().tolist()),
            "nlgi_grades": sorted([x for x in df['Grado NLGI Consistencia'].dropna().unique().tolist() if pd.notna(x)]),
            "colores": sorted(df['color'].dropna().unique().tolist()) if 'color' in df.columns else [],
            "texturas": sorted(df['textura'].dropna().unique().tolist()) if 'textura' in df.columns else [],
        }

        return options
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dataset/categorical-options/rivals")
def get_categorical_options_rivals():
    """Obtiene valores únicos de campos categóricos de rivales."""
    try:
        df = pd.read_csv(CSV_RIVALES, encoding='utf-8-sig')

        options = {
            "aceites_base": sorted(df['Aceite Base'].dropna().unique().tolist()) if 'Aceite Base' in df.columns else [],
            "espesantes": sorted(df['Espesante'].dropna().unique().tolist()) if 'Espesante' in df.columns else [],
            "nlgi_grades": sorted([x for x in df['Grado NLGI Consistencia'].dropna().unique().tolist() if pd.notna(x)]) if 'Grado NLGI Consistencia' in df.columns else [],
        }

        return options
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Products Endpoints ====================

@app.get("/api/products")
def get_products(limit: int = 100, offset: int = 0):
    """Obtiene lista de productos Interlub."""
    try:
        rec = get_recomendador_normal()
        df = rec.df.copy()

        # Paginar
        df_page = df.iloc[offset:offset + limit]

        products = []
        for _, row in df_page.iterrows():
            product = {
                "id": sanitize_value(row.get('codigoGrasa')),
                "nombre": sanitize_value(row.get('codigoGrasa')),
                "aceite_base": sanitize_value(row.get('Aceite Base')),
                "espesante": sanitize_value(row.get('Espesante')),
                "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                "temp_min": sanitize_numeric(row.get('temp_min')),
                "temp_max": sanitize_numeric(row.get('temp_max')),
                "punto_gota": sanitize_numeric(row.get('punto_gota')),
                "penetracion": sanitize_numeric(row.get('penetracion')),
                "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                "carga_timken": sanitize_numeric(row.get('carga_timken')),
                "descripcion": sanitize_value(row.get('descripcion')),
                "aplicaciones": sanitize_value(row.get('aplicaciones')),
                "beneficios": sanitize_value(row.get('beneficios')),
                "color": sanitize_value(row.get('color')),
                "textura": sanitize_value(row.get('textura')),
            }
            products.append(product)

        return {
            "total": len(df),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/products/count")
def get_products_count():
    """Obtiene el conteo de productos."""
    try:
        rec = get_recomendador_normal()
        return {"count": len(rec.df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: str):
    """Obtiene un producto por su código."""
    try:
        rec = get_recomendador_normal()
        df = rec.df[rec.df['codigoGrasa'] == product_id]

        if df.empty:
            raise HTTPException(status_code=404, detail=f"Producto '{product_id}' no encontrado")

        row = df.iloc[0]

        return {
            "id": sanitize_value(row.get('codigoGrasa')),
            "nombre": sanitize_value(row.get('codigoGrasa')),
            "aceite_base": sanitize_value(row.get('Aceite Base')),
            "espesante": sanitize_value(row.get('Espesante')),
            "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
            "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
            "temp_min": sanitize_numeric(row.get('temp_min')),
            "temp_max": sanitize_numeric(row.get('temp_max')),
            "punto_gota": sanitize_numeric(row.get('punto_gota')),
            "penetracion": sanitize_numeric(row.get('penetracion')),
            "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
            "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
            "carga_timken": sanitize_numeric(row.get('carga_timken')),
            "descripcion": sanitize_value(row.get('descripcion')),
            "subtitulo": sanitize_value(row.get('subtitulo')),
            "aplicaciones": sanitize_value(row.get('aplicaciones')),
            "beneficios": sanitize_value(row.get('beneficios')),
            "color": sanitize_value(row.get('color')),
            "textura": sanitize_value(row.get('textura')),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Recommendation Endpoints ====================

@app.get("/api/recommend/by-popularity")
def recommend_by_popularity(top_n: int = 10, filtro_categoria: Optional[str] = None):
    """Recomienda productos por popularidad (completitud de datos)."""
    try:
        rec = get_recomendador_normal()

        result = rec.recomendar_por_popularidad(top_n=top_n, filtro_categoria=filtro_categoria)

        if result.empty:
            return {"recommendations": [], "count": 0}

        recommendations = []
        for _, filtered_row in result.iterrows():
            codigo = filtered_row.get('codigoGrasa')
            # Buscar datos completos en el DataFrame original
            full_data = rec.df[rec.df['codigoGrasa'] == codigo]
            if full_data.empty:
                continue
            row = full_data.iloc[0]

            # score_completitud indica qué tan completos son los datos
            score_completitud = sanitize_numeric(filtered_row.get('score_completitud')) or 0
            # Normalizar a 0-1
            max_possible = 10  # máximo de columnas principales
            similarity = min(score_completitud / max_possible, 1.0)

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                    "subtitulo": sanitize_value(row.get('subtitulo')),
                    "descripcion": sanitize_value(row.get('descripcion')),
                },
                "similarity_score": similarity,
                "matched_features": ["data_completeness"]
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/by-characteristics")
def recommend_by_characteristics(query: RecommendationQuery):
    """Recomienda productos por características."""
    try:
        rec = get_recomendador_normal()

        result = rec.buscar_por_caracteristicas(
            aceite_base=query.aceite_base,
            espesante=query.espesante,
            temp_min=query.temp_min,
            temp_max=query.temp_max,
            top_n=query.top_k
        )

        if result.empty:
            return {"recommendations": [], "count": 0}

        recommendations = []
        # El resultado de buscar_por_caracteristicas solo tiene columnas limitadas
        # Necesitamos buscar los datos completos en el DataFrame original
        for _, filtered_row in result.iterrows():
            codigo = filtered_row.get('codigoGrasa')
            # Buscar datos completos en el DataFrame original
            full_data = rec.df[rec.df['codigoGrasa'] == codigo]
            if full_data.empty:
                continue
            row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                    "subtitulo": sanitize_value(row.get('subtitulo')),
                    "descripcion": sanitize_value(row.get('descripcion')),
                    "aplicaciones": sanitize_value(row.get('aplicaciones')),
                    "beneficios": sanitize_value(row.get('beneficios')),
                    "color": sanitize_value(row.get('color')),
                    "textura": sanitize_value(row.get('textura')),
                },
                "similarity_score": 1.0,  # Es un filtro, no similitud real
                "matched_features": []
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/by-content")
def recommend_by_content(query: ContentBasedQuery):
    """Recomienda productos similares basado en contenido (TF-IDF)."""
    try:
        rec = get_recomendador_normal()

        result = rec.recomendar_por_contenido(query.codigo_grasa, top_n=query.top_k)

        if result.empty:
            raise HTTPException(status_code=404, detail=f"Producto '{query.codigo_grasa}' no encontrado")

        recommendations = []
        for _, filtered_row in result.iterrows():
            similarity = sanitize_numeric(filtered_row.get('similitud'))
            codigo = filtered_row.get('codigoGrasa')

            # Buscar datos completos en el DataFrame original
            full_data = rec.df[rec.df['codigoGrasa'] == codigo]
            if full_data.empty:
                continue
            row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                    "subtitulo": sanitize_value(row.get('subtitulo')),
                    "descripcion": sanitize_value(row.get('descripcion')),
                },
                "similarity_score": similarity if similarity is not None else 0.0,
                "matched_features": []
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/by-range")
def recommend_by_range(query: RangeQuery):
    """Recomienda productos dentro de un rango de una propiedad."""
    try:
        rec = get_recomendador_normal()

        result = rec.recomendar_por_rango(
            query.columna,
            query.valor_min,
            query.valor_max,
            top_n=query.top_k
        )

        if result.empty:
            return {"recommendations": [], "count": 0}

        recommendations = []
        for _, filtered_row in result.iterrows():
            dist_centro = sanitize_numeric(filtered_row.get('dist_centro')) or 0
            codigo = filtered_row.get('codigoGrasa')

            # Buscar datos completos en el DataFrame original
            full_data = rec.df[rec.df['codigoGrasa'] == codigo]
            if full_data.empty:
                continue
            row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                },
                "similarity_score": 1.0 - (dist_centro / 1000),  # Normalizar
                "matched_features": [query.columna]
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/hybrid")
def recommend_hybrid(query: HybridQuery):
    """Recomendación híbrida: contenido + filtros numéricos."""
    try:
        rec = get_recomendador_normal()

        # Convertir filtros al formato esperado
        filtros = None
        if query.filtros:
            filtros = {k: tuple(v) for k, v in query.filtros.items()}

        result = rec.recomendar_hibrido(
            query.codigo_grasa,
            filtros_numericos=filtros,
            top_n=query.top_k
        )

        if result.empty:
            return {"recommendations": [], "count": 0}

        recommendations = []
        for _, filtered_row in result.iterrows():
            similarity = sanitize_numeric(filtered_row.get('similitud'))
            codigo = filtered_row.get('codigoGrasa')

            # Buscar datos completos en el DataFrame original
            full_data = rec.df[rec.df['codigoGrasa'] == codigo]
            if full_data.empty:
                continue
            row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                },
                "similarity_score": similarity if similarity is not None else 0.0,
                "matched_features": list(query.filtros.keys()) if query.filtros else []
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Competitive Analysis Endpoints ====================

@app.get("/api/rivals")
def get_rivals(limit: int = 100, offset: int = 0):
    """Obtiene lista de productos rivales."""
    try:
        rec = get_recomendador_competitivo()
        df = rec.df_rivales.copy()

        df_page = df.iloc[offset:offset + limit]

        products = []
        for _, row in df_page.iterrows():
            product = {
                "id": sanitize_value(row.get('codigoGrasa')),
                "nombre": sanitize_value(row.get('codigoGrasa')),
                "aceite_base": sanitize_value(row.get('Aceite Base')),
                "espesante": sanitize_value(row.get('Espesante')),
                "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                "temp_min": sanitize_numeric(row.get('temp_min')),
                "temp_max": sanitize_numeric(row.get('temp_max')),
                "punto_gota": sanitize_numeric(row.get('punto_gota')),
                "penetracion": sanitize_numeric(row.get('penetracion')),
                "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                "carga_timken": sanitize_numeric(row.get('carga_timken')),
                "descripcion": sanitize_value(row.get('descripcion')) or sanitize_value(row.get('Descripcion')),
            }
            products.append(product)

        return {
            "total": len(df),
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/rivals-similar")
def find_similar_rivals(query: ContentBasedQuery):
    """Encuentra rivales similares a un producto propio."""
    try:
        rec = get_recomendador_competitivo()

        result = rec.buscar_rivales_similares(query.codigo_grasa, top_n=query.top_k)

        if result.empty:
            raise HTTPException(status_code=404, detail=f"Producto '{query.codigo_grasa}' no encontrado")

        recommendations = []
        for _, filtered_row in result.iterrows():
            similarity = sanitize_numeric(filtered_row.get('similitud'))
            codigo = filtered_row.get('codigoGrasa')

            # Buscar datos completos en df_rivales
            full_data = rec.df_rivales[rec.df_rivales['codigoGrasa'] == codigo]
            if full_data.empty:
                # Si no está en rivales, usar los datos del resultado
                row = filtered_row
            else:
                row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                    "descripcion": sanitize_value(row.get('descripcion')) or sanitize_value(row.get('Descripcion')),
                },
                "similarity_score": similarity if similarity is not None else 0.0,
                "matched_features": [],
                "origen": "rival"
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/find-competitor")
def find_direct_competitor(query: ContentBasedQuery):
    """Encuentra el mejor producto propio para competir contra un rival."""
    try:
        rec = get_recomendador_competitivo()

        result = rec.encontrar_competidor_directo(query.codigo_grasa)

        if result.empty:
            raise HTTPException(status_code=404, detail=f"Rival '{query.codigo_grasa}' no encontrado")

        recommendations = []
        for _, filtered_row in result.iterrows():
            match_score = sanitize_numeric(filtered_row.get('match_score'))
            codigo = filtered_row.get('codigoGrasa')

            # Buscar datos completos en df_propios
            full_data = rec.df_propios[rec.df_propios['codigoGrasa'] == codigo]
            if full_data.empty:
                row = filtered_row
            else:
                row = full_data.iloc[0]

            rec_item = {
                "product": {
                    "id": sanitize_value(row.get('codigoGrasa')),
                    "nombre": sanitize_value(row.get('codigoGrasa')),
                    "aceite_base": sanitize_value(row.get('Aceite Base')),
                    "espesante": sanitize_value(row.get('Espesante')),
                    "nlgi_grade": sanitize_numeric(row.get('Grado NLGI Consistencia')),
                    "viscosidad_40c": sanitize_numeric(row.get('visc_40c')),
                    "temp_min": sanitize_numeric(row.get('temp_min')),
                    "temp_max": sanitize_numeric(row.get('temp_max')),
                    "punto_gota": sanitize_numeric(row.get('punto_gota')),
                    "penetracion": sanitize_numeric(row.get('penetracion')),
                    "soldadura_4bolas": sanitize_numeric(row.get('soldadura_4bolas')),
                    "desgaste_4bolas": sanitize_numeric(row.get('desgaste_4bolas')),
                    "carga_timken": sanitize_numeric(row.get('carga_timken')),
                    "subtitulo": sanitize_value(row.get('subtitulo')),
                    "descripcion": sanitize_value(row.get('descripcion')),
                },
                "similarity_score": match_score if match_score is not None else 0.0,
                "matched_features": [],
                "origen": "propio"
            }
            recommendations.append(rec_item)

        return {"recommendations": recommendations, "count": len(recommendations)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend/compare")
def compare_products(query: CompareQuery):
    """Compara un producto propio con un rival."""
    try:
        rec = get_recomendador_competitivo()

        # Obtener datos
        if query.codigo_propio not in rec.df_propios['codigoGrasa'].values:
            raise HTTPException(status_code=404, detail=f"Producto propio '{query.codigo_propio}' no encontrado")

        if query.codigo_rival not in rec.df_rivales['codigoGrasa'].values:
            raise HTTPException(status_code=404, detail=f"Producto rival '{query.codigo_rival}' no encontrado")

        propio = rec.df_propios[rec.df_propios['codigoGrasa'] == query.codigo_propio].iloc[0]
        rival = rec.df_rivales[rec.df_rivales['codigoGrasa'] == query.codigo_rival].iloc[0]

        # Propiedades a comparar
        propiedades = ['visc_40c', 'temp_min', 'temp_max', 'penetracion',
                      'punto_gota', 'soldadura_4bolas', 'desgaste_4bolas', 'carga_timken']

        comparaciones = []
        ventajas_propias = 0
        ventajas_rival = 0

        for prop in propiedades:
            if prop in propio and prop in rival:
                val_propio = propio[prop]
                val_rival = rival[prop]

                if pd.notna(val_propio) and pd.notna(val_rival):
                    diferencia = float(val_propio) - float(val_rival)

                    # Determinar ventaja (depende de la propiedad)
                    # Para desgaste, menor es mejor
                    if prop == 'desgaste_4bolas':
                        ventaja = "propio" if diferencia < 0 else "rival" if diferencia > 0 else "igual"
                    else:
                        ventaja = "propio" if diferencia > 0 else "rival" if diferencia < 0 else "igual"

                    if ventaja == "propio":
                        ventajas_propias += 1
                    elif ventaja == "rival":
                        ventajas_rival += 1

                    comparaciones.append({
                        "propiedad": prop,
                        "valor_propio": float(val_propio),
                        "valor_rival": float(val_rival),
                        "diferencia": diferencia,
                        "ventaja": ventaja
                    })

        return {
            "producto_propio": {
                "id": query.codigo_propio,
                "aceite_base": propio.get('Aceite Base', ''),
                "espesante": propio.get('Espesante', ''),
            },
            "producto_rival": {
                "id": query.codigo_rival,
                "aceite_base": rival.get('Aceite Base', ''),
                "espesante": rival.get('Espesante', ''),
            },
            "comparaciones": comparaciones,
            "resumen": {
                "ventajas_propias": ventajas_propias,
                "ventajas_rival": ventajas_rival,
                "total_comparaciones": len(comparaciones)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/gap")
def gap_analysis():
    """Análisis de gaps: qué tienen los rivales que nosotros no."""
    try:
        rec = get_recomendador_competitivo()

        propiedades = ['temp_max', 'visc_40c', 'soldadura_4bolas', 'carga_timken']
        gaps = []

        for prop in propiedades:
            if prop not in rec.df_combinado.columns:
                continue

            propios_data = rec.df_combinado[
                (rec.df_combinado['origen'] == 'propio') &
                (rec.df_combinado[prop].notna())
            ][prop]

            rivales_data = rec.df_combinado[
                (rec.df_combinado['origen'] == 'rival') &
                (rec.df_combinado[prop].notna())
            ][prop]

            if len(propios_data) > 0 and len(rivales_data) > 0:
                max_propio = float(propios_data.max())
                max_rival = float(rivales_data.max())
                min_propio = float(propios_data.min())
                min_rival = float(rivales_data.min())

                if max_rival > max_propio:
                    gaps.append({
                        "propiedad": prop,
                        "tipo": "superior",
                        "valor_propio": max_propio,
                        "valor_rival": max_rival,
                        "gap": max_rival - max_propio,
                        "oportunidad": "Desarrollar productos de mayor rendimiento"
                    })

                if min_rival < min_propio:
                    gaps.append({
                        "propiedad": prop,
                        "tipo": "inferior",
                        "valor_propio": min_propio,
                        "valor_rival": min_rival,
                        "gap": min_propio - min_rival,
                        "oportunidad": "Expandir hacia aplicaciones de menor especificación"
                    })

        return {"gaps": gaps, "total": len(gaps)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/benchmarking/{propiedad}")
def benchmarking(propiedad: str):
    """Benchmarking de una propiedad: propios vs rivales."""
    try:
        rec = get_recomendador_competitivo()

        if propiedad not in rec.df_combinado.columns:
            raise HTTPException(status_code=400, detail=f"Propiedad '{propiedad}' no disponible")

        stats_propios = rec.df_combinado[
            (rec.df_combinado['origen'] == 'propio') &
            (rec.df_combinado[propiedad].notna())
        ][propiedad]

        stats_rivales = rec.df_combinado[
            (rec.df_combinado['origen'] == 'rival') &
            (rec.df_combinado[propiedad].notna())
        ][propiedad]

        result = {
            "propiedad": propiedad,
            "propios": {
                "min": float(stats_propios.min()) if len(stats_propios) > 0 else None,
                "max": float(stats_propios.max()) if len(stats_propios) > 0 else None,
                "promedio": float(stats_propios.mean()) if len(stats_propios) > 0 else None,
                "count": len(stats_propios)
            },
            "rivales": {
                "min": float(stats_rivales.min()) if len(stats_rivales) > 0 else None,
                "max": float(stats_rivales.max()) if len(stats_rivales) > 0 else None,
                "promedio": float(stats_rivales.mean()) if len(stats_rivales) > 0 else None,
                "count": len(stats_rivales)
            }
        }

        # Análisis
        if len(stats_propios) > 0 and len(stats_rivales) > 0:
            result["analisis"] = {
                "mejor_max": "propios" if stats_propios.max() > stats_rivales.max() else "rivales",
                "mejor_promedio": "propios" if stats_propios.mean() > stats_rivales.mean() else "rivales"
            }

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/competitive-matrix")
def competitive_matrix():
    """Matriz competitiva: posicionamiento de productos propios vs rivales."""
    try:
        rec = get_recomendador_competitivo()

        # Obtener productos propios y rivales
        productos_propios = rec.df_propios['codigoGrasa'].tolist()[:20]  # Limitar a 20
        productos_rivales = rec.df_rivales['codigoGrasa'].tolist()[:20]

        matriz = []
        mejor_matchup = None
        mejor_similitud = 0
        total_similitud = 0
        total_comparaciones = 0

        # Para cada producto propio, encontrar similitud con rivales
        for codigo_propio in productos_propios:
            try:
                similares = rec.buscar_rivales_similares(codigo_propio, top_n=5)
                if not similares.empty:
                    for _, row in similares.iterrows():
                        codigo_rival = row.get('codigoGrasa', '')
                        similitud = float(row.get('similitud', 0))

                        matriz.append({
                            "propio": codigo_propio,
                            "rival": codigo_rival,
                            "similitud": similitud,
                            "ventajas_propio": 0,  # Se calcularía con comparar_con_rival
                            "ventajas_rival": 0
                        })

                        total_similitud += similitud
                        total_comparaciones += 1

                        if similitud > mejor_similitud:
                            mejor_similitud = similitud
                            mejor_matchup = {
                                "propio": codigo_propio,
                                "rival": codigo_rival,
                                "similitud": similitud
                            }
            except Exception:
                continue

        promedio_similitud = total_similitud / total_comparaciones if total_comparaciones > 0 else 0

        return {
            "matriz": matriz,
            "productos_propios": productos_propios,
            "productos_rivales": productos_rivales,
            "resumen": {
                "total_comparaciones": total_comparaciones,
                "promedio_similitud": round(promedio_similitud, 4),
                "mejor_matchup": mejor_matchup
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Regression Endpoints ====================

@app.get("/api/regression/features")
def get_regression_features():
    """Obtiene las features disponibles para regresion con sus estadisticas."""
    try:
        reg = get_regresor()
        features = reg.obtener_features_disponibles()
        return {
            "features": features,
            "total": len(features)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/regression/correlation")
def get_correlation_matrix():
    """Obtiene la matriz de correlacion de las variables numericas."""
    try:
        reg = get_regresor()
        correlation = reg.obtener_matriz_correlacion()
        return correlation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/regression/correlated-variables")
def get_correlated_variables(umbral: float = 0.3):
    """Obtiene predictores correlacionados para cada variable objetivo."""
    try:
        reg = get_regresor()
        reg.umbral = umbral
        predictores_dic, corrs_dic = reg.variables_correlacionadas()

        result = []
        for variable, predictores in predictores_dic.items():
            correlaciones = corrs_dic.get(variable, {})
            result.append({
                "variable": variable,
                "variable_display": reg.COLUMN_MAPPING_INVERSE.get(variable, variable),
                "predictores": [
                    {
                        "name": p,
                        "display": reg.COLUMN_MAPPING_INVERSE.get(p, p),
                        "correlation": correlaciones.get(p, 0)
                    }
                    for p in predictores
                ]
            })

        return {
            "umbral": umbral,
            "variables": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/regression/train")
def train_regression_model(query: RegressionTrainQuery):
    """Entrena un modelo de regresion lineal."""
    try:
        reg = get_regresor()
        result = reg.entrenar_modelo(
            variable_objetivo=query.target_variable,
            predictores=query.predictor_features,
            test_size=query.test_size_percent / 100.0
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/regression/train-all")
def train_all_regression_models():
    """Entrena modelos finales para todas las variables objetivo."""
    try:
        reg = get_regresor()
        result = reg.entrenar_modelos_finales()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/regression/predict")
def predict_value(query: RegressionPredictQuery):
    """Hace una prediccion usando un modelo entrenado."""
    try:
        reg = get_regresor()
        result = reg.predecir(
            variable_objetivo=query.target_variable,
            entrada=query.input_features
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/regression/recommend")
def regression_recommendation(query: RegressionRecommendQuery):
    """Recomienda grasas usando regresion y distancia euclidea."""
    try:
        reg = get_regresor()
        result = reg.regresor_recomendacion(
            entrada_usuario=query.input_features,
            variables_similitud=query.variables_similitud,
            top_k=query.top_k
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/regression/build-vector")
def build_target_vector(query: RegressionRecommendQuery):
    """Construye un vector objetivo completando valores faltantes con predicciones."""
    try:
        reg = get_regresor()
        vector = reg.construir_vector_objetivo(
            entrada_usuario=query.input_features,
            variables_a_predecir=query.variables_similitud
        )

        return {
            "input": query.input_features,
            "vector_completo": {k: round(v, 4) for k, v in vector.items()},
            "variables_predichas": [k for k in vector.keys() if k not in query.input_features]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Clustering Endpoints ====================

@app.get("/api/clustering/variables")
def get_clustering_variables():
    """Gets available variables for clustering with their statistics."""
    try:
        cluster = get_clusterizador()
        variables = cluster.obtener_variables_disponibles()
        return {
            "variables": variables,
            "total": len(variables),
            "default_variables": cluster.DEFAULT_CLUSTER_VARIABLES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clustering/correlation")
def get_clustering_correlation(variables: Optional[str] = None):
    """Gets correlation matrix for clustering variables."""
    try:
        cluster = get_clusterizador()
        var_list = variables.split(',') if variables else None
        result = cluster.obtener_matriz_correlacion(var_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clustering/elbow")
def get_elbow_data(max_clusters: int = 10, variables: Optional[str] = None):
    """Calculates elbow method data for optimal k selection."""
    try:
        cluster = get_clusterizador()
        var_list = variables.split(',') if variables else None
        if var_list:
            cluster.preparar_datos(var_list)
        else:
            cluster.preparar_datos()
        result = cluster.calcular_elbow(max_clusters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/clustering/train")
def train_clustering_model(query: ClusterTrainQuery):
    """Trains a K-Means clustering model."""
    try:
        cluster = get_clusterizador()
        result = cluster.entrenar_modelo(
            n_clusters=query.n_clusters,
            variables=query.variables,
            escalar=query.scale
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clustering/summary")
def get_clusters_summary():
    """Gets statistical summary of all clusters."""
    try:
        cluster = get_clusterizador()
        result = cluster.resumen_clusters()
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/clustering/recommend")
def cluster_recommendation(query: ClusterRecommendQuery):
    """Recommends greases based on user input using clustering."""
    try:
        cluster = get_clusterizador()
        recommendations, user_cluster = cluster.recomendar_grasas(
            entrada_usuario=query.input_features,
            top_k=query.top_k
        )
        return {
            "recommendations": recommendations,
            "user_cluster": user_cluster,
            "count": len(recommendations),
            "variables_used": cluster.variables_cluster
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clustering/products/{cluster_id}")
def get_cluster_products(cluster_id: int, limit: int = 50):
    """Gets products belonging to a specific cluster."""
    try:
        cluster = get_clusterizador()
        products = cluster.obtener_productos_cluster(cluster_id, limit)
        return {
            "cluster_id": cluster_id,
            "products": products,
            "count": len(products)
        }
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Factor Analysis Endpoints ====================

@app.get("/api/factorial/variables")
def get_factorial_variables():
    """Gets available variables for factor analysis with their statistics."""
    try:
        fa = get_factorial()
        variables = fa.obtener_variables_disponibles()
        return {
            "variables": variables,
            "total": len(variables),
            "default_variables": fa.DEFAULT_FACTOR_VARIABLES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/factorial/correlation")
def get_factorial_correlation(variables: Optional[str] = None):
    """Gets correlation matrix for factor analysis variables."""
    try:
        fa = get_factorial()
        var_list = variables.split(',') if variables else None
        result = fa.obtener_matriz_correlacion(var_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/factorial/scree")
def get_scree_data(max_factors: int = 10, variables: Optional[str] = None):
    """Calculates scree plot data for optimal factor selection."""
    try:
        fa = get_factorial()
        var_list = variables.split(',') if variables else None
        if var_list:
            fa.preparar_datos(var_list)
        else:
            fa.preparar_datos()
        result = fa.obtener_scree_data(max_factors)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/factorial/train")
def train_factorial_model(query: FactorialTrainQuery):
    """Trains a Factor Analysis model."""
    try:
        fa = get_factorial()
        result = fa.entrenar_modelo(
            n_factores=query.n_factors,
            variables=query.variables,
            escalar=query.scale
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/factorial/loadings")
def get_factor_loadings():
    """Gets the factor loadings matrix."""
    try:
        fa = get_factorial()
        result = fa.obtener_cargas_factoriales()
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/factorial/summary")
def get_factorial_summary():
    """Gets summary of factors with interpretations."""
    try:
        fa = get_factorial()
        result = fa.obtener_resumen_factores()
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/factorial/recommend")
def factorial_recommendation(query: FactorialRecommendQuery):
    """Recommends greases based on user input using Factor Analysis."""
    try:
        fa = get_factorial()
        recommendations, user_factors = fa.recomendar_grasas(
            entrada_usuario=query.input_features,
            top_k=query.top_k
        )
        return {
            "recommendations": recommendations,
            "user_factors": user_factors,
            "count": len(recommendations),
            "variables_used": fa.variables_factor
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
