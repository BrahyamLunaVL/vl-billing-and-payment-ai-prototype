import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { Select } from '../Select';
import './table.css';

export interface TableColumn<T> {
  key: string;
  label: string;
  /** Pixel width — Figma's columns are fixed-width, not flexible. */
  width: number;
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

export type SortDirection = 'asc' | 'desc';

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Renders a leading checkbox column and enables select-all, when provided together with `onToggleRow`/`onToggleAll`. */
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  /** 1-based current page. */
  page: number;
  pageSize: number;
  /** Total row count across all pages (not just `rows.length`). */
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * A sortable, paginated, optionally multi-selectable data table (Figma's
 * "Table" — e.g. the client's Changes & Approvals list). Generic over the
 * row type: callers describe columns as `{ key, label, width, render }`
 * rather than this component knowing anything about a specific entity.
 */
export function Table<T>({
  columns,
  rows,
  getRowId,
  selectedIds,
  onToggleRow,
  onToggleAll,
  sortKey,
  sortDirection = 'asc',
  onSort,
  page,
  pageSize,
  totalRows,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  className,
}: TableProps<T>) {
  const selectable = Boolean(selectedIds && onToggleRow && onToggleAll);
  const allSelected = selectable && rows.length > 0 && rows.every((row) => selectedIds!.has(getRowId(row)));
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const firstRowIndex = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRowIndex = Math.min(totalRows, page * pageSize);

  const classNames = ['table', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="table__scroll">
        <div className="table__row table__row--header">
          {selectable && (
            <div className="table__cell table__cell--checkbox" style={{ width: 60 }}>
              <input
                type="checkbox"
                className="table__checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all rows"
              />
            </div>
          )}
          {columns.map((column) => (
            <button
              key={column.key}
              type="button"
              className="table__cell table__cell--header"
              style={{ width: column.width }}
              onClick={column.sortable ? () => onSort?.(column.key) : undefined}
              disabled={!column.sortable}
            >
              <span>{column.label}</span>
              {column.sortable && (
                <Icon
                  name="arrow-down"
                  variant="bold"
                  size={16}
                  className={
                    sortKey === column.key && sortDirection === 'desc'
                      ? 'table__sort-icon table__sort-icon--desc'
                      : 'table__sort-icon'
                  }
                />
              )}
            </button>
          ))}
        </div>

        {rows.map((row) => {
          const id = getRowId(row);
          return (
            <div key={id} className="table__row">
              {selectable && (
                <div className="table__cell table__cell--checkbox" style={{ width: 60 }}>
                  <input
                    type="checkbox"
                    className="table__checkbox"
                    checked={selectedIds!.has(id)}
                    onChange={() => onToggleRow!(id)}
                    aria-label={`Select row ${id}`}
                  />
                </div>
              )}
              {columns.map((column) => (
                <div key={column.key} className="table__cell" style={{ width: column.width }}>
                  {column.render(row)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="table__pagination">
        <div className="table__pagination-left">
          <span>
            {firstRowIndex}-{lastRowIndex} of {totalRows}
          </span>
          <span className="table__pagination-divider" />
          <span className="table__pagination-label">Rows per page</span>
          <Select
            className="table__page-size-select"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
          />
        </div>
        <div className="table__pagination-right">
          <button
            type="button"
            className="table__page-nav"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <Icon name="chevrons-left" variant="bold" size={20} />
          </button>
          <button
            type="button"
            className="table__page-nav"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <Icon name="chevron-left" variant="bold" size={20} />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="table__page-nav"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <Icon name="chevron-right" variant="bold" size={20} />
          </button>
          <button
            type="button"
            className="table__page-nav"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            <Icon name="chevrons-right" variant="bold" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
