import React, { useState, useCallback } from 'react';
import { AppState, Force, PivotPointId } from './types';
import { INITIAL_STATE } from './constants';
import Diagram from './components/Diagram';
import WorkflowPanel from './components/WorkflowPanel';
import Header from './components/Header';

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStateChange = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setAppState(prevState => ({
      ...prevState,
      [key]: value,
    }));
    setExpandedId(null); // Reset explanation when parameters change
  }, []);

  const handleForceChange = useCallback((id: PivotPointId, updatedForce: Partial<Force>) => {
    setAppState(prevState => ({
      ...prevState,
      forces: {
        ...prevState.forces,
        [id]: { ...prevState.forces[id], ...updatedForce },
      },
    }));
    setExpandedId(null); // Reset explanation when parameters change
  }, []);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setExpandedId(null);
  }
  
  return (
    <div className="h-screen w-screen max-w-full bg-white text-gray-900 font-mono overflow-hidden flex flex-col">
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-1 lg:gap-2 px-1 lg:px-2 pb-1 min-h-0 w-full max-w-full overflow-hidden">
        <div className="lg:col-span-3 bg-gray-50 p-2 rounded-lg shadow-sm border border-gray-300 flex items-center justify-center min-h-0 w-full max-w-full overflow-hidden">
          <Diagram {...appState} expandedForceId={expandedId} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-1 min-h-0 overflow-hidden w-full max-w-full">
          <WorkflowPanel
            appState={appState}
            onStateChange={handleStateChange}
            onForceChange={handleForceChange}
            expandedId={expandedId}
            onExpandedIdChange={setExpandedId}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>
      </main>

      <footer className="text-center py-0.5 text-gray-500 text-xs border-t border-gray-200 bg-gray-50 font-mono w-full max-w-full">
        <p>Built with React, TypeScript, and modern web technologies</p>
      </footer>
    </div>
  );
}
