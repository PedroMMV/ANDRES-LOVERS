"""
Clase RegresorGrasas - Motor de regresion lineal para grasas lubricantes
=========================================================================
Adaptado de Clase_regresor.py para uso en backend FastAPI.
Aprende relaciones entre propiedades usando regresiones lineales basadas en
variables correlacionadas y utiliza esos modelos para completar las caracteristicas
que falten. Con el "vector objetivo" completo, compara al usuario contra todo el
catalogo midiendo distancias euclideas en un espacio normalizado y retorna las
grasas mas similares.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import pairwise_distances

np.random.seed(42)


class RegresorGrasas:
    """
    Motor de regresion lineal y recomendacion de grasas lubricantes.
    """

    # Mapeo de nombres de columnas del CSV a nombres internos mas cortos
    COLUMN_MAPPING = {
        'Grado NLGI Consistencia': 'nlgi_grade',
        'Viscosidad del Aceite Base a 40 °C': 'visc_40c',
        'Punto de Gota °C': 'drop_point',
        'Punto de Soldadura Cuatro Bolas, kgf': 'weld_point',
        'Temperatura de Servicio °C min': 'temp_min',
        'Temperatura de Servicio °C max': 'temp_max',
        'Penetracion de Cono a 25 °C 0.1mm min': 'penetration_min',
        'Penetracion de Cono a 25 °C 0.1mm max': 'penetration_max',
        'Estabilidad Mecánica % min': 'stability_min',
        'Estabilidad Mecánica % max': 'stability_max',
        'Resistencia al Lavado por Agua a 80 °C % min': 'water_resist_min',
        'Resistencia al Lavado por Agua a 80 °C % max': 'water_resist_max',
    }

    # Mapeo inverso
    COLUMN_MAPPING_INVERSE = {v: k for k, v in COLUMN_MAPPING.items()}

    # Descripciones de las variables (en ingles para consistencia con el frontend)
    VARIABLE_DESCRIPTIONS = {
        'nlgi_grade': 'NLGI consistency grade (0-6)',
        'visc_40c': 'Base oil viscosity at 40C in cSt',
        'drop_point': 'Drop point in C',
        'weld_point': 'Four ball weld point in kgf',
        'temp_min': 'Minimum service temperature in C',
        'temp_max': 'Maximum service temperature in C',
        'penetration_min': 'Cone penetration at 25C min (0.1mm)',
        'penetration_max': 'Cone penetration at 25C max (0.1mm)',
        'stability_min': 'Mechanical stability min %',
        'stability_max': 'Mechanical stability max %',
        'water_resist_min': 'Water washout resistance at 80C min %',
        'water_resist_max': 'Water washout resistance at 80C max %',
    }

    def __init__(self, ruta_csv: str, umbral: float = 0.3, variables_objetivo: Optional[List[str]] = None):
        """
        Inicializa el regresor con datos de un CSV.

        Args:
            ruta_csv: Ruta al archivo CSV con los datos de grasas
            umbral: Correlacion minima (valor absoluto) para considerar un predictor
            variables_objetivo: Lista de variables a modelar. Si es None, usa todas las numericas
        """
        self.ruta_csv = ruta_csv
        self.umbral = umbral
        self.df_original = pd.read_csv(ruta_csv, encoding='utf-8-sig')
        self.df = self._preparar_datos()

        # Variables numericas disponibles
        self.num_variables = self._obtener_variables_numericas()

        # Variables objetivo
        if variables_objetivo is None:
            self.variables_objetivo = self.num_variables.copy()
        else:
            self.variables_objetivo = [v for v in variables_objetivo if v in self.num_variables]

        # Diccionario para guardar modelos entrenados
        self.modelos_finales: Dict[str, Dict[str, Any]] = {}
        self._modelos_entrenados = False

    def _preparar_datos(self) -> pd.DataFrame:
        """Prepara y limpia los datos del DataFrame."""
        df = self.df_original.copy()

        # Renombrar columnas usando el mapeo
        rename_dict = {}
        for col_original, col_nuevo in self.COLUMN_MAPPING.items():
            if col_original in df.columns:
                rename_dict[col_original] = col_nuevo

        df = df.rename(columns=rename_dict)

        # Convertir columnas numericas
        for col in self.COLUMN_MAPPING.values():
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        return df

    def _obtener_variables_numericas(self) -> List[str]:
        """Obtiene lista de variables numericas disponibles con datos suficientes."""
        num_cols = []
        for col in self.COLUMN_MAPPING.values():
            if col in self.df.columns:
                # Solo incluir si tiene al menos 10 valores no nulos
                if self.df[col].notna().sum() >= 10:
                    num_cols.append(col)
        return num_cols

    def obtener_features_disponibles(self) -> List[Dict[str, Any]]:
        """
        Retorna lista de features disponibles para el frontend.

        Returns:
            Lista de diccionarios con info de cada feature
        """
        features = []
        for col in self.num_variables:
            col_data = self.df[col].dropna()
            features.append({
                'name': col,
                'displayName': self.COLUMN_MAPPING_INVERSE.get(col, col),
                'type': 'numeric',
                'description': self.VARIABLE_DESCRIPTIONS.get(col, ''),
                'stats': {
                    'min': float(col_data.min()) if len(col_data) > 0 else None,
                    'max': float(col_data.max()) if len(col_data) > 0 else None,
                    'mean': float(col_data.mean()) if len(col_data) > 0 else None,
                    'count': int(col_data.count()),
                }
            })
        return features

    def obtener_matriz_correlacion(self) -> Dict[str, Any]:
        """
        Calcula y retorna la matriz de correlacion.

        Returns:
            Diccionario con la matriz de correlacion y metadata
        """
        data_num = self.df[self.num_variables].dropna(how='all')
        corr = data_num.corr()

        # Convertir a formato JSON-serializable
        corr_data = []
        variables = corr.columns.tolist()

        for i, var1 in enumerate(variables):
            for j, var2 in enumerate(variables):
                if i <= j:  # Solo mitad inferior + diagonal
                    valor = corr.loc[var1, var2]
                    if not np.isnan(valor):
                        corr_data.append({
                            'var1': var1,
                            'var2': var2,
                            'var1_display': self.COLUMN_MAPPING_INVERSE.get(var1, var1),
                            'var2_display': self.COLUMN_MAPPING_INVERSE.get(var2, var2),
                            'correlation': round(float(valor), 4)
                        })

        return {
            'variables': variables,
            'variables_display': [self.COLUMN_MAPPING_INVERSE.get(v, v) for v in variables],
            'correlations': corr_data,
            'umbral': self.umbral
        }

    def variables_correlacionadas(self) -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, float]]]:
        """
        Encuentra predictores con correlacion >= umbral para cada variable objetivo.

        Returns:
            Tupla (predictores_dic, correlaciones_dic)
        """
        data_num = self.df[self.num_variables].dropna(how='all')
        corr = data_num.corr()

        predictores_dic = {}
        corrs_dic = {}

        for col in self.variables_objetivo:
            if col not in corr.columns:
                continue

            corr_obj = corr[col].drop(col, errors='ignore')

            # Filtrar por valor absoluto >= umbral
            corr_filtrado = corr_obj[abs(corr_obj) >= self.umbral]

            # Ordenar por |correlacion| descendente
            corr_ordenado = corr_filtrado.reindex(
                corr_filtrado.abs().sort_values(ascending=False).index
            )

            predictores = corr_ordenado.index.tolist()
            predictores_dic[col] = predictores
            corrs_dic[col] = {k: round(float(v), 4) for k, v in corr_ordenado.items()}

        return predictores_dic, corrs_dic

    def entrenar_modelo(
        self,
        variable_objetivo: str,
        predictores: Optional[List[str]] = None,
        test_size: float = 0.2
    ) -> Dict[str, Any]:
        """
        Entrena un modelo de regresion para una variable objetivo.

        Args:
            variable_objetivo: Variable a predecir
            predictores: Lista de predictores (si None, usa correlacionados)
            test_size: Porcentaje de datos para testing

        Returns:
            Diccionario con metricas y datos del modelo
        """
        if variable_objetivo not in self.num_variables:
            raise ValueError(f"Variable '{variable_objetivo}' no disponible")

        # Si no se especifican predictores, usar los correlacionados
        if predictores is None:
            predictores_dic, _ = self.variables_correlacionadas()
            predictores = predictores_dic.get(variable_objetivo, [])

        # Filtrar predictores validos
        predictores = [p for p in predictores if p in self.num_variables and p != variable_objetivo]

        if len(predictores) == 0:
            raise ValueError(f"No hay predictores validos para '{variable_objetivo}'")

        # Preparar datos (eliminar filas con NaN en las columnas necesarias)
        cols_necesarias = predictores + [variable_objetivo]
        data_clean = self.df[cols_necesarias].dropna()

        if len(data_clean) < 20:
            raise ValueError(f"Datos insuficientes ({len(data_clean)} filas) para entrenar el modelo")

        X = data_clean[predictores]
        y = data_clean[variable_objetivo]

        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )

        # Escalar features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Entrenar modelo
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)

        # Predicciones
        y_pred_train = model.predict(X_train_scaled)
        y_pred_test = model.predict(X_test_scaled)

        # Calcular metricas
        mse_train = float(mean_squared_error(y_train, y_pred_train))
        mse_test = float(mean_squared_error(y_test, y_pred_test))
        rmse_train = float(np.sqrt(mse_train))
        rmse_test = float(np.sqrt(mse_test))
        r2_train = float(r2_score(y_train, y_pred_train))
        r2_test = float(r2_score(y_test, y_pred_test))
        mae_test = float(np.mean(np.abs(y_test - y_pred_test)))

        # Datos para grafica actual vs predicho
        actual_vs_predicted = [
            {'actual': float(a), 'predicted': float(p)}
            for a, p in zip(y_test.values, y_pred_test)
        ]

        # Residuos
        residuals = [float(a - p) for a, p in zip(y_test.values, y_pred_test)]

        # Coeficientes del modelo
        coefficients = [
            {
                'feature': predictores[i],
                'feature_display': self.COLUMN_MAPPING_INVERSE.get(predictores[i], predictores[i]),
                'coefficient': float(model.coef_[i]),
                'importance': float(abs(model.coef_[i]))
            }
            for i in range(len(predictores))
        ]
        # Ordenar por importancia
        coefficients.sort(key=lambda x: x['importance'], reverse=True)

        # Guardar modelo internamente para predicciones posteriores
        self.modelos_finales[variable_objetivo] = {
            'model': model,
            'features': predictores,
            'scaler': scaler
        }
        self._modelos_entrenados = True

        return {
            'targetVariable': variable_objetivo,
            'targetVariableDisplay': self.COLUMN_MAPPING_INVERSE.get(variable_objetivo, variable_objetivo),
            'predictorFeatures': predictores,
            'predictorFeaturesDisplay': [
                self.COLUMN_MAPPING_INVERSE.get(p, p) for p in predictores
            ],
            'testSizePercent': test_size * 100,
            'numSamples': len(data_clean),
            'numTrainSamples': len(X_train),
            'numTestSamples': len(X_test),
            'metrics': {
                'r2Train': round(r2_train, 4),
                'r2Test': round(r2_test, 4),
                'mseTrain': round(mse_train, 4),
                'mseTest': round(mse_test, 4),
                'rmseTrain': round(rmse_train, 4),
                'rmseTest': round(rmse_test, 4),
                'mae': round(mae_test, 4),
            },
            'coefficients': coefficients,
            'intercept': float(model.intercept_),
            'actualVsPredicted': actual_vs_predicted,
            'residuals': residuals,
        }

    def entrenar_modelos_finales(self, variables: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Entrena modelos finales para todas las variables objetivo usando TODOS los datos.
        Estos modelos se usan para prediccion y recomendacion.

        Args:
            variables: Variables a entrenar. Si None, usa variables_objetivo

        Returns:
            Resumen de modelos entrenados
        """
        if variables is None:
            variables = self.variables_objetivo

        predictores_dic, corrs_dic = self.variables_correlacionadas()
        resultados = []

        for col in variables:
            predictores = predictores_dic.get(col, [])
            if len(predictores) == 0:
                continue

            # Preparar datos
            cols_necesarias = predictores + [col]
            data_clean = self.df[cols_necesarias].dropna()

            if len(data_clean) < 10:
                continue

            X = data_clean[predictores]
            y = data_clean[col]

            # Escalar y entrenar con TODOS los datos
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            model = LinearRegression()
            model.fit(X_scaled, y)

            self.modelos_finales[col] = {
                'model': model,
                'features': predictores,
                'scaler': scaler
            }

            resultados.append({
                'variable': col,
                'variable_display': self.COLUMN_MAPPING_INVERSE.get(col, col),
                'predictores': predictores,
                'num_samples': len(data_clean)
            })

        self._modelos_entrenados = True
        return {
            'modelos_entrenados': resultados,
            'total': len(resultados)
        }

    def predecir(
        self,
        variable_objetivo: str,
        entrada: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Hace una prediccion usando un modelo entrenado.

        Args:
            variable_objetivo: Variable a predecir
            entrada: Diccionario con valores de los predictores

        Returns:
            Diccionario con la prediccion y confianza
        """
        if variable_objetivo not in self.modelos_finales:
            raise ValueError(f"No hay modelo entrenado para '{variable_objetivo}'")

        info = self.modelos_finales[variable_objetivo]
        model = info['model']
        features = info['features']
        scaler = info['scaler']

        # Verificar que tenemos todos los predictores necesarios
        missing = [f for f in features if f not in entrada]
        if missing:
            raise ValueError(f"Faltan predictores: {missing}")

        # Preparar input
        X_input = np.array([[entrada[f] for f in features]])
        X_scaled = scaler.transform(X_input)

        # Predecir
        y_pred = model.predict(X_scaled)[0]

        # Calcular intervalo de confianza aproximado basado en R2 del modelo
        # (En produccion se usaria bootstrap o intervalos de confianza reales)

        return {
            'targetVariable': variable_objetivo,
            'targetVariableDisplay': self.COLUMN_MAPPING_INVERSE.get(variable_objetivo, variable_objetivo),
            'predictedValue': round(float(y_pred), 4),
            'inputFeatures': {
                k: v for k, v in entrada.items() if k in features
            }
        }

    def construir_vector_objetivo(
        self,
        entrada_usuario: Dict[str, float],
        variables_a_predecir: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """
        Completa un vector objetivo usando los modelos finales.
        Respeta valores existentes y predice los faltantes si es posible.

        Args:
            entrada_usuario: Valores conocidos del usuario
            variables_a_predecir: Variables a intentar predecir

        Returns:
            Diccionario con todas las variables disponibles
        """
        if not self._modelos_entrenados:
            self.entrenar_modelos_finales()

        if variables_a_predecir is None:
            variables_a_predecir = self.variables_objetivo

        vector = entrada_usuario.copy()

        for objetivo in variables_a_predecir:
            # Si ya existe, no modificar
            if objetivo in vector:
                continue

            if objetivo not in self.modelos_finales:
                continue

            info = self.modelos_finales[objetivo]
            feats = info['features']

            # Solo predecir si tenemos todos los predictores
            if not all(f in vector for f in feats):
                continue

            X_input = np.array([[vector[f] for f in feats]])
            X_scaled = info['scaler'].transform(X_input)
            y_pred = info['model'].predict(X_scaled)[0]
            vector[objetivo] = float(y_pred)

        return vector

    def regresor_recomendacion(
        self,
        entrada_usuario: Dict[str, float],
        variables_similitud: Optional[List[str]] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Recomienda grasas basandose en distancia euclidea en espacio normalizado.

        Args:
            entrada_usuario: Propiedades deseadas por el usuario
            variables_similitud: Variables a usar para calcular similitud
            top_k: Numero de grasas a recomendar

        Returns:
            Diccionario con recomendaciones y vector objetivo
        """
        if not self._modelos_entrenados:
            self.entrenar_modelos_finales()

        if variables_similitud is None:
            variables_similitud = self.variables_objetivo

        # Construir vector objetivo completo
        vector_obj = self.construir_vector_objetivo(entrada_usuario, variables_similitud)

        # Variables usables (presentes en vector y en catalogo)
        cols_usable = [
            col for col in variables_similitud
            if col in vector_obj and col in self.df.columns
        ]

        if len(cols_usable) == 0:
            raise ValueError("No hay variables en comun para calcular similitud")

        # Filtrar catalogo con datos completos en las variables usables
        catalogo_df = self.df.dropna(subset=cols_usable)
        if len(catalogo_df) == 0:
            raise ValueError("No hay productos con datos completos en las variables seleccionadas")

        catalogo = catalogo_df[cols_usable].values
        v_usuario = np.array([[vector_obj[col] for col in cols_usable]])

        # Normalizar
        scaler_sim = StandardScaler()
        catalogo_scaled = scaler_sim.fit_transform(catalogo)
        v_usuario_scaled = scaler_sim.transform(v_usuario)

        # Calcular distancias euclideas
        dists = pairwise_distances(v_usuario_scaled, catalogo_scaled, metric='euclidean')[0]

        # Ordenar por distancia (menor = mas similar)
        indices_top = np.argsort(dists)[:top_k]

        # Construir respuesta
        recomendaciones = []
        for idx in indices_top:
            row = catalogo_df.iloc[idx]
            dist = float(dists[idx])

            # Convertir distancia a similitud (0-1)
            # Usamos exp(-dist) para que menor distancia = mayor similitud
            similitud = float(np.exp(-dist / 2))

            # Get grease ID from various possible column names
            grease_id = row.get('idGrasa', row.get('codigoGrasa', row.get('idDatosGrasas', idx)))
            rec = {
                'id': str(int(grease_id) if pd.notna(grease_id) else idx),
                'nombre': f'Grease_{int(grease_id) if pd.notna(grease_id) else idx}',
                'distancia': round(dist, 4),
                'similitud': round(similitud, 4),
                'propiedades': {
                    col: round(float(row[col]), 4) if pd.notna(row[col]) else None
                    for col in cols_usable
                },
            }
            recomendaciones.append(rec)

        return {
            'entrada_usuario': entrada_usuario,
            'vector_objetivo': {k: round(v, 4) for k, v in vector_obj.items()},
            'variables_usadas': cols_usable,
            'variables_usadas_display': [
                self.COLUMN_MAPPING_INVERSE.get(v, v) for v in cols_usable
            ],
            'recomendaciones': recomendaciones,
            'total': len(recomendaciones)
        }
