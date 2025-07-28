import React, { useState } from 'react';

// NP Logo Component
const NPLogo: React.FC = () => (
    <div className="flex items-center">
        <img 
            src="https://www.np.edu.sg/images/default-source/default-album/img-logo.png?sfvrsn=764583a6_19"
            alt="NP Logo"
            className="h-10 w-auto object-contain"
            onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.classList.remove('hidden');
            }}
        />
        <div className="hidden bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-2">
            <span className="text-white font-bold text-sm">NP</span>
        </div>
    </div>
);

// Collapsible Learning Objectives Panel
const LearningObjectivesPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const objectives = [
        { icon: '🧭', text: 'Select pivot point (A, B, C, D)' },
        { icon: '⚡', text: 'Choose forces to include' },
        { icon: '📏', text: 'Adjust magnitude & direction' },
        { icon: '📐', text: 'Use angle or components' },
        { icon: '🔄', text: 'See live calculations' },
        { icon: '↻', text: 'View rotation direction' },
        { icon: '🎯', text: 'Practice with guided activities' }
    ];

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-lg font-bold transition-colors shadow-md font-mono"
            >
                <span>ℹ️</span>
                <span>Interactive Tasks</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▲</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl px-4 py-3 z-50 min-w-[420px] w-[520px] max-h-[40vh] overflow-y-auto overflow-x-hidden animate-fade-in">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-3 text-2xl font-mono">
                        🎯 <span>What You Can Do:</span>
                    </h3>
                    <div className="flex flex-row flex-wrap gap-4 items-center justify-start w-full">
                        {objectives.map((obj, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-[120px]">
                                <span className="text-3xl grayscale">{obj.icon}</span>
                                <span className="text-xl text-gray-800 font-mono text-center whitespace-nowrap">{obj.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Sticky Formula Box
const StickyFormulaBox: React.FC = () => (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400 rounded-xl p-2 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4">
            {/* Main Formula */}
            <div className="flex flex-col items-start justify-center">
                <h3 className="font-bold text-gray-900 text-sm mb-1 font-mono">Key Formula:</h3>
                <div className="font-mono text-lg bg-white px-3 py-1 rounded-lg border-2 border-gray-500 shadow-md">
                    <span className="text-gray-900 font-extrabold">Moment</span>
                    <span className="text-gray-600 mx-1 text-lg">=</span>
                    <span className="text-gray-800 font-extrabold">Force</span>
                    <span className="text-gray-600 mx-1 text-lg">×</span>
                    <span className="text-gray-700 font-extrabold">d<sub className="text-sm align-baseline">⊥</sub></span>
                </div>
            </div>
            {/* Rotation Direction Legend */}
            <div className="flex items-center gap-2">
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 mb-1 font-mono">Rotation Direction:</p>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 bg-green-100 border-2 border-green-400 px-3 py-2 rounded-xl">
                            <div className="w-10 h-10 flex items-center justify-center text-green-700 text-2xl">↺</div>
                            <div className="text-center">
                                <div className="text-base font-extrabold text-green-800 font-mono">+ve</div>
                                <div className="text-sm text-green-600 font-mono">CCW</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-red-100 border-2 border-red-400 px-3 py-2 rounded-xl">
                            <div className="w-10 h-10 flex items-center justify-center text-red-700 text-2xl">↻</div>
                            <div className="text-center">
                                <div className="text-base font-extrabold text-red-800 font-mono">-ve</div>
                                <div className="text-sm text-red-600 font-mono">CW</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Header: React.FC = () => {
    return (
        <header className="border-b-2 border-gray-300 bg-white shadow-sm">
            {/* Main Header Section */}
            <div className="px-2 py-1">
                <div className="flex items-center justify-between">
                    {/* Logo and Interactive Tasks */}
                    <div className="flex items-center gap-2">
                        <NPLogo />
                        <LearningObjectivesPanel />
                    </div>
                    
                    {/* Main Title Block - Centered */}
                    <div className="flex-1 text-center mx-4">
                        <h1 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight leading-tight font-mono">
                            Moment of a Force Interactive Simulator
                        </h1>
                        <p className="text-xs text-gray-600 mt-0.5 italic font-mono">
                            Master the principles of mechanics through interactive learning
                        </p>
                    </div>
                    
                    {/* Empty space for balance */}
                    <div className="flex-shrink-0 w-20 lg:w-24"></div>
                </div>
            </div>
            
            {/* Sticky Formula Box */}
            <div className="px-2 pb-1">
                <StickyFormulaBox />
            </div>
        </header>
    );
};

export default Header;
