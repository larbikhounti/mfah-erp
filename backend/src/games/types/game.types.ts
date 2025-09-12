export interface GameType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface MachineType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Game {
  id: number;
  name: string;
  price: number;
  playTime: number;
  gameTypeId?: number | null;
  machineTypeId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  gameType?: GameType | null;
  machineType?: MachineType | null;
  _count?: {
    experiences?: number;
  };
  age?: number | null;
}

export interface GameWithRelations extends Game {
  gameType?: GameType | null;
  machineType?: MachineType | null;
}

export interface GameResponse {
  id: number;
  name: string;
  price: number;
  playTime: number;
  gameTypeId?: number | null;
  machineTypeId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  gameType?: {
    id: number;
    name: string;
  } | null;
  machineType?: {
    id: number;
    name: string;
  } | null;
  experiencesCount?: number;
  age?: number | null;
}

export interface PaginatedGamesResponse {
  games: GameResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
