'use client';

import { useState, useEffect } from 'react';

// Add Google Fonts for better Arabic typography
const fontLink = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

// Word data based on the screenshots and additional vocabulary
const wordsData = [
  {
    english: "to reveal, to send down",
    root: "نزل",
    forms: {
      "الماضي المعلوم": "نَزَّلَ",
      "المضارع المعلوم": "يُنَزِّلُ", 
      "الماضي المجهول": "نُزِّلَ",
      "المضارع المجهول": "يُنَزَّلُ",
      "المصدر": "تَنْزِيلاً",
      "الأمر": "نَزِّلْ",
      "النهي": "لا تُنَزِّلْ",
      "اسم الفاعل": "مُنَزِّلٌ",
      "اسم المفعول": "مُنَزَّلٌ"
    }
  },
  {
    english: "to punish",
    root: "عذب",
    forms: {
      "الماضي المعلوم": "عَذَّبَ",
      "المضارع المعلوم": "يُعَذِّبُ", 
      "الماضي المجهول": "عُذِّبَ",
      "المضارع المجهول": "يُعَذَّبُ",
      "المصدر": "تَعْذِيباً",
      "الأمر": "عَذِّبْ",
      "النهي": "لا تُعَذِّبْ",
      "اسم الفاعل": "مُعَذِّبٌ",
      "اسم المفعول": "مُعَذَّبٌ"
    }
  },
  {
    english: "to put forth",
    root: "قدم", 
    forms: {
      "الماضي المعلوم": "قَدَّمَ",
      "المضارع المعلوم": "يُقَدِّمُ",
      "الماضي المجهول": "قُدِّمَ", 
      "المضارع المجهول": "يُقَدَّمُ",
      "المصدر": "تَقْدِيماً",
      "الأمر": "قَدِّمْ",
      "النهي": "لا تُقَدِّمْ",
      "اسم الفاعل": "مُقَدِّمٌ",
      "اسم المفعول": "مُقَدَّمٌ"
    }
  },
  {
    english: "to believe",
    root: "صدق",
    forms: {
      "الماضي المعلوم": "صَدَّقَ",
      "المضارع المعلوم": "يُصَدِّقُ",
      "الماضي المجهول": "صُدِّقَ",
      "المضارع المجهول": "يُصَدَّقُ",
      "المصدر": "تَصْدِيقاً",
      "الأمر": "صَدِّقْ",
      "النهي": "لا تُصَدِّقْ",
      "اسم الفاعل": "مُصَدِّقٌ",
      "اسم المفعول": "مُصَدَّقٌ"
    }
  },
  {
    english: "to teach",
    root: "علم",
    forms: {
      "الماضي المعلوم": "عَلَّمَ",
      "المضارع المعلوم": "يُعَلِّمُ",
      "الماضي المجهول": "عُلِّمَ",
      "المضارع المجهول": "يُعَلَّمُ",
      "المصدر": "تَعْلِيماً",
      "الأمر": "عَلِّمْ",
      "النهي": "لا تُعَلِّمْ",
      "اسم الفاعل": "مُعَلِّمٌ",
      "اسم المفعول": "مُعَلَّمٌ"
    }
  },
  {
    english: "to reject",
    root: "كذب",
    forms: {
      "الماضي المعلوم": "كَذَّبَ",
      "المضارع المعلوم": "يُكَذِّبُ",
      "الماضي المجهول": "كُذِّبَ",
      "المضارع المجهول": "يُكَذَّبُ",
      "المصدر": "تَكْذِيباً",
      "الأمر": "كَذِّبْ",
      "النهي": "لا تُكَذِّبْ",
      "اسم الفاعل": "مُكَذِّبٌ",
      "اسم المفعول": "مُكَذَّبٌ"
    }
  },
  {
    english: "to remind",
    root: "ذكر",
    forms: {
      "الماضي المعلوم": "ذَكَّرَ",
      "المضارع المعلوم": "يُذَكِّرُ",
      "الماضي المجهول": "ذُكِّرَ",
      "المضارع المجهول": "يُذَكَّرُ",
      "المصدر": "تَذْكِيراً",
      "الأمر": "ذَكِّرْ",
      "النهي": "لا تُذَكِّرْ",
      "اسم الفاعل": "مُذَكِّرٌ",
      "اسم المفعول": "مُذَكَّرٌ"
    }
  },
  {
    english: "to think",
    root: "فكر",
    forms: {
      "الماضي المعلوم": "فَكَّرَ",
      "المضارع المعلوم": "يُفَكِّرُ",
      "الماضي المجهول": "فُكِّرَ",
      "المضارع المجهول": "يُفَكَّرُ",
      "المصدر": "تَفْكِيراً",
      "الأمر": "فَكِّرْ",
      "النهي": "لا تُفَكِّرْ",
      "اسم الفاعل": "مُفَكِّرٌ",
      "اسم المفعول": "مُفَكَّرٌ"
    }
  },
  {
    english: "to clean",
    root: "نظف",
    forms: {
      "الماضي المعلوم": "نَظَّفَ",
      "المضارع المعلوم": "يُنَظِّفُ",
      "الماضي المجهول": "نُظِّفَ",
      "المضارع المجهول": "يُنَظَّفُ",
      "المصدر": "تَنْظِيفاً",
      "الأمر": "نَظِّفْ",
      "النهي": "لا تُنَظِّفْ",
      "اسم الفاعل": "مُنَظِّفٌ",
      "اسم المفعول": "مُنَظَّفٌ"
    }
  },
  {
    english: "to smoke",
    root: "دخن",
    forms: {
      "الماضي المعلوم": "دَخَّنَ",
      "المضارع المعلوم": "يُدَخِّنُ",
      "الماضي المجهول": "دُخِّنَ",
      "المضارع المجهول": "يُدَخَّنُ",
      "المصدر": "تَدْخِيناً",
      "الأمر": "دَخِّنْ",
      "النهي": "لا تُدَخِّنْ",
      "اسم الفاعل": "مُدَخِّنٌ",
      "اسم المفعول": "مُدَخَّنٌ"
    }
  }
];

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

