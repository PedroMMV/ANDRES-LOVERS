# Librerías base
import numpy as np
import pandas as pd

# Visualización y estadísticas
import matplotlib.pyplot as plt
import seaborn as sns

# Entrenamiento y regresor
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, root_mean_squared_error
from sklearn.preprocessing import StandardScaler
#from sklearn.linear_model import ElasticNet
#from sklearn.linear_model import ElasticNetCV
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import pairwise_distances

np.random.seed(42)

""" 
-----   Funcionamiento   -----
1. Usuario ingresa requerimiento
2. (propiedades objetivo deseadas)
3. Se genera seleccionas las variables correlacionadas
3.2 Estadísticos de la regresión y presición
3. Modelo de regresión estima propiedades
5. Vector objetivo (features predichas)
6. Catálogo de grasas
7. Similitud coseno
8. Recomendación de las grasas más similares
"""

"""La clase Clase_regresor funciona como un motor de recomendación de grasas lubricantes. Aprende relaciones entre sus
propiedades usando regresiones lineales basadas en variables correlacionadas y luego utiliza esos modelos para completar
las características que falten en la entrada del usuario. Con ese “vector objetivo” completo, compara al usuario contra
todo el catálogo midiendo distancias euclídeas en un espacio normalizado y retorna las grasas más similares. 
Internamente, la clase analiza correlaciones, selecciona predictores, estandariza datos y entrena modelos finales; 
externamente, ofrece funciones para evaluar métricas, entrenar los modelos y obtener recomendaciones a partir de la 
entrada de un usuario."""



