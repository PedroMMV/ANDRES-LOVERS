/**
 * Recommender form component
 * Allows users to configure query parameters for grease similarity search
 */

import React, { useState, useEffect } from 'react';
import { Dropdown } from '../common/Dropdown';
import { Input } from '../common/Input';
import { Slider } from '../common/Slider';
import { Checkbox } from '../common/Checkbox';
import { Button } from '../common/Button';
import { getCategoricalOptions } from '../../services/recommenderService';
import type { RecommenderQuery, CategoricalOptions } from '../../types/products';
import { ChevronDown, ChevronUp } from 'lucide-react';

type RecommenderMode = 'normal' | 'competitive';

interface RecommenderFormProps {
  onSubmit: (query: RecommenderQuery) => void;
  onClear: () => void;
  isLoading?: boolean;
  catalogCount: number;
  mode?: RecommenderMode;
}

export const RecommenderForm: React.FC<RecommenderFormProps> = ({
  onSubmit,
  onClear,
  isLoading = false,
  catalogCount,
  mode: recommenderMode = 'normal',
}) => {
  const [queryMode, setQueryMode] = useState<'basic' | 'advanced'>('basic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<CategoricalOptions>({
    aceitesBase: [],
    espesantes: [],
    nlgiGrades: [],
  });

  // Fetch categorical options from API
  useEffect(() => {
    getCategoricalOptions().then(setOptions);
  }, []);

  // Core properties
  const [aceiteBase, setAceiteBase] = useState<string>('');
  const [espesante, setEspesante] = useState<string>('');
  const [nlgiGrade, setNlgiGrade] = useState<number | undefined>();
  const [viscosidad40C, setViscosidad40C] = useState<number | undefined>();

  // Additional properties
  const [penetracion, setPenetracion] = useState<number | undefined>();
  const [puntoGota, setPuntoGota] = useState<number | undefined>();
  const [tempMin, setTempMin] = useState<number | undefined>();
  const [tempMax, setTempMax] = useState<number | undefined>();

  // Query configuration
  const [topK, setTopK] = useState<number>(5);
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  const handleSubmit = () => {
    const query: RecommenderQuery = {
      aceiteBase: aceiteBase || undefined,
      espesante: espesante || undefined,
      nlgiGrade,
      viscosidad40C,
      penetracion,
      puntoGota,
      tempMin,
      tempMax,
      topK,
      onlyActive,
      mode: recommenderMode === 'competitive' ? 'competitive' : queryMode,
    };
    onSubmit(query);
  };

  const handleClear = () => {
    setAceiteBase('');
    setEspesante('');
    setNlgiGrade(undefined);
    setViscosidad40C(undefined);
    setPenetracion(undefined);
    setPuntoGota(undefined);
    setTempMin(undefined);
    setTempMax(undefined);
    setTopK(5);
    setOnlyActive(true);
    onClear();
  };

  const aceiteBaseOptions = [
    { value: '', label: 'Any' },
    ...options.aceitesBase.map(oil => ({ value: oil, label: oil }))
  ];

  const espesanteOptions = [
    { value: '', label: 'Any' },
    ...options.espesantes.map(t => ({ value: t, label: t }))
  ];

  const nlgiOptions = [
    { value: '', label: 'Any' },
    ...options.nlgiGrades.map(g => ({ value: g, label: g.toString() }))
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selector - only show in normal mode */}
      {recommenderMode === 'normal' && (
        <div className="flex items-center justify-between">
          <Dropdown
            label="Search Mode"
            value={queryMode}
            onChange={(val) => setQueryMode(val as 'basic' | 'advanced')}
            options={[
              { value: 'basic', label: 'Basic Mode' },
              { value: 'advanced', label: 'Advanced Mode' },
            ]}
            className="w-48"
          />
        </div>
      )}

      {/* Core Properties */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {recommenderMode === 'competitive' ? 'Filter by Properties' : 'Core Properties'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Aceite Base (Base Oil)"
            value={aceiteBase}
            onChange={(v) => setAceiteBase(String(v))}
            options={aceiteBaseOptions}
          />
          <Dropdown
            label="Espesante (Thickener)"
            value={espesante}
            onChange={(v) => setEspesante(String(v))}
            options={espesanteOptions}
          />
          <Dropdown
            label="Grado NLGI"
            value={nlgiGrade ?? ''}
            onChange={(val) => setNlgiGrade(val ? Number(val) : undefined)}
            options={nlgiOptions}
          />
          <Input
            label="Viscosidad a 40°C (cSt)"
            type="number"
            value={viscosidad40C ?? ''}
            onChange={(e) => setViscosidad40C(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 150"
          />
        </div>
      </div>

      {/* Additional Properties (Collapsible) */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-900 uppercase tracking-wide hover:text-primary-600 transition-colors"
        >
          <span>Additional Properties</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Penetración de Cono (0.1 mm)"
              type="number"
              value={penetracion ?? ''}
              onChange={(e) => setPenetracion(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 265"
            />
            <Input
              label="Punto de Gota (°C)"
              type="number"
              value={puntoGota ?? ''}
              onChange={(e) => setPuntoGota(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 250"
            />
            <Input
              label="Temperatura Mín. de Servicio (°C)"
              type="number"
              value={tempMin ?? ''}
              onChange={(e) => setTempMin(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., -20"
            />
            <Input
              label="Temperatura Máx. de Servicio (°C)"
              type="number"
              value={tempMax ?? ''}
              onChange={(e) => setTempMax(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 130"
            />
          </div>
        )}
      </div>

      {/* Query Configuration */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <Slider
          label="Number of Recommendations (Top K)"
          value={topK}
          onChange={setTopK}
          min={5}
          max={20}
          step={1}
        />
        <Checkbox
          label="Only show active / available products"
          checked={onlyActive}
          onChange={setOnlyActive}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4">
        <Button
          variant={recommenderMode === 'competitive' ? 'secondary' : 'primary'}
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading
            ? 'Searching...'
            : recommenderMode === 'competitive'
              ? 'Find Competitors'
              : 'Get Recommendations'}
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear Filters
        </Button>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 pt-2">
        Catalog contains <span className="font-semibold text-gray-900">{catalogCount}</span> products
        {onlyActive && ' (active only)'}
      </div>
    </div>
  );
};
