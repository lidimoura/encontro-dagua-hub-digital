import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Bug, Lightbulb, Star, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface CrmFeedback {
  id: string;
  email: string | null;
  category: 'bug' | 'melhoria' | 'elogio';
  message: string;
  company_id: string | null;
  created_at: string;
}

const CATEGORY_CONFIG = {
  bug: { label: 'Bug', icon: Bug, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  melhoria: { label: 'Melhoria', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  elogio: { label: 'Elogio', icon: Star, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
};

export default function FeedbacksTab() {
  const [feedbacks, setFeedbacks] = useState<CrmFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bug' | 'melhoria' | 'elogio'>('all');

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[FeedbacksTab] Erro ao buscar feedbacks:', error.message);
        setFeedbacks([]);
      } else {
        setFeedbacks((data || []) as CrmFeedback[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const filtered = filter === 'all' ? feedbacks : feedbacks.filter(f => f.category === filter);

  const counts = feedbacks.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-500" />
            Feedbacks dos Leads
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} recebido{feedbacks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchFeedbacks}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Category Filter + Counts */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'bug', 'melhoria', 'elogio'] as const).map((cat) => {
          const config = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
          const count = cat === 'all' ? feedbacks.length : (counts[cat] || 0);
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === cat
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
              }`}
            >
              {cat === 'all' ? `Todos (${count})` : `${cat === 'bug' ? '🐛' : cat === 'melhoria' ? '💡' : '⭐'} ${CATEGORY_CONFIG[cat].label} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Nenhum feedback ainda</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Os leads enviarão feedback via o banner do MVP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb) => {
            const catConfig = CATEGORY_CONFIG[fb.category];
            const Icon = catConfig?.icon || MessageSquare;
            return (
              <div
                key={fb.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${catConfig?.color || ''}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {catConfig?.label || fb.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(fb.created_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {fb.message}
                    </p>
                    {fb.email && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        de: {fb.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
