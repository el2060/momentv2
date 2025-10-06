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
        { icon: '🧭', text: 'Select pivot point' },
        { icon: '⚡', text: 'Configure forces' },
        { icon: '📏', text: 'Adjust parameters' },
        { icon: '📐', text: 'Choose input method' },
        { icon: '🔄', text: 'View live results' },
        { icon: '↻', text: 'See rotation direction' },
        { icon: '🎯', text: 'Practice activities' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <span>ℹ️</span>
                <span>Quick Guide</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-4 z-50 w-96 max-h-[60vh] overflow-y-auto">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                        🎯 <span>What You Can Do</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {objectives.map((obj, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <span className="text-lg">{obj.icon}</span>
                                <span className="text-sm text-gray-700 font-medium">{obj.text}</span>
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            {/* Main Formula */}
            <div className="flex flex-col items-center lg:items-start">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Key Formula</h3>
                <div className="font-mono text-xl bg-white px-4 py-2 rounded-xl border border-blue-300 shadow-sm">
                    <span className="text-blue-900 font-bold">Moment</span>
                    <span className="text-gray-500 mx-2">=</span>
                    <span className="text-blue-800 font-bold">Force</span>
                    <span className="text-gray-500 mx-2">×</span>
                    <span className="text-blue-700 font-bold">d<sub className="text-sm">⊥</sub></span>
                </div>
            </div>
            {/* Rotation Direction Legend */}
            <div className="flex items-center gap-3">
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Rotation Direction</p>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                            <div className="w-8 h-8 flex items-center justify-center text-emerald-600 text-xl">↺</div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-emerald-700">+ve</div>
                                <div className="text-xs text-emerald-600">CCW</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                            <div className="w-8 h-8 flex items-center justify-center text-rose-600 text-xl">↻</div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-rose-700">-ve</div>
                                <div className="text-xs text-rose-600">CW</div>
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
        <header className="border-b border-gray-200 bg-white shadow-sm">
            {/* Main Header Section */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo and Interactive Tasks */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <NPLogo />
                        <LearningObjectivesPanel />
                    </div>

                    {/* Main Title Block - Centered */}
                    <div className="flex-1 text-center mx-4 min-w-0">
                        <h1 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight truncate">
                            Moment of a Force Interactive Simulator
                        </h1>
                        <p className="text-xs lg:text-sm text-gray-600 mt-1 truncate">
                            Master the principles of mechanics through interactive learning
                        </p>
                    </div>

                    {/* Updated Button */}
                    <div className="flex items-center flex-shrink-0">
                        <button
                            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-2 lg:px-3 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 hover:border-gray-400 flex items-center gap-1 lg:gap-2 shadow-sm"
                            title="Last updated on October 6, 2025"
                            disabled
                        >
                            <span className="text-gray-500 text-xs lg:text-sm">📅</span>
                            <span className="hidden sm:inline">Updated: 06 Oct 2025</span>
                            <span className="sm:hidden">06 Oct 2025</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sticky Formula Box */}
            <div className="px-4 pb-3">
                <StickyFormulaBox />
            </div>
        </header>
    );
};

export default Header;