class Clase_regresor():
    def __init__(self, df: pd.DataFrame, umbral: float = 0.3, variables_objetivo: list[str] | None = None):
        """
        df: DataFrame con las grasas (incluye idGrasa y variables numéricas).
        umbral: correlación mínima (en valor absoluto) para considerar un predictor.
        variables_objetivo: lista de variables que quiero modelar. 
                            Si es None, se usan todas las numéricas excepto idGrasa.
        """
        self.data = df.copy()
        self.umbral = umbral

        # Variables numéricas
        self.num_variables = self.data.select_dtypes(include=np.number).columns.to_list()
        if "idGrasa" in self.num_variables:
            self.num_variables.remove("idGrasa")

        # Variables objetivo (por defecto, todas las numéricas)
        if variables_objetivo is None:
            self.variables_objetivo = self.num_variables
        else:
            self.variables_objetivo = variables_objetivo

        # Aquí voy a guardar los modelos entrenados
        self.modelos = {}
        
    # ---------- Matriz de correlación ----------
    def matriz_de_correlacion(self):
        data_num = self.data[self.num_variables]
        corr = data_num.corr()

        mask = np.triu(np.ones_like(corr, dtype=bool))

        plt.figure(figsize=(14, 10))

        sns.heatmap(
            corr,
            mask=mask,
            annot=True,
            fmt=".2f",
            cmap="coolwarm",
            linewidths=0.5,      # líneas divisorias
            linecolor="white",
            square=True,         # celdas cuadradas
            cbar_kws={"shrink": 0.7}
        )

        plt.title("Matriz de Correlación de Variables Numéricas", fontsize=16, pad=20)
        plt.xticks(rotation=45, ha="right")
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.show()
    
    # ---------- Selección de variables correlacionadas ----------
    def variables_correlacionadas(self):
        """
        Devuelve:
          - predictores_dic: {objetivo: [lista de predictores]}
          - corrs_dic: {objetivo: serie de correlaciones filtradas y ordenadas}
        """
        
        variables_objetivo = self.variables_objetivo
        
        data_num = self.data[self.num_variables]
        corr = data_num.corr()
        
        # Variables numéricas solamente
        data_num = self.data[self.num_variables]
        
        # Matriz de correlación
        corr = data_num.corr()

        # diccionarios para guardar los predictores por objetivo
        predictores_dic = {}
        corrs_dic = {}

        for col in variables_objetivo:
            corr_obj = corr[col].drop(col)

            # Filtrar por valor absoluto
            corr_filtrado = corr_obj[abs(corr_obj) >= self.umbral]

            # Ordenar por |correlación| descendente
            corr_ordenado = corr_filtrado.reindex(corr_filtrado.abs().sort_values(ascending=False).index)
            predictores = corr_ordenado.index.tolist()
            
            predictores_dic[col] = predictores
            corrs_dic[col] = corr_ordenado

        return predictores_dic, corrs_dic
    
    
    def variables_regresion(self, test_size: float = 0.2):
        """
        Prepara X_train, X_test, y_train, y_test para cada variable objetivo.
        Devuelve diccionarios por columna objetivo.
        """

        train_X = {}
        test_X = {}
        train_y = {}
        test_y = {}
        scalers = {}

        # Selección automática de predictores
        predictores_dic, _ = self.variables_correlacionadas()

        for col, predictores in predictores_dic.items():
            if len(predictores) == 0:
                print(f"No hay variables con correlación >= {self.umbral} para '{col}'")
                continue

            X = self.data[predictores]
            y = self.data[col]

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            train_X[col] = X_train_scaled
            test_X[col] = X_test_scaled
            train_y[col] = y_train
            test_y[col] = y_test
            scalers[col] = scaler

        return train_X, test_X, train_y, test_y, predictores_dic, scalers

    
    # ---------- Entrenar modelos + métricas + gráficas ----------
    def metricas_regresores(self, test_size=0.2, graficas = True, error = True):
        """ Resumen de la función: 
            - Se mete un test_size
            Devuelve: 
            - Métricas: mse, rmse y R2
            - Gráficas
        """
        
        modelos_dic = {}
        train_X, test_X, train_y, test_y, predictores_dic, scalers = self.variables_regresion(
            test_size=test_size
        )

        for col, X_train_scaled in train_X.items():
            X_test_scaled = test_X[col]
            y_train = train_y[col]
            y_test = test_y[col]
            predictores = predictores_dic[col]

            model = LinearRegression()
            model.fit(X_train_scaled, y_train)
            modelos_dic[col] = {
                "model": model,
                "features": predictores,
                "scaler": scalers[col],
            }

            y_pred_train = model.predict(X_train_scaled)
            y_pred_test = model.predict(X_test_scaled)

            if error: 
                mse_train = mean_squared_error(y_train, y_pred_train)
                mse_test = mean_squared_error(y_test, y_pred_test)
                rmse_train = root_mean_squared_error(y_train, y_pred_train)
                rmse_test = root_mean_squared_error(y_test, y_pred_test)
                r2_train = r2_score(y_train, y_pred_train)
                r2_test = r2_score(y_test, y_pred_test)

                print(f"\n===* {col} *===")
                print(f"Features usadas: {predictores}")
                print(f"MSE train: {mse_train:.4f}, MSE test: {mse_test:.4f}")
                print(f"RMSE train: {rmse_train:.4f}, RMSE test: {rmse_test:.4f}")
                print(f"R2 train: {r2_train:.4f}, R2 test: {r2_test:.4f}")

            if graficas:
                # gráfico
                y_pred = y_pred_train
                y_real = y_train

                z = np.polyfit(y_real, y_pred, 1)
                p = np.poly1d(z)

                plt.figure(figsize=(8,6))
                plt.scatter(y_real, y_pred, alpha=0.6, s=50)
                order = np.argsort(y_real)
                plt.plot(y_real.values[order], p(y_real.values[order]), "r--",
                        alpha=0.8, linewidth=2, label=f'y = {z[0]:.2f}x + {z[1]:.2f}')
                plt.plot([y_real.min(), y_real.max()], [y_real.min(), y_real.max()],
                        'g-', alpha=0.5, linewidth=2, label='descripción perfecta')
                plt.xlabel("Real")
                plt.ylabel("Predicho")
                plt.title(f'Predicción vs Real - {col}')
                plt.legend()
                plt.grid(True, alpha=0.3)
                plt.tight_layout()

        return modelos_dic
  
    def entrenar_modelos_finales(self):
        """
        Entrena un modelo LinearRegression por cada variable objetivo usando.
        A diferencia del método metricas_regresores, este entrada con todos los datos
        para predecir y recomendar
        """
        
        #variables_objetivo = self.variables_objetivo

        # Obtenemos los datos con las variables correlacionadas
        predictores_dic, _ = self.variables_correlacionadas()
        self.modelos_finales = {}

        for col, predictores in predictores_dic.items():
            if len(predictores) == 0:
                print(f"[AVISO] No hay predictores con |corr| >= {self.umbral} para '{col}'")
                continue

            X = self.data[predictores]
            y = self.data[col]

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            model = LinearRegression()
            model.fit(X_scaled, y)

            self.modelos_finales[col] = {
                "model": model,
                "features": predictores,
                "scaler": scaler,
            }

        print("\nModelos finales entrenados para variables:")
        for col in self.modelos_finales.keys():
            print(" -", col)
            
            
    def construir_vector_objetivo(self, entrada_usuario: dict, variables_a_predecir: list[str] | None = None):
        """
        Completa un vector objetivo usando los modelos finales:
        - respeta los valores que ya venga en entrada_usuario
        -predice solo variables para las que:
             -haya modelo final, y
             - sus predictores estén presentes en el vector
        Devuelve un dict con todas las variables disponibles.
        """
        
        variables_a_predecir = self.variables_objetivo

        # por las dusda
        if not self.modelos_finales:
            raise RuntimeError("Primero llama a entrenar_modelos_finales().")

        vector = entrada_usuario.copy()

        # Intentamos predecir variables objetivo una sola pasada (simple)
        for objetivo in variables_a_predecir:
            # si el usuario ya dio esta variable, no la tocamos
            if objetivo in vector:
                continue

            if objetivo not in self.modelos_finales:
                continue

            info = self.modelos_finales[objetivo]
            feats = info["features"]

            # solo predecimos si tenemos todos los predictores necesarios
            if not all(f in vector for f in feats):
                continue

            X_input = np.array([[vector[f] for f in feats]])
            X_scaled = info["scaler"].transform(X_input)
            y_pred = info["model"].predict(X_scaled)[0]
            vector[objetivo] = float(y_pred)

        return vector
    
    #                                                                           Por si no existen              Se puede cambiar
    def regresor_recomendacion(self, entrada_usuario: dict, variables_similitud: list[str] | None = None, top_k: int = 5, mostrar=True):
        if variables_similitud is None:
            variables_similitud = self.variables_objetivo

        vector_obj = self.construir_vector_objetivo(
            entrada_usuario, 
            variables_a_predecir=variables_similitud
        )

        cols_usable = [col for col in variables_similitud if col in vector_obj and col in self.data.columns]

        if len(cols_usable) == 0:
            raise ValueError("No hay variables en común entre entrada_usuario/vector_objetivo y el catálogo.")

        catalogo = self.data[cols_usable].values
        v_usuario = np.array([[vector_obj[col] for col in cols_usable]])

        scaler_sim = StandardScaler()
        catalogo_scaled = scaler_sim.fit_transform(catalogo)
        v_usuario_scaled = scaler_sim.transform(v_usuario)

        # usar distancia euclídea 
        dists = pairwise_distances(v_usuario_scaled, catalogo_scaled, metric="euclidean")[0]

        # Menor distancia es más parecido 
        indices_top = np.argsort(dists)[:top_k]
        recomendadas = self.data.iloc[indices_top].copy()
        recomendadas["distancia"] = dists[indices_top]

        if mostrar:
            print("\n=== Recomendación de grasas ===")
            print("Entrada del usuario:")
            for k, v in entrada_usuario.items():
                print(f"  - {k}: {v}")

            print("\nGrasas recomendadas (ordenadas por distancia creciente):")
            for i, (_, fila)  in enumerate( recomendadas.iterrows(), start=1):
                idg = fila.get("idGrasa", "N/A")
                print(f"\n#{i}  idGrasa: {idg }  | distancia: {fila['distancia']:.4f}")
                for col in cols_usable:
                    print(f"   {col}: {fila[col]:.3f}")

        return recomendadas, vector_obj


