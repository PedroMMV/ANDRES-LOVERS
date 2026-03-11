"""
Clase de Clustering para Grasas Industriales
=============================================
Implementa K-Means clustering para análisis y recomendación de grasas.
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import pairwise_distances, silhouette_score
from typing import Optional, List, Dict, Any, Tuple


class ClusterGrasas:
    """
    Clustering de grasas industriales usando K-Means.
    """

    # Mapeo de columnas del CSV a nombres cortos
    COLUMN_MAPPING = {
        'Grado NLGI Consistencia': 'nlgi_grade',
        'Viscosidad del Aceite Base a 40°C. cSt': 'visc_40c',
        'Punto de Soldadura Cuatro Bolas, kgf': 'soldadura_4bolas',
        'Temperatura de Servicio °C, min': 'temp_min',
        'Temperatura de Servicio °C, max': 'temp_max',
        'Penetracion de Cono a 25 °C 0.1mm min': 'penetracion_min',
        'Penetracion de Cono a 25 °C 0.1mm max': 'penetracion_max',
        'Punto de Gota °C': 'punto_gota',
        'Desgaste Cuatro Bolas, mm': 'desgaste_4bolas',
        'Carga Timken Ok, lb': 'carga_timken',
        'Penetración de Cono a 25°C, 0.1mm': 'penetracion',
    }

    # Mapeo inverso para display
    COLUMN_MAPPING_INVERSE = {v: k for k, v in COLUMN_MAPPING.items()}

    # Variables por defecto para clustering
    DEFAULT_CLUSTER_VARIABLES = [
        'nlgi_grade', 'visc_40c', 'soldadura_4bolas',
        'temp_min', 'temp_max', 'punto_gota', 'penetracion',
        'desgaste_4bolas', 'carga_timken'
    ]

    def __init__(self, csv_path: str):
        """
        Inicializa el clusterizador con datos del CSV.

        Args:
            csv_path: Ruta al archivo CSV con datos de grasas.
        """
        self.csv_path = csv_path
        self.df = self._cargar_datos()
        self.scaler: Optional[StandardScaler] = None
        self.modelo: Optional[KMeans] = None
        self.X: Optional[np.ndarray] = None
        self.X_scaled: Optional[np.ndarray] = None
        self.labels_: Optional[np.ndarray] = None
        self.variables_cluster: List[str] = []
        self.n_clusters: int = 5
        self.valid_indices: Optional[np.ndarray] = None

    def _cargar_datos(self) -> pd.DataFrame:
        """Carga y preprocesa el CSV."""
        df = pd.read_csv(self.csv_path, encoding='utf-8-sig')

        # Renombrar columnas usando el mapeo
        for original, nuevo in self.COLUMN_MAPPING.items():
            if original in df.columns and nuevo not in df.columns:
                df[nuevo] = df[original]

        return df

    def obtener_variables_disponibles(self) -> List[Dict[str, Any]]:
        """
        Obtiene las variables numéricas disponibles para clustering.

        Returns:
            Lista de diccionarios con info de cada variable.
        """
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()

        # Filtrar columnas útiles (excluir IDs y similares)
        exclude = ['id', 'index', 'Unnamed']
        variables = []

        for col in numeric_cols:
            if not any(exc.lower() in col.lower() for exc in exclude):
                non_null = self.df[col].notna().sum()
                variables.append({
                    'name': col,
                    'display': self.COLUMN_MAPPING_INVERSE.get(col, col),
                    'non_null_count': int(non_null),
                    'missing_percentage': round((1 - non_null/len(self.df)) * 100, 2),
                    'min': float(self.df[col].min()) if non_null > 0 else None,
                    'max': float(self.df[col].max()) if non_null > 0 else None,
                    'mean': round(float(self.df[col].mean()), 2) if non_null > 0 else None
                })

        return variables

    def obtener_matriz_correlacion(self, variables: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Calcula la matriz de correlación entre variables.

        Args:
            variables: Lista de variables a incluir. Si None, usa las por defecto.

        Returns:
            Diccionario con la matriz y variables.
        """
        if variables is None:
            variables = [v for v in self.DEFAULT_CLUSTER_VARIABLES if v in self.df.columns]

        # Filtrar variables que existen
        variables = [v for v in variables if v in self.df.columns]

        if not variables:
            return {'matrix': [], 'variables': [], 'error': 'No valid variables found'}

        df_vars = self.df[variables].dropna()
        corr = df_vars.corr()

        # Convertir a formato serializable
        matrix = []
        for i, var1 in enumerate(variables):
            row = []
            for j, var2 in enumerate(variables):
                val = corr.loc[var1, var2]
                row.append(round(float(val), 4) if pd.notna(val) else 0)
            matrix.append(row)

        return {
            'matrix': matrix,
            'variables': variables,
            'variables_display': [self.COLUMN_MAPPING_INVERSE.get(v, v) for v in variables]
        }

    def preparar_datos(
        self,
        variables: Optional[List[str]] = None,
        escalar: bool = True
    ) -> Dict[str, Any]:
        """
        Prepara los datos para clustering.

        Args:
            variables: Variables a usar. Si None, usa las por defecto.
            escalar: Si True, aplica StandardScaler.

        Returns:
            Info sobre los datos preparados.
        """
        if variables is None:
            variables = [v for v in self.DEFAULT_CLUSTER_VARIABLES if v in self.df.columns]

        self.variables_cluster = [v for v in variables if v in self.df.columns]

        if not self.variables_cluster:
            raise ValueError("No valid clustering variables found")

        # Obtener datos y eliminar NaN
        df_vars = self.df[self.variables_cluster].copy()
        valid_mask = df_vars.notna().all(axis=1)
        self.valid_indices = np.where(valid_mask)[0]

        df_clean = df_vars.loc[valid_mask]
        self.X = df_clean.values

        if escalar:
            self.scaler = StandardScaler()
            self.X_scaled = self.scaler.fit_transform(self.X)
        else:
            self.scaler = None
            self.X_scaled = self.X.copy()

        return {
            'total_records': len(self.df),
            'valid_records': len(self.valid_indices),
            'removed_records': len(self.df) - len(self.valid_indices),
            'variables_used': self.variables_cluster,
            'scaled': escalar
        }

    def entrenar_modelo(
        self,
        n_clusters: int = 5,
        variables: Optional[List[str]] = None,
        escalar: bool = True
    ) -> Dict[str, Any]:
        """
        Entrena el modelo K-Means.

        Args:
            n_clusters: Número de clusters.
            variables: Variables para clustering.
            escalar: Si True, aplica StandardScaler.

        Returns:
            Métricas y resultados del entrenamiento.
        """
        self.n_clusters = n_clusters

        # Preparar datos si no están listos
        if self.X_scaled is None or variables is not None:
            self.preparar_datos(variables, escalar)

        # Entrenar K-Means
        self.modelo = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init='auto'
        )
        self.labels_ = self.modelo.fit_predict(self.X_scaled)

        # Asignar clusters al DataFrame
        self.df['cluster'] = -1  # Default para registros sin cluster
        self.df.loc[self.df.index[self.valid_indices], 'cluster'] = self.labels_

        # Calcular métricas
        inertia = float(self.modelo.inertia_)

        # Silhouette score (solo si hay más de 1 cluster)
        silhouette = None
        if n_clusters > 1 and len(self.X_scaled) > n_clusters:
            silhouette = float(silhouette_score(self.X_scaled, self.labels_))

        # Conteo por cluster
        unique, counts = np.unique(self.labels_, return_counts=True)
        cluster_counts = {int(c): int(n) for c, n in zip(unique, counts)}

        return {
            'n_clusters': n_clusters,
            'inertia': round(inertia, 4),
            'silhouette_score': round(silhouette, 4) if silhouette else None,
            'cluster_counts': cluster_counts,
            'total_clustered': int(len(self.labels_)),
            'variables_used': self.variables_cluster
        }

    def calcular_elbow(self, max_clusters: int = 10) -> Dict[str, Any]:
        """
        Calcula datos para el método del codo.

        Args:
            max_clusters: Número máximo de clusters a probar.

        Returns:
            Datos de inertia y silhouette por número de clusters.
        """
        if self.X_scaled is None:
            self.preparar_datos()

        results = []
        max_k = min(max_clusters, len(self.X_scaled) - 1)

        for k in range(2, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
            labels = kmeans.fit_predict(self.X_scaled)

            inertia = float(kmeans.inertia_)
            silhouette = float(silhouette_score(self.X_scaled, labels))

            results.append({
                'k': k,
                'inertia': round(inertia, 4),
                'silhouette': round(silhouette, 4)
            })

        # Encontrar k óptimo (mayor silhouette)
        optimal_k = max(results, key=lambda x: x['silhouette'])['k']

        return {
            'results': results,
            'optimal_k': optimal_k,
            'max_tested': max_k
        }

    def resumen_clusters(self) -> Dict[str, Any]:
        """
        Genera resumen estadístico de cada cluster.

        Returns:
            Estadísticas por cluster.
        """
        if self.labels_ is None:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        # Filtrar solo registros con cluster asignado
        df_clustered = self.df[self.df['cluster'] >= 0].copy()

        clusters_summary = []

        for cluster_id in sorted(df_clustered['cluster'].unique()):
            cluster_data = df_clustered[df_clustered['cluster'] == cluster_id]

            stats = {
                'cluster_id': int(cluster_id),
                'count': len(cluster_data),
                'variables': {}
            }

            for var in self.variables_cluster:
                if var in cluster_data.columns:
                    values = cluster_data[var].dropna()
                    if len(values) > 0:
                        stats['variables'][var] = {
                            'mean': round(float(values.mean()), 2),
                            'min': round(float(values.min()), 2),
                            'max': round(float(values.max()), 2),
                            'std': round(float(values.std()), 2) if len(values) > 1 else 0
                        }

            clusters_summary.append(stats)

        return {
            'clusters': clusters_summary,
            'total_clusters': len(clusters_summary),
            'variables_analyzed': self.variables_cluster
        }

    def recomendar_grasas(
        self,
        entrada_usuario: Dict[str, float],
        top_k: int = 5
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Recomienda grasas similares basado en características del usuario.

        Args:
            entrada_usuario: Diccionario con valores para cada variable de clustering.
            top_k: Número de recomendaciones.

        Returns:
            Tupla (lista de recomendaciones, cluster asignado al usuario).
        """
        if self.modelo is None or self.X_scaled is None:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        # Verificar que tenemos todas las variables necesarias
        missing_vars = [v for v in self.variables_cluster if v not in entrada_usuario]
        if missing_vars:
            raise ValueError(f"Missing variables: {missing_vars}")

        # Construir vector del usuario
        v_usuario = np.array([[entrada_usuario[var] for var in self.variables_cluster]])

        # Escalar
        if self.scaler is not None:
            v_usuario_scaled = self.scaler.transform(v_usuario)
        else:
            v_usuario_scaled = v_usuario

        # Predecir cluster
        cluster_usuario = int(self.modelo.predict(v_usuario_scaled)[0])

        # Filtrar grasas del mismo cluster
        mask_cluster = (self.labels_ == cluster_usuario)
        indices_cluster = np.where(mask_cluster)[0]
        X_cluster_scaled = self.X_scaled[indices_cluster]

        # Calcular distancias
        dists = pairwise_distances(v_usuario_scaled, X_cluster_scaled, metric='euclidean')[0]

        # Ordenar por distancia
        orden = np.argsort(dists)[:top_k]
        idx_recomendadas = indices_cluster[orden]

        # Construir recomendaciones
        recommendations = []

        for rank, (idx, dist_idx) in enumerate(zip(idx_recomendadas, orden)):
            # Obtener índice original en el DataFrame
            original_idx = self.valid_indices[idx]
            row = self.df.iloc[original_idx]

            distance = float(dists[dist_idx])
            similarity = 1 / (1 + distance)

            rec = {
                'rank': rank + 1,
                'product': {
                    'id': str(row.get('codigoGrasa', row.get('idGrasas', f'GRASA-{original_idx}'))),
                    'nombre': str(row.get('codigoGrasa', row.get('idGrasas', f'GRASA-{original_idx}'))),
                    'aceite_base': str(row.get('Aceite Base', '')) if pd.notna(row.get('Aceite Base')) else '',
                    'espesante': str(row.get('Espesante', '')) if pd.notna(row.get('Espesante')) else '',
                    'descripcion': str(row.get('descripcion', '')) if pd.notna(row.get('descripcion')) else '',
                    'aplicaciones': str(row.get('aplicaciones', '')) if pd.notna(row.get('aplicaciones')) else '',
                    'beneficios': str(row.get('beneficios', '')) if pd.notna(row.get('beneficios')) else '',
                },
                'cluster': int(self.labels_[idx]),
                'distance': round(distance, 4),
                'similarity_score': round(similarity, 4),
                'similarity_percentage': round(similarity * 100, 1),
                'feature_values': {
                    var: round(float(row[var]), 2) if pd.notna(row.get(var)) else None
                    for var in self.variables_cluster
                }
            }
            recommendations.append(rec)

        return recommendations, cluster_usuario

    def obtener_productos_cluster(self, cluster_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Obtiene productos de un cluster específico.

        Args:
            cluster_id: ID del cluster.
            limit: Máximo de productos a retornar.

        Returns:
            Lista de productos del cluster.
        """
        if 'cluster' not in self.df.columns:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        df_cluster = self.df[self.df['cluster'] == cluster_id].head(limit)

        products = []
        for _, row in df_cluster.iterrows():
            product = {
                'id': str(row.get('codigoGrasa', row.get('idGrasas', ''))),
                'nombre': str(row.get('codigoGrasa', row.get('idGrasas', ''))),
                'aceite_base': str(row.get('Aceite Base', '')) if pd.notna(row.get('Aceite Base')) else '',
                'espesante': str(row.get('Espesante', '')) if pd.notna(row.get('Espesante')) else '',
                'cluster': int(cluster_id),
                'feature_values': {
                    var: round(float(row[var]), 2) if pd.notna(row.get(var)) else None
                    for var in self.variables_cluster if var in self.df.columns
                }
            }
            products.append(product)

        return products
