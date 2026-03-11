<div align="center">

# Interlub Grease Recommender

### Sistema Inteligente de Recomendación de Grasas Industriales

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br>

**Proyecto Académico | Tecnológico de Monterrey | Métodos Multivariados en Ciencia de Datos**

[Ir a la Aplicación](#inicio-rápido) | [Documentación](#documentación) | [Datasets](#datasets) | [Equipo](#autores)

</div>

---

## Descripción del Proyecto

Este proyecto desarrolla un **sistema de recomendación inteligente** para grasas lubricantes industriales de la empresa **Interlub**. Utilizando técnicas avanzadas de Machine Learning y análisis multivariado, el sistema permite:

- **Recomendar productos** similares basados en características técnicas
- **Analizar la competencia** mediante comparación de propiedades
- **Predecir propiedades** de grasas usando regresión lineal
- **Segmentar productos** en grupos mediante clustering K-Means
- **Reducir dimensionalidad** con análisis factorial para descubrir patrones

### Objetivos

1. Facilitar la selección de grasas industriales para clientes de Interlub
2. Identificar productos competitivos en el mercado
3. Aplicar métodos multivariados para análisis de datos de lubricantes
4. Desarrollar una interfaz web moderna y funcional

---

## Métodos Multivariados Implementados

| Método | Descripción | Aplicación |
|--------|-------------|------------|
| **TF-IDF + Similitud Coseno** | Vectorización de texto y cálculo de similitud | Recomendación por contenido textual |
| **Regresión Lineal Múltiple** | Predicción de variables continuas | Estimar propiedades faltantes |
| **K-Means Clustering** | Agrupamiento no supervisado | Segmentación de productos |
| **Análisis Factorial** | Reducción de dimensionalidad | Identificar factores latentes |
| **Distancia Euclidiana** | Métrica de similitud numérica | Encontrar productos cercanos |

---

## Estructura del Repositorio

```
ANDRES-LOVERS/
|
+-- app/                             # Aplicación web completa
|   +-- backend/                     # API REST con FastAPI
|   +-- src/                         # Frontend React + TypeScript
|   +-- modelos/                     # Clases de ML en Python
|   |   +-- recomendador/            # Recomendador por similitud coseno
|   |   +-- regresor/                # Regresión lineal
|   |   +-- cluster/                 # Clustering K-Means
|   |   +-- factorial/               # Análisis factorial
|   +-- public/data/                 # Datasets
|   +-- README.md                    # Documentación de la app
|
+-- notebooks/                       # Jupyter notebooks de análisis
|
+-- config.yml                       # Configuración de conda
+-- README.md                        # Este archivo
```

---

## Datasets

El proyecto utiliza tres conjuntos de datos de grasas lubricantes:

| Dataset | Registros | Descripción |
|---------|-----------|-------------|
| `datos_grasas_Tec.csv` | ~50 | Catálogo de productos Interlub |
| `Grasas_Consolidado_Total.csv` | ~100 | Productos de la competencia |
| `datos_sinteticos_1200.csv` | 1,200 | Dataset expandido para entrenamiento de ML |

### Variables Principales

- **Categóricas**: Aceite Base, Espesante, Color, Textura
- **Numéricas**: Grado NLGI, Viscosidad 40°C, Punto de Gota, Penetración, Soldadura 4 Bolas, Temperatura Mín/Máx
- **Textuales**: Descripción, Aplicaciones, Beneficios

---

## Inicio Rápido

### Requisitos

- **Node.js** 18+ y npm
- **Python** 3.10+
- **Git**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/yosebitasgg/ANDRES-LOVERS.git
cd ANDRES-LOVERS

# 2. Ir a la carpeta de la aplicación
cd app

# 3. Instalar dependencias del frontend
npm install

# 4. Instalar dependencias del backend
cd backend
pip install -r requirements.txt
```

### Ejecutar la Aplicación

```bash
# Opción 1: Usar el panel de control (Windows)
cd app
app.bat

# Opción 2: Iniciar manualmente
# Terminal 1 - Backend
cd app/backend
python main.py

# Terminal 2 - Frontend
cd app
npm run dev
```

### URLs

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |

---

## Documentación

La documentación completa de la aplicación web se encuentra en:

**[app/README.md](./app/README.md)**

Incluye:
- Descripción detallada de cada página
- Todos los endpoints de la API
- Guía de desarrollo
- Solución de problemas

---

## Configuración del Entorno Conda (Opcional)

Para usar notebooks de Jupyter con el entorno de conda:

```bash
# Crear entorno
conda env create -f config.yml

# Activar entorno
conda activate mv-tec

# Instalar kernel de Jupyter
conda develop .
```

Para actualizar el entorno:
```bash
conda env update --file config.yml --prune
```

---

## Stack Tecnológico

<table>
<tr>
<td align="center" width="50%">

### Frontend
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2.10-FF6384)

</td>
<td align="center" width="50%">

### Backend
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?logo=fastapi)
![Pandas](https://img.shields.io/badge/Pandas-2.0-150458?logo=pandas)
![scikit-learn](https://img.shields.io/badge/sklearn-1.3-F7931E?logo=scikit-learn)
![NumPy](https://img.shields.io/badge/NumPy-1.24-013243?logo=numpy)

</td>
</tr>
</table>

---

## Autores

<div align="center">

| Matrícula | Nombre |
|:---------:|--------|
| A01612830 | Yoseba Michel Mireles Ahumada |
| A00573182 | Barush Caliel Copado Luna |
| A01741569 | Pedro Manuel Montes Valle |
| A01741944 | Santiago Pérez Mendoza |
| A01246417 | Pedro Emilio Silva Rodríguez |
| A01738369 | Diego Barragán Castillo |

<br>

**Tecnológico de Monterrey** | Métodos Multivariados en Ciencia de Datos | 2025

</div>

---

## Licencia

Este proyecto es de uso académico y fue desarrollado como parte del curso de **Métodos Multivariados en Ciencia de Datos** del Tecnológico de Monterrey.

---

<div align="center">

Hecho por el equipo **ANDRES-LOVERS**

</div>
