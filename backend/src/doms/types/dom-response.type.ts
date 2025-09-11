import { doms } from '@prisma/client';

export interface DomResponse extends doms {
  Users?: {
    id: number;
    name: string;
    email: string;
  }[];
  experiences?: {
    id: number;
    machineId: number;
    gameId: number;
  }[];
  machines?: {
    id: number;
    name: string;
    machineTypeId: number | null;
  }[];
  _count?: {
    Users: number;
    experiences: number;
    machines: number;
    tickets: number;
  };
}
