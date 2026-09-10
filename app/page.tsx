"use client";

import { Header } from '../components/Header';
import { Board } from '../components/Board';
import { useMinesweeperStore } from '../store/useMinesweeperStore';
import { Difficulty } from '../types/minesweeper';

export default function MinesweeperPage() {
  const { difficulty, setDifficulty } = useMinesweeperStore();

  return (
    <main className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-300 p-2 rounded-lg shadow-2xl border-4 border-gray-400 max-w-full">
        {/* controles de dificuldade */}
        <div className="flex justify-center gap-2 mb-2 p-2 bg-gray-200 rounded">
          {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1 text-xs md:text-sm font-semibold rounded capitalize transition-colors ${
                difficulty === level
                  ? 'bg-green-800 text-white'
                  : 'bg-gray-300 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Especialista'}
            </button>
          ))}
        </div>

        <Header />
        <Board />
      </div>

      <footer>
        <p className="text-white text-lg mt-15">Campo Minado Sinistro | Desenvolvido por <a href="https://ryan-alecrim-portfolio.vercel.app/" target='_blank' className='underline hover:text-amber-100 font-mono'>Ryan Alecrim Sodré</a> | {new Date().getFullYear()} </p>
      </footer>
    </main>
  );
}