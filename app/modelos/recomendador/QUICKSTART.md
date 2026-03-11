# 🚀 Guía de Inicio Rápido

## Instalación y Configuración

### 1. Instalar dependencias
```bash
pip install pandas numpy scikit-learn
```

### 2. Estructura de archivos necesaria
```
tu_proyecto/
├── recomendador_grasas.py      # Sistema principal
├── ejemplos_uso.py              # Ejemplos de uso
├── datos_grasas_Tec__1_.csv    # Base de datos (REQUERIDO)
└── README.md                    # Documentación completa
```

## 🎯 Inicio Rápido - 3 Formas de Usar

### OPCIÓN 1: Menú Interactivo (Más fácil)
```bash
python recomendador_grasas.py
```
Sigue el menú en pantalla - ¡ideal para explorar!

### OPCIÓN 2: Ejemplos Predefinidos
```bash
python ejemplos_uso.py
```
Ejecuta ejemplos pre-programados para aprender.

### OPCIÓN 3: Uso Programático (Más flexible)
```python
from recomendador_grasas import RecomendadorGrasas

# Inicializar
rec = RecomendadorGrasas('datos_grasas_Tec__1_.csv')

# ¡Listo para usar!
similares = rec.recomendar_por_contenido('Grasa_1', top_n=5)
print(similares)
```

## 📚 Top 5 Casos de Uso

### 1️⃣ Encontrar Reemplazos
```python
# ¿Necesitas reemplazar Grasa_5?
rec.recomendar_por_contenido('Grasa_5', top_n=5)
```

### 2️⃣ Filtrar por Temperatura
```python
# Grasas para alta temperatura (>200°C)
rec.recomendar_por_rango('temp_max', 200, 300, top_n=10)
```

### 3️⃣ Buscar por Tipo
```python
# Solo grasas con aceite mineral
rec.buscar_por_caracteristicas(aceite_base='Mineral')
```

### 4️⃣ Búsqueda Avanzada
```python
# Similares a Grasa_1 PERO con temp_max > 180°C
filtros = {'temp_max': (180, 300)}
rec.recomendar_hibrido('Grasa_1', filtros_numericos=filtros)
```

### 5️⃣ Información Completa
```python
# Ver TODO sobre una grasa
rec.mostrar_info_grasa('Grasa_10')
```

## 🎓 Casos de Ejemplo Reales

### Caso 1: "Necesito una grasa para equipo que opera a -25°C"
```python
rec.buscar_por_caracteristicas(temp_min=-30, top_n=5)
```

### Caso 2: "Busco alternativas a mi grasa actual"
```python
rec.recomendar_por_contenido('Grasa_8', top_n=10)
```

### Caso 3: "Grasa para alta velocidad (viscosidad baja)"
```python
rec.recomendar_por_rango('visc_40c', 100, 400, top_n=5)
```

### Caso 4: "Grasa sintética para temperatura extrema"
```python
rec.buscar_por_caracteristicas(
    aceite_base='Sintetico',
    temp_max=200
)
```

### Caso 5: "Similar a Grasa_3 pero para más temperatura"
```python
filtros = {'temp_max': (180, 300)}
rec.recomendar_hibrido('Grasa_3', filtros_numericos=filtros)
```

## 🔧 Propiedades Disponibles para Filtrar

| Código | Descripción | Unidad | Ejemplo Rango |
|--------|-------------|---------|---------------|
| `visc_40c` | Viscosidad a 40°C | cSt | 200-800 |
| `penetracion` | Penetración de cono | 0.1mm | 250-300 |
| `punto_gota` | Punto de gota | °C | 200-350 |
| `soldadura_4bolas` | Soldadura 4 bolas | kgf | 300-800 |
| `desgaste_4bolas` | Desgaste 4 bolas | mm | 0.3-0.8 |
| `carga_timken` | Carga Timken | lb | 40-80 |
| `presion_flujo` | Presión de flujo | mbar | 0-500 |
| `visc_dinamica` | Viscosidad dinámica | cP | 1000-5000 |
| `temp_min` | Temperatura mínima | °C | -40 a 20 |
| `temp_max` | Temperatura máxima | °C | 100 a 300 |

## 💡 Tips y Trucos

### Tip 1: Ver opciones disponibles
```python
rec.listar_opciones()  # Lista TODOS los aceites y espesantes
```

### Tip 2: Exportar resultados
```python
resultados = rec.recomendar_por_contenido('Grasa_1')
resultados.to_csv('mis_recomendaciones.csv', index=False)
```

### Tip 3: Filtrar múltiples propiedades
```python
filtros = {
    'temp_max': (180, 300),
    'visc_40c': (400, 800),
    'soldadura_4bolas': (400, 900)
}
rec.recomendar_hibrido('Grasa_1', filtros_numericos=filtros)
```

### Tip 4: Ver grasas más documentadas
```python
rec.recomendar_por_popularidad(top_n=20)
```

## 🐛 Solución de Problemas

### Error: "No se encontró el archivo"
**Solución:** Asegúrate de que `datos_grasas_Tec__1_.csv` esté en el mismo directorio.

### Error: "No module named 'sklearn'"
**Solución:** 
```bash
pip install scikit-learn
```

### No muestra resultados
**Verificar:**
1. ¿El código de grasa existe? Usa códigos como 'Grasa_1', 'Grasa_2', etc.
2. ¿El rango es correcto? Algunos valores pueden no estar en el dataset.

### Los acentos se ven raros
**Explicación:** Es por la codificación del CSV. Los datos están completos, solo se ven diferente.

## 📊 Output Ejemplo

Cuando ejecutas el menú interactivo verás:
```
================================================================================
SISTEMA DE RECOMENDACIÓN DE GRASAS INDUSTRIALES
================================================================================

Cargando datos...

Creando matriz TF-IDF para análisis de similitud...
✓ Matriz TF-IDF creada exitosamente
✓ Datos cargados exitosamente: 51 grasas en el catálogo
================================================================================

MENÚ PRINCIPAL - SISTEMA DE RECOMENDACIÓN
================================================================================

1. 📊 Mostrar grasas más completas
2. 🔍 Buscar grasas similares
3. 🎯 Filtrar por rango
4. 🔧 Buscar por características
5. 🎭 Recomendación híbrida
6. ℹ️  Ver información detallada
7. 📋 Listar opciones
8. ❌ Salir
```

## 🎉 ¡Listo!

Ya tienes todo lo necesario para:
- ✅ Buscar grasas similares
- ✅ Filtrar por propiedades técnicas
- ✅ Encontrar reemplazos
- ✅ Hacer búsquedas avanzadas
- ✅ Exportar resultados

---

**¿Necesitas ayuda?** Revisa el `README.md` completo para documentación detallada.
