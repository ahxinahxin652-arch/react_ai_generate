import React from 'react';
import { ipc } from '../services/ipcRenderer';
const openDownloadDir = async () => {
  window.parent.postMessage(
    {
      type: 'OPEN_DOWNLOAD_DIR',
      data: { /* 可选参数 */ }
    },
    '*'
  );
}

// Icons
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

interface HeaderProps {
    onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="h-16 w-full fixed top-0 z-50 bg-[#0F1113]/90 backdrop-blur-md border-b border-[#2A2C30] flex items-center px-4 md:px-6 justify-between">
      {/* <div className="flex items-center gap-2">
        <div className="size-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-lg">
          影
        </div>
        <span className="hidden md:block font-bold text-lg tracking-tight">影画 AI 工作室</span>
      </div> */}

      <nav className="hidden md:flex items-center gap-1 bg-[#1B1D20] p-1 rounded-xl border border-[#2A2C30]">
        {/* <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-colors">
          首页
        </button>
        <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[#2A2C30] text-white shadow-sm">
          工作室
        </button>
        <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-colors">
          视频生成
        </button> */}
      </nav>

      <div className="flex items-center gap-3">
      </div>
    </header>
  );
};

export default Header;