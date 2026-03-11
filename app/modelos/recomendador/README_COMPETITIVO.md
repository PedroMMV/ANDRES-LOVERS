# Sistema de Recomendación con Análisis Competitivo 🏆

## 📋 Descripción

Sistema avanzado que combina recomendación de productos con **análisis competitivo completo**. Permite comparar productos propios contra rivales, identificar ventajas competitivas, gaps de mercado y oportunidades estratégicas.

## 🆕 Nuevas Funciones Competitivas

### 1. **Buscar Rivales Similares** 🔍
Encuentra qué productos de la competencia son más similares a tus productos.

```python
rec.buscar_rivales_similares('Grasa_1', top_n=5)
```

**Uso:** Identificar contra quién compites directamente.

### 2. **Comparación Detallada** ⚔️
Compara propiedad por propiedad un producto propio vs rival.

```python
rec.comparar_con_rival('Grasa_1', 'Starplex EP 2')
```

**Output:**
- Información básica (aceite, espesante)
- Comparación numérica de todas las propiedades
- Indicadores de ventaja (✓/✗)
- Resumen de ventajas competitivas

### 3. **Encontrar Competidor Directo** 🎯
Para un producto rival, encuentra cuál de tus productos compite mejor contra él.

```python
rec.encontrar_competidor_directo('ANDEROL FGCS-2')
```

**Uso:** Definir estrategia de ventas contra productos rivales específicos.

### 4. **Benchmarking de Propiedades** 📊
Compara estadísticas de una propiedad: propios vs rivales.

```python
rec.benchmarking_categoria('temp_max')
```

**Analiza:**
- Mínimo, máximo, promedio
- Número de productos
- Ventajas/desventajas relativas

### 5. **Gap Analysis** 💡
Identifica qué tienen los rivales que tú no tienes.

```python
rec.gap_analysis()
```

**Detecta:**
- Gaps en límites superiores (necesitas productos de mayor rendimiento)
- Gaps en límites inferiores (oportunidad en segmento económico)
- Oportunidades específicas de desarrollo

### 6. **Matriz Competitiva** 🗺️
Visualiza el posicionamiento en el mercado por segmentos.

```python
rec.matriz_competitiva()
```

**Segmenta por:**
- Alta/Baja temperatura
- Alta/Baja viscosidad
- Identifica dónde tienes ventaja y dónde hay oportunidades

### 7. **Listar Productos Rivales** 📋
Ver catálogo completo de la competencia.

```python
rec.listar_productos_rivales()
```

## 🚀 Casos de Uso Reales

### Caso 1: Preparar Presentación de Ventas
```python
# Tu cliente usa "Starplex EP 2", necesitas mostrar por qué tu producto es mejor

# 1. Encontrar tu mejor alternativa
rec.encontrar_competidor_directo('Starplex EP 2')

# 2. Hacer comparación detallada
rec.comparar_con_rival('Grasa_1', 'Starplex EP 2')

# Resultado: Presentación con 6/6 ventajas técnicas
```

### Caso 2: Análisis Estratégico
```python
# Necesitas identificar oportunidades de negocio

# 1. Ver gaps de mercado
rec.gap_analysis()

# 2. Analizar posicionamiento
rec.matriz_competitiva()

# 3. Benchmarking por propiedad clave
rec.benchmarking_categoria('temp_max')

# Resultado: Roadmap de desarrollo de productos
```

### Caso 3: Respuesta a RFQ (Request for Quotation)
```python
# Cliente pide cotizar alternativa a producto rival

# 1. Identificar rivales similares a tu línea
rec.buscar_rivales_similares('Grasa_5', top_n=10)

# 2. Encontrar tu mejor opción contra el rival específico
rec.encontrar_competidor_directo('Delo Grease EP 2')

# Resultado: Producto óptimo para cotizar
```

### Caso 4: Entrenamiento de Fuerza de Ventas
```python
# Preparar al equipo para competir

# 1. Listar principales rivales
rec.listar_productos_rivales()

# 2. Para cada rival, hacer comparación con tu producto
rec.comparar_con_rival('Grasa_10', 'ULTRAPLEX MCS 2')

# Resultado: Material de entrenamiento con ventajas técnicas
```

## 📊 Estructura de Datos

### Productos Propios: 51 productos
- Catálogo interno completo
- Todas las propiedades técnicas
- Descripciones y aplicaciones

### Productos Rivales: 13 productos
- Principales competidores del mercado
- Propiedades técnicas comparables
- Información pública disponible

### Total en Análisis: 64 productos

## 🎯 Propiedades Comparables

Las siguientes propiedades se pueden comparar entre propios y rivales:

| Propiedad | Descripción | Importancia |
|-----------|-------------|-------------|
| `visc_40c` | Viscosidad a 40°C | Alta - Define aplicación |
| `temp_min` | Temperatura mínima | Alta - Rango operativo |
| `temp_max` | Temperatura máxima | Alta - Límite superior |
| `penetracion` | Penetración de cono | Media - Consistencia |
| `punto_gota` | Punto de gota | Alta - Estabilidad térmica |
| `soldadura_4bolas` | Soldadura 4 bolas | Alta - Carga extrema |
| `desgaste_4bolas` | Desgaste 4 bolas | Alta - Protección |
| `carga_timken` | Carga Timken | Media - Capacidad carga |

## 💼 Ejemplo de Análisis Completo

```python
from recomendador_grasas_competitivo import RecomendadorGrasasCompetitivo

# Inicializar
rec = RecomendadorGrasasCompetitivo(
    'datos_grasas_Tec__1_.csv',
    'Grasas_Consolidado_Total.csv'
)

# === ANÁLISIS ESTRATÉGICO COMPLETO ===

# 1. Identificar oportunidades de mercado
print("=== GAP ANALYSIS ===")
rec.gap_analysis()

# 2. Ver posicionamiento general
print("\n=== MATRIZ COMPETITIVA ===")
rec.matriz_competitiva()

# 3. Benchmarking de propiedades clave
print("\n=== BENCHMARKING TEMPERATURA ===")
rec.benchmarking_categoria('temp_max')

print("\n=== BENCHMARKING VISCOSIDAD ===")
rec.benchmarking_categoria('visc_40c')

# 4. Análisis de productos específicos
print("\n=== COMPETENCIA DIRECTA ===")
# Para cada producto importante, identificar competencia
for producto in ['Grasa_1', 'Grasa_5', 'Grasa_10']:
    print(f"\n--- Rivales similares a {producto} ---")
    rivales = rec.buscar_rivales_similares(producto, top_n=3)
    print(rivales)

# Resultado: Reporte estratégico completo
```

## 🎨 Ventajas del Sistema Competitivo

### Para Ventas 💰
- ✅ Identificar ventajas técnicas inmediatamente
- ✅ Preparar comparaciones detalladas
- ✅ Justificar precio premium con datos
- ✅ Responder objeciones con hechos

### Para Marketing 📢
- ✅ Posicionamiento competitivo claro
- ✅ Mensajes diferenciadores basados en datos
- ✅ Identificar nichos sin competencia
- ✅ Contenido técnico para campañas

### Para Desarrollo 🔬
- ✅ Identificar gaps de producto
- ✅ Priorizar desarrollo basado en mercado
- ✅ Benchmarking técnico continuo
- ✅ Roadmap guiado por competencia

### Para Estrategia 🎯
- ✅ Análisis competitivo completo
- ✅ Identificar amenazas y oportunidades
- ✅ Decisiones basadas en datos
- ✅ Ventaja competitiva sostenible

## 📈 Métricas Clave

### Ventajas Competitivas
- **6/6 ventajas** vs Starplex EP 2 (ejemplo real)
- **Temperatura máxima**: 240°C vs 180°C (33% superior)
- **Viscosidad**: Rango más amplio que competencia

### Cobertura de Mercado
- **51 productos propios** vs **13 rivales principales**
- **4:1 ratio** de productos
- **Mayor diversidad** de portafolio

## 🔧 Instalación y Uso

### Requisitos
```bash
pip install pandas numpy scikit-learn
```

### Archivos Necesarios
1. `recomendador_grasas_competitivo.py` - Sistema principal
2. `datos_grasas_Tec__1_.csv` - Catálogo propio
3. `Grasas_Consolidado_Total.csv` - Catálogo rivales

### Ejecutar Menú Interactivo
```bash
python recomendador_grasas_competitivo.py
```

### Uso Programático
```python
from recomendador_grasas_competitivo import RecomendadorGrasasCompetitivo

rec = RecomendadorGrasasCompetitivo(
    'datos_grasas_Tec__1_.csv',
    'Grasas_Consolidado_Total.csv'
)

# Usar cualquier función
resultados = rec.buscar_rivales_similares('Grasa_1')
```

## 🎓 Tips Avanzados

### Tip 1: Análisis por Segmento
```python
# Para analizar un segmento específico
rec.benchmarking_categoria('temp_max')
rec.benchmarking_categoria('visc_40c')
rec.matriz_competitiva()  # Ver posicionamiento cruzado
```

### Tip 2: Preparar Batalla de Ventas
```python
# Cuando compites contra un rival específico
rival_target = 'Delo Grease EP 2'

# 1. Tu mejor arma
rec.encontrar_competidor_directo(rival_target)

# 2. Análisis detallado
rec.comparar_con_rival('Grasa_X', rival_target)
```

### Tip 3: Identificar Nichos Desprotegidos
```python
# Buscar gaps y matriz competitiva
rec.gap_analysis()
rec.matriz_competitiva()

# Identificar dónde los rivales son fuertes pero tú eres débil
# = Amenaza competitiva

# Identificar dónde los rivales son débiles y tú eres fuerte
# = Oportunidad de ataque
```

## 🏆 Resultados Esperados

### Inmediatos
- ✅ Comparaciones técnicas listas en segundos
- ✅ Identificación de ventajas competitivas
- ✅ Datos para presentaciones de ventas

### Corto Plazo (1-3 meses)
- ✅ Mejores tasas de conversión en ventas
- ✅ Argumentos técnicos más sólidos
- ✅ Mejor posicionamiento vs competencia

### Largo Plazo (6-12 meses)
- ✅ Roadmap de productos basado en gaps
- ✅ Ventaja competitiva sostenible
- ✅ Liderazgo técnico en segmentos clave

## 📞 Soporte

Para dudas o mejoras, contactar al desarrollador.

---

**Desarrollado por:** Yose - ITESM IDM  
**Versión:** 2.0 con Análisis Competitivo  
**Fecha:** 2024
