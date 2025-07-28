import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { getForceExplanation, getConceptExplanation } from '../services/geminiService';
import { AppState, ConceptId, Force, PivotPointId, Distances } from '../types';
import { CONCEPTS, getApplicationPoints } from '../constants';
import { calculateTotalMoment, calculateSingleForceMoment } from '../services/momentCalculator';
import Stepper from './Stepper';


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
        <label htmlFor={id} className="text-lg font-bold text-gray-900 font-mono">{label}</label>
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
            <span className="text-lg text-gray-700 font-mono font-bold min-w-[1rem]">{unit}</span>
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
            <span key={tick} className="text-base text-gray-500 font-mono" style={{
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

const ForceControlCard: React.FC<ForceControlCardProps> = ({ force, onChange }) => {
    // Helper functions to sync different input methods
    const updateFromMagnitudeAngle = (magnitude: number, angle: number) => {
        const angleRad = (angle * Math.PI) / 180;
        const fx = magnitude * Math.cos(angleRad);
        const fy = magnitude * Math.sin(angleRad);
        onChange(force.id, { magnitude, angle, fx, fy });
    };

    const updateFromComponents = (fx: number, fy: number) => {
        const magnitude = Math.sqrt(fx * fx + fy * fy);
        const angle = Math.atan2(fy, fx) * 180 / Math.PI;
        const normalizedAngle = angle < 0 ? angle + 360 : angle;
        onChange(force.id, { fx, fy, magnitude, angle: normalizedAngle });
    };

    const updateFromAcuteAngle = (magnitude: number, acuteAngle: number, xDirection: 'right' | 'left', yDirection: 'up' | 'down') => {
        const angleRad = (acuteAngle * Math.PI) / 180;
        const fxMag = magnitude * Math.cos(angleRad);
        const fyMag = magnitude * Math.sin(angleRad);
        
        const fx = xDirection === 'right' ? fxMag : -fxMag;
        const fy = yDirection === 'up' ? fyMag : -fyMag;
        
        // Calculate full angle from components
        const fullAngle = Math.atan2(fy, fx) * 180 / Math.PI;
        const normalizedAngle = fullAngle < 0 ? fullAngle + 360 : fullAngle;
        
        onChange(force.id, { 
            magnitude, 
            acuteAngle, 
            xDirection, 
            yDirection, 
            fx, 
            fy, 
            angle: normalizedAngle 
        });
    };

    const getInputMethod = () => {
        if (force.useComponents) return 'components';
        if (force.useAcuteAngle) return 'acute';
        return 'full-angle';
    };

    const setInputMethod = (method: 'full-angle' | 'acute' | 'components') => {
        onChange(force.id, { 
            useComponents: method === 'components',
            useAcuteAngle: method === 'acute'
        });
    };

    return (
        <div className={`p-3 rounded-lg border-2 space-y-2 transition-all duration-300 ${
            force.isEnabled ? 'bg-gray-100 border-gray-400 shadow-md' : 'bg-gray-50 border-gray-300'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-gray-900 font-mono">{force.name}</h3>
                    <span className={`text-lg px-3 py-1 rounded-full font-bold font-mono ${
                        force.isEnabled ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                        {force.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
                <label className="flex items-center cursor-pointer group">
                    <span className="mr-2 text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors font-mono">Include Force</span>
                    <div className="relative">
                        <input type="checkbox" checked={force.isEnabled} onChange={(e) => onChange(force.id, { isEnabled: e.target.checked })} className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-600 peer-focus:ring-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-800 shadow-sm"></div>
                    </div>
                </label>
            </div>
            {force.isEnabled && (
                <div className="space-y-3 pt-2 border-t-2 border-gray-300">
                    {/* Input Method Selection */}
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-bold text-gray-800 font-mono">Input Method:</span>
                        </div>
                        <div className="flex rounded-lg overflow-hidden border-2 border-gray-400">
                            <button
                                type="button"
                                onClick={() => setInputMethod('acute')}
                                className={`px-3 py-2 text-sm font-bold font-mono transition-colors flex-1 ${
                                    getInputMethod() === 'acute'
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-white text-gray-800 hover:bg-blue-50'
                                }`}
                            >
                                Acute + Direction
                                <div className="text-xs opacity-80">0-90° + Direction</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputMethod('components')}
                                className={`px-3 py-2 text-sm font-bold font-mono transition-colors flex-1 ${
                                    getInputMethod() === 'components'
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-white text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                Components
                                <div className="text-xs opacity-80">Fx, Fy Direct</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputMethod('full-angle')}
                                className={`px-3 py-2 text-sm font-bold font-mono transition-colors flex-1 ${
                                    getInputMethod() === 'full-angle'
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-white text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                Full Angle
                                <div className="text-xs opacity-80">0-360°</div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-gray-300">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 font-mono">Adjust Force Parameters:</h4>
                        <div className="space-y-4">
                            {getInputMethod() === 'full-angle' && (
                                // Full Angle inputs (original)
                                <>
                                    <SliderInput 
                                        label="Magnitude" 
                                        value={force.magnitude} 
                                        min={0} 
                                        max={200} 
                                        step={1} 
                                        unit="N" 
                                        onChange={(v) => updateFromMagnitudeAngle(v, force.angle)} 
                                    />
                                    <SliderInput 
                                        label="Angle (0-360°)" 
                                        value={force.angle} 
                                        min={0} 
                                        max={360} 
                                        step={1} 
                                        unit="°" 
                                        onChange={(v) => updateFromMagnitudeAngle(force.magnitude, v)} 
                                    />
                                </>
                            )}
                            
                            {getInputMethod() === 'acute' && (
                                // Acute angle with direction inputs
                                <>
                                    <SliderInput 
                                        label="Magnitude" 
                                        value={force.magnitude} 
                                        min={0} 
                                        max={200} 
                                        step={1} 
                                        unit="N" 
                                        onChange={(v) => updateFromAcuteAngle(v, force.acuteAngle, force.xDirection, force.yDirection)} 
                                    />
                                    <SliderInput 
                                        label="Acute Angle (0-90°)" 
                                        value={force.acuteAngle} 
                                        min={0} 
                                        max={90} 
                                        step={1} 
                                        unit="°" 
                                        onChange={(v) => updateFromAcuteAngle(force.magnitude, v, force.xDirection, force.yDirection)} 
                                    />
                                    
                                    {/* Direction Controls */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2 font-mono">X-Direction:</label>
                                            <div className="flex rounded-lg overflow-hidden border-2 border-gray-400">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFromAcuteAngle(force.magnitude, force.acuteAngle, 'right', force.yDirection)}
                                                    className={`flex-1 px-3 py-1 text-sm font-bold font-mono transition-colors ${
                                                        force.xDirection === 'right'
                                                            ? 'bg-gray-800 text-white' 
                                                            : 'bg-white text-gray-800 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    Right →
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateFromAcuteAngle(force.magnitude, force.acuteAngle, 'left', force.yDirection)}
                                                    className={`flex-1 px-3 py-1 text-sm font-bold font-mono transition-colors ${
                                                        force.xDirection === 'left'
                                                            ? 'bg-gray-800 text-white' 
                                                            : 'bg-white text-gray-800 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    ← Left
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2 font-mono">Y-Direction:</label>
                                            <div className="flex rounded-lg overflow-hidden border-2 border-gray-400">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFromAcuteAngle(force.magnitude, force.acuteAngle, force.xDirection, 'up')}
                                                    className={`flex-1 px-3 py-1 text-sm font-bold font-mono transition-colors ${
                                                        force.yDirection === 'up'
                                                            ? 'bg-gray-800 text-white' 
                                                            : 'bg-white text-gray-800 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    ↑ Up
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateFromAcuteAngle(force.magnitude, force.acuteAngle, force.xDirection, 'down')}
                                                    className={`flex-1 px-3 py-1 text-sm font-bold font-mono transition-colors ${
                                                        force.yDirection === 'down'
                                                            ? 'bg-gray-800 text-white' 
                                                            : 'bg-white text-gray-800 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    ↓ Down
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {getInputMethod() === 'components' && (
                                // Component inputs
                                <>
                                    <SliderInput 
                                        label="X-Component (Fx)" 
                                        value={force.fx} 
                                        min={-200} 
                                        max={200} 
                                        step={1} 
                                        unit="N" 
                                        onChange={(v) => updateFromComponents(v, force.fy)} 
                                    />
                                    <SliderInput 
                                        label="Y-Component (Fy)" 
                                        value={force.fy} 
                                        min={-200} 
                                        max={200} 
                                        step={1} 
                                        unit="N" 
                                        onChange={(v) => updateFromComponents(force.fx, v)} 
                                    />
                                </>
                            )}
                        </div>
                        
                        {/* Show all representations for reference */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <h5 className="text-sm font-bold text-gray-700 mb-2 font-mono">Current Values:</h5>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-mono">
                                <div className="space-y-1">
                                    <div className="text-gray-600">Magnitude: <span className="font-bold text-gray-900">{force.magnitude.toFixed(1)} N</span></div>
                                    <div className="text-gray-600">Full Angle: <span className="font-bold text-gray-900">{force.angle.toFixed(1)}°</span></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-600">✅ Acute Angle: <span className="font-bold text-gray-900">{force.acuteAngle.toFixed(1)}°</span></div>
                                    <div className="text-gray-600">✅ Direction: <span className="font-bold text-gray-900">{force.xDirection === 'right' ? '→ Right' : '← Left'}, {force.yDirection === 'up' ? '↑ Up' : '↓ Down'}</span></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-600">Fx: <span className="font-bold text-gray-900">{force.fx.toFixed(1)} N</span></div>
                                    <div className="text-gray-600">Fy: <span className="font-bold text-gray-900">{force.fy.toFixed(1)} N</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    <div className="border-b border-gray-200">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-4 font-medium text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 font-mono text-lg"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <div className="truncate pr-2">{title}</div>
                <svg className={`w-4 h-4 transform transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                </svg>
            </button>
        </h2>
        {isOpen && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                {isLoading && <LoadingSpinner />}
                {!isLoading && content && (
                     <div
                        className="prose prose-gray prose-sm max-w-none prose-h3:text-gray-800 prose-strong:text-gray-900 font-mono"
                        dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
                    />
                )}
            </div>
        )}
    </div>
);

// Detailed Calculation Breakdown Component
const CalculationBreakdown: React.FC<{
    forces: Record<PivotPointId, Force>;
    distances: Distances;
    pivotPoint: PivotPointId | null;
    totalMoment: number;
}> = ({ forces, distances, pivotPoint, totalMoment }) => {
    if (!pivotPoint) {
        return (
            <div className="p-6 text-center text-gray-600 font-medium text-xl font-mono">
                Please select a pivot point to see calculations
            </div>
        );
    }

    const enabledForces = Object.values(forces).filter(f => f.isEnabled);
    
    if (enabledForces.length === 0) {
        return (
            <div className="p-6 text-center text-gray-600 font-medium text-xl font-mono">
                No forces enabled. Go back to Step 2 to add forces.
            </div>
        );
    }

    const points = getApplicationPoints(distances);
    const pivotPoint_pos = points[pivotPoint];

    return (
        <div className="p-6 bg-white font-mono">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                Calculation Breakdown - Moment about Point {pivotPoint}
            </h3>
            
            {/* Main equation with substituted values */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 mb-4">
                <div className="text-lg font-bold text-gray-900 mb-2">ΣM<sub>{pivotPoint}</sub> = </div>
                <div className="text-base text-gray-800 leading-relaxed">
                    {enabledForces.map((force, index) => {
                        const applicationPoint = points[force.id];
                        const rx = applicationPoint.x - pivotPoint_pos.x;
                        const ry = applicationPoint.y - pivotPoint_pos.y;
                        const moment = calculateSingleForceMoment(force, distances, pivotPoint);
                        const sign = index === 0 ? '' : (moment >= 0 ? ' + ' : ' - ');
                        
                        return (
                            <span key={force.id}>
                                {sign}({force.fx.toFixed(0)} × {ry.toFixed(1)} - {force.fy.toFixed(0)} × {rx.toFixed(1)})
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Step-by-step arithmetic breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 mb-4">
                <div className="text-base text-gray-800 leading-relaxed space-y-1">
                    <div>= {enabledForces.map((force, index) => {
                        const applicationPoint = points[force.id];
                        const rx = applicationPoint.x - pivotPoint_pos.x;
                        const ry = applicationPoint.y - pivotPoint_pos.y;
                        const fxTimesRy = force.fx * ry;
                        const fyTimesRx = force.fy * rx;
                        const moment = fxTimesRy - fyTimesRx;
                        const sign = index === 0 ? '' : (moment >= 0 ? ' + ' : ' - ');
                        
                        return (
                            <span key={force.id}>
                                {sign}({fxTimesRy.toFixed(2)} - {fyTimesRx.toFixed(2)})
                            </span>
                        );
                    })}</div>
                    
                    <div>= {enabledForces.map((force, index) => {
                        const moment = calculateSingleForceMoment(force, distances, pivotPoint);
                        const sign = index === 0 ? '' : (moment >= 0 ? ' + ' : ' - ');
                        const value = index === 0 ? moment.toFixed(2) : Math.abs(moment).toFixed(2);
                        
                        return (
                            <span key={force.id}>
                                {sign}{value}
                            </span>
                        );
                    })}</div>
                    
                    <div>= {totalMoment.toFixed(2)} Nm</div>
                </div>
            </div>

            {/* Final answer with direction indication */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-300">
                <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>= {Math.abs(totalMoment).toFixed(0)} Nm</span>
                    {Math.abs(totalMoment) > 0.01 && (
                        <span className="text-2xl">
                            {totalMoment > 0 ? '↻' : '↺'}
                        </span>
                    )}
                    <span className="text-green-800">(Answer)</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                    {Math.abs(totalMoment) < 0.01 
                        ? 'System is in equilibrium' 
                        : totalMoment > 0 
                        ? 'Counter-clockwise rotation' 
                        : 'Clockwise rotation'
                    }
                </div>
            </div>

            {/* Individual force breakdown for reference */}
            <div className="mt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Individual Force Contributions:</h4>
                <div className="space-y-2">
                    {enabledForces.map((force) => {
                        const applicationPoint = points[force.id];
                        const moment = calculateSingleForceMoment(force, distances, pivotPoint);
                        
                        return (
                            <div key={force.id} className="bg-white p-3 rounded border border-gray-200">
                                <div className="text-sm font-semibold text-gray-900">{force.name}:</div>
                                <div className="text-xs text-gray-700">
                                    Position: ({applicationPoint.x}, {applicationPoint.y}), 
                                    Force: ({force.fx.toFixed(1)}, {force.fy.toFixed(1)}) N, 
                                    Moment: {moment.toFixed(2)} Nm
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Learning Activities Component for Clearing Misconceptions
const LearningActivities: React.FC<{
    forces: Record<PivotPointId, Force>;
    distances: Distances;
    pivotPoint: PivotPointId | null;
    onStateChange: (field: keyof AppState, value: any) => void;
}> = ({ forces: _forces, distances: _distances, pivotPoint: _pivotPoint, onStateChange: _onStateChange }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

    const questions = [
        {
            id: 1,
            title: "Predicting Moment Direction",
            question: "Try with a force, predict the magnitude and direction of rotation of the moment as a result of the force.",
            instruction: "Set up any force configuration and observe the result. Focus on understanding the relationship between force direction and rotation direction.",
            answer: "Observe how the force creates clockwise (negative) or counter-clockwise (positive) rotation. The direction depends on how the force would cause the object to rotate about the pivot point.",
            type: "observation"
        },
        {
            id: 2,
            title: "Horizontal Force - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing right at B, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a horizontal force at B, and identify the perpendicular distance.",
            answer: "d2. When force is in horizontal direction, the distance is taken in the vertical direction.",
            correctAnswer: "d2",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 3,
            title: "Vertical Force - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing down at C, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a downward force at C, and identify the perpendicular distance.",
            answer: "d1. When force is in vertical direction, the distance is taken in the horizontal direction.",
            correctAnswer: "d1",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 4,
            title: "Vertical Force at D - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing up at D, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place an upward force at D, and identify the perpendicular distance.",
            answer: "d3. When force is in vertical direction, the distance is taken in the horizontal direction.",
            correctAnswer: "d3",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 5,
            title: "Force at Pivot Point",
            question: "Try with pivot point A, a force pointing left at A, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a force at point A, and observe the perpendicular distance.",
            answer: "Zero. When a force passes through the pivot point, the perpendicular distance between them is zero.",
            correctAnswer: "Zero",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 6,
            title: "Line of Action Through Pivot",
            question: "Try with pivot point A, a force pointing up at B, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place an upward force at B, and observe the line of action.",
            answer: "Zero. When the line of action of a force passes through the pivot point, the perpendicular distance between them is zero.",
            correctAnswer: "Zero",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 7,
            title: "Understanding Positive Moment Sign",
            question: "Try with pivot point B, a force pointing left at C, predict if the moment is indicated as positive sign, and why.",
            instruction: "Set pivot to B, place a leftward force at C, and observe the rotation direction.",
            answer: "The moment is indicated with positive sign as the force is causing the object to rotate anti-clockwise. The positive/negative sign of a moment is purely decided by the direction of rotation caused by the force on the object. This is different from the sign convention in Chapter 3 Resultant Forces, where force pointing right is indicated as positive, force pointing left is indicated as negative.",
            correctAnswer: "Positive (Counter-clockwise)",
            type: "multiple-choice",
            options: ["Positive (Counter-clockwise)", "Negative (Clockwise)", "Zero", "Cannot determine"]
        },
        {
            id: 8,
            title: "Sign Convention Clarification",
            question: "Try with pivot point C, a force pointing up at A, predict if the moment is indicated as negative sign, and why.",
            instruction: "Set pivot to C, place an upward force at A, and observe the rotation direction.",
            answer: "The moment is indicated with positive sign as the force is causing the object to rotate anti-clockwise. The positive/negative sign of a moment is purely decided by the direction of rotation caused by the force on the object. This is different from the sign convention in Chapter 3 Resultant Forces, where force pointing up is indicated as positive, force pointing down is indicated as negative.",
            correctAnswer: "Positive (Counter-clockwise)",
            type: "multiple-choice",
            options: ["Positive (Counter-clockwise)", "Negative (Clockwise)", "Zero", "Cannot determine"]
        },
        {
            id: 9,
            title: "Two Forces - Rotation Analysis",
            question: "Try with pivot point A, a force pointing down at B and a force pointing right at C, does the object rotate as a result of the forces?",
            instruction: "Set pivot to A, place forces as described, and analyze the total moment.",
            answer: "As Moment = force × distance (perpendicular), when the distance between the pivot point and the force is zero, there is no moment created by the force. Thus when the line of action of a force passes through the pivot point, the force does not create a moment on the object with the said pivot point.",
            correctAnswer: "No",
            type: "multiple-choice",
            options: ["Yes", "No", "Depends on force magnitude", "Cannot determine"]
        },
        {
            id: 10,
            title: "Three Forces - Complex Analysis",
            question: "Try with pivot point A, a force pointing down at B and a force pointing right at C and a force pointing up at D, does the object rotate as a result of the forces?",
            instruction: "Set pivot to A, place all three forces as described, and analyze the total moment.",
            answer: "As Moment = force × distance (perpendicular), although there is no moment created by the forces at B and C, there is a moment created by force at D, as there is a distance d3 between the force at D and the pivot point A. You may refer to question 4.",
            correctAnswer: "Yes",
            type: "multiple-choice",
            options: ["Yes", "No", "Depends on force magnitude", "Cannot determine"]
        }
    ];

    const currentQ = questions[currentQuestion];

    const handleAnswerSubmit = (selectedAnswer: string) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
        setShowAnswer(true);
    };

    const nextQuestion = () => {
        setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1));
        setShowAnswer(false);
    };

    const previousQuestion = () => {
        setCurrentQuestion(prev => Math.max(prev - 1, 0));
        setShowAnswer(false);
    };

    const isCorrect = userAnswers[currentQuestion] === currentQ.correctAnswer;

    return (
        <div className="p-6 bg-white font-mono">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🎯 Learning Activities - Clearing Common Misconceptions
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Work through these guided activities to understand moment direction, signs, and perpendicular distances.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <span className="font-bold">Question {currentQuestion + 1} of {questions.length}:</span> {currentQ.title}
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">{currentQ.question}</h4>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
                    <p className="text-sm text-yellow-800">
                        <span className="font-bold">📋 Instructions:</span> {currentQ.instruction}
                    </p>
                </div>

                {currentQ.type === "multiple-choice" && currentQ.options && (
                    <div className="space-y-2 mb-4">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSubmit(option)}
                                disabled={showAnswer}
                                className={`w-full text-left p-3 rounded border-2 transition-all ${
                                    showAnswer
                                        ? option === currentQ.correctAnswer
                                            ? 'bg-green-100 border-green-400 text-green-800'
                                            : userAnswers[currentQuestion] === option
                                            ? 'bg-red-100 border-red-400 text-red-800'
                                            : 'bg-gray-100 border-gray-300 text-gray-600'
                                        : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                                {option}
                                {showAnswer && option === currentQ.correctAnswer && ' ✓'}
                                {showAnswer && userAnswers[currentQuestion] === option && option !== currentQ.correctAnswer && ' ✗'}
                            </button>
                        ))}
                    </div>
                )}

                {currentQ.type === "observation" && (
                    <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                        <p className="text-gray-700">
                            This is an observation exercise. Use the simulator above to explore the concept, then click "Show Explanation" to see the key insights.
                        </p>
                        <button
                            onClick={() => setShowAnswer(true)}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Show Explanation
                        </button>
                    </div>
                )}

                {showAnswer && (
                    <div className={`p-4 rounded-lg border-2 ${
                        currentQ.type === "observation" || isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'bg-orange-50 border-orange-300'
                    }`}>
                        <div className="flex items-start gap-2 mb-2">
                            <span className="text-xl">
                                {currentQ.type === "observation" ? '💡' : isCorrect ? '✅' : '📚'}
                            </span>
                            <h5 className="font-bold text-gray-900">
                                {currentQ.type === "observation" ? 'Key Insight:' : isCorrect ? 'Correct!' : 'Learning Point:'}
                            </h5>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{currentQ.answer}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded transition-colors ${
                        currentQuestion === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                >
                    ← Previous
                </button>

                <span className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                </span>

                <button
                    onClick={nextQuestion}
                    disabled={currentQuestion === questions.length - 1}
                    className={`px-4 py-2 rounded transition-colors ${
                        currentQuestion === questions.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                >
                    Next →
                </button>
            </div>

            {currentQuestion === questions.length - 1 && showAnswer && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300">
                    <h4 className="font-bold text-purple-900 mb-2">🎉 Congratulations!</h4>
                    <p className="text-sm text-purple-800">
                        You've completed all the learning activities! You should now have a clearer understanding of:
                    </p>
                    <ul className="text-sm text-purple-800 mt-2 ml-4 list-disc">
                        <li>How to identify perpendicular distances for different force directions</li>
                        <li>Why moment sign depends on rotation direction, not force direction</li>
                        <li>When forces create zero moment (line of action through pivot)</li>
                        <li>How multiple forces combine to create net rotation</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

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
  const [activeTab, setActiveTab] = useState<'breakdown' | 'concepts' | 'activities'>('breakdown');
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
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-mono">1. Select Pivot Point (A, B, C, or D)</h3>
                    <p className="text-base text-gray-700 mb-2 font-mono">Choose which point will be the center of rotation:</p>
                    {!pivotPoint && (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 mb-2 border-l-4 border-l-gray-600">
                            <p className="text-sm text-gray-700 font-medium flex items-center gap-2 font-mono">
                                <span className="text-gray-600">ℹ️</span>
                                Please select a pivot point to continue
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map((id) => (
                            <button
                            key={id}
                            onClick={() => onStateChange('pivotPoint', id as PivotPointId)}
                            className={`py-2 px-3 rounded-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 text-lg border-2 font-mono ${
                                pivotPoint === id ? 'bg-gray-800 text-white border-gray-800 shadow-lg' : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300 hover:border-gray-400'
                            }`}
                            >
                            Point {id} {pivotPoint === id ? '✓' : ''}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 font-mono">2. Adjust Frame Distances (in meters)</h3>
                    <p className="text-base text-gray-700 mb-2 font-mono">Set the distances between points on the structural frame:</p>
                    <SliderInput label="Distance d1 (A to C)" value={distances.d1} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d1: v})} />
                    <SliderInput label="Distance d2 (A to B)" value={distances.d2} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d2: v})} />
                    <SliderInput label="Distance d3 (B to D)" value={distances.d3} min={0} max={10} step={0.1} unit="m" onChange={(v) => onStateChange('distances', {...distances, d3: v})} />
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    {pivotPoint && (
                        <button 
                            onClick={() => onStateChange('pivotPoint', null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 flex items-center gap-2 text-xs font-mono"
                        >
                            ↻ Reset Selection
                        </button>
                    )}
                    <button 
                        onClick={() => onStepChange(2)} 
                        disabled={!pivotPoint}
                        className={`font-bold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 text-sm button-hover-lift font-mono ${
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
            <section className="space-y-6 animate-fade-in">
                 <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-mono">3. Select Forces to Include & Adjust Parameters</h2>
                    <p className="text-lg text-gray-700 mb-2 font-mono">Choose which forces to apply and configure their magnitude and direction:</p>
                 </div>
                 {Object.values(forces).map((force: Force) => (
                    <ForceControlCard key={force.id} force={force} onChange={onForceChange} />
                ))}
                <div className="flex justify-between pt-6">
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
            <section className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center border-2 border-purple-200 shadow-lg">
                    <p className="text-xl text-purple-700 uppercase tracking-wider font-bold mb-2 font-mono">📊 LIVE CALCULATION UPDATE</p>
                    <p className="text-lg text-gray-600 uppercase tracking-wider font-bold font-mono">Total Moment about Pivot {pivotPoint}</p>
                    <p className="text-4xl font-bold text-gray-900 my-4 font-mono">{totalMoment.toFixed(2)} Nm</p>
                    
                    <div className="bg-white p-4 rounded-lg border border-purple-200 mt-4">
                        <p className="text-xl font-bold text-gray-700 mb-2 font-mono">🔄 RESULTANT ROTATION DIRECTION:</p>
                        <div className={`flex items-center justify-center gap-4 text-xl font-bold ${getRotationDirection().color} font-mono`}>
                            <span className="bg-gray-100 px-4 py-2 rounded-full">{getRotationDirection().text}</span>
                        </div>
                    </div>
                </div>
      
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                    <div className="border-b border-gray-300">
                        <div className="flex -mb-px">
                            <button onClick={() => { setActiveTab('breakdown'); onExpandedIdChange(null); }} className={`flex-1 py-3 font-bold text-lg transition-colors border-r border-gray-300 font-mono ${activeTab === 'breakdown' ? 'bg-gray-200 text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Calculation Breakdown
                            </button>
                            <button onClick={() => { setActiveTab('activities'); onExpandedIdChange(null); }} className={`flex-1 py-3 font-bold text-lg transition-colors border-r border-gray-300 font-mono ${activeTab === 'activities' ? 'bg-gray-200 text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Learning Activities
                            </button>
                            <button onClick={() => { setActiveTab('concepts'); onExpandedIdChange(null); }} className={`flex-1 py-3 font-bold text-lg transition-colors font-mono ${activeTab === 'concepts' ? 'bg-gray-200 text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                Concept Explorer
                            </button>
                        </div>
                    </div>

                    <div className="bg-white">
                    {activeTab === 'breakdown' && (
                        <CalculationBreakdown 
                            forces={forces}
                            distances={distances}
                            pivotPoint={pivotPoint}
                            totalMoment={totalMoment}
                        />
                    )}
                    {activeTab === 'activities' && (
                        <LearningActivities
                            forces={forces}
                            distances={distances}
                            pivotPoint={pivotPoint}
                            onStateChange={onStateChange}
                        />
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
                 <div className="flex justify-center pt-6">
                    <button onClick={() => onStepChange(1)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center gap-2 text-xl border border-gray-700 shadow-md button-hover-lift font-mono">
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
