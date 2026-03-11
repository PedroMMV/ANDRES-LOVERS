<div align="center">

# Interlub Grease Recommender

### Aplicación Web de Recomendación de Grasas Industriales

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<br>

Sistema de recomendación de grasas industriales basado en técnicas de Machine Learning.
Frontend moderno en React + Backend FastAPI con múltiples modelos de análisis.

[Inicio Rápido](#inicio-rápido) | [Características](#características) | [API Docs](#api-endpoints) | [Stack](#stack-tecnológico)

</div>

---

## Características

<table>
<tr>
<td width="50%">

### Recomendador de Grasas
- Búsqueda por similitud coseno (TF-IDF)
- Filtrado por características
- Búsqueda por rangos
- Método híbrido

</td>
<td width="50%">

### Análisis Competitivo
- Comparación con productos rivales
- Análisis de gaps de mercado
- Benchmarking por propiedad
- Matriz competitiva

</td>
</tr>
<tr>
<td width="50%">

### Regresión Lineal
- Predicción de propiedades
- Selección automática de predictores
- Métricas R², RMSE, MAE
- Recomendación por distancia euclidiana

</td>
<td width="50%">

### Clustering K-Means
- Segmentación de productos
- Análisis del codo
- Silhouette score
- Recomendación por cluster

</td>
</tr>
<tr>
<td width="50%">

### Análisis Factorial
- Reducción de dimensionalidad
- Scree plot y cargas factoriales
- Factor scores
- Descubrimiento de patrones

</td>
<td width="50%">

### Explorador de Datos
- Estadísticas de datasets
- Análisis de datos faltantes
- Pipeline de preprocesamiento
- Visualizaciones interactivas

</td>
</tr>
</table>

---

## Inicio Rápido

### Requisitos Previos

- **Node.js** 18+ y npm
- **Python** 3.10+
- **pip**

### Instalación

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
cd backend
pip install -r requirements.txt
```

### Ejecutar la Aplicación

#### Opción 1: Panel de Control (Recomendado para Windows)

```bash
app.bat
```

| Opción | Descripción |
|:------:|-------------|
| 1 | Iniciar servicios (Backend + Frontend) |
| 2 | Detener servicios |
| 3 | Reiniciar servicios |
| 4 | Verificar estado |
| 5 | Abrir navegador |
| 6 | Ver documentación API |

#### Opción 2: Iniciar Manualmente

```bash
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Frontend
npm run dev
```

### URLs de Acceso

| Servicio | URL |
|:--------:|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |

---

## Estructura del Proyecto

```
app/
+-- app.bat                          # Panel de control Windows
+-- package.json                     # Dependencias frontend
+-- vite.config.ts                   # Configuración Vite
+-- tailwind.config.js               # Configuración Tailwind
|
+-- backend/                         # Backend FastAPI
|   +-- main.py                      # Servidor API principal
|   +-- requirements.txt             # Dependencias Python
|
+-- modelos/                         # Modelos de ML
|   +-- recomendador/                # Similitud coseno + competitivo
|   |   +-- recomendador_grasas.py
|   |   +-- recomendador_grasas_competitivo.py
|   |   +-- datos_grasas_Tec.csv
|   |   +-- Grasas_Consolidado_Total.csv
|   +-- regresor/                    # Regresión lineal
|   |   +-- regresor_grasas.py
|   +-- cluster/                     # K-Means clustering
|   |   +-- cluster_grasas.py
|   +-- factorial/                   # Análisis factorial
|       +-- factorial_grasas.py
|
+-- src/                             # Frontend React
|   +-- pages/                       # Páginas
|   |   +-- HomeRecommender.tsx      # Recomendador + competitivo
|   |   +-- DataExplorer.tsx         # Explorador de datos
|   |   +-- Regressor.tsx            # Regresión lineal
|   |   +-- Clustering.tsx           # K-Means
|   |   +-- FactorAnalysis.tsx       # Análisis factorial
|   |   +-- HelpAbout.tsx            # Ayuda
|   +-- components/                  # Componentes React
|   +-- services/                    # Llamadas API
|   +-- types/                       # Tipos TypeScript
|
+-- public/data/                     # Datasets
    +-- datos_sinteticos_1200.csv
```

---

## Páginas de la Aplicación

### 1. Home / Recomendador (`/`)

**Modo Normal** - 5 algoritmos de recomendación:

| Método | Descripción |
|--------|-------------|
| Por Contenido (TF-IDF) | Similitud coseno en descripciones textuales |
| Por Características | Filtrado por aceite base, espesante, temperatura |
| Por Rango | Búsqueda por rangos numéricos |
| Por Popularidad | Ranking por completitud de datos |
| Híbrido | Contenido + filtros numéricos |

**Modo Competitivo** - 6 análisis estratégicos:

| Método | Descripción |
|--------|-------------|
| Rivales Similares | Productos competidores similares |
| Mejor Competidor | Tu mejor producto vs un rival |
| Comparar Productos | Comparación cabeza a cabeza |
| Análisis de Gaps | Oportunidades de mercado |
| Benchmarking | Comparación estadística |
| Matriz Competitiva | Vista completa del mercado |

---

### 2. Explorador de Datos (`/data-explorer`)

- Estadísticas de datasets (Interlub, Rivales, Sintético)
- Distribución de datos faltantes
- Pipeline de preprocesamiento
- Tipos de variables

---

### 3. Regresor (`/regressor`)

**Flujo:**
1. Seleccionar variable objetivo
2. Elegir predictores (auto/manual)
3. Configurar % test
4. Entrenar y evaluar

**Métricas:** R², RMSE, MAE, Coeficientes

**Salidas:** Predicción de valores o Recomendación de grasas similares

---

### 4. Clustering (`/clustering`)

**Flujo:**
1. Cargar variables
2. Análisis del codo (1-10 clusters)
3. Entrenar K-Means
4. Obtener recomendaciones por cluster

**Métricas:** Silhouette Score, Inercia (WCSS), K óptimo

---

### 5. Análisis Factorial (`/factor-analysis`)

**Flujo:**
1. Cargar variables
2. Generar scree plot
3. Configurar número de factores
4. Analizar cargas y scores

**Salidas:** Cargas factoriales, Varianza explicada, Factor scores

---

## API Endpoints

### Health & Dataset

```http
GET  /api/health                           # Estado del servidor
GET  /api/dataset/overview                 # Stats Interlub
GET  /api/dataset/overview/rivals          # Stats competencia
GET  /api/dataset/overview/expanded        # Stats sintético
GET  /api/dataset/categorical-options      # Opciones categóricas
```

### Productos

```http
GET  /api/products                         # Lista productos (paginado)
GET  /api/products/count                   # Conteo total
GET  /api/products/{id}                    # Producto por ID
GET  /api/rivals                           # Lista rivales
```

### Recomendaciones

```http
GET  /api/recommend/by-popularity          # Por popularidad
POST /api/recommend/by-characteristics     # Por características
POST /api/recommend/by-content             # Por contenido (TF-IDF)
POST /api/recommend/by-range               # Por rango
POST /api/recommend/hybrid                 # Híbrido
```

### Análisis Competitivo

```http
POST /api/recommend/rivals-similar         # Rivales similares
POST /api/recommend/find-competitor        # Mejor competidor
POST /api/recommend/compare                # Comparar productos
GET  /api/analysis/gap                     # Análisis de gaps
GET  /api/analysis/benchmarking/{prop}     # Benchmarking
GET  /api/analysis/competitive-matrix      # Matriz competitiva
```

### Regresión

```http
GET  /api/regression/features              # Variables disponibles
GET  /api/regression/correlation           # Matriz correlación
GET  /api/regression/correlated-variables  # Variables correlacionadas
POST /api/regression/train                 # Entrenar modelo
POST /api/regression/predict               # Predecir
POST /api/regression/recommend             # Recomendar por regresión
```

### Clustering

```http
GET  /api/clustering/variables             # Variables disponibles
GET  /api/clustering/elbow                 # Análisis del codo
POST /api/clustering/train                 # Entrenar K-Means
GET  /api/clustering/summary               # Resumen clusters
POST /api/clustering/recommend             # Recomendar por cluster
GET  /api/clustering/products/{cluster}    # Productos del cluster
```

### Análisis Factorial

```http
GET  /api/factorial/variables              # Variables disponibles
GET  /api/factorial/scree                  # Datos scree plot
POST /api/factorial/train                  # Entrenar modelo
GET  /api/factorial/loadings               # Cargas factoriales
GET  /api/factorial/summary                # Resumen factores
POST /api/factorial/recommend              # Recomendar por factores
```

---

## Algoritmos de ML

| Algoritmo | Propósito | Librería |
|-----------|-----------|----------|
| **TF-IDF + Coseno** | Matching textual | `sklearn.feature_extraction` |
| **K-Means** | Segmentación | `sklearn.cluster` |
| **Regresión Lineal** | Predicción | `sklearn.linear_model` |
| **Análisis Factorial** | Reducción dim. | `sklearn.decomposition` |
| **Silhouette** | Calidad clusters | `sklearn.metrics` |
| **StandardScaler** | Normalización | `sklearn.preprocessing` |

---

## Stack Tecnológico

<table>
<tr>
<td align="center" width="50%">

### Frontend

| Tecnología | Versión |
|:----------:|:-------:|
| React | 18.2 |
| TypeScript | 5.0 |
| Vite | 5.0 |
| Tailwind CSS | 3.4 |
| React Router | 6.0 |
| Recharts | 2.10 |
| Lucide Icons | - |

</td>
<td align="center" width="50%">

### Backend

| Tecnología | Versión |
|:----------:|:-------:|
| Python | 3.10+ |
| FastAPI | 0.100+ |
| Uvicorn | - |
| Pandas | 2.0 |
| NumPy | 1.24 |
| scikit-learn | 1.3 |
| Pydantic | 2.0 |

</td>
</tr>
</table>

---

## Desarrollo

### Comandos

```bash
# Frontend
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # Linter

# Backend
python main.py       # Servidor FastAPI
```

### Puertos

| Servicio | Puerto |
|:--------:|:------:|
| Frontend (Vite) | 5173 |
| Backend (FastAPI) | 8000 |

### CORS Habilitados

- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:5173`

---

## Solución de Problemas

<details>
<summary><b>El backend no inicia</b></summary>

1. Verificar Python 3.10+ instalado
2. Instalar dependencias: `pip install -r backend/requirements.txt`
3. Verificar CSVs en `modelos/recomendador/`
</details>

<details>
<summary><b>Frontend no conecta al backend</b></summary>

1. Verificar backend corriendo en puerto 8000
2. Revisar configuración CORS en `backend/main.py`
3. Verificar firewall no bloquea puertos
</details>

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

**Tecnológico de Monterrey** | Métodos Multivariados | 2025

</div>

---

## Licencia

Proyecto académico - ITESM

---

<div align="center">

Hecho por **ANDRES-LOVERS**

</div>
