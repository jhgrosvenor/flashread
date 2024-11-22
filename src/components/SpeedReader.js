import React from 'react';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  Moon, 
  Sun, 
  Trash2 
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';

const CustomCard = ({ children, className = "" }) => (
  <div className={`rounded-lg shadow-lg transition-colors duration-200 ${className}`}>
    <div className="p-3 sm:p-6">
      {children}
    </div>
  </div>
);

const SpeedReader = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [inputText, setInputText] = useState('Welcome to the Speed Reader demo! This is a sample text to help you get started. Try pasting your own text here, or continue reading this demo. You can adjust the reading speed by scrolling up/down or dragging on mobile. Double-click the sides to jump forward or backward.');
  const [isTouching, setIsTouching] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const displayRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastSpeedChangeRef = useRef(0);

  useEffect(() => {
    document.body.className = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  }, [isDarkMode]);

  useEffect(() => {
    if (!inputText.trim()) {
      setWords([]);
      setCurrentWordIndex(0);
      setIsPlaying(false);
      return;
    }

    const wordArray = inputText
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.replace(/[.,!?;:]$/, '')); 
    
    setWords(wordArray);
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setShowHint(true);
  }, [inputText]);

  const jumpWords = (direction) => {
    setCurrentWordIndex((prev) => {
      const jumpAmount = 5;
      const newIndex = prev + (direction * jumpAmount);
      if (newIndex < 0) return 0;
      if (newIndex >= words.length) return words.length - 1;
      return newIndex;
    });
  };

  const handleJumpClick = (direction, e) => {
    e.preventDefault();
    if (!words.length) return;
    jumpWords(direction);
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setSpeed(prevSpeed => {
      const delta = e.deltaY < 0 ? 10 : -10;
      const newSpeed = Math.min(Math.max(100, prevSpeed + delta), 800);
      return newSpeed;
    });
  }, []);

  useEffect(() => {
    const element = displayRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleTouchStart = (e) => {
    setIsTouching(true);
    setShowHint(false);
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    e.preventDefault();
    
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartRef.current - currentY;
    const now = Date.now();
    
    if (now - lastSpeedChangeRef.current > 50) {
      const delta = deltaY > 0 ? 1 : -1;
      setSpeed(prevSpeed => {
        const step = 10;
        const newSpeed = prevSpeed + (delta * step);
        return Math.min(Math.max(100, newSpeed), 800);
      });
      touchStartRef.current = currentY;
      lastSpeedChangeRef.current = now;
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    touchStartRef.current = null;
  };

  const getCurrentWord = () => {
    if (words.length === 0) return null;
    const word = words[currentWordIndex];
    const pivotIndex = Math.ceil(word.length / 2) - 1;
    const beforePivot = word.slice(0, pivotIndex);
    const pivotLetter = word[pivotIndex];
    const afterPivot = word.slice(pivotIndex + 1);
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-0 right-0 flex justify-center items-center text-2xl sm:text-4xl font-mono tracking-normal">
          <div className="text-right" style={{ width: '6ch', textOverflow: 'clip', overflow: 'hidden' }}>
            <span className={isDarkMode ? 'text-white' : 'text-black'}>
              {beforePivot}
            </span>
          </div>
          <div className="text-orange-600 font-bold w-[1ch] text-center">
            {pivotLetter}
          </div>
          <div className="text-left" style={{ width: '6ch', textOverflow: 'clip', overflow: 'hidden' }}>
            <span className={isDarkMode ? 'text-white' : 'text-black'}>
              {afterPivot}
            </span>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let interval;
    if (isPlaying && words.length > 0) {
      interval = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, (60 * 1000) / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, words.length]);

  const togglePlayPause = () => {
    if (words.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
  };

  const handleClearText = () => {
    setInputText('');
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <CustomCard className={`w-full max-w-xl mx-auto transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'
      }`}>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex justify-end mb-2 space-x-2">
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              } disabled:opacity-50`}
              onClick={handleClearText}
              disabled={!inputText}
            >
              <Trash2 className="h-5 w-5" />
            </button>

            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className={`w-full h-24 sm:h-32 p-2 border rounded-md text-base transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="relative">
            {words.length > 0 && (
              <>
                <div 
                  className="absolute left-0 inset-y-0 w-1/4 z-10 cursor-pointer opacity-0 hover:opacity-20 transition-opacity"
                  onDoubleClick={(e) => handleJumpClick(-1, e)}
                >
                  <div className={`h-full ${isDarkMode ? 'bg-blue-300' : 'bg-blue-500'}`} />
                </div>
                <div 
                  className="absolute right-0 inset-y-0 w-1/4 z-10 cursor-pointer opacity-0 hover:opacity-20 transition-opacity"
                  onDoubleClick={(e) => handleJumpClick(1, e)}
                >
                  <div className={`h-full ${isDarkMode ? 'bg-blue-300' : 'bg-blue-500'}`} />
                </div>
              </>
            )}

            <div 
              ref={displayRef}
              className={`h-36 sm:h-44 w-full overflow-hidden touch-none select-none cursor-ns-resize transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              } ${words.length > 0 && isDarkMode ? 'active:bg-gray-700' : ''} rounded-lg`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {words.length > 0 ? (
                getCurrentWord()
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-center">
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Paste or type text above to begin
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex justify-center space-x-4 w-full sm:w-auto">
              <button
                onClick={togglePlayPause}
                disabled={!words.length}
                className={`w-20 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'border border-gray-200 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              
              <button
                onClick={reset}
                disabled={!words.length}
                className={`w-20 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'border border-gray-200 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className={`text-sm font-medium text-center ${isDarkMode ? 'text-white' : ''}`}>
              {speed} WPM
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Scroll or drag up/down to adjust speed
              </div>
            </div>
          </div>

          {words.length > 0 && (
            <div className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Word {currentWordIndex + 1} of {words.length}
            </div>
          )}
        </div>
      </CustomCard>
    </div>
  );
};

export default SpeedReader;