
# Visualización y manejo de datos con pandas
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import pandas as pd

# Importar librerías para generación de datos sintéticos
from sklearn.preprocessing import RobustScaler
import numpy as np

# Librerías para generación de datos sintéticos
from copulas.multivariate import GaussianMultivariate
from copulas.univariate import ParametricType, Univariate
#### - Omitido - ####
from sdv.metadata import Metadata
from sdv.single_table import CTGANSynthesizer

# Validación de datos sintéticos
from scipy.stats import ks_2samp

"""
Investigación y argumentación de la función para generar datos sintéticos

- Mediana, moda y media: introduce mucho sesgo y no respeta la variabilidad de los datos, 
es decir, no captaría las relaciones no lineales y solo reproduciría los mismos datos.
- Regresión múltiple: puedes ser buena para algunas variables, pero la mayoría de variables no
se correlacionan. Genera datos muy restringidos; no crea nueva varianza realista.
- KNN Imputer / KNN Synthesis: crea datos por cercanía en vecinos, pero no genera nuevas 
relaciones que podrían existen entre grasas más complejas. Dentro de valores límites inferiores y superiores,
crea nuevos datos que se parecen a los existentes, pero no representan nuevas relaciones con varianza
similar o relaciones complejas. 

Fuente de link: https://sdv.dev/Copulas/tutorials/03_Multivariate_Distributions.html#
"""

### --- Metodología --- ###
"""
La metodología es, evaluada en main_experiment(), es: 
- Escalar los datos continuos con RobustScaler para minimizar el impacto de outliers.
- Usar GaussianCopula para modelar las relaciones entre variables y generar datos sintéticos.
    - Se verifica la calidad de los datos generados con la función verificar_sesgo().
- Regresar los datos a escala original de los datos sintéticos para devolverlos a su escala original.
- Eliminar valores fuera de los límites reales conocidos para cada variable.
    - Detección de outliers y limpieza estadística
- Evaluar la calidad de los datos sintéticos comparando distribuciones y relaciones con los datos originales.
"""


############# ---------------- #############
#          Clase Datos_sinteticos
############# ---------------- #############

class Datos_sinteticos():
    def __init__(self, df):
        # - Se asume que df ya está limpio y sin valores nulos
        # Toma el dataframe limpio y prepara para generación de datos sintéticos
        
        self.df = df
        # Obtener variables numéricas
        self.num_variables = df.select_dtypes(include=[np.number]).columns.tolist()
        self.num_variables.remove("idGrasas") 
        self.data = df[self.num_variables]
        
    def escalar_datos(self):
        # Escala los datos con RobustScaler
        self.scaler = RobustScaler()
        self.data_scaled = pd.DataFrame(self.scaler.fit_transform(self.data), columns=self.num_variables)
        
    def gauss_copulas(self, lenght = 300):
        """Genera datoas sintéticos usando Gaussian Copula"""
        # Ajustamos de forma paramétrica con todo el dataset
        univariate = Univariate(
            parametric=ParametricType.PARAMETRIC,
            selection_sample_size=None)
        # Crear el modelo GaussianMultivariate
        model = GaussianMultivariate(distribution=univariate, random_state=42)
        
        model.fit(self.data_scaled) 
        self.data_gauss = model.sample(lenght) 
    
    def CTGAN(self, lenght = 1_000, info = False, epochs=300):
        ### Función omitida ###
        """Genera extrae los metados del dataframe, datos sintéticos usando CTGAN 
        y hace print del loss durante el entrenamiento"""
        
        # En escala normal los datos sintéticos de Gaussian Copula
        data_gauss_rescaled = pd.DataFrame(self.scaler.inverse_transform(self.data_gauss), columns=self.num_variables) 
        
        # Preparamos datos reales con los sintéticos de Gaussian Copula
        data_train = pd.concat([self.data_scaled, data_gauss_rescaled], ignore_index=True)
        
        metadata = Metadata()
        metadata.detect_table_from_dataframe(
            data=data_train,    # o el df que vayas a usar
            table_name='grasas'
            )
        
        metadata.detect_from_dataframe(data_train)
        
        metadata.update_column(
            "Grado NLGI Consistencia",
            sdtype="categorical"
        )
                
        synthesizer = CTGANSynthesizer(metadata=metadata, 
                                 enforce_rounding=True, 
                                 epochs=epochs, 
                                 batch_size=50, 
                                 generator_lr=1e-4)
        
        synthesizer.fit(data_train)
        self.data_ctgan = synthesizer.sample(num_rows=lenght)
        
        if info == True:
            print(metadata)
            fig = synthesizer.get_loss_values_plot()
            fig.show()
    
    def return_data(self, method="CTGAN"):
        """Regresa los datos sintéticos generados por el método especificado"""
        if method == "CTGAN":
            return self.data_ctgan
        elif method == "Gauss":
            return self.data_gauss
        else:
            raise ValueError("Método no reconocido. Usa 'CTGAN' o 'Gauss'.")
        
    
    def verificar_sesgo(self, data):
        """Aplicamos la prueba de Kolmogorov-Smirnov para cada variable numérica
        y verificamos si las distribuciones son similares entre los datos originales y sintéticos."""
        # Printea la prueba de KS y gráficas de comparación
        
        # Ajustamos el sample para ser "justos" con la prueba
        data = data.sample(n=len(self.data_scaled), random_state=42).reset_index(drop=True) 
        stats = {}
        p_values = {}
        
        for col in self.num_variables:
            stat, p_value = ks_2samp(self.data_scaled[col], data[col])
            #print(f"Variable: {col}, KS Statistic: {stat}, p-value: {p_value}")
            
            stats[col] = stat
            p_values[col] = p_value
            
            # Graficar las distribuciones
            fig = go.Figure()

            # Histograma de datos originales
            fig.add_trace(go.Histogram(
                x=self.data_scaled[col],
                nbinsx=30,
                name='Original',
                opacity=0.5,
                histnorm='probability density'
            ))

            # Histograma de datos sintéticos
            fig.add_trace(go.Histogram(
                x=data[col],
                nbinsx=30,
                name='Sintético',
                opacity=0.5,
                histnorm='probability density'
            ))

            fig.update_layout(
                title=f"Distribución de {col} - Original vs Sintético",
                xaxis_title=col,
                yaxis_title="Densidad",
                barmode='overlay',
                template='plotly_white'
            )

            fig.show()
        
        print("\nResultados de la prueba de Kolmogorov-Smirnov:") 
        print("\nP-values:")
        for pvalue, col in zip(p_values.values(), p_values.keys()):
            if pvalue > 0.05:
                print(f"La variable {col} no está sesgada (p-value: {pvalue:.4f})")
            else:
                print(f"La variable {col} **está sesgada** (p-value: {pvalue:.4f})")
        print("\nEstadísticas KS:")
        for stat, col in zip(stats.values(), stats.keys()):
            print(f"KS Statistic para {col}: {stat:.4f}")
            
    def desescalar_datos(self, data_sintetica_scaled):
        data_sintetica = pd.DataFrame(self.scaler.inverse_transform(data_sintetica_scaled), columns=self.num_variables)
        return data_sintetica
    
    
