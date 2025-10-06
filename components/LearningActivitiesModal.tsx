import React, { useState } from 'react';
import { AppState, Force, PivotPointId, Distances } from '../types';

interface LearningActivitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    forces: Record<PivotPointId, Force>;
    distances: Distances;
    pivotPoint: PivotPointId | null;
    onStateChange: (field: keyof AppState, value: any) => void;
    onForceChange: (id: PivotPointId, updatedForce: Partial<Force>) => void;
}

const LearningActivitiesModal: React.FC<LearningActivitiesModalProps> = ({
    isOpen,
    onClose,
    forces,
    onStateChange,
    onForceChange
}) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

    const questions = [
        {
            id: 1,
            title: "Predicting Moment Direction",
            question: "Try with a force, predict the magnitude and direction of rotation of the moment as a result of the force.",
            instruction: "Set up any force configuration and observe the result. Focus on understanding the relationship between force direction and rotation direction.",
            answerExplanation: "Observe how the force creates clockwise (negative) or counter-clockwise (positive) rotation. The direction depends on how the force would cause the object to rotate about the pivot point.",
            type: "observation"
        },
        {
            id: 2,
            title: "Horizontal Force - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing right at B, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a horizontal force at B, and identify the perpendicular distance.",
            correctAnswer: "d2",
            answerExplanation: "When force is in horizontal direction, the distance is taken in the vertical direction.",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 3,
            title: "Vertical Force - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing down at C, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a downward force at C, and identify the perpendicular distance.",
            correctAnswer: "d1",
            answerExplanation: "When force is in vertical direction, the distance is taken in the horizontal direction.",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 4,
            title: "Vertical Force at D - Perpendicular Distance",
            question: "Try with pivot point A, a force pointing up at D, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place an upward force at D, and identify the perpendicular distance.",
            correctAnswer: "d3",
            answerExplanation: "When force is in vertical direction, the distance is taken in the horizontal direction.",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 5,
            title: "Force at Pivot Point",
            question: "Try with pivot point A, a force pointing left at A, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place a force at point A, and observe the perpendicular distance.",
            correctAnswer: "Zero",
            answerExplanation: "When a force passes through the pivot point, the perpendicular distance between them is zero.",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 6,
            title: "Line of Action Through Pivot",
            question: "Try with pivot point A, a force pointing up at B, what is the perpendicular distance between the force and the pivot point?",
            instruction: "Set pivot to A, place an upward force at B, and observe the line of action.",
            correctAnswer: "Zero",
            answerExplanation: "When the line of action of a force passes through the pivot point, the perpendicular distance between them is zero.",
            type: "multiple-choice",
            options: ["d1", "d2", "d3", "Zero"]
        },
        {
            id: 7,
            title: "Understanding Positive Moment Sign",
            question: "Try with pivot point B, a force pointing left at C, predict if the moment is indicated as positive sign, and why.",
            instruction: "Set pivot to B, place a leftward force at C, and observe the rotation direction.",
            correctAnswer: "Positive (Counter-clockwise)",
            answerExplanation: "The moment is indicated with positive sign as the force is causing the object to rotate anti-clockwise. The positive/negative sign of a moment is purely decided by the direction of rotation caused by the force on the object. This is different from the sign convention in Chapter 3 Resultant Forces, where force pointing right is indicated as positive, force pointing left is indicated as negative.",
            type: "multiple-choice",
            options: ["Positive (Counter-clockwise)", "Negative (Clockwise)", "Zero", "Cannot determine"]
        },
        {
            id: 8,
            title: "Sign Convention Clarification",
            question: "Try with pivot point C, a force pointing up at A, predict if the moment is indicated as negative sign, and why.",
            instruction: "Set pivot to C, place an upward force at A, and observe the rotation direction.",
            correctAnswer: "Negative (Clockwise)",
            answerExplanation: "The moment is indicated with negative sign as the force is causing the object to rotate clockwise. The positive/negative sign of a moment is purely decided by the direction of rotation caused by the force on the object. This is different from the sign convention in Chapter 3 Resultant Forces, where force pointing up is indicated as positive, force pointing down is indicated as negative.",
            type: "multiple-choice",
            options: ["Positive (Counter-clockwise)", "Negative (Clockwise)", "Zero", "Cannot determine"]
        },
        {
            id: 9,
            title: "Two Forces - Rotation Analysis",
            question: "Try with pivot point A, a force pointing down at B and a force pointing right at C, does the object rotate as a result of the forces?",
            instruction: "Set pivot to A, place forces as described, and analyze the total moment.",
            correctAnswer: "No",
            answerExplanation: "As Moment = force × distance (perpendicular), when the distance between the pivot point and the force is zero, there is no moment created by the force. Thus when the line of action of a force passes through the pivot point, the force does not create a moment on the object with the said pivot point.",
            type: "multiple-choice",
            options: ["Yes", "No", "Depends on force magnitude", "Cannot determine"]
        },
        {
            id: 10,
            title: "Three Forces - Complex Analysis",
            question: "Try with pivot point A, a force pointing down at B and a force pointing right at C and a force pointing up at D, does the object rotate as a result of the forces?",
            instruction: "Set pivot to A, place all three forces as described, and analyze the total moment.",
            correctAnswer: "Yes",
            answerExplanation: "As Moment = force × distance (perpendicular), although there is no moment created by the forces at B and C, there is a moment created by force at D, as there is a distance d3 between the force at D and the pivot point A. You may refer to question 4.",
            type: "multiple-choice",
            options: ["Yes", "No", "Depends on force magnitude", "Cannot determine"]
        }
    ];

    const handleQuestionNavigation = (direction: 'next' | 'previous') => {
        setCurrentQuestion((prev) => {
            if (direction === 'next') {
                return Math.min(prev + 1, questions.length - 1);
            } else {
                return Math.max(prev - 1, 0);
            }
        });
    };

    const handleAnswerSubmit = (selectedAnswer: string) => {
        setUserAnswers({ ...userAnswers, [currentQuestion]: selectedAnswer });
    };

    const isCorrect = userAnswers[currentQuestion] === questions[currentQuestion]?.correctAnswer;

    if (!isOpen) return null;

    return (
        <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 flex flex-col gap-4">
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Learning Activities - Interactive Practice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </header>

        <div className="flex gap-4">
          {/* Instructions Panel */}
          <div className="w-1/3 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Instructions</h3>
            <p className="mb-4">{questions[currentQuestion]?.instruction}</p>

            {/* Reference Diagram */}
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="text-sm font-semibold mb-2 text-gray-700">Reference Frame</h4>
              <svg width="120" height="100" viewBox="0 0 120 100" className="border border-gray-300 rounded">
                {/* Frame Structure */}
                <line x1="20" y1="70" x2="100" y2="70" stroke="#374151" strokeWidth="2"/>
                <line x1="20" y1="70" x2="20" y2="20" stroke="#374151" strokeWidth="2"/>

                {/* Points */}
                <circle cx="20" cy="20" r="4" fill="#dc2626" stroke="#fff" strokeWidth="2"/>
                <circle cx="20" cy="70" r="4" fill="#dc2626" stroke="#fff" strokeWidth="2"/>
                <circle cx="70" cy="20" r="4" fill="#dc2626" stroke="#fff" strokeWidth="2"/>
                <circle cx="100" cy="70" r="4" fill="#dc2626" stroke="#fff" strokeWidth="2"/>

                {/* Labels */}
                <text x="15" y="15" fontSize="12" fill="#374151" fontWeight="bold">A</text>
                <text x="15" y="85" fontSize="12" fill="#374151" fontWeight="bold">B</text>
                <text x="75" y="15" fontSize="12" fill="#374151" fontWeight="bold">C</text>
                <text x="105" y="85" fontSize="12" fill="#374151" fontWeight="bold">D</text>

                {/* Distance Labels */}
                <text x="42" y="15" fontSize="10" fill="#6b7280">d₁</text>
                <text x="10" y="50" fontSize="10" fill="#6b7280">d₂</text>
                <text x="55" y="85" fontSize="10" fill="#6b7280">d₃</text>

                {/* Distance Lines */}
                <line x1="20" y1="25" x2="70" y2="25" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="15" y1="20" x2="15" y2="70" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="20" y1="75" x2="100" y2="75" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
              </svg>
            </div>
          </div>

          {/* Canvas Interaction Panel */}
          <div className="w-2/3 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Question {currentQuestion + 1} of {questions.length}</h3>
            <p>{questions[currentQuestion]?.question}</p>

            {/* Options or Interaction */}
            {questions[currentQuestion]?.type === 'multiple-choice' && (
              <div className="flex flex-col gap-2">
                {questions[currentQuestion]?.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg ${userAnswers[currentQuestion] === option ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    onClick={() => handleAnswerSubmit(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback */}
            {userAnswers[currentQuestion] && (
              <p className={`mt-4 text-lg font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect, try again.'}
              </p>
            )}

            {/* Explanation */}
            {userAnswers[currentQuestion] && (
              <p className="mt-2 text-sm text-gray-700">
                {questions[currentQuestion]?.answerExplanation}
              </p>
            )}
          </div>
        </div>

        <footer className="flex justify-between items-center">
          <button
            onClick={() => handleQuestionNavigation('previous')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          <button
            onClick={() => handleQuestionNavigation('next')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            disabled={currentQuestion === questions.length - 1}
          >
            Next
          </button>
        </footer>
      </div>
    </div>
    );
};

export default LearningActivitiesModal;
