import { useState, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';

interface SynthesisHistoryItem {
  id: string;
  title: string;
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

export function useSynthesisHistory() {
  const [history, setHistory] = useState<SynthesisHistoryItem[]>([]);

  const reloadHistory = () => {
    const storedHistory = localStorage.getItem('synthesisHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  const addToHistory = (title: string, nodes: Node[], edges: Edge[]) => {
    const newItem: SynthesisHistoryItem = {
      id: crypto.randomUUID(),
      title,
      nodes,
      edges,
      timestamp: Date.now(),
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('synthesisHistory', JSON.stringify(updatedHistory));
  };

  const updateHistoryItem = (id: string, nodes: Node[], edges: Edge[]) => {
    const updatedHistory = history.map(item => {
      if (item.id === id) {
        return { ...item, nodes, edges };
      }
      return item;
    });
    setHistory(updatedHistory);
    localStorage.setItem('synthesisHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('synthesisHistory');
  };

  return {
    history,
    addToHistory,
    updateHistoryItem,
    clearHistory,
    reloadHistory,
  };
} 