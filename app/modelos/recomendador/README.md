# Sistema de Recomendación de Grasas Industriales

## 📋 Descripción

Sistema completo de recomendación de grasas industriales que replica la funcionalidad del sistema de recomendación de películas, adaptado para trabajar con datos técnicos de lubricantes.

## 🚀 Características

El sistema implementa **5 métodos de recomendación**:

1. **Recomendador Simple**: Basado en completitud de datos técnicos
2. **Recomendador por Contenido**: Usa TF-IDF para encontrar grasas similares
3. **Filtrado por Rangos**: Búsqueda por propiedades técnicas específicas
4. **Búsqueda por Características**: Filtros combinados (aceite base, espesante, temperatura)
5. **Recomendador Híbrido**: Combina similitud de contenido con filtros numéricos

## 📦 Requisitos

```bash
pip install pandas numpy scikit-learn
```

## 💻 Uso

### Ejecución del Menú Interactivo

```bash
python recomendador_grasas.py
```

El sistema debe ejecutarse en el mismo directorio donde se encuentra el archivo `datos_grasas_Tec__1_.csv`

### Uso Programático

```python
from recomendador_grasas import RecomendadorGrasas

# Inicializar el recomendador
recomendador = RecomendadorGrasas('datos_grasas_Tec__1_.csv')

# Ejemplo 1: Buscar grasas similares
similares = recomendador.recomendar_por_contenido('Grasa_1', top_n=5)
print(similares)

# Ejemplo 2: Filtrar por temperatura
resultado = recomendador.recomendar_por_rango('temp_max', 100, 200, top_n=10)
print(resultado)

# Ejemplo 3: Búsqueda por características
grasas = recomendador.buscar_por_caracteristicas(
    aceite_base='Mineral',
    temp_min=-20,
    temp_max=150
)
print(grasas)

# Ejemplo 4: Recomendación híbrida
filtros = {
    'temp_max': (150, 250),
    'visc_40c': (200, 800)
}
hibrido = recomendador.recomendar_hibrido('Grasa_5', filtros_numericos=filtros)
print(hibrido)

# Ejemplo 5: Ver información detallada
recomendador.mostrar_info_grasa('Grasa_1')
```

## 🎯 Funcionalidades del Menú

### 1. Mostrar grasas más completas
Muestra las grasas con mayor cantidad de datos técnicos disponibles.

### 2. Buscar grasas similares
Encuentra grasas similares basándose en descripciones, aplicaciones y beneficios usando TF-IDF y similitud del coseno.

### 3. Filtrar por rango
Busca grasas dentro de un rango específico para cualquier propiedad técnica:
- Viscosidad a 40°C
- Penetración de cono
- Punto de gota
- Temperatura de servicio
- Y más...

### 4. Buscar por características
Combina múltiples filtros:
- Tipo de aceite base
- Tipo de espesante
- Rango de temperatura mínima
- Rango de temperatura máxima

### 5. Recomendación híbrida
Combina similitud de contenido con filtros técnicos personalizados para obtener recomendaciones altamente específicas.

### 6. Información detallada
Muestra toda la información técnica, aplicaciones y beneficios de una grasa específica.

### 7. Listar opciones
Muestra todas las opciones disponibles en el catálogo (aceites base, espesantes, rangos de temperatura).

## 📊 Estructura del Código

```
RecomendadorGrasas
├── __init__()              # Inicialización y carga de datos
├── recomendar_por_popularidad()    # Recomendador simple
├── recomendar_por_contenido()      # Basado en TF-IDF
├── recomendar_por_rango()          # Filtrado numérico
├── buscar_por_caracteristicas()    # Búsqueda combinada
├── recomendar_hibrido()            # Sistema híbrido
├── mostrar_info_grasa()            # Información detallada
└── listar_opciones()               # Opciones del catálogo
```

## 🔧 Propiedades Técnicas Soportadas

El sistema maneja las siguientes propiedades:
- `visc_40c`: Viscosidad del aceite base a 40°C (cSt)
- `penetracion`: Penetración de cono a 25°C (0.1mm)
- `punto_gota`: Punto de gota (°C)
- `soldadura_4bolas`: Punto de soldadura cuatro bolas (kgf)
- `desgaste_4bolas`: Desgaste cuatro bolas (mm)
- `carga_timken`: Carga Timken Ok (lb)
- `presion_flujo`: Presión de flujo a -30°C (mbar)
- `visc_dinamica`: Viscosidad dinámica a 25°C (cP)
- `temp_min`: Temperatura de servicio mínima (°C)
- `temp_max`: Temperatura de servicio máxima (°C)

## 📝 Ejemplos de Uso

### Buscar grasas para alta temperatura
```python
recomendador.buscar_por_caracteristicas(temp_max=200)
```

### Encontrar alternativas a una grasa específica
```python
recomendador.recomendar_por_contenido('Grasa_10', top_n=5)
```

### Filtrar por viscosidad específica
```python
recomendador.recomendar_por_rango('visc_40c', 400, 600)
```

## 🎨 Ventajas del Sistema

✅ **Interfaz intuitiva**: Menú interactivo fácil de usar
✅ **Múltiples métodos**: 5 algoritmos de recomendación diferentes
✅ **Flexible**: Uso tanto interactivo como programático
✅ **Completo**: Maneja todas las propiedades técnicas del catálogo
✅ **Robusto**: Manejo de errores y validación de datos
✅ **Documentado**: Código completamente comentado

## 👤 Autor

Yose - ITESM IDM

## 📅 Fecha

2024
