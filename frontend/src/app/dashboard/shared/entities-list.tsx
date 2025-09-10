'use client';
import EntityIcon from '../../icons/entity';
import { useState } from 'react';

interface Entity {
  id: string;
  name: string;
  status: string;
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

export default function EntitiesList({ entities }: { entities: Entity[] }) {
  const [search, setSearch] = useState('');

  const getEntityStatus = (status: string) => {
    if (status === 'active') {
      return 'text-customTeal-500';
    } else {
      return 'text-rose-500';
    }
  };

  const groupEntities = (entities: Entity[]) => {
    const grouped = entities.reduce(
      (acc: { [key: string]: Entity[] }, entity) => {
        const firstLetter = entity.name[0].toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(entity);
        return acc;
      },
      {}
    );

    // Sort entities within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  const filteredEntities = entities.filter((entity) =>
    entity.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedEntities = groupEntities(filteredEntities);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex w-fit items-end justify-start gap-x-1 rounded-full border border-border bg-neutral-50 px-3 py-0 text-xs font-medium dark:bg-neutral-950">
            <EntityIcon size={'14'} />
            {entities.length}
          </span>
        </TooltipTrigger>
        {entities.length > 0 && (
          <TooltipContent className="w-64 !bg-background py-2 shadow-md">
            <div className="space-y-2">
              <div className="text-[13px] font-medium text-neutral-800 dark:text-neutral-100">
                {entities.length}
                Entities
              </div>
              <Input
                type="text"
                placeholder="Search entities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <hr className="mt-4 border-neutral-200" />
              <div className="max-h-[200px] overflow-y-auto pr-2">
                {Object.keys(groupedEntities)
                  .sort()
                  .map((letter) => (
                    <div key={letter}>
                      <div className="mb-1 mt-2 text-xs font-semibold capitalize text-neutral-800">
                        start with : {letter}
                      </div>
                      {groupedEntities[letter].map((entity) => (
                        <div
                          key={entity.id}
                          className="flex items-center gap-2 py-1 pl-2 text-xs text-neutral-600 dark:text-neutral-100"
                        >
                          <svg
                            width="8"
                            height="8"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`shrink-0 ${getEntityStatus(entity.status)}`}
                            aria-hidden="true"
                          >
                            <circle cx="4" cy="4" r="4"></circle>
                          </svg>
                          {entity.name}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
