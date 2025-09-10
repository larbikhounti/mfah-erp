/**
 * Dynamic DataTable System - Export Index
 * 
 * This file provides easy access to all table configurations and the main DataTable component.
 * Use this to quickly import what you need for any table implementation.
 */

// Main DataTable component
export { DataTable } from './data-table'
export type { DataTableProps, TableColumn, FilterOption } from './data-table'

// Table Configurations
export { getUserTableConfig } from './table-configs/user-table-config'
export type { User } from './table-configs/user-table-config'

export { getMachineTypeTableConfig } from './table-configs/machine-type-table-config'
export type { MachineType } from './table-configs/machine-type-table-config'

export { getGameTypeTableConfig } from './table-configs/game-type-table-config'
export type { GameType } from './table-configs/game-type-table-config'

export { getExperienceTableConfig } from './table-configs/experience-table-config'
export type { Experience } from './table-configs/experience-table-config'

export { getGameTableConfig } from './table-configs/game-table-config'
export type { Game } from './table-configs/game-table-config'

export { getMachineTableConfig } from './table-configs/machine-table-config'
export type { Machine } from './table-configs/machine-table-config'

export { getDomTableConfig } from './table-configs/dom-table-config'
export type { Dom } from './table-configs/dom-table-config'

export { getBasicTableConfig } from './table-configs/basic-table-config'
export type { BasicEntity } from './table-configs/basic-table-config'

/**
 * Quick Start Examples:
 * 
 * // Simple table
 * import { DataTable, getBasicTableConfig } from '@/components/shared'
 * const config = getBasicTableConfig(onEdit, onDelete, "Search...")
 * return <DataTable title="Items" data={items} {...config} />
 * 
 * // User table
 * import { DataTable, getUserTableConfig } from '@/components/shared'
 * const config = getUserTableConfig(onEdit, onDelete)
 * return <DataTable title="Users" data={users} {...config} />
 * 
 * // Table with add button
 * import { DataTable, getMachineTypeTableConfig } from '@/components/shared'
 * const config = getMachineTypeTableConfig(onEdit, onDelete)
 * const addButton = <Button onClick={onCreate}>Add</Button>
 * return <DataTable title="Types" data={types} addButton={addButton} {...config} />
 */