############# ---------------- #############
#          Funciones fuera de la clase
############# ---------------- #############

# main para escalar y regresar los datos originales
def transformacion_data(df, lenght):
    """Aplica las transformaciones y genera nuevos datos a partir de la aplicación de la 
    clase Datos_sinteticos"""
    datos = Datos_sinteticos(df)
    datos.escalar_datos()
    datos.gauss_copulas(lenght = lenght)
    datos.verificar_sesgo(datos.return_data(method="Gauss"))
    df = datos.desescalar_datos(datos.return_data(method="Gauss"))
    return df
    
def verificar_rangos_fisicos(df):
    """Verifica que los valores máximos y mínimos de la data sintética tengan
    sentido físico """
    
    num_variables = df.select_dtypes(include=[np.number]).columns.tolist()
    df = df[num_variables]

    # Valores investigados
    ranges = {
            "Grado NLGI Consistencia": (0, 5),
            "Viscosidad del Aceite Base a 40 °C": (40, 4000),
            "Punto de Gota °C": (80, 400),
            "Punto de Soldadura Cuatro Bolas, kgf": (200, 1000),
            "Temperatura de Servicio °C min": (-60, 20),
            "Temperatura de Servicio °C max": (80, 260),
            "Penetracion de Cono a 25 °C 0.1mm min": (220, 475),
            "Penetracion de Cono a 25 °C 0.1mm max": (220, 475),
            "Estabilidad Mecánica % min": (0, 20),
            "Estabilidad Mecánica % max": (0, 20),
            "Resistencia al Lavado por Agua a 80 °C % min": (0, 15),
            "Resistencia al Lavado por Agua a 80 °C % max": (0, 15),
        }

    ### Guardamos los valores máximos y mínimos en el mismo formato
    ### que la variable ranges para compararlos
    comparar = {}

    for col in num_variables:
        min = df[col].min()
        max = df[col].max()
        
        comparar[col] = (min, max) 
    
    ### Comparamos ###    
    print("\nComparación contra rangos físicos:\n")
    for col, (observed_min, observed_max) in comparar.items():
        if col in ranges:
            real_min, real_max = ranges[col]
            
            ok_min = observed_min >= real_min
            ok_max = observed_max <= real_max
            
            estado = "Dentro de rango" if ok_min and ok_max else "Fuera de rango"
            
            print(f"{col}:")
            print(f"Observado: min={observed_min:.2f}, max={observed_max:.2f}")
            print(f"Rango físico: {real_min}-{real_max}")
            print(f"Resultado: {estado}\n")


############# ---------------- #############
#          Implementación con main
############# ---------------- #############

if __name__ == "__main__":
    lenght = 1280
    df = pd.read_csv("../data/dataset_limpio.csv")
    data = transformacion_data(df, lenght)
    # print(data.describe())
    
    # Guardamos los datos sintéticos
    index = np.arange(0, lenght)
    data["idGrasa"] = index
    data = data.set_index("idGrasa")
    #verificar_rangos_fisicos(data)
    
    #### --- limpieza de valores fuera de rango --- ####
    """Variables fuera de rango: 
    - Temperatura de Servicio °C max:
    - Penetracion de Cono a 25 °C 0.1mm min
    - Penetracion de Cono a 25 °C 0.1mm max
    - Estabilidad Mecánica % max
    - Resistencia al Lavado por Agua a 80 °C % min
    - Resistencia al Lavado por Agua a 80 °C % max
    """
    
    data = data.loc[data["Temperatura de Servicio °C max"].between(80, 260)]

    data = data.loc[data["Penetracion de Cono a 25 °C 0.1mm min"].between(220, 475)]
    data = data.loc[data["Penetracion de Cono a 25 °C 0.1mm max"].between(220, 475)]

    data = data.loc[data["Estabilidad Mecánica % max"].between(0, 20)]

    data = data.loc[data["Resistencia al Lavado por Agua a 80 °C % min"] >= 0]
    data = data.loc[data["Resistencia al Lavado por Agua a 80 °C % max"] >= 0]
    #verificar_rangos_fisicos(data)
    
    data.to_csv("../data/datos_sinteticos_1200.csv")
