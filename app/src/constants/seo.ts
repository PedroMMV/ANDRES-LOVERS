/**
 * SEO metadata for each page
 */

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
}

export const SEO_DATA: Record<string, PageSEO> = {
  home: {
    title: 'Smart Lube Recommender | Interlub x Tec de Monterrey',
    description:
      'Encuentra la grasa lubricante perfecta con nuestro sistema inteligente de recomendación basado en similitud coseno. Compara propiedades físicas y químicas para obtener las mejores alternativas.',
    keywords:
      'recomendador de grasas, lubricantes industriales, similitud coseno, análisis de propiedades, Interlub, Tec de Monterrey, machine learning, NLGI',
  },
  dataExplorer: {
    title: 'Data Explorer - Exploración de Datos | Smart Lube Recommender',
    description:
      'Explora el dataset completo de grasas lubricantes. Analiza características, distribuciones estadísticas y el pipeline de preprocesamiento de datos utilizado en el sistema de recomendación.',
    keywords:
      'explorador de datos, dataset de lubricantes, análisis estadístico, preprocesamiento de datos, visualización de datos, features engineering',
  },
  regressor: {
    title: 'Regressor - Predicción de Propiedades | Smart Lube Recommender',
    description:
      'Predice propiedades físicas y químicas de grasas lubricantes usando modelos de regresión lineal. Entrena modelos personalizados y valida predicciones con métricas de rendimiento.',
    keywords:
      'regresión lineal, predicción de propiedades, machine learning, modelado predictivo, viscosidad, punto de goteo, RMSE, R²',
  },
  metrics: {
    title: 'Métricas y Reportes - Evaluación del Sistema | Smart Lube Recommender',
    description:
      'Revisa las métricas de rendimiento del sistema, precisión de las recomendaciones y la justificación de diseño. Análisis detallado de la metodología de similitud coseno implementada.',
    keywords:
      'métricas de rendimiento, evaluación de modelos, similitud coseno, precisión de recomendaciones, validación de sistema, reporting',
  },
  help: {
    title: 'Ayuda y Acerca de | Smart Lube Recommender',
    description:
      'Documentación completa del Smart Lube Recommender. Aprende cómo usar el sistema, entiende la metodología de recomendación y descubre más sobre la colaboración Interlub x Tec de Monterrey.',
    keywords:
      'ayuda, documentación, tutorial, guía de usuario, acerca de, Interlub, Tecnológico de Monterrey, soporte',
  },
};
