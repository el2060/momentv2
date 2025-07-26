import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { getForceExplanation, getConceptExplanation } from '../services/geminiService';
import { AppState, ConceptId, Force, PivotPointId } from '../types';
import { CONCEPTS } from '../constants';
import { calculateTotalMoment, calculateSingleForceMoment } from '../services/momentCalculator';
import Stepper from './Stepper';
import RotationArrow from './RotationArrow';


// --- Child Components ---

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step, unit, onChange }) => {
  const id = React.useId();
  const tickCount = Math.min(11, Math.floor((max - min) / step) + 1);
  const ticks = Array.from({ length: tickCount }, (_, i) => min + (i * (max - min) / (tickCount - 1)));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-xs font-bold text-gray-900 font-mono">{label}</label>
        <div className="flex items-center gap-2">
            <input
                id={id}
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-18 bg-white border-2 border-gray-400 rounded-lg px-2 py-1 text-right text-gray-900 font-mono text-xs font-bold focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none transition-colors"
            />
            <span className="text-xs text-gray-700 font-mono font-bold min-w-[1rem]">{unit}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-enhanced"
        />
        <div className="flex justify-between mt-1 px-1">
          {ticks.slice(0, Math.min(6, ticks.length)).map((tick, i, arr) => (
            <span key={tick} className="text-xs text-gray-500 font-mono" style={{
              marginLeft: i === 0 ? '0' : i === arr.length - 1 ? 'auto' : 'auto',
              marginRight: i === arr.length - 1 ? '0' : 'auto'
            }}>
              {tick.toFixed(step < 1 ? 1 : 0)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ForceControlCardProps {
    force: Force;
    onChange: (id: PivotPointId, updatedForce: Partial<Force>) => void;
}

const ForceControlCard: React.FC<ForceControlCardProps> = ({ force, onChange }) => (
    <div className={`p-3 rounded-lg border-2 space-y-2 transition-all duration-300 ${
        force.isEnabled ? 'bg-gray-100 border-gray-400 shadow-md' : 'bg-gray-50 border-gray-300'
    }`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 font-mono">{force.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-bold font-mono ${
                    force.isEnabled ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                    {force.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </div>
            <label className="flex items-center cursor-pointer group">
                <span className="mr-2 text-xs font-bold text-gray-900 group-hover:text-gray-700 transition-colors font-mono">Include Force</span>
                <div className="relative">
                    <input type="checkbox" checked={force.isEnabled} onChange={(e) => onChange(force.id, { isEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-600 peer-focus:ring-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-800 shadow-sm"></div>
                </div>
            </label>
        </div>
        {force.isEnabled && (
            <div className="space-y-3 pt-2 border-t-2 border-gray-300">
                <div className="bg-white p-2 rounded-lg border border-gray-300">
                    <h4 className="text-xs font-bold text-gray-900 mb-2 font-mono">Adjust Force Parameters:</h4>
                    <div className="space-y-2">
                        <SliderInput label="Magnitude" value={force.magnitude} min={0} max={200} step={1} unit="N" onChange={(v) => onChange(force.id, { magnitude: v })} />
                        <SliderInput label="Angle (Direction)" value={force.angle} min={0} max={360} step={1} unit="°" onChange={(v) => onChange(force.id, { angle: v })} />
                    </div>
                </div>
            </div>
        )}
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <svg className="animate-spin h-6 w-6 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const AccordionItem: React.FC<{
    title: React.ReactNode;
    content: string;
    isLoading: boolean;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, content, isLoading, isOpen, onToggle }) => (
    <div className="border-b border-slate-700">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-4 font-medium text-left text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <div className="truncate pr-2">{title}</div>
                <svg className={`w-3 h-3 transform transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                </svg>
            </button>
        </h2>
        {isOpen && (
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                {isLoading && <LoadingSpinner />}
                {!isLoading && content && (
                     <div
                        className="prose prose-invert prose-sm max-w-none prose-h3:text-teal-300 prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
                    />
                )}
            </div>
        )}
    </div>
);

// --- Main Workflow Panel ---

interface WorkflowPanelProps {
    appState: AppState;
    onStateChange: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
    onForceChange: (id: PivotPointId, updatedForce: Partial<Force>) => void;
    expandedId: string | null;
    onExpandedIdChange: (id: string | null) => void;
    currentStep: number;
    onStepChange: (step: number) => void;
}

const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
    appState,
    onStateChange,
    onForceChange,
    expandedId,
    onExpandedIdChange,
    currentStep,
    onStepChange
}) => {
  const [totalMoment, setTotalMoment] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'concepts'>('breakdown');
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const { forces, pivotPoint, distances } = appState;
  
  useEffect(() => {
    const moment = calculateTotalMoment(appState.forces, appState.distances, appState.pivotPoint);
    setTotalMoment(moment);
  }, [appState]);

  useEffect(() => {
    if (!expandedId || explanations[expandedId]) {
      return;
    }
    
    const isForce = !!forces[expandedId as PivotPointId];

    const fetchExplanation = async () => {
        setLoadingStates(s => ({...s, [expandedId]: true}));
        try {
            const explanation = isForce
                ? await getForceExplanation(forces[expandedId as PivotPointId], pivotPoint, distances)
                : await getConceptExplanation(expandedId as ConceptId);
            setExplanations(e => ({...e, [expandedId]: explanation}));
        } catch(e) {
            console.error(e);
            setExplanations(e => ({...e, [expandedId]: "Failed to load explanation."}));
        } finally {
            setLoadingStates(s => ({...s, [expandedId]: false}));
        }
    }
    fetchExplanation();

  }, [expandedId, forces, pivotPoint, distances, explanations]);

  const handleToggle = (id: string) => {
    onExpandedIdChange(expandedId === id ? null : id);
  };
  
  const getRotationDirection = () => {
    if (Math.abs(totalMoment) < 0.01) return { text: 'In Equilibrium', color: 'text-gray-600', icon: null };
    return totalMoment > 0 
        ? { text: 'Anti-Clockwise Rotation', color: 'text-gray-800', icon: 'ccw' as const } 
        : { text: 'Clockwise Rotation', color: 'text-gray-900', icon: 'cw' as const };
  };

  const steps = ["Frame Setup", "Define Forces", "Analyze Results"];

  return (
    <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm h-full flex flex-col min-h-0">
        <div className="pb-3 flex-shrink-0">
            <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
        {/* --- STEP 1: FRAME SETUP --- */}
        {currentStep === 1 && (
            <section className="space-y-3 animate-fade-in">
                <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                    <h3 className="text-base font-bold text-gray-900 mb-3 font-mono">1. Select Pivot Point (A, B, C, or D)</h3>
                    <p className="text-xs text-gray-700 mb-3 font-mono">Choose which point will be the center of rotation:</p>
                    {!pivotPoint && (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-3 border-l-4 border-l-gray-600">
                            <p className="text-xs text-gray-700 font-medium flex items-center gap-2 font-mono">
                                <span className="text-gray-600">ℹ️</span>
                                Please select a pivot point to continue
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((id) => (
                            <button
                            key={id}
                            onClick={() => onStateChange('pivotPoint', id as PivotPointId)}
                            className={`py-3 px-3 rounded-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 text-sm border-2 font-mono ${
                                pivotPoint === id ? 'bg-gray-800 text-white border-gray-800 shadow-lg' : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300 hover:border-gray-400'
                            }`}
                            >
                            Point {id} {pivotPoint === id ? '✓' : ''}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300 space-y-3">
                    <h3 className="text-base font-bold text-gray-900 font-mono">2. Adjust Frame Distances (in meters)</h3>
                    <p className="text-xs text-gray-700 mb-3 font-mono">Set the distances between points on the structural frame:</p>
                    <SliderInput label="Distance d1 (A to C)" value={distances.d1} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d1: v})} />
                    <SliderInput label="Distance d2 (A to B)" value={distances.d2} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d2: v})} />
                    <SliderInput label="Distance d3 (B to D)" value={distances.d3} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d3: v})} />
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    {pivotPoint && (
                        <button 
                            onClick={() => onStateChange('pivotPoint', null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 flex items-center gap-2 text-xs font-mono"
                        >
                            ↻ Reset Selection
                        </button>
                    )}
                    <button 
                        onClick={() => onStepChange(2)} 
                        disabled={!pivotPoint}
                        className={`font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 text-sm button-hover-lift font-mono ${
                            pivotPoint 
                                ? 'bg-gray-800 hover:bg-gray-900 text-white hover:shadow-xl focus:ring-gray-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } ${!pivotPoint ? '' : 'ml-auto'}`}
                    >
                        Next: Define Forces &rarr;
                    </button>
                </div>
            </section>
        )}

        {/* --- STEP 2: DEFINE FORCES --- */}
        {currentStep === 2 && (
            <section className="space-y-2 animate-fade-in">
                 <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                    <h2 className="text-base font-bold text-gray-900 mb-2 font-mono">3. Select Forces to Include & Adjust Parameters</h2>
                    <p className="text-xs text-gray-700 mb-2 font-mono">Choose which forces to apply and configure their magnitude and direction:</p>
                 </div>
                 {Object.values(forces).map((force: Force) => (
                    <ForceControlCard key={force.id} force={force} onChange={onForceChange} />
                ))}
                <div className="flex justify-between pt-2">
                     <button onClick={() => onStepChange(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-xs border border-gray-700 shadow-md button-hover-lift font-mono">
                        &larr; Back
                    </button>
                    <button onClick={() => onStepChange(3)} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-600 flex items-center gap-2 text-xs border border-gray-800 button-hover-lift font-mono">
                        Analyze Results &rarr;
                    </button>
                </div>
            </section>
        )}

        {/* --- STEP 3: ANALYZE RESULTS --- */}
        {currentStep === 3 && (
            <section className="space-y-2 animate-fade-in">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg text-center border-2 border-purple-200 shadow-lg">
                    <p className="text-xs text-purple-700 uppercase tracking-wider font-bold mb-1 font-mono">📊 LIVE CALCULATION UPDATE</p>
                    <p className="text-xs text-gray-600 uppercase tracking-wider font-bold font-mono">Total Moment about Pivot {pivotPoint}</p>
                    <p className="text-2xl font-bold text-gray-900 my-2 font-mono">{totalMoment.toFixed(2)} Nm</p>
                    
                    <div className="bg-white p-2 rounded-lg border border-purple-200 mt-2">
                        <p className="text-xs font-bold text-gray-700 mb-2 font-mono">🔄 RESULTANT ROTATION DIRECTION:</p>
                        <div className={`flex items-center justify-center gap-2 text-sm font-bold ${getRotationDirection().color} font-mono`}>
                            {getRotationDirection().icon && <RotationArrow direction={getRotationDirection().icon!} className="w-5 h-5" />}
                            <span className="bg-gray-100 px-2 py-1 rounded-full">{getRotationDirection().text}</span>
                        </div>
                    </div>
                </div>
      
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                    <div className="border-b border-gray-300">
                        <div className="flex -mb-px">
                            <button onClick={() => { setActiveTab('breakdown'); onExpandedIdChange(null); }} className={`flex-1 py-2 font-bold text-xs transition-colors border-r border-gray-300 font-mono ${activeTab === 'breakdown' ? 'bg-gray-200 text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Calculation Breakdown
                            </button>
                            <button onClick={() => { setActiveTab('concepts'); onExpandedIdChange(null); }} className={`flex-1 py-2 font-bold text-xs transition-colors font-mono ${activeTab === 'concepts' ? 'bg-gray-200 text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Concept Explorer
                            </button>
                        </div>
                    </div>

                    <div className="bg-white">
                    {activeTab === 'breakdown' && (
                        <div>
                            {Object.values(forces).filter(f => f.isEnabled).length > 0 ? Object.values(forces).filter(f => f.isEnabled).map((force: Force) => {
                                const moment = calculateSingleForceMoment(force, distances, pivotPoint);
                                return (
                                    <AccordionItem 
                                        key={force.id}
                                        title={<span className="flex justify-between w-full pr-2"><span>{force.name}</span> <span className="font-mono">{moment.toFixed(2)} Nm</span></span>}
                                        content={explanations[force.id] || ''}
                                        isLoading={loadingStates[force.id] || false}
                                        isOpen={expandedId === force.id}
                                        onToggle={() => handleToggle(force.id)}
                                    />
                                )
                            }) : <p className="p-3 text-center text-gray-600 font-medium text-xs font-mono">No forces enabled. Go back to Step 2 to add forces.</p>}
                        </div>
                    )}
                    {activeTab === 'concepts' && (
                        <div>
                            {CONCEPTS.map(concept => (
                                <AccordionItem 
                                    key={concept.id}
                                    title={concept.name}
                                    content={explanations[concept.id] || ''}
                                    isLoading={loadingStates[concept.id] || false}
                                    isOpen={expandedId === concept.id}
                                    onToggle={() => handleToggle(concept.id)}
                                />
                            ))}
                        </div>
                    )}
                    </div>
                </div>
                 <div className="flex justify-center pt-2">
                    <button onClick={() => onStepChange(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-xs border border-gray-700 shadow-md button-hover-lift font-mono">
                        &larr; Start Over
                    </button>
                </div>
            </section>
        )}
        </div>
    </div>
  );
};

export default WorkflowPanel;
