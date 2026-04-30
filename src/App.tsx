import { useState } from 'react';
import { AudioRecorder } from './components/AudioRecorder';
import { RecognitionResult } from './components/RecognitionResult';
import { recognizeSong, SongRecognitionResult } from './services/geminiService';
import { Music, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SongRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(',')[1];
        
        try {
          const recognitionResult = await recognizeSong(base64Content, blob.type);
          setResult(recognitionResult);
        } catch (err: any) {
          setError(err.message || '분석 중 오류가 발생했습니다.');
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setError('오디오 데이터를 처리할 수 없습니다.');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 selection:bg-black selection:text-white">
      <header className="text-center mb-16 space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-2"
        >
          <Music className="text-white w-6 h-6" />
        </motion.div>
        <h1 className="text-5xl font-display font-bold tracking-tight">HumMatch</h1>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          목소리나 허밍으로 노래를 찾아보세요. <br />
          AI가 가사와 멜로디를 정밀하게 분석합니다.
        </p>
      </header>

      <main className="w-full flex flex-col items-center justify-center flex-1">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="glass-card shadow-2xl overflow-hidden">
                <AudioRecorder 
                  onRecordingComplete={handleRecordingComplete} 
                  isProcessing={isProcessing} 
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="mt-6 text-red-500 text-sm text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center space-y-8"
            >
              <RecognitionResult result={result} />
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-widest active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                다시 시도하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-gray-200"></div>
          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
            Powered by Gemini 3 Flash
          </p>
          <div className="h-px w-8 bg-gray-200"></div>
        </div>
      </footer>
    </div>
  );
}
