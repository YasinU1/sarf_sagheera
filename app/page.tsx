'use client';

import { useState, useEffect } from 'react';

// Add Google Fonts for better Arabic typography
const fontLink = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

// Form labels in Arabic
const formLabels = {
  "الماضي المعلوم": "Past Active",
  "المضارع المعلوم": "Present Active", 
  "الماضي المجهول": "Past Passive",
  "المضارع المجهول": "Present Passive",
  "المصدر": "Verbal Noun",
  "الأمر": "Command",
  "النهي": "Prohibition", 
  "اسم الفاعل": "Active Participle",
  "اسم المفعول": "Passive Participle"
};

// Baab configurations
const baabConfigs = {
  2: { 
    file: './data/tafeel.json', 
    name: 'Baab II تَفْعِيل',
    color: 'yellow'
  },
  3: { 
    file: './data/mufala.json', 
    name: 'Baab III مُفَاعَلَة',
    color: 'green'
  },
  4: { 
    file: './data/ifala.json', 
    name: 'Baab IV إِفْعَال',
    color: 'purple'
  },
  5: { 
    file: './data/tafula.json', 
    name: 'Baab V تَفَعُّل',
    color: 'blue'
  },
  6: { 
    file: './data/VI.json', 
    name: 'Baab VI تَفَاعُل',
    color: 'indigo'
  },
  7: { 
    file: './data/VII.json', 
    name: 'Baab VII انْفِعَال',
    color: 'pink'
  },
  8: { 
    file: './data/VIII.json', 
    name: 'Baab VIII افْتِعَال',
    color: 'red'
  },
  10: { 
    file: './data/X.json', 
    name: 'Baab X اسْتِفْعَال',
    color: 'orange'
  },
  11: { 
    file: './data/rubaee-I.json', 
    name: 'رُبَاعِي مُجَرَّد I',
    color: 'teal'
  },
  12: { 
    file: './data/rubaee-II.json', 
    name: 'رُبَاعِي مَزِيد II',
    color: 'cyan'
  }
};

// Define types for better type safety
interface WordData {
  english: string;
  root: string;
  forms: {
    [key: string]: string;
  };
}

// Generate wrong answers by mixing up the forms
const generateWrongAnswers = (correctAnswer: string, currentWord: WordData, currentForm: string, wordsData: WordData[]): string[] => {
  const wrongAnswers: string[] = [];
  const allForms = Object.values(currentWord.forms);
  
  // Add other forms from the same word as wrong answers
  for (const form of allForms) {
    if (form !== correctAnswer && wrongAnswers.length < 3) {
      wrongAnswers.push(form);
    }
  }
  
  // If we need more wrong answers, add forms from other words
  if (wrongAnswers.length < 3) {
    for (const word of wordsData) {
      if (word !== currentWord) {
        const otherWordForm = word.forms[currentForm];
        if (otherWordForm && !wrongAnswers.includes(otherWordForm) && wrongAnswers.length < 3) {
          wrongAnswers.push(otherWordForm);
        }
      }
    }
  }
  
  return wrongAnswers.slice(0, 3);
};

