import React from 'react';
import { Search, Filter, Plus, Download } from 'lucide-react';

interface ContactsHeaderProps {
  viewMode: 'people' | 'companies';
  search: string;
  setSearch: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK';
  setStatusFilter: (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK') => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  openCreateModal: () => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  viewMode,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  isFilterOpen,
  setIsFilterOpen,
  openCreateModal,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Title row */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
          {viewMode === 'people' ? 'Contatos (Pessoas)' : 'Empresas (Contas)'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {viewMode === 'people'
            ? 'Pessoas com quem você negocia.'
            : 'Organizações onde seus contatos trabalham.'}
        </p>
      </div>

      {/* Actions row — wraps on small screens so buttons are always reachable */}
      <div className="flex flex-wrap gap-2 items-center w-full">
        {/* Search — takes remaining space, min width so it doesn't collapse */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              viewMode === 'people' ? 'Buscar nomes, emails...' : 'Buscar empresas, setor...'
            }
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm"
          />
        </div>

        {/* Status filter — hidden on very small screens, shown from sm */}
        {viewMode === 'people' && (
          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'RISK')
            }
            className="hidden sm:block pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white backdrop-blur-sm appearance-none cursor-pointer"
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
            <option value="CHURNED">Perdidos</option>
            <option value="RISK">Em Risco</option>
          </select>
        )}

        {/* Filter toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-2 border rounded-lg transition-colors shrink-0 ${isFilterOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
          title="Filtros avançados"
        >
          <Filter size={18} />
        </button>

        {/* Export — icon-only on mobile */}
        <button
          className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors shrink-0"
          title="Exportar"
        >
          <Download size={18} />
        </button>

        {/* PRIMARY CTA — always visible, never truncated */}
        <button
          id="btn-novo-contato"
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 shrink-0 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Novo Contato</span>
        </button>
      </div>
    </div>
  );
};
