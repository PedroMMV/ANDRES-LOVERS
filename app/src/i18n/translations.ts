/**
 * Internationalization translations
 * Supports English (en) and Spanish (es)
 */

export interface Translations {
  nav: {
    home: string;
    dataExplorer: string;
    regressor: string;
    metrics: string;
    help: string;
  };
  home: {
    title: string;
    findSimilar: string;
    competitiveAnalysis: string;
    getRecommendations: string;
    clear: string;
    results: string;
    topK: string;
    selectProduct: string;
    selectRival: string;
    yourProduct: string;
    rivalProduct: string;
    searching: string;
    analyzing: string;
    runAnalysis: string;
    methods: {
      content: string;
      characteristics: string;
      range: string;
      popularity: string;
      hybrid: string;
    };
    competitive: {
      findRivals: string;
      findCompetitor: string;
      compare: string;
      gapAnalysis: string;
      benchmarking: string;
      matrix: string;
    };
    descriptions: {
      content: string;
      characteristics: string;
      range: string;
      popularity: string;
      hybrid: string;
      findRivals: string;
      findCompetitor: string;
      compare: string;
      gapAnalysis: string;
      benchmarking: string;
      matrix: string;
    };
    gettingStarted: {
      title: string;
      normalModeIntro: string;
      competitiveModeIntro: string;
    };
    presets: {
      quickSearch: string;
      nlgiFilter: string;
      highPerformance: string;
      lithiumComplex: string;
      semiSynthetic: string;
      calciumSulfonate: string;
      lowViscosity: string;
      mediumViscosity: string;
      highViscosity: string;
      topBestData: string;
      popularNlgi2: string;
      popularHighVisc: string;
      industrialNlgi2: string;
      highViscMatch: string;
      lightGreaseMatch: string;
    };
    advanced: {
      title: string;
      nlgiGrade: string;
      viscosity40Min: string;
      viscosity40Max: string;
      dropPointMin: string;
      dropPointMax: string;
      penetrationMin: string;
      penetrationMax: string;
    };
    properties: {
      property: string;
      minValue: string;
      maxValue: string;
      tempMin: string;
      tempMax: string;
      aceiteBase: string;
      espesante: string;
      selectAny: string;
      propertyToBenchmark: string;
    };
    catalog: string;
    ownProducts: string;
    rivals: string;
    vs: string;
    authors: string;
  };
  settings: {
    title: string;
    appearance: string;
    dashboard: string;
    advanced: string;
    theme: string;
    language: string;
    density: string;
    light: string;
    dark: string;
    auto: string;
    comfortable: string;
    compact: string;
    defaultPage: string;
    showHints: string;
    autoSave: string;
    defaultTopK: string;
    defaultOnlyActive: string;
    chartAnimations: string;
    colorScheme: string;
    colorSchemeDefault: string;
    colorSchemeColorblind: string;
    colorSchemeMonochrome: string;
    enableExperimentalFeatures: string;
    debugMode: string;
    reset: string;
    export: string;
    import: string;
    resetConfirm: string;
    importSuccess: string;
    importError: string;
  };
  dataExplorer: {
    title: string;
    overview: string;
    missingData: string;
    preprocessing: string;
    totalProducts: string;
    totalFeatures: string;
    missingValues: string;
    completeness: string;
    dataQuality: string;
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  regressor: {
    title: string;
    configuration: string;
    metrics: string;
    predictions: string;
    charts: string;
    targetVariable: string;
    features: string;
    testSize: string;
    randomState: string;
    train: string;
    training: string;
    predict: string;
    predicting: string;
    enterValues: string;
    prediction: string;
    r2Score: string;
    mse: string;
    rmse: string;
    mae: string;
    actualVsPredicted: string;
    residuals: string;
    featureImportance: string;
  };
  metricsReports: {
    title: string;
    systemMetrics: string;
    performance: string;
    usage: string;
    quality: string;
    totalRecommendations: string;
    avgResponseTime: string;
    cacheHitRate: string;
    activeUsers: string;
  };
  help: {
    title: string;
    about: string;
    documentation: string;
    support: string;
    version: string;
    authors: string;
  };
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    close: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    delete: string;
    edit: string;
    view: string;
    add: string;
    remove: string;
    yes: string;
    no: string;
    ok: string;
    apply: string;
    reset: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    submit: string;
    download: string;
    upload: string;
    refresh: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    showing: string;
    of: string;
    to: string;
    page: string;
    rowsPerPage: string;
  };
  results: {
    topRecommendations: string;
    cosineSimilarity: string;
    match: string;
    queryVsProduct: string;
    comparisonBetween: string;
    productComparison: string;
    yourAdvantages: string;
    ties: string;
    rivalAdvantages: string;
    yourValue: string;
    rivalValue: string;
    winner: string;
    you: string;
    rival: string;
    tie: string;
    gapAnalysis: string;
    marketOpportunities: string;
    identified: string;
    rivalsHaveHigher: string;
    rivalsHaveLower: string;
    yourBest: string;
    rivalBest: string;
    gap: string;
    opportunity: string;
    benchmarking: string;
    yourProducts: string;
    rivals: string;
    min: string;
    max: string;
    average: string;
    analysis: string;
    bestMaxGoesTo: string;
    bestAverageGoesTo: string;
    competitiveMatrix: string;
    comparisonsAnalyzed: string;
    rivalProducts: string;
    avgSimilarity: string;
    bestMatchFound: string;
    competesBestAgainst: string;
    with: string;
    similarity: string;
    showingTopOf: string;
    comparisons: string;
  };
}