export default function ArabicSarfGame() {
  const [currentBaab, setCurrentBaab] = useState<number>(2);
  const [showBaabDropdown, setShowBaabDropdown] = useState(false);
  const [wordsData, setWordsData] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [bombExploded, setBombExploded] = useState(false);
  const [showBombWarning, setShowBombWarning] = useState(false);
  const [gameMode, setGameMode] = useState<'sequential' | 'random-verbs' | 'fully-random'>('sequential');
  const [questionQueue, setQuestionQueue] = useState<{wordIndex: number, formIndex: number}[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  // Load data from external JSON file based on current baab
  useEffect(() => {
    const loadWordsData = async () => {
      try {
        setLoading(true);
        const baabConfig = baabConfigs[currentBaab as keyof typeof baabConfigs];
        if (!baabConfig) {
          throw new Error(`Invalid baab: ${currentBaab}`);
        }
        
        const response = await fetch(baabConfig.file);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        const data: WordData[] = await response.json();
        setWordsData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading words data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadWordsData();
  }, [currentBaab]);

  // Reset game when baab changes
  useEffect(() => {
    resetGame();
  }, [currentBaab]);

  // Initialize question queue based on game mode
  const generateQuestionQueue = (): {wordIndex: number, formIndex: number}[] => {
    if (wordsData.length === 0) return [];
    
    const queue: {wordIndex: number, formIndex: number}[] = [];
    
    if (gameMode === 'sequential') {
      // Sequential: words in order, forms in order
      for (let wordIndex = 0; wordIndex < wordsData.length; wordIndex++) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        for (let formIndex = 0; formIndex < formKeys.length; formIndex++) {
          queue.push({ wordIndex, formIndex });
        }
      }
    } else if (gameMode === 'random-verbs') {
      // Random verbs but all forms of each verb together
      // First, create a random order of verb indices
      const shuffledWordIndices = Array.from({ length: wordsData.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      
      // For each randomly ordered verb, add all its forms in order
      for (const wordIndex of shuffledWordIndices) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        for (let formIndex = 0; formIndex < formKeys.length; formIndex++) {
          queue.push({ wordIndex, formIndex });
        }
      }
    } else if (gameMode === 'fully-random') {
      // Fully random: any verb, any form, completely random order
      for (let wordIndex = 0; wordIndex < wordsData.length; wordIndex++) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        for (let formIndex = 0; formIndex < formKeys.length; formIndex++) {
          queue.push({ wordIndex, formIndex });
        }
      }
      // Shuffle everything completely randomly
      queue.sort(() => Math.random() - 0.5);
    }
    
    return queue;
  };

  // Get current question based on mode
  const getCurrentQuestion = (): {
    wordIndex: number;
    formIndex: number;
    word: WordData;
    formKey: string;
  } | null => {
    if (wordsData.length === 0) return null;
    
    if (gameMode !== 'sequential' && questionQueue.length > 0) {
      const current = questionQueue[currentQueueIndex];
      if (!current || !wordsData[current.wordIndex]) return null;
      
      const formKeys = Object.keys(wordsData[current.wordIndex].forms);
      const formKey = formKeys[current.formIndex];
      if (!formKey) return null;
      
      return {
        wordIndex: current.wordIndex,
        formIndex: current.formIndex,
        word: wordsData[current.wordIndex],
        formKey
      };
    } else {
      if (!wordsData[currentWordIndex]) return null;
      
      const formKeys = Object.keys(wordsData[currentWordIndex].forms);
      const formKey = formKeys[currentFormIndex];
      if (!formKey) return null;
      
      return {
        wordIndex: currentWordIndex,
        formIndex: currentFormIndex,
        word: wordsData[currentWordIndex],
        formKey
      };
    }
  };

  const currentQuestion = getCurrentQuestion();
  const currentWord = currentQuestion?.word;
  const currentFormKey = currentQuestion?.formKey;
  const correctAnswer = currentWord && currentFormKey ? currentWord.forms[currentFormKey] : undefined;

  // Calculate total forms per word (all words have same structure)
  const formsPerWord = wordsData.length > 0 ? Object.keys(wordsData[0].forms).length : 0;
  const totalQuestionCount = wordsData.length * formsPerWord;

  // Timer effect
  useEffect(() => {
    if (!showResult && !gameComplete && !bombExploded && timeLeft > 0 && !loading) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        
        // Show warning when time is running low
        if (timeLeft <= 5) {
          setShowBombWarning(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && !bombExploded && !loading) {
      // Bomb explodes!
      setBombExploded(true);
    }
  }, [timeLeft, showResult, gameComplete, bombExploded, loading]);

  // Generate choices when question changes
  useEffect(() => {
    if (!gameComplete && !bombExploded && wordsData.length > 0 && currentWord && correctAnswer && currentFormKey) {
      const wrongAnswers = generateWrongAnswers(correctAnswer, currentWord, currentFormKey, wordsData);
      const allChoices = [correctAnswer, ...wrongAnswers];
      // Shuffle the choices
      const shuffled = allChoices.sort(() => Math.random() - 0.5);
      setChoices(shuffled);
      // Reset timer for new question
      setTimeLeft(15);
      setShowBombWarning(false);
    }
  }, [currentWordIndex, currentFormIndex, currentQueueIndex, gameComplete, bombExploded, gameMode, wordsData, currentWord, correctAnswer, currentFormKey]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (answer === correctAnswer) {
      setScore(prev => prev + 1);
      // Auto-advance after 1.5 seconds for correct answers
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      // Auto-advance after 2.5 seconds for incorrect answers (show correct answer longer)
      setTimeout(() => {
        handleNext();
      }, 2500);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    
    if (gameMode !== 'sequential') {
      // Move to next question in queue
      if (currentQueueIndex < questionQueue.length - 1) {
        setCurrentQueueIndex(prev => prev + 1);
      } else {
        // Game complete
        setGameComplete(true);
      }
    } else {
      // Original sequential logic
      const formKeys = Object.keys(wordsData[currentWordIndex].forms);
      if (currentFormIndex < formKeys.length - 1) {
        setCurrentFormIndex(prev => prev + 1);
      } else {
        // Move to next word
        if (currentWordIndex < wordsData.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setCurrentFormIndex(0);
        } else {
          // Game complete
          setGameComplete(true);
        }
      }
    }
  };

  const handleBaabChange = (newBaab: number) => {
    setCurrentBaab(newBaab);
    setShowBaabDropdown(false);
  };

  const changeGameMode = (newMode: 'sequential' | 'random-verbs' | 'fully-random') => {
    setGameMode(newMode);
    
    if (newMode !== 'sequential') {
      // Generate queue for random modes
      const newQueue = generateQuestionQueue();
      setQuestionQueue(newQueue);
      setCurrentQueueIndex(0);
    } else {
      // Reset to sequential mode
      setCurrentWordIndex(0);
      setCurrentFormIndex(0);
      setCurrentQueueIndex(0);
    }
    
    // Reset other states
    setScore(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(15);
    setBombExploded(false);
    setShowBombWarning(false);
  };

  const resetGame = () => {
    if (gameMode !== 'sequential') {
      // Generate new queue for random modes
      const newQueue = generateQuestionQueue();
      setQuestionQueue(newQueue);
      setCurrentQueueIndex(0);
    } else {
      setCurrentWordIndex(0);
      setCurrentFormIndex(0);
    }
    
    setScore(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(15);
    setBombExploded(false);
    setShowBombWarning(false);
  };

  // Calculate progress based on current mode
  const getProgress = () => {
    if (gameMode !== 'sequential' && questionQueue.length > 0) {
      return (currentQueueIndex / questionQueue.length) * 100;
    } else {
      return ((currentWordIndex * formsPerWord + currentFormIndex) / totalQuestionCount) * 100;
    }
  };

  // Get color classes for current baab
  const getBaabColorClasses = (color?: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      teal: 'bg-teal-100 text-teal-800 border-teal-300',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full text-center border-2 border-gray-100">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-8">📚</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading {baabConfigs[currentBaab as keyof typeof baabConfigs]?.name || 'Arabic Game'}...
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full text-center border-2 border-red-200">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-8">⚠️</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Error Loading Data
          </h2>
          <div className="bg-red-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-red-200">
            <div className="text-red-700 mb-4 text-sm sm:text-base">
              {error}
            </div>
            <div className="text-xs sm:text-sm text-red-600">
              Please make sure the file <code>{baabConfigs[currentBaab as keyof typeof baabConfigs]?.file}</code> exists and is accessible.
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-2xl transition-colors duration-300 shadow-lg text-sm sm:text-base"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Bomb explosion screen
  if (bombExploded) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full text-center border-2 border-red-200">
          <div className="text-6xl sm:text-8xl mb-6 sm:mb-8 animate-pulse">💥</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-red-600 mb-4 sm:mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            BOOM! Time's Up!
          </h2>
          <div className="bg-red-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-red-200">
            <div className="text-base sm:text-lg text-red-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              The bomb exploded! 💣
            </div>
            <div className="text-gray-600 mb-4 text-sm sm:text-base">
              You ran out of time and lost all your progress.
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Previous score: {score}/{totalQuestions}
            </div>
          </div>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-2xl transition-colors duration-300 shadow-lg text-sm sm:text-base"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full text-center border-2 border-gray-100">
          <div className="text-6xl sm:text-8xl mb-6 sm:mb-8">🏆</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            أحسنت! Well done!
          </h2>
          <div className="bg-green-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-200">
            <div className="text-lg sm:text-xl text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your Score
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-base sm:text-lg text-gray-600">
              {totalQuestions > 0 ? Math.round((score/totalQuestions) * 100) : 0}% Correct
            </div>
          </div>
          <button
            onClick={resetGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-2xl transition-colors duration-300 shadow-lg text-sm sm:text-base"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render the game until we have data
  if (wordsData.length === 0 || !currentWord || !correctAnswer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-lg w-full text-center border-2 border-gray-100">
          <div className="text-4xl sm:text-6xl mb-6 sm:mb-8">📚</div>
          <div className="text-gray-600 text-sm sm:text-base">Preparing game...</div>
        </div>
      </div>
    );
  }

  const currentBaabConfig = baabConfigs[currentBaab as keyof typeof baabConfigs] || {
    name: 'Baab II تَفْعِيل',
    color: 'yellow',
    file: './data/tafeel.json'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <style dangerouslySetInnerHTML={{ __html: fontLink }} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Question {totalQuestions + 1}
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-green-600">{score}</span> / {totalQuestions}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Game Mode Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => changeGameMode('sequential')}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'sequential'
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  📋 Sequential
                </button>
                <button
                  onClick={() => changeGameMode('random-verbs')}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'random-verbs'
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  🔀 Random
                </button>
                <button
                  onClick={() => changeGameMode('fully-random')}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'fully-random'
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  🎲 Chaos
                </button>
              </div>
              {/* Baab Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowBaabDropdown(!showBaabDropdown)}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between sm:justify-center space-x-2 ${getBaabColorClasses(currentBaabConfig?.color)}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <span className="truncate">{currentBaabConfig?.name}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${showBaabDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showBaabDropdown && (
                  <div className="absolute right-0 mt-2 w-full sm:w-56 bg-white rounded-xl shadow-lg border-2 border-gray-100 z-50">
                    {Object.entries(baabConfigs).map(([baabNum, config]) => (
                      <button
                        key={baabNum}
                        onClick={() => handleBaabChange(parseInt(baabNum))}
                        className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-bold transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50 ${
                          currentBaab === parseInt(baabNum) 
                            ? getBaabColorClasses(config.color)
                            : 'text-gray-700'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <span className="block sm:hidden">{config.name.split(' ')[0]}</span>
                        <span className="hidden sm:block">{config.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Timer Bar - Below Score Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 3 ? 'bg-red-500 animate-pulse' :
                  timeLeft <= 7 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ 
                  width: `${(timeLeft / 15) * 100}%`,
                  transition: 'width 1s linear, background-color 0.3s ease'
                }}
              ></div>
              {/* Bomb icon that moves with the timer */}
              <div 
                className="absolute top-0 h-4 flex items-center transition-all duration-1000 ease-linear"
                style={{ 
                  left: `${Math.max(0, (timeLeft / 15) * 100 - 2)}%`,
                  transition: 'left 1s linear'
                }}
              >
                <div className={`text-lg ${timeLeft <= 5 ? 'animate-bounce' : ''}`}>
                  {timeLeft <= 5 ? '💣' : timeLeft <= 10 ? '⏰' : '⏱️'}
                </div>
              </div>
            </div>
            {/* Timer warning text */}
            {timeLeft <= 5 && !showResult && (
              <div className="text-center">
                <div className="text-red-600 font-bold text-sm animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
                  💣 BOMB ALERT: {timeLeft} seconds left! 💣
                </div>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${getProgress()}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 mb-4 sm:mb-6 border-2 border-gray-100">
          {/* Word being tested */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
              <div className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentWord.english}
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-blue-600" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                {currentWord.root}
              </div>
            </div>
          </div>

          {/* Form being asked */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block bg-blue-500 text-white rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg max-w-full">
              <div className="text-lg sm:text-xl font-bold mb-1" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                {currentFormKey}
              </div>
              <div className="text-xs sm:text-sm opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
                {formLabels[currentFormKey as keyof typeof formLabels]}
              </div>
            </div>
          </div>

          {/* Answer choices */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {choices.map((choice, index) => {
              let buttonClass = "w-full p-4 sm:p-5 text-lg sm:text-xl font-bold rounded-2xl border-2 transition-all duration-200 ";
              
              if (showResult) {
                if (choice === correctAnswer) {
                  buttonClass += "bg-green-100 border-green-500 text-green-800";
                } else if (choice === selectedAnswer && choice !== correctAnswer) {
                  buttonClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass += "bg-gray-50 border-gray-300 text-gray-500";
                }
              } else {
                // Add urgency styling when time is low
                if (timeLeft <= 5) {
                  buttonClass += "bg-white border-red-300 text-gray-800 hover:bg-red-50 hover:border-red-400 cursor-pointer shadow-sm hover:shadow-md";
                } else {
                  buttonClass += "bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showResult}
                  className={buttonClass}
                  dir="rtl"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Result message */}
          {showResult && (
            <div className="mt-6 sm:mt-8 text-center">
              <div className={`text-xl sm:text-2xl font-bold mb-4 ${selectedAnswer === correctAnswer ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedAnswer === correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              {selectedAnswer !== correctAnswer && (
                <div className="bg-green-50 rounded-2xl p-4 mb-4 sm:mb-6 border border-green-200">
                  <div className="text-gray-600 mb-2 text-sm sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Correct answer:
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-700" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                    {correctAnswer}
                  </div>
                </div>
              )}
              <div className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedAnswer === correctAnswer ? 'Moving to next question...' : 'Study the correct answer...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}