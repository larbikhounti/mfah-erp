'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiselect';
import SpinnerLoaderIcon from '../../../../../../../components/icons/helpers/spiner-loader';
import axios from 'axios';
import PageFilter from './page';
import LimitSelector from './limit-selector';

interface Entity {
  id: string;
  name: string;
}

interface SelectEntityProps {
  onEntitySelect: (entities: Entity[]) => void;
  selectedEntities?: Entity[];
  accountId: string;
  accountStatus: string | null;
}

const SelectedEntity = ({
  onEntitySelect,
  selectedEntities = [],
  accountId,
  accountStatus,
}: SelectEntityProps) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalSearch, setIsLocalSearch] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const fetchEntity = async (searchTerm = '') => {
    try {
      setIsLoading(true);
      if (accountStatus === null) return;

      const res = await axios.get(
        `http://192.168.100.5:8080/api/v1/accounts/GetAccountsByLinkStatus`,
        {
          params: {
            accountId,
            status: accountStatus === 'link' ? 'unlink' : 'link',
            limit,
            page,
            filter: searchTerm,
          },
        }
      );
      setEntities(res.data.data);
      setTotalResults(res.data.total);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountStatus !== null) {
      fetchEntity(debouncedSearchQuery);
    }
  }, [accountStatus, page, limit, debouncedSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLocalSearch) {
        setDebouncedSearchQuery(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, isLocalSearch]);

  const performLocalSearch = useCallback(
    (searchValue: string, data: Entity[]) => {
      if (!searchValue.trim()) return data;
      const searchLower = searchValue.toLowerCase();
      return data.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    },
    []
  );

  const entityOptions: Option[] = useMemo(
    () =>
      entities?.map((entity) => ({
        value: entity.id,
        label: entity.name,
        disabled: false,
      })) || [],
    [entities]
  );

  const selectedOptions: Option[] = useMemo(
    () =>
      selectedEntities?.map((entity) => ({
        value: entity.id,
        label: entity.name,
        disabled: false,
      })) || [],
    [selectedEntities]
  );

  const handleSearch = useCallback(
    async (query: string): Promise<Option[]> => {
      setSearchQuery(query);
      setPage(1);

      if (!query.trim()) {
        setIsLocalSearch(true);
        return entityOptions;
      }

      const localResults = performLocalSearch(query, entities);
      if (localResults.length === 0) {
        setIsLocalSearch(false);
        // Return empty array but don't disable the select
        return [];
      } else {
        setIsLocalSearch(true);
        return localResults.map((entity) => ({
          value: entity.id,
          label: entity.name,
          disabled: false,
        }));
      }
    },
    [entityOptions, entities]
  );

  const handleSelectionChange = useCallback(
    (selectedOptions: Option[]) => {
      const selectedEntities = selectedOptions.map((option) => ({
        id: option.value,
        name: option.label,
      }));
      onEntitySelect(selectedEntities);
    },
    [onEntitySelect]
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full">
        <MultipleSelector
          key={entities.length}
          value={selectedOptions}
          defaultOptions={entityOptions}
          options={entityOptions}
          onChange={handleSelectionChange}
          onSearch={handleSearch}
          placeholder={isLoading ? 'Loading accounts...' : 'Select accounts'}
          hideClearAllButton={false}
          hidePlaceholderWhenSelected
          disabled={isLoading} // Only disable during loading
          commandProps={{
            label: 'Select accounts',
            filter: (value, search) => {
              if (!search) return 1;
              return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            },
          }}
          emptyIndicator={
            isLoading ? (
              <p className="text-center text-sm">Loading accounts...</p>
            ) : (
              <p className="text-center text-sm">No matches found</p>
            )
          }
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-white">
            <SpinnerLoaderIcon size={18} className="text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <LimitSelector
          currentLimit={limit}
          availableLimits={[10, 20, 50, 100]}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
        <PageFilter
          currentPage={page}
          onPageChange={setPage}
          limit={limit}
          total={totalResults}
        />
      </div>
    </div>
  );
};

export default SelectedEntity;
