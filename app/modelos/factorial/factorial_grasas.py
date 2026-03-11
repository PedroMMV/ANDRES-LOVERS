"""
Factor Analysis for Grease Recommendation
==========================================
Implements Factor Analysis-based recommendation system for industrial greases.
Uses dimensionality reduction to identify patterns in grease properties.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import FactorAnalysis
from sklearn.metrics import pairwise_distances


# Column mapping for display names
COLUMN_MAPPING = {
    'Grado NLGI Consistencia': 'nlgi_grade',
    'Viscosidad del Aceite Base a 40 °C': 'visc_40c',
    'Punto de Soldadura Cuatro Bolas, kgf': 'soldadura_4bolas',
    'Temperatura de Servicio °C, min': 'temp_min',
    'Temperatura de Servicio °C, max': 'temp_max',
    'Penetracion de Cono a 25 °C 0.1mm': 'penetracion',
    'Punto de Gota °C': 'punto_gota',
    'Desgaste Cuatro Bolas': 'desgaste_4bolas',
    'Carga Timken': 'carga_timken',
}

COLUMN_MAPPING_INVERSE = {v: k for k, v in COLUMN_MAPPING.items()}

# Default variables for factor analysis
DEFAULT_FACTOR_VARIABLES = [
    'nlgi_grade',
    'visc_40c',
    'soldadura_4bolas',
    'temp_min',
    'temp_max',
    'penetracion',
    'punto_gota',
]


class FactorialGrasas:
    """
    Factor Analysis-based recommendation system for industrial greases.
    """

    COLUMN_MAPPING = COLUMN_MAPPING
    COLUMN_MAPPING_INVERSE = COLUMN_MAPPING_INVERSE
    DEFAULT_FACTOR_VARIABLES = DEFAULT_FACTOR_VARIABLES

    def __init__(self, ruta_csv: str):
        """
        Initialize the Factor Analysis recommender.

        Args:
            ruta_csv: Path to the CSV file with grease data
        """
        self.ruta_csv = ruta_csv
        self.df = self._cargar_datos()

        # Model state
        self.variables_factor: List[str] = []
        self.n_factores: int = 3
        self.scaler: Optional[StandardScaler] = None
        self.modelo: Optional[FactorAnalysis] = None
        self.scores_: Optional[pd.DataFrame] = None
        self.X_scaled: Optional[np.ndarray] = None

        # For percentage score calculation
        self.var_min_: Optional[pd.Series] = None
        self.var_max_: Optional[pd.Series] = None

    def _cargar_datos(self) -> pd.DataFrame:
        """Load and prepare the dataset."""
        try:
            df = pd.read_csv(self.ruta_csv, encoding='utf-8-sig')
        except UnicodeDecodeError:
            df = pd.read_csv(self.ruta_csv, encoding='latin1')

        # Standardize column names using mapping
        for old_name, new_name in COLUMN_MAPPING.items():
            if old_name in df.columns and new_name not in df.columns:
                df[new_name] = df[old_name]

        return df

    def obtener_variables_disponibles(self) -> List[Dict[str, Any]]:
        """Get available numeric variables with their statistics."""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()

        # Filter out non-feature columns
        exclude_cols = ['id', 'index', 'Unnamed']
        numeric_cols = [c for c in numeric_cols
                       if not any(ex.lower() in c.lower() for ex in exclude_cols)]

        variables = []
        for col in numeric_cols:
            col_data = self.df[col].dropna()
            variables.append({
                'name': col,
                'display': self.COLUMN_MAPPING_INVERSE.get(col, col),
                'non_null_count': int(col_data.count()),
                'missing_percentage': round((self.df[col].isna().sum() / len(self.df)) * 100, 2),
                'min': float(col_data.min()) if len(col_data) > 0 else None,
                'max': float(col_data.max()) if len(col_data) > 0 else None,
                'mean': float(col_data.mean()) if len(col_data) > 0 else None,
            })

        return variables

    def obtener_matriz_correlacion(self, variables: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get correlation matrix for selected variables."""
        if variables is None:
            variables = self.DEFAULT_FACTOR_VARIABLES

        # Filter to available variables
        available = [v for v in variables if v in self.df.columns]

        if len(available) < 2:
            return {'error': 'Need at least 2 valid variables'}

        # Calculate correlation matrix
        df_subset = self.df[available].dropna()
        corr_matrix = df_subset.corr()

        return {
            'matrix': corr_matrix.values.tolist(),
            'variables': available,
            'variables_display': [self.COLUMN_MAPPING_INVERSE.get(v, v) for v in available],
        }

    def preparar_datos(self, variables: Optional[List[str]] = None, escalar: bool = True):
        """
        Prepare data for factor analysis.

        Args:
            variables: List of variable names to use
            escalar: Whether to standardize the data
        """
        if variables is None:
            variables = self.DEFAULT_FACTOR_VARIABLES

        # Filter to available variables
        self.variables_factor = [v for v in variables if v in self.df.columns]

        if len(self.variables_factor) < 2:
            raise ValueError("Need at least 2 valid variables for factor analysis")

        # Extract and clean data
        df_vars = self.df[self.variables_factor].copy().dropna()

        # Update main dataframe to match
        self.df = self.df.loc[df_vars.index].reset_index(drop=True)
        df_vars = df_vars.reset_index(drop=True)

        # Store min/max for percentage scoring
        self.var_min_ = df_vars.min()
        self.var_max_ = df_vars.max()

        X = df_vars.values

        if escalar:
            self.scaler = StandardScaler()
            self.X_scaled = self.scaler.fit_transform(X)
        else:
            self.scaler = None
            self.X_scaled = X

    def entrenar_modelo(
        self,
        n_factores: int = 3,
        variables: Optional[List[str]] = None,
        escalar: bool = True
    ) -> Dict[str, Any]:
        """
        Train the Factor Analysis model.

        Args:
            n_factores: Number of factors to extract
            variables: List of variables to use
            escalar: Whether to standardize data

        Returns:
            Dictionary with training results
        """
        self.n_factores = n_factores
        self.preparar_datos(variables, escalar)

        # Ensure n_factores doesn't exceed number of variables
        max_factors = min(n_factores, len(self.variables_factor))

        # Train Factor Analysis model
        self.modelo = FactorAnalysis(
            n_components=max_factors,
            random_state=42
        )
        scores = self.modelo.fit_transform(self.X_scaled)

        # Store factor scores
        self.scores_ = pd.DataFrame(
            scores,
            columns=[f"Factor_{i+1}" for i in range(max_factors)]
        )

        # Calculate explained variance
        total_var = np.var(self.X_scaled, axis=0).sum()
        explained_var = np.var(scores, axis=0)
        explained_var_ratio = explained_var / total_var
        cumulative_var_ratio = np.cumsum(explained_var_ratio)

        # Get factor loadings
        loadings = self.modelo.components_.T  # (n_features, n_factors)

        return {
            'n_factors': int(max_factors),
            'n_samples': int(len(self.df)),
            'variables_used': self.variables_factor,
            'explained_variance_ratio': [float(x) for x in explained_var_ratio],
            'cumulative_variance_ratio': [float(x) for x in cumulative_var_ratio],
            'total_variance_explained': float(cumulative_var_ratio[-1]) if len(cumulative_var_ratio) > 0 else 0,
            'loadings': {
                'matrix': [[float(x) for x in row] for row in loadings],
                'variables': self.variables_factor,
                'factors': [f"Factor_{i+1}" for i in range(max_factors)],
            },
        }

    def obtener_cargas_factoriales(self) -> Dict[str, Any]:
        """Get the factor loadings matrix."""
        if self.modelo is None:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        loadings = self.modelo.components_.T

        # Format loadings by variable
        loadings_by_var = []
        for i, var in enumerate(self.variables_factor):
            var_loadings = {
                'variable': var,
                'display': self.COLUMN_MAPPING_INVERSE.get(var, var),
            }
            for j in range(loadings.shape[1]):
                var_loadings[f'Factor_{j+1}'] = float(loadings[i, j])
            loadings_by_var.append(var_loadings)

        return {
            'loadings': loadings_by_var,
            'n_factors': int(self.n_factores),
            'variables': self.variables_factor,
        }

    def _score_porcentaje(self, entrada_usuario: Dict[str, float], fila_grasa: pd.Series) -> float:
        """
        Calculate percentage similarity between user input and a grease.

        Args:
            entrada_usuario: User's desired values
            fila_grasa: Row from the grease dataset

        Returns:
            Similarity score (0-100)
        """
        scores_var = []

        for col in self.variables_factor:
            if col not in entrada_usuario:
                continue

            rango = self.var_max_[col] - self.var_min_[col]
            if rango <= 0:
                continue

            diff = abs(fila_grasa[col] - entrada_usuario[col])
            frac = diff / rango
            score_var = max(0.0, 1.0 - frac) * 100.0
            scores_var.append(score_var)

        if len(scores_var) == 0:
            return 0.0

        return float(np.mean(scores_var))

    def recomendar_grasas(
        self,
        entrada_usuario: Dict[str, float],
        top_k: int = 5
    ) -> Tuple[List[Dict[str, Any]], Dict[str, float]]:
        """
        Recommend greases based on user input using Factor Analysis.

        Args:
            entrada_usuario: User's desired values for variables
            top_k: Number of recommendations to return

        Returns:
            Tuple of (list of recommendations, user's factor scores)
        """
        if self.modelo is None or self.X_scaled is None:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        # Validate user input
        missing_vars = [v for v in self.variables_factor if v not in entrada_usuario]
        if missing_vars:
            raise ValueError(f"Missing variables in input: {missing_vars}")

        # Create user vector
        v_user = np.array([[entrada_usuario[col] for col in self.variables_factor]])

        # Scale user input
        if self.scaler:
            v_user_scaled = self.scaler.transform(v_user)
        else:
            v_user_scaled = v_user

        # Transform to factor space
        v_user_factor = self.modelo.transform(v_user_scaled)

        # Calculate distances in factor space
        dists = pairwise_distances(v_user_factor, self.scores_.values, metric="euclidean")[0]

        # Get top-k by smallest distance
        indices_top = np.argsort(dists)[:top_k]

        # Build recommendations
        recommendations = []
        for rank, idx in enumerate(indices_top, 1):
            row = self.df.iloc[idx]

            # Calculate similarity score
            similarity_pct = self._score_porcentaje(entrada_usuario, row)

            # Get feature values
            feature_values = {}
            for var in self.variables_factor:
                val = row.get(var)
                feature_values[var] = float(val) if pd.notna(val) else None

            rec = {
                'rank': rank,
                'product': {
                    'id': str(row.get('codigoGrasa', row.get('idGrasas', f'ID_{idx}'))),
                    'nombre': str(row.get('codigoGrasa', row.get('idGrasas', f'Product_{idx}'))),
                    'aceite_base': str(row.get('Aceite Base', '')) if pd.notna(row.get('Aceite Base')) else '',
                    'espesante': str(row.get('Espesante', '')) if pd.notna(row.get('Espesante')) else '',
                    'descripcion': str(row.get('descripcion', '')) if pd.notna(row.get('descripcion')) else '',
                    'aplicaciones': str(row.get('aplicaciones', '')) if pd.notna(row.get('aplicaciones')) else '',
                    'beneficios': str(row.get('beneficios', '')) if pd.notna(row.get('beneficios')) else '',
                },
                'distance': float(dists[idx]),
                'similarity_percentage': round(similarity_pct, 2),
                'feature_values': feature_values,
                'factor_scores': {
                    f'Factor_{i+1}': float(self.scores_.iloc[idx][f'Factor_{i+1}'])
                    for i in range(self.n_factores)
                },
            }
            recommendations.append(rec)

        # Sort by similarity percentage (descending)
        recommendations.sort(key=lambda x: x['similarity_percentage'], reverse=True)

        # Update ranks after sorting
        for i, rec in enumerate(recommendations, 1):
            rec['rank'] = i

        # User factor scores
        user_factors = {
            f'Factor_{i+1}': float(v_user_factor[0, i])
            for i in range(self.n_factores)
        }

        return recommendations, user_factors

    def obtener_scree_data(self, max_factors: int = 10) -> Dict[str, Any]:
        """
        Calculate scree plot data for optimal factor selection.

        Args:
            max_factors: Maximum number of factors to test

        Returns:
            Dictionary with eigenvalues and variance data
        """
        if self.X_scaled is None:
            self.preparar_datos()

        # Limit to number of variables
        max_factors = min(max_factors, len(self.variables_factor))

        # Calculate eigenvalues from correlation matrix for proper scree plot
        X = self.X_scaled
        corr_matrix = np.corrcoef(X.T)
        eigenvalues, _ = np.linalg.eig(corr_matrix)
        eigenvalues = np.real(eigenvalues)
        eigenvalues = np.sort(eigenvalues)[::-1]  # Sort descending

        # Total variance in standardized data equals number of variables
        total_variance = len(self.variables_factor)

        results = []
        cumulative = 0.0
        for n in range(1, max_factors + 1):
            # Individual variance explained by this factor
            individual_var = float(eigenvalues[n-1]) / total_variance if n <= len(eigenvalues) else 0
            cumulative += individual_var

            results.append({
                'n_factors': n,
                'eigenvalue': float(eigenvalues[n-1]) if n <= len(eigenvalues) else 0,
                'explained_variance_ratio': float(cumulative),
                'individual_variance': float(individual_var),
            })

        # Find optimal using Kaiser criterion (eigenvalue > 1) and elbow method
        # Kaiser: count factors with eigenvalue > 1
        kaiser_k = int(sum(1 for ev in eigenvalues[:max_factors] if ev > 1))

        # Elbow method: find where the rate of decrease in eigenvalues slows
        if len(eigenvalues) >= 3:
            # Calculate rate of change
            diffs = np.diff(eigenvalues[:max_factors])
            # Find where the slope becomes less steep (second derivative)
            second_diffs = np.diff(diffs)
            if len(second_diffs) > 0:
                # The elbow is where second derivative is maximum (curve bends most)
                elbow_idx = int(np.argmax(second_diffs)) + 2
                elbow_k = min(elbow_idx, max_factors)
            else:
                elbow_k = 2
        else:
            elbow_k = min(2, max_factors)

        # Use Kaiser criterion if valid, otherwise elbow
        optimal_k = kaiser_k if kaiser_k >= 1 else elbow_k
        optimal_k = max(1, min(optimal_k, max_factors))

        return {
            'results': results,
            'optimal_factors': int(optimal_k),
            'kaiser_criterion': int(kaiser_k),
            'max_tested': int(max_factors),
        }

    def obtener_resumen_factores(self) -> Dict[str, Any]:
        """Get summary of factors with interpretations."""
        if self.modelo is None:
            raise RuntimeError("Model not trained. Call entrenar_modelo() first.")

        loadings = self.modelo.components_.T

        factor_summaries = []
        for j in range(self.n_factores):
            factor_loadings = loadings[:, j]

            # Get top positive and negative loadings
            sorted_idx = np.argsort(factor_loadings)

            top_positive = []
            top_negative = []

            for idx in sorted_idx[::-1][:3]:  # Top 3 positive
                if factor_loadings[idx] > 0.3:
                    top_positive.append({
                        'variable': self.variables_factor[idx],
                        'display': self.COLUMN_MAPPING_INVERSE.get(self.variables_factor[idx], self.variables_factor[idx]),
                        'loading': float(factor_loadings[idx]),
                    })

            for idx in sorted_idx[:3]:  # Top 3 negative
                if factor_loadings[idx] < -0.3:
                    top_negative.append({
                        'variable': self.variables_factor[idx],
                        'display': self.COLUMN_MAPPING_INVERSE.get(self.variables_factor[idx], self.variables_factor[idx]),
                        'loading': float(factor_loadings[idx]),
                    })

            factor_summaries.append({
                'factor': f'Factor_{j+1}',
                'top_positive_loadings': top_positive,
                'top_negative_loadings': top_negative,
            })

        return {
            'factors': factor_summaries,
            'n_factors': int(self.n_factores),
        }