################# ----  ---- #################
#----------------   Ejemplo  ----------------#
################# ----  ---- #################


# Data
df = pd.read_csv("../data/datos_sinteticos_1200.csv")

########### Para ver todas las métricas de las variables ###########
"""
entrada_usuario = {
    'Grado NLGI Consistencia': 0,
 'Viscosidad del Aceite Base a 40 °C': 0,
 'Punto de Gota °C': 0,
 'Punto de Soldadura Cuatro Bolas, kgf': 0,
 'Temperatura de Servicio °C min': 0,
 'Temperatura de Servicio °C max': 0,
 'Penetracion de Cono a 25 °C 0.1mm min': 0,
 'Penetracion de Cono a 25 °C 0.1mm max': 0,
 'Estabilidad Mecánica % min': 0,
 'Estabilidad Mecánica % max': 0,
 'Resistencia al Lavado por Agua a 80 °C % min': 0,
 'Resistencia al Lavado por Agua a 80 °C % max': 0
}
"""

################# ----  ---- #################
#-----  Los valores dentro del dataset  -----#
################# ----  ---- #################

"""
Grado NLGI Consistencia:
Observado: min=0.02, max=2.98
Rango físico: 0-5

Viscosidad del Aceite Base a 40 °C:
Observado: min=40.13, max=2481.34
Rango físico: 40-4000

Punto de Gota °C:
Observado: min=96.63, max=350.15
Rango físico: 80-400

Punto de Soldadura Cuatro Bolas, kgf:
Observado: min=250.01, max=946.43
Rango físico: 200-1000

Temperatura de Servicio °C min:
Observado: min=-45.94, max=8.18
Rango físico: -60-20

Temperatura de Servicio °C max:
Observado: min=80.87, max=251.54
Rango físico: 80-260

Penetracion de Cono a 25 °C 0.1mm min:
Observado: min=220.13, max=428.84
Rango físico: 220-475

Penetracion de Cono a 25 °C 0.1mm max:
Observado: min=226.96, max=469.57
Rango físico: 220-475

Estabilidad Mecánica % min:
Observado: min=0.02, max=10.95
Rango físico: 0-20

Estabilidad Mecánica % max:
Observado: min=0.10, max=19.91
Rango físico: 0-20

Resistencia al Lavado por Agua a 80 °C % min:
Observado: min=0.01, max=7.27
Rango físico: 0-15

Resistencia al Lavado por Agua a 80 °C % max:
Observado: min=0.05, max=6.77
Rango físico: 0-15

"""

########### Ejemplo ###########
# Comentar para ver estadísticas de las variables
entrada_usuario = {
    "Grado NLGI Consistencia": 1,
    "Viscosidad del Aceite Base a 40 °C": 1000,
    "Resistencia al Lavado por Agua a 80 °C % max": 2
}

variables_obj = []
for col, _ in entrada_usuario.items():
    variables_obj.append(col)

# Se instancia la clase con las variables objetivo y el umbral (correlación mínima)
reg = Clase_regresor(df, umbral=0.3, variables_objetivo=variables_obj)

# --- ver correlaciones y métricas
#reg.matriz_de_correlacion()
#reg.metricas_regresores()
reg.metricas_regresores(graficas=False)

# Entrenar los modelos finales con el dataset
reg.entrenar_modelos_finales()

# Obtener recomendación
recomendadas, v_obj = reg.regresor_recomendacion(
    entrada_usuario=entrada_usuario,
    top_k=8,
    mostrar=True)

""" Por si sirve para la interfaz manejar un dataframe con las recomendaciones
y todos sus datos"""

#print("\n\n========= Dataframe de grasas =========")
#print(recomendadas)



