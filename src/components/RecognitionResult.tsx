import { SongRecognitionResult } from '../services/geminiService';
import { motion } from 'motion/react';
import { Music, Mic2, Star, Info, CheckCircle2, History } from 'lucide-react';

interface RecognitionResultProps {
  result: SongRecognitionResult;
}

export const RecognitionResult = ({ result }: RecognitionResultProps) => {
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { label: '매우 높음', color: 'text-green-600 bg-green-50' };
    if (score >= 0.5) return { label: '보통', color: 'text-blue-600 bg-blue-50' };
    return { label: '낮음', color: 'text-orange-600 bg-orange-50' };
  };

  const confidence = getConfidenceLevel(result.matchConfidence);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 space-y-8 max-w-xl w-full"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${confidence.color}`}>
              {result.searchMethod} 기반
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${confidence.color}`}>
              일치도: {Math.round(result.matchConfidence * 100)}%
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold leading-tight">{result.songTitle}</h1>
          <p className="text-xl text-gray-600 font-medium">{result.artist}</p>
        </div>
        <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shrink-0">
          <Music className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
            <Mic2 className="w-3 h-3" />
            가사 명확도
          </div>
          <div className="text-2xl font-display font-bold">
            {Math.round(result.lyricClarity * 100)}%
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            신뢰 레벨
          </div>
          <div className="text-lg font-display font-bold">
            {confidence.label}
          </div>
        </div>
      </div>

      {result.recognizedLyrics && (
        <div className="space-y-2 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3 h-3 text-orange-400" />
            인식된 가사
          </div>
          <p className="text-lg italic text-[#1A1A1A] leading-relaxed">
            "{result.recognizedLyrics}"
          </p>
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-start gap-3 text-sm text-gray-500 leading-relaxed">
          <Info className="w-4 h-4 mt-1 shrink-0 text-blue-500" />
          <p>{result.explanation}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase">
          <History className="w-3 h-3" />
          데이터 처리 완료
        </div>
      </div>
    </motion.div>
  );
};