export const translations: Record<'en' | 'es', Translations> = {
  en: {
    nav: {
      home: 'Home',
      dataExplorer: 'Data Explorer',
      regressor: 'Regressor',
      metrics: 'Metrics',
      help: 'Help',
    },
    home: {
      title: 'Grease Recommender',
      findSimilar: 'Find Similar Products',
      competitiveAnalysis: 'Competitive Analysis',
      getRecommendations: 'Get Recommendations',
      clear: 'Clear',
      results: 'results',
      topK: 'Number of Results (Top K)',
      selectProduct: 'Select a product...',
      selectRival: 'Select a rival product...',
      yourProduct: 'Your Product',
      rivalProduct: 'Rival Product',
      searching: 'Searching...',
      analyzing: 'Analyzing...',
      runAnalysis: 'Run Analysis',
      methods: {
        content: 'TF-IDF Content',
        characteristics: 'Characteristics',
        range: 'Range Search',
        popularity: 'Popularity',
        hybrid: 'Hybrid',
      },
      competitive: {
        findRivals: 'Find Similar Rivals',
        findCompetitor: 'Find Best Competitor',
        compare: 'Compare Products',
        gapAnalysis: 'Gap Analysis',
        benchmarking: 'Benchmarking',
        matrix: 'Competitive Matrix',
      },
      descriptions: {
        content: 'Real cosine similarity',
        characteristics: 'Filter by properties',
        range: 'Value range query',
        popularity: 'Best data completeness',
        hybrid: 'Content + filters',
        findRivals: 'Rivals similar to your product',
        findCompetitor: 'Your best match vs a rival',
        compare: 'Head-to-head analysis',
        gapAnalysis: 'Market opportunities',
        benchmarking: 'Property comparison',
        matrix: 'Full market view',
      },
      gettingStarted: {
        title: 'Getting Started',
        normalModeIntro: 'Find similar greases using advanced ML methods:',
        competitiveModeIntro: 'Analyze competitive positioning:',
      },
      presets: {
        quickSearch: 'Quick Search',
        nlgiFilter: 'NLGI 2 Filter',
        highPerformance: 'High Performance',
        lithiumComplex: 'Lithium Complex',
        semiSynthetic: 'Semi-Synthetic',
        calciumSulfonate: 'Calcium Sulfonate',
        lowViscosity: 'Low Viscosity',
        mediumViscosity: 'Medium Viscosity',
        highViscosity: 'High Viscosity',
        topBestData: 'Top 5 Best Data',
        popularNlgi2: 'Popular NLGI 2',
        popularHighVisc: 'Popular High Visc',
        industrialNlgi2: 'Industrial NLGI 2',
        highViscMatch: 'High Viscosity Match',
        lightGreaseMatch: 'Light Grease Match',
      },
      advanced: {
        title: 'Advanced Properties (optional)',
        nlgiGrade: 'NLGI Grade',
        viscosity40Min: 'Viscosity 40°C Min',
        viscosity40Max: 'Viscosity 40°C Max',
        dropPointMin: 'Drop Point Min (°C)',
        dropPointMax: 'Drop Point Max (°C)',
        penetrationMin: 'Penetration Min',
        penetrationMax: 'Penetration Max',
      },
      properties: {
        property: 'Property',
        minValue: 'Min Value',
        maxValue: 'Max Value',
        tempMin: 'Min. Temperature (°C)',
        tempMax: 'Max. Temperature (°C)',
        aceiteBase: 'Base Oil',
        espesante: 'Thickener',
        selectAny: 'Any',
        propertyToBenchmark: 'Property to Benchmark',
      },
      catalog: 'Catalog',
      ownProducts: 'own products',
      rivals: 'rivals',
      vs: 'vs',
      authors: 'Authors',
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      dashboard: 'Dashboard',
      advanced: 'Advanced',
      theme: 'Theme',
      language: 'Language',
      density: 'Density',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      comfortable: 'Comfortable',
      compact: 'Compact',
      defaultPage: 'Default Page',
      showHints: 'Show Hints',
      autoSave: 'Auto Save',
      defaultTopK: 'Default Top K Results',
      defaultOnlyActive: 'Show Only Active Products',
      chartAnimations: 'Chart Animations',
      colorScheme: 'Color Scheme',
      colorSchemeDefault: 'Default',
      colorSchemeColorblind: 'Colorblind',
      colorSchemeMonochrome: 'Monochrome',
      enableExperimentalFeatures: 'Enable Experimental Features',
      debugMode: 'Debug Mode',
      reset: 'Reset to Defaults',
      export: 'Export Settings',
      import: 'Import Settings',
      resetConfirm: 'Are you sure you want to reset all settings to defaults?',
      importSuccess: 'Settings imported successfully!',
      importError: 'Error importing settings. Please check the file format.',
    },
    dataExplorer: {
      title: 'Data Explorer',
      overview: 'Dataset Overview',
      missingData: 'Missing Data Analysis',
      preprocessing: 'Preprocessing Pipeline',
      totalProducts: 'Total Products',
      totalFeatures: 'Total Features',
      missingValues: 'Missing Values',
      completeness: 'Completeness',
      dataQuality: 'Data Quality',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    },
    regressor: {
      title: 'Regression Analysis',
      configuration: 'Configuration',
      metrics: 'Metrics',
      predictions: 'Predictions',
      charts: 'Charts',
      targetVariable: 'Target Variable',
      features: 'Features',
      testSize: 'Test Size',
      randomState: 'Random State',
      train: 'Train Model',
      training: 'Training...',
      predict: 'Predict',
      predicting: 'Predicting...',
      enterValues: 'Enter Values',
      prediction: 'Prediction',
      r2Score: 'R² Score',
      mse: 'MSE',
      rmse: 'RMSE',
      mae: 'MAE',
      actualVsPredicted: 'Actual vs Predicted',
      residuals: 'Residuals',
      featureImportance: 'Feature Importance',
    },
    metricsReports: {
      title: 'Metrics & Reports',
      systemMetrics: 'System Metrics',
      performance: 'Performance',
      usage: 'Usage',
      quality: 'Quality',
      totalRecommendations: 'Total Recommendations',
      avgResponseTime: 'Avg Response Time',
      cacheHitRate: 'Cache Hit Rate',
      activeUsers: 'Active Users',
    },
    help: {
      title: 'Help & About',
      about: 'About',
      documentation: 'Documentation',
      support: 'Support',
      version: 'Version',
      authors: 'Authors',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',
      remove: 'Remove',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      apply: 'Apply',
      reset: 'Reset',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      submit: 'Submit',
      download: 'Download',
      upload: 'Upload',
      refresh: 'Refresh',
      select: 'Select',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      showing: 'Showing',
      of: 'of',
      to: 'to',
      page: 'Page',
      rowsPerPage: 'Rows per page',
    },
    results: {
      topRecommendations: 'Top Recommendations',
      cosineSimilarity: 'cosine similarity',
      match: 'match',
      queryVsProduct: 'Query vs Product Details',
      comparisonBetween: 'Comparison between your query and selected product',
      productComparison: 'Product Comparison',
      yourAdvantages: 'Your Advantages',
      ties: 'Ties',
      rivalAdvantages: 'Rival Advantages',
      yourValue: 'Your Value',
      rivalValue: 'Rival Value',
      winner: 'Winner',
      you: 'You',
      rival: 'Rival',
      tie: 'Tie',
      gapAnalysis: 'Gap Analysis',
      marketOpportunities: 'market opportunities',
      identified: 'identified',
      rivalsHaveHigher: 'Rivals have higher',
      rivalsHaveLower: 'Rivals have lower',
      yourBest: 'Your Best',
      rivalBest: 'Rival Best',
      gap: 'Gap',
      opportunity: 'Opportunity',
      benchmarking: 'Benchmarking',
      yourProducts: 'Your Products',
      rivals: 'Rivals',
      min: 'Min',
      max: 'Max',
      average: 'Average',
      analysis: 'Analysis',
      bestMaxGoesTo: 'Best max goes to',
      bestAverageGoesTo: 'Best average goes to',
      competitiveMatrix: 'Competitive Matrix',
      comparisonsAnalyzed: 'comparisons analyzed',
      rivalProducts: 'Rival Products',
      avgSimilarity: 'Avg. Similarity',
      bestMatchFound: 'Best Match Found!',
      competesBestAgainst: 'competes best against',
      with: 'with',
      similarity: 'Similarity',
      showingTopOf: 'Showing top',
      comparisons: 'comparisons',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      dataExplorer: 'Explorador de Datos',
      regressor: 'Regresor',
      metrics: 'Métricas',
      help: 'Ayuda',
    },
    home: {
      title: 'Recomendador de Grasas',
      findSimilar: 'Buscar Productos Similares',
      competitiveAnalysis: 'Análisis Competitivo',
      getRecommendations: 'Obtener Recomendaciones',
      clear: 'Limpiar',
      results: 'resultados',
      topK: 'Número de Resultados (Top K)',
      selectProduct: 'Seleccione un producto...',
      selectRival: 'Seleccione un producto rival...',
      yourProduct: 'Tu Producto',
      rivalProduct: 'Producto Rival',
      searching: 'Buscando...',
      analyzing: 'Analizando...',
      runAnalysis: 'Ejecutar Análisis',
      methods: {
        content: 'Contenido TF-IDF',
        characteristics: 'Características',
        range: 'Búsqueda por Rango',
        popularity: 'Popularidad',
        hybrid: 'Híbrido',
      },
      competitive: {
        findRivals: 'Buscar Rivales Similares',
        findCompetitor: 'Buscar Mejor Competidor',
        compare: 'Comparar Productos',
        gapAnalysis: 'Análisis de Brechas',
        benchmarking: 'Benchmarking',
        matrix: 'Matriz Competitiva',
      },
      descriptions: {
        content: 'Similitud coseno real',
        characteristics: 'Filtrar por propiedades',
        range: 'Consulta por rango de valores',
        popularity: 'Mejor completitud de datos',
        hybrid: 'Contenido + filtros',
        findRivals: 'Rivales similares a tu producto',
        findCompetitor: 'Tu mejor opción vs un rival',
        compare: 'Análisis cara a cara',
        gapAnalysis: 'Oportunidades de mercado',
        benchmarking: 'Comparación de propiedades',
        matrix: 'Vista completa del mercado',
      },
      gettingStarted: {
        title: 'Comenzando',
        normalModeIntro: 'Encuentra grasas similares usando métodos ML avanzados:',
        competitiveModeIntro: 'Analiza el posicionamiento competitivo:',
      },
      presets: {
        quickSearch: 'Búsqueda Rápida',
        nlgiFilter: 'Filtro NLGI 2',
        highPerformance: 'Alto Rendimiento',
        lithiumComplex: 'Complejo de Litio',
        semiSynthetic: 'Semi-Sintético',
        calciumSulfonate: 'Sulfonato de Calcio',
        lowViscosity: 'Viscosidad Baja',
        mediumViscosity: 'Viscosidad Media',
        highViscosity: 'Viscosidad Alta',
        topBestData: 'Top 5 Mejores Datos',
        popularNlgi2: 'Popular NLGI 2',
        popularHighVisc: 'Popular Alta Visc',
        industrialNlgi2: 'Industrial NLGI 2',
        highViscMatch: 'Coincidencia Alta Viscosidad',
        lightGreaseMatch: 'Coincidencia Grasa Ligera',
      },
      advanced: {
        title: 'Propiedades Avanzadas (opcional)',
        nlgiGrade: 'Grado NLGI',
        viscosity40Min: 'Viscosidad 40°C Mín',
        viscosity40Max: 'Viscosidad 40°C Máx',
        dropPointMin: 'Punto de Gota Mín (°C)',
        dropPointMax: 'Punto de Gota Máx (°C)',
        penetrationMin: 'Penetración Mín',
        penetrationMax: 'Penetración Máx',
      },
      properties: {
        property: 'Propiedad',
        minValue: 'Valor Mín',
        maxValue: 'Valor Máx',
        tempMin: 'Temp. Mínima (°C)',
        tempMax: 'Temp. Máxima (°C)',
        aceiteBase: 'Aceite Base',
        espesante: 'Espesante',
        selectAny: 'Cualquiera',
        propertyToBenchmark: 'Propiedad para Benchmark',
      },
      catalog: 'Catálogo',
      ownProducts: 'productos propios',
      rivals: 'rivales',
      vs: 'vs',
      authors: 'Autores',
    },
    settings: {
      title: 'Configuración',
      appearance: 'Apariencia',
      dashboard: 'Panel',
      advanced: 'Avanzado',
      theme: 'Tema',
      language: 'Idioma',
      density: 'Densidad',
      light: 'Claro',
      dark: 'Oscuro',
      auto: 'Auto',
      comfortable: 'Cómodo',
      compact: 'Compacto',
      defaultPage: 'Página Predeterminada',
      showHints: 'Mostrar Sugerencias',
      autoSave: 'Guardado Automático',
      defaultTopK: 'Resultados Top K Predeterminados',
      defaultOnlyActive: 'Mostrar Solo Productos Activos',
      chartAnimations: 'Animaciones de Gráficos',
      colorScheme: 'Esquema de Color',
      colorSchemeDefault: 'Predeterminado',
      colorSchemeColorblind: 'Daltónicos',
      colorSchemeMonochrome: 'Monocromático',
      enableExperimentalFeatures: 'Habilitar Características Experimentales',
      debugMode: 'Modo de Depuración',
      reset: 'Restablecer a Predeterminados',
      export: 'Exportar Configuración',
      import: 'Importar Configuración',
      resetConfirm: '¿Está seguro de que desea restablecer toda la configuración a los valores predeterminados?',
      importSuccess: '¡Configuración importada exitosamente!',
      importError: 'Error al importar configuración. Por favor, verifique el formato del archivo.',
    },
    dataExplorer: {
      title: 'Explorador de Datos',
      overview: 'Resumen del Conjunto de Datos',
      missingData: 'Análisis de Datos Faltantes',
      preprocessing: 'Pipeline de Preprocesamiento',
      totalProducts: 'Total de Productos',
      totalFeatures: 'Total de Características',
      missingValues: 'Valores Faltantes',
      completeness: 'Completitud',
      dataQuality: 'Calidad de Datos',
      excellent: 'Excelente',
      good: 'Bueno',
      fair: 'Regular',
      poor: 'Pobre',
    },
    regressor: {
      title: 'Análisis de Regresión',
      configuration: 'Configuración',
      metrics: 'Métricas',
      predictions: 'Predicciones',
      charts: 'Gráficos',
      targetVariable: 'Variable Objetivo',
      features: 'Características',
      testSize: 'Tamaño de Prueba',
      randomState: 'Estado Aleatorio',
      train: 'Entrenar Modelo',
      training: 'Entrenando...',
      predict: 'Predecir',
      predicting: 'Prediciendo...',
      enterValues: 'Ingresar Valores',
      prediction: 'Predicción',
      r2Score: 'Puntuación R²',
      mse: 'ECM',
      rmse: 'RECM',
      mae: 'EAM',
      actualVsPredicted: 'Real vs Predicho',
      residuals: 'Residuos',
      featureImportance: 'Importancia de Características',
    },
    metricsReports: {
      title: 'Métricas e Informes',
      systemMetrics: 'Métricas del Sistema',
      performance: 'Rendimiento',
      usage: 'Uso',
      quality: 'Calidad',
      totalRecommendations: 'Recomendaciones Totales',
      avgResponseTime: 'Tiempo de Respuesta Promedio',
      cacheHitRate: 'Tasa de Acierto de Caché',
      activeUsers: 'Usuarios Activos',
    },
    help: {
      title: 'Ayuda y Acerca de',
      about: 'Acerca de',
      documentation: 'Documentación',
      support: 'Soporte',
      version: 'Versión',
      authors: 'Autores',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      add: 'Agregar',
      remove: 'Quitar',
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      apply: 'Aplicar',
      reset: 'Restablecer',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      submit: 'Enviar',
      download: 'Descargar',
      upload: 'Subir',
      refresh: 'Actualizar',
      select: 'Seleccionar',
      selectAll: 'Seleccionar Todo',
      deselectAll: 'Deseleccionar Todo',
      showing: 'Mostrando',
      of: 'de',
      to: 'a',
      page: 'Página',
      rowsPerPage: 'Filas por página',
    },
    results: {
      topRecommendations: 'Principales Recomendaciones',
      cosineSimilarity: 'similitud coseno',
      match: 'coincidencia',
      queryVsProduct: 'Consulta vs Detalles del Producto',
      comparisonBetween: 'Comparación entre tu consulta y el producto seleccionado',
      productComparison: 'Comparación de Productos',
      yourAdvantages: 'Tus Ventajas',
      ties: 'Empates',
      rivalAdvantages: 'Ventajas del Rival',
      yourValue: 'Tu Valor',
      rivalValue: 'Valor del Rival',
      winner: 'Ganador',
      you: 'Tú',
      rival: 'Rival',
      tie: 'Empate',
      gapAnalysis: 'Análisis de Brechas',
      marketOpportunities: 'oportunidades de mercado',
      identified: 'identificadas',
      rivalsHaveHigher: 'Los rivales tienen mayor',
      rivalsHaveLower: 'Los rivales tienen menor',
      yourBest: 'Tu Mejor',
      rivalBest: 'Mejor del Rival',
      gap: 'Brecha',
      opportunity: 'Oportunidad',
      benchmarking: 'Benchmarking',
      yourProducts: 'Tus Productos',
      rivals: 'Rivales',
      min: 'Mín',
      max: 'Máx',
      average: 'Promedio',
      analysis: 'Análisis',
      bestMaxGoesTo: 'El mejor máximo es para',
      bestAverageGoesTo: 'El mejor promedio es para',
      competitiveMatrix: 'Matriz Competitiva',
      comparisonsAnalyzed: 'comparaciones analizadas',
      rivalProducts: 'Productos Rivales',
      avgSimilarity: 'Similitud Prom.',
      bestMatchFound: '¡Mejor Coincidencia Encontrada!',
      competesBestAgainst: 'compite mejor contra',
      with: 'con',
      similarity: 'Similitud',
      showingTopOf: 'Mostrando los',
      comparisons: 'comparaciones',
    },
  },
};
