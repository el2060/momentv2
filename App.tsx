import { useState, useCallback } from 'react';
import { AppState, Force, PivotPointId } from './types';
import { INITIAL_STATE } from './constants';
import Diagram from './components/Diagram';
import WorkflowPanel from './components/WorkflowPanel';
import Header from './components/Header';
import LearningActivitiesModal from './components/LearningActivitiesModal';
import RotationVisualization from './components/RotationVisualization';

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);

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
    <div className="h-screen w-screen max-w-full bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <Header />

      {/* Floating Action Buttons */}
      <div className="fixed top-32 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => setIsLearningModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm transition-all duration-200 hover:shadow-xl flex items-center gap-2"
          title="Open Learning Activities"
        >
          🎯 <span>Activities</span>
        </button>

        <button
          onClick={() => {
            setAppState(INITIAL_STATE);
            setCurrentStep(1);
            setExpandedId(null);
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm transition-all duration-200 hover:shadow-xl flex items-center gap-2"
          title="Reset All"
        >
          🔄 <span>Reset</span>
        </button>
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4 px-3 lg:px-4 pb-3 min-h-0 w-full max-w-full overflow-hidden">
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center min-h-0 w-full max-w-full overflow-hidden">
          <Diagram {...appState} expandedForceId={expandedId} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 overflow-hidden w-full max-w-full">
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

      {/* Learning Activities Modal */}
      <LearningActivitiesModal
        isOpen={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
        forces={appState.forces}
        distances={appState.distances}
        pivotPoint={appState.pivotPoint}
        onStateChange={handleStateChange}
        onForceChange={handleForceChange}
      />

      <footer className="text-center py-2 text-gray-400 text-xs border-t border-gray-200 bg-white w-full max-w-full">
      </footer>
    </div>
  );
}
