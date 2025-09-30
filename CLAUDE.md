# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Moment Calculator Simulator** - an interactive educational application that helps students learn physics concepts related to moments, forces, and rotational equilibrium. The application is built with React 19, TypeScript, and Vite.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### Core Application Structure

The application follows a **step-based workflow pattern** with three main phases:
1. **Step 1: Frame Setup** - Users select a pivot point and adjust distances
2. **Step 2: Define Forces** - Users configure force magnitudes, angles, and enable/disable forces
3. **Step 3: Analyze Results** - Real-time moment calculations and educational explanations

### Key Components

- **App.tsx**: Main application component managing global state and step progression
- **WorkflowPanel.tsx**: Multi-step interface with stepper navigation and controls
- **Diagram.tsx**: Interactive SVG diagram showing forces, distances, and pivot points
- **LearningActivitiesModal.tsx**: Educational content and guided activities

### State Management Pattern

The application uses **lifted state** with callback props rather than Context API:

```typescript
// Central state in App.tsx
const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
const [currentStep, setCurrentStep] = useState(1);

// State modification callbacks passed down
const handleStateChange = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
  setAppState(prevState => ({ ...prevState, [key]: value }));
}, []);
```

### Core Data Types

- **AppState**: Contains `pivotPoint`, `forces`, and `distances`
- **Force**: Supports multiple input methods (magnitude/angle, components, acute angle + direction)
- **PivotPointId**: 'A' | 'B' | 'C' | 'D' representing the four frame points

### Physics Calculations

The moment calculation engine is in `services/momentCalculator.ts`:
- Uses cross product formula: `Moment = rx * Fy - ry * Fx`
- Real-time updates when any parameter changes
- Handles multiple forces with proper vector mathematics

### External Services

- **Gemini AI Integration**: `services/geminiService.ts` provides educational explanations
- Requires `GEMINI_API_KEY` environment variable in `.env.local`
- Fallback content available when API is unavailable

## Component Hierarchy

```
App
├── Header (formula display)
├── Diagram (interactive SVG)
├── WorkflowPanel
│   ├── Stepper (step navigation)
│   ├── Controls (step-specific inputs)
│   └── AnalysisPanel (results display)
├── LearningActivitiesModal
└── RotationVisualization
```

## Key Files

- `types.ts`: TypeScript interfaces for all data structures
- `constants.ts`: Initial state, coordinate calculations, and configuration
- `services/momentCalculator.ts`: Core physics calculations
- `services/geminiService.ts`: AI-powered educational content
- `components/WorkflowPanel.tsx`: Main interface logic and step management

## Development Notes

- The application is designed to fit within 100% viewport without scrolling
- Force visualization uses SVG with coordinate transformations for physics accuracy
- State updates trigger immediate visual feedback in the diagram
- All calculations use metric units (Newtons, meters)
- The stepper component enforces workflow progression (can't skip steps)

## Educational Features

- Interactive force manipulation with real-time visual feedback
- Multiple input methods for forces (accommodates different learning styles)
- AI-generated explanations for complex physics concepts
- Guided learning activities with auto-setup functionality
- Comprehensive moment analysis with individual force breakdowns