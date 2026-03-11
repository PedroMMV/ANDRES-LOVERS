
import numpy as np
import pandas as pd

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import pairwise_distances


class Clase_clusterizador:
    def __init__(
        self,
        df: pd.DataFrame,
        variables_cluster: list[str] | None = None,
        n_clusters: int = 5,
        escala: bool = True,
        id_col: str = "idGrasas"
    ):
        """
        df: DataFrame con el catálogo de grasas.
        variables_cluster: variables numéricas que usarás para el clustering.
                           Si es None, se toman todas las numéricas excepto id_col.
        n_clusters: número de clusters de K-Means.
        escala: si True, aplica StandardScaler.
        id_col: nombre de la columna identificadora de la grasa.
        """
        self.data = df.copy()
        self.id_col = id_col
        self.n_clusters = n_clusters
        self.escala = escala

        # Selección automática de numéricas si no se pasan explícitas
        if variables_cluster is None:
            num_cols = self.data.select_dtypes(include=np.number).columns.tolist()
            if self.id_col in num_cols:
                num_cols.remove(self.id_col)
            self.variables_cluster = num_cols
        else:
            self.variables_cluster = variables_cluster

        # contenedores internos
        self.scaler = None
        self.modelo_cluster = None
        self.X = None
        self.X_scaled = None
        self.labels_ = None

    # ---------- Matriz de correlación opcional ----------
    def matriz_de_correlacion(self):
        data_num = self.data[self.variables_cluster]
        corr = data_num.corr()

        mask = np.triu(np.ones_like(corr, dtype=bool))

        plt.figure(figsize=(14, 10))
        sns.heatmap(
            corr,
            mask=mask,
            annot=True,
            fmt=".2f",
            cmap="coolwarm",
            linewidths=0.5,
            linecolor="white",
            square=True,
            cbar_kws={"shrink": 0.7}
        )
        plt.title("Matriz de Correlación - Variables de Clustering", fontsize=16, pad=20)
        plt.xticks(rotation=45, ha="right")
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.show()

    # ---------- Preparar datos ----------
    def preparar_datos(self):
        """
        Construye X y X_scaled con las variables de clustering.
        Elimina filas con NaN en esas columnas.
        """
        df_vars = self.data[self.variables_cluster].copy()
        df_vars = df_vars.dropna(axis=0, how="any")

        # Alinear self.data con las filas válidas
        self.data = self.data.loc[df_vars.index].reset_index(drop=True)
        df_vars = df_vars.reset_index(drop=True)

        self.X = df_vars.values

        if self.escala:
            self.scaler = StandardScaler()
            self.X_scaled = self.scaler.fit_transform(self.X)
        else:
            self.scaler = None
            self.X_scaled = self.X.copy()

    # ---------- Entrenar K-Means ----------
    def entrenar_modelo(self):
        if self.X_scaled is None:
            self.preparar_datos()

        self.modelo_cluster = KMeans(
            n_clusters=self.n_clusters,
            random_state=42,
            n_init="auto"
        )
        self.labels_ = self.modelo_cluster.fit_predict(self.X_scaled)
        self.data["cluster"] = self.labels_

        print(f"Modelo K-Means entrenado con {self.n_clusters} clusters.")
        uniques, counts = np.unique(self.labels_, return_counts=True)
        for c, n in zip(uniques, counts):
            print(f" - Cluster {c}: {n} grasas")

    # ---------- Resumen de clusters ----------
    def resumen_clusters(self):
        if "cluster" not in self.data.columns:
            raise RuntimeError("Primero entrena el modelo con entrenar_modelo().")

        resumen = self.data.groupby("cluster")[self.variables_cluster].agg(
            ["mean", "min", "max", "count"]
        )
        print("\n===== Resumen de clusters =====")
        print(resumen)
        return resumen

    # ---------- Recomendación ----------
    def recomendar_grasas(
        self,
        entrada_usuario: dict,
        top_k: int = 5,
        mostrar: bool = True
    ):
        """
        entrada_usuario: dict con las MISMAS variables que self.variables_cluster.
        Ejemplo:
            {
              'Grado NLGI Consistencia': 2,
              'Viscosidad del Aceite Base a 40Â°C. cSt': 460,
              ...
            }
        """
        if self.modelo_cluster is None or self.X_scaled is None:
            raise RuntimeError("Primero entrena el modelo con entrenar_modelo().")

        # Verificar que el usuario haya ingresado todas las variables requeridas
        for col in self.variables_cluster:
            if col not in entrada_usuario:
                raise ValueError(
                    f"Falta la variable '{col}' en entrada_usuario. "
                    "Debe contener todas las variables_cluster."
                )

        # Vector del usuario
        v_usuario = np.array([[entrada_usuario[col] for col in self.variables_cluster]])

        # Escalar como los datos de entrenamiento
        if self.escala and self.scaler is not None:
            v_usuario_scaled = self.scaler.transform(v_usuario)
        else:
            v_usuario_scaled = v_usuario

        # Cluster asignado al usuario
        cluster_usuario = self.modelo_cluster.predict(v_usuario_scaled)[0]

        # Filtrar grasas del mismo cluster
        mask_cluster = (self.data["cluster"].values == cluster_usuario)
        indices_cluster = np.where(mask_cluster)[0]
        X_cluster_scaled = self.X_scaled[indices_cluster]

        # Distancias dentro del cluster
        dists = pairwise_distances(v_usuario_scaled, X_cluster_scaled, metric="euclidean")[0]
        orden = np.argsort(dists)[:top_k]
        idx_recomendadas = indices_cluster[orden]

        recomendadas = self.data.iloc[idx_recomendadas].copy()
        recomendadas["distancia"] = dists[orden]

        # ---------- Similitud en porcentaje ----------
        # Usamos una transformación simple: similitud = 1 / (1 + distancia)
        # y luego la normalizamos a 0-100% respecto a la mejor recomendación.
        similitud_bruta = 1 / (1 + recomendadas["distancia"])
        recomendadas["similitud_%"] = (similitud_bruta / similitud_bruta.max() * 100).round(1)

        # ---------- Tabla tabulada ----------
        # Columnas base
        cols_tabla = [self.id_col]
        if "cluster" in recomendadas.columns:
            cols_tabla.append("cluster")
        cols_tabla += ["distancia", "similitud_%"] + self.variables_cluster

        # Agregar aplicaciones y beneficios 
        extra_cols = [c for c in ["aplicaciones", "beneficios"] if c in recomendadas.columns]
        cols_tabla += extra_cols

        # Nos aseguramos de no repetir columnas
        cols_tabla = [c for i, c in enumerate(cols_tabla) if c in recomendadas.columns and c not in cols_tabla[:i]]

        if mostrar:
            print("\n=== Recomendación basada en clustering ===")
            print("Entrada del usuario:")
            for k, v in entrada_usuario.items():
                print(f"  - {k}: {v}")

            print(f"\nCluster asignado al usuario: {cluster_usuario}")

            print("\nGrasas recomendadas (ordenadas por similitud):")
            for i, (_, fila) in enumerate(recomendadas.iterrows(), start=1):
                print(
                    f"\n#{i}  {self.id_col}: {fila.get(self.id_col, 'N/A')}  "
                    f"| similitud aprox.: {fila['similitud_%']:.1f}%  "
                    f"| distancia: {fila['distancia']:.4f}  "
                    f"| cluster: {fila.get('cluster', 'N/A')}"
                )
                # Mostrar un pequeño resumen de aplicaciones y beneficios
                if "aplicaciones" in recomendadas.columns:
                    print("   Aplicaciones:", str(fila["aplicaciones"])[:120], "...")
                if "beneficios" in recomendadas.columns:
                    print("   Beneficios  :", str(fila["beneficios"])[:120], "...")

            # Tabla tabulada final
            print("\n===== Tabla de recomendaciones =====")
            print(recomendadas[cols_tabla].to_string(index=False))

        return recomendadas, cluster_usuario





# ================== EJEMPLO DE USO ==================
df = pd.read_csv("../data/dataset_limpio.csv", encoding="latin1")

variables_cluster = [
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

clusterizador = Clase_clusterizador(
    df,
    variables_cluster=variables_cluster,
    n_clusters=5,
    escala=True,
    id_col="idGrasas"
)

clusterizador.entrenar_modelo()

clusterizador.resumen_clusters()

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

recomendadas, cluster_usuario = clusterizador.recomendar_grasas(
    entrada_usuario=entrada_usuario,
    top_k=5,
    mostrar=True
)

