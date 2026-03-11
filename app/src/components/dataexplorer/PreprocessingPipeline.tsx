/**
 * Preprocessing pipeline component
 * Visualizes the data preprocessing steps applied before similarity calculation
 */

import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import type { PreprocessingStep } from '../../types/metrics';

interface PreprocessingPipelineProps {
  steps: PreprocessingStep[];
}

export const PreprocessingPipeline: React.FC<PreprocessingPipelineProps> = ({
  steps,
}) => {
  const getStepColor = (appliesTo: string) => {
    switch (appliesTo) {
      case 'numeric':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'categorical':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.step}>
            <div className={`border rounded-lg p-4 ${getStepColor(step.appliesTo)}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      Step {step.step}: {step.name}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 bg-white rounded-full">
                      {step.appliesTo}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Before/After Example */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Example: Text Processing for TF-IDF
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="text-xs font-semibold text-red-900 uppercase mb-2">
              Raw Text Fields
            </h5>
            <div className="space-y-1 text-sm font-mono text-red-800">
              <div>Aceite Base: "Mineral"</div>
              <div>Espesante: "Sulfonato de Calcio"</div>
              <div>descripcion: "Grasa lubricante..."</div>
              <div>beneficios: "Alta estabilidad@..."</div>
            </div>
          </div>

          {/* After */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="text-xs font-semibold text-green-900 uppercase mb-2">
              Concatenated & Cleaned
            </h5>
            <div className="space-y-1 text-sm font-mono text-green-800">
              <div>texto_full: "mineral sulfonato</div>
              <div>de calcio grasa lubricante</div>
              <div>alta estabilidad..."</div>
              <div className="text-xs mt-2 text-green-600">→ TF-IDF Vector [1000 dims]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
