import { Company } from '../types';
import { INITIAL_COMPANIES } from '../services/mockData';
import { usePersistedState } from './usePersistedState';

export const useCompaniesLogic = () => {
    const [companies, setCompanies] = usePersistedState<Company[]>('companies', []);

    const addCompany = (company: Company) => {
        setCompanies(prev => [...prev, company]);
    };

    return {
        companies,
        addCompany,
        setCompanies
    };
};