// Generate wrong answers by mixing up the forms
const generateWrongAnswers = (correctAnswer: string, currentWord: any, currentForm: string) => {
  const wrongAnswers = [];
  const allForms = Object.values(currentWord.forms) as string[];
  
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
        const otherWordForm = word.forms[currentForm as keyof typeof word.forms];
        if (otherWordForm && !wrongAnswers.includes(otherWordForm) && wrongAnswers.length < 3) {
          wrongAnswers.push(otherWordForm);
        }
      }
    }
  }
  
  return wrongAnswers.slice(0, 3);
};

export default function ArabicSarfGame() {
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
  const [gameMode, setGameMode] = useState<'sequential' | 'word-random' | 'fully-random'>('sequential');
  const [questionQueue, setQuestionQueue] = useState<{wordIndex: number, formIndex: number}[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [wordOrder, setWordOrder] = useState<number[]>([]);

  // Initialize question queue based on game mode
  const generateQuestionQueue = () => {
    const queue = [];
    
    if (gameMode === 'sequential') {
      // Sequential: words in order, forms in order
      for (let wordIndex = 0; wordIndex < wordsData.length; wordIndex++) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        for (let formIndex = 0; formIndex < formKeys.length; formIndex++) {
          queue.push({ wordIndex, formIndex });
        }
      }
    } else if (gameMode === 'word-random') {
      // Word-random: words in random order, but all forms for each word together
      const shuffledWordIndices = Array.from({ length: wordsData.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      
      for (const wordIndex of shuffledWordIndices) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        // Shuffle forms within each word
        const shuffledFormIndices = Array.from({ length: formKeys.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5);
        
        for (const formIndex of shuffledFormIndices) {
          queue.push({ wordIndex, formIndex });
        }
      }
    } else if (gameMode === 'fully-random') {
      // Fully random: everything shuffled together
      for (let wordIndex = 0; wordIndex < wordsData.length; wordIndex++) {
        const formKeys = Object.keys(wordsData[wordIndex].forms);
        for (let formIndex = 0; formIndex < formKeys.length; formIndex++) {
          queue.push({ wordIndex, formIndex });
        }
      }
      queue.sort(() => Math.random() - 0.5);
    }
    
    return queue;
  };

  // Get current question based on mode
  const getCurrentQuestion = () => {
    if (gameMode !== 'sequential' && questionQueue.length > 0) {
      const current = questionQueue[currentQueueIndex];
      return {
        wordIndex: current.wordIndex,
        formIndex: current.formIndex,
        word: wordsData[current.wordIndex],
        formKey: Object.keys(wordsData[current.wordIndex].forms)[current.formIndex]
      };
    } else {
      return {
        wordIndex: currentWordIndex,
        formIndex: currentFormIndex,
        word: wordsData[currentWordIndex],
        formKey: Object.keys(wordsData[currentWordIndex].forms)[currentFormIndex]
      };
    }
  };

  const currentQuestion = getCurrentQuestion();
  const currentWord = currentQuestion.word;
  const currentFormKey = currentQuestion.formKey;
  const correctAnswer = currentWord.forms[currentFormKey as keyof typeof currentWord.forms];

  // Calculate total forms per word (all words have same structure)
  const formsPerWord = Object.keys(wordsData[0].forms).length;
  const totalQuestionCount = wordsData.length * formsPerWord;

  // Timer effect
  useEffect(() => {
    if (!showResult && !gameComplete && !bombExploded && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        
        // Show warning when time is running low
        if (timeLeft <= 5) {
          setShowBombWarning(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && !bombExploded) {
      // Bomb explodes!
      setBombExploded(true);
    }
  }, [timeLeft, showResult, gameComplete, bombExploded]);

  // Generate choices when question changes
  useEffect(() => {
    if (!gameComplete && !bombExploded) {
      const wrongAnswers = generateWrongAnswers(correctAnswer, currentWord, currentFormKey);
      const allChoices = [correctAnswer, ...wrongAnswers];
      // Shuffle the choices
      const shuffled = allChoices.sort(() => Math.random() - 0.5);
      setChoices(shuffled);
      // Reset timer for new question
      setTimeLeft(15);
      setShowBombWarning(false);
    }
  }, [currentWordIndex, currentFormIndex, currentQueueIndex, gameComplete, bombExploded, gameMode]);

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

  const changeGameMode = (newMode: 'sequential' | 'word-random' | 'fully-random') => {
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

  // Bomb explosion screen
  if (bombExploded) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontLink }} />
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-lg w-full text-center border-2 border-red-200">
          <div className="text-8xl mb-8 animate-pulse">💥</div>
          <h2 className="text-4xl font-bold text-red-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            BOOM! Time's Up!
          </h2>
          <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-200">
            <div className="text-lg text-red-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              The bomb exploded! 💣
            </div>
            <div className="text-gray-600 mb-4">
              You ran out of time and lost all your progress.
            </div>
            <div className="text-sm text-gray-500">
              Previous score: {score}/{totalQuestions}
            </div>
          </div>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-2xl transition-colors duration-300 shadow-lg"
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
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-lg w-full text-center border-2 border-gray-100">
          <div className="text-8xl mb-8">🏆</div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            أحسنت! Well done!
          </h2>
          <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-200">
            <div className="text-xl text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your Score
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-lg text-gray-600">
              {totalQuestions > 0 ? Math.round((score/totalQuestions) * 100) : 0}% Correct
            </div>
          </div>
          <button
            onClick={resetGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-2xl transition-colors duration-300 shadow-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <style dangerouslySetInnerHTML={{ __html: fontLink }} />
      
      <div className="">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Question {totalQuestions + 1}
              </div>
              <div className="text-lg font-bold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-green-600">{score}</span> / {totalQuestions}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Game Mode Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => changeGameMode('sequential')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'sequential'
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  📋 Sequential
                </button>
                <button
                  onClick={() => changeGameMode('word-random')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'word-random'
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  🔀 Word Random
                </button>
                <button
                  onClick={() => changeGameMode('fully-random')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
                    gameMode === 'fully-random'
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  🎲 Fully Random
                </button>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-300">
                <div className="text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Baab II تَفْعِيل
                </div>
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
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border-2 border-gray-100">
          {/* Word being tested */}
          <div className="text-center mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-xl font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentWord.english}
              </div>
              <div className="text-4xl font-bold text-blue-600" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                {currentWord.root}
              </div>
            </div>
          </div>

          {/* Form being asked */}
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-500 text-white rounded-2xl px-6 py-4 shadow-lg">
              <div className="text-xl font-bold mb-1" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                {currentFormKey}
              </div>
              <div className="text-sm opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
                {formLabels[currentFormKey as keyof typeof formLabels]}
              </div>
            </div>
          </div>

          {/* Answer choices */}
          <div className="grid grid-cols-1 gap-4">
            {choices.map((choice, index) => {
              let buttonClass = "w-full p-5 text-xl font-bold rounded-2xl border-2 transition-all duration-200 ";
              
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
            <div className="mt-8 text-center">
              <div className={`text-2xl font-bold mb-4 ${selectedAnswer === correctAnswer ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedAnswer === correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              {selectedAnswer !== correctAnswer && (
                <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
                  <div className="text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Correct answer:
                  </div>
                  <div className="text-2xl font-bold text-green-700" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                    {correctAnswer}
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                {selectedAnswer === correctAnswer ? 'Moving to next question...' : 'Study the correct answer...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}