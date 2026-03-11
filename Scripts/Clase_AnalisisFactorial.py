
import numpy as np
import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import FactorAnalysis
from sklearn.metrics import pairwise_distances


class Clase_factorial_recomendador:
    def __init__(
        self,
        df: pd.DataFrame,
        variables_factor: list[str],
        n_factores: int = 3,
        escala: bool = True,
        id_col: str = "idGrasas"
    ):
        """
        df: dataset de grasas
        variables_factor: variables numéricas que usarás como entrada
        n_factores: número de factores a extraer (3 es usual)
        escala: si se estandariza o no
        id_col: columna identificadora de la grasa
        """
        self.data = df.copy()
        self.variables_factor = variables_factor
        self.n_factores = n_factores
        self.escala = escala
        self.id_col = id_col

        self.scaler = None
        self.modelo = None
        self.scores_ = None  # puntajes factoriales de cada grasa

        # Para calcular scores de "match" en porcentaje
        self.var_min_ = None
        self.var_max_ = None

    # ---------- Preparar datos ----------
    def preparar_datos(self):
        df_vars = self.data[self.variables_factor].copy().dropna()

        self.data = self.data.loc[df_vars.index].reset_index(drop=True)
        df_vars = df_vars.reset_index(drop=True)

        # Guardamos rangos por variable para el score en porcentaje
        self.var_min_ = df_vars.min()
        self.var_max_ = df_vars.max()

        X = df_vars.values

        if self.escala:
            self.scaler = StandardScaler()
            self.X_scaled = self.scaler.fit_transform(X)
        else:
            self.scaler = None
            self.X_scaled = X

    # ---------- Entrenar modelo factorial ----------
    def entrenar_modelo(self):
        if not hasattr(self, "X_scaled"):
            self.preparar_datos()

        self.modelo = FactorAnalysis(
            n_components=self.n_factores,
            random_state=42
        )
        scores = self.modelo.fit_transform(self.X_scaled)

        self.scores_ = pd.DataFrame(
            scores,
            columns=[f"Factor_{i+1}" for i in range(self.n_factores)]
        )

        print(f"Modelo factorial entrenado con {self.n_factores} factores.")

    # ---------- Score de parecido (0–100%) ----------
    def _score_porcentaje(self, entrada_usuario: dict, fila_grasa: pd.Series) -> float:
        """
        Calcula qué tanto se parece una grasa a lo que pidió el usuario,
        en porcentaje (0 a 100).
        Se basa en diferencias normalizadas por el rango de cada variable.
        """
        scores_var = []

        for col in self.variables_factor:
            if col not in entrada_usuario:
                continue

            rango = self.var_max_[col] - self.var_min_[col]
            if rango <= 0:
                continue  # evita división entre 0

            diff = abs(fila_grasa[col] - entrada_usuario[col])
            frac = diff / rango
            score_var = max(0.0, 1.0 - frac) * 100.0  # 0–100
            scores_var.append(score_var)

        if len(scores_var) == 0:
            return 0.0

        return float(np.mean(scores_var))

    # ---------- Recomendación ----------
    def recomendar_grasas(self, entrada_usuario: dict, top_k: int = 5, mostrar: bool = True):
        """
        El usuario ingresa los valores de las mismas variables_factor.
        La clase devuelve grasas similares en el espacio de factores,
        con un score de parecido en porcentaje y tabla de salida.
        """
        # Validación
        for col in self.variables_factor:
            if col not in entrada_usuario:
                raise ValueError(f"Falta la variable '{col}' en la entrada del usuario.")

        if self.modelo is None or not hasattr(self, "X_scaled"):
            raise RuntimeError("Primero llama a preparar_datos() y entrenar_modelo().")

        # Vector usuario
        v_user = np.array([[entrada_usuario[col] for col in self.variables_factor]])

        # Escalar igual que el dataset
        if self.scaler:
            v_user_scaled = self.scaler.transform(v_user)
        else:
            v_user_scaled = v_user

        # Transformar a espacio factorial
        v_user_factor = self.modelo.transform(v_user_scaled)  # (1, n_factores)

        # Calcular distancias en espacio factorial
        dists = pairwise_distances(v_user_factor, self.scores_.values, metric="euclidean")[0]

        # Ordenar recomendaciones por menor distancia
        indices_top = np.argsort(dists)[:top_k]

        recomendadas = self.data.iloc[indices_top].copy()
        recomendadas["distancia_factorial"] = dists[indices_top]

        # Calcular score en porcentaje para cada recomendación
        scores_pct = []
        for _, fila in recomendadas.iterrows():
            s = self._score_porcentaje(entrada_usuario, fila)
            scores_pct.append(s)
        recomendadas["score_match_%"] = scores_pct

        # Ordenar ahora por mejor score (mayor %)
        recomendadas = recomendadas.sort_values("score_match_%", ascending=False).reset_index(drop=True)

        if mostrar:
            print("\n=== Recomendación de grasas (Análisis Factorial) ===")
            print("Valores ingresados por el usuario:")
            for k, v in entrada_usuario.items():
                print(f"  - {k}: {v}")

            print("\nGrasas recomendadas (ordenadas por % de coincidencia):")

            # Seleccionamos columnas a mostrar en la tabla
            cols_tabla = [self.id_col] + self.variables_factor + ["score_match_%"]
            cols_tabla = [c for c in cols_tabla if c in recomendadas.columns]

            print(recomendadas[cols_tabla].to_string(index=False, float_format=lambda x: f"{x:,.2f}"))

            # Si quieres, se puede imprimir también un pequeño resumen textual por fila:
            for i, fila in recomendadas.iterrows():
                print(f"\n#{i+1}  {self.id_col}: {fila[self.id_col]}  | match: {fila['score_match_%']:.1f}%")
                if "aplicaciones" in fila:
                    print("   Aplicaciones:", str(fila["aplicaciones"])[:120], "...")
                if "beneficios" in fila:
                    print("   Beneficios:", str(fila["beneficios"])[:120], "...")

        return recomendadas


df = pd.read_csv("../data/dataset_limpio.csv", encoding="latin1")

variables_factor = [
    "Grado NLGI Consistencia",
    "Viscosidad del Aceite Base a 40Â°C. cSt",
    "Punto de Soldadura Cuatro Bolas, kgf",
    "Temperatura de Servicio Â°C, min",
    "Temperatura de Servicio Â°C, max",
    "Penetracion de Cono a 25 Â°C 0.1mm min",
    "Penetracion de Cono a 25 Â°C 0.1mm max",
    "Punto de Gota Â°C",
    "Estabilidad MecÃ¡nica % min",
    "Estabilidad MecÃ¡nica % max",
    "Resistencia al Lavado por Agua a 80 Â°C % min",
    "Resistencia al Lavado por Agua a 80 Â°C % max"
]

recom = Clase_factorial_recomendador(
    df,
    variables_factor,
    n_factores=3,
    escala=True,
    id_col="idGrasas"
)

recom.preparar_datos()
recom.entrenar_modelo()

entrada_usuario = {
    "Grado NLGI Consistencia": 2,
    "Viscosidad del Aceite Base a 40Â°C. cSt": 460,
    "Punto de Soldadura Cuatro Bolas, kgf": 500,
    "Temperatura de Servicio Â°C, min": -20,
    "Temperatura de Servicio Â°C, max": 180,
    "Penetracion de Cono a 25 Â°C 0.1mm min": 280,
    "Penetracion de Cono a 25 Â°C 0.1mm max": 300,
    "Punto de Gota Â°C": 260,
    "Estabilidad MecÃ¡nica % min": 1,
    "Estabilidad MecÃ¡nica % max": 5,
    "Resistencia al Lavado por Agua a 80 Â°C % min": 1,
    "Resistencia al Lavado por Agua a 80 Â°C % max": 3
}

recomendadas = recom.recomendar_grasas(entrada_usuario, top_k=5, mostrar=True)
