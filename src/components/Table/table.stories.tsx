import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Table, type TableColumn } from './table';
import { Chip } from '../Chip';

interface DemoRow {
  id: string;
  name: string;
  company: string;
  status: 'Approved' | 'Rejected';
}

const ALL_ROWS: DemoRow[] = Array.from({ length: 23 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Person ${index + 1}`,
  company: index % 2 === 0 ? 'Bloominari dba Virtual Latinos' : 'Bay Point Counseling Center',
  status: index % 3 === 0 ? 'Rejected' : 'Approved',
}));

const COLUMNS: TableColumn<DemoRow>[] = [
  { key: 'name', label: 'NAME', width: 250, sortable: true, render: (row) => row.name },
  { key: 'company', label: 'COMPANY', width: 350, sortable: true, render: (row) => row.company },
  {
    key: 'status',
    label: 'STATUS',
    width: 150,
    render: (row) => <Chip label={row.status} tone={row.status === 'Approved' ? 'blue' : 'red'} />,
  },
];

function ControlledTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sorted = [...ALL_ROWS].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = String(a[sortKey as keyof DemoRow]);
    const bValue = String(b[sortKey as keyof DemoRow]);
    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Table
      columns={COLUMNS}
      rows={pageRows}
      getRowId={(row) => row.id}
      selectedIds={selectedIds}
      onToggleRow={(id) =>
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        })
      }
      onToggleAll={() =>
        setSelectedIds((prev) =>
          pageRows.every((row) => prev.has(row.id)) ? new Set() : new Set(pageRows.map((row) => row.id)),
        )
      }
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={(key) => {
        if (key === sortKey) setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        else {
          setSortKey(key);
          setSortDirection('asc');
        }
      }}
      page={page}
      pageSize={pageSize}
      totalRows={ALL_ROWS.length}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
}

// `Table` is generic, and `Meta<typeof Table>` collapses its type parameter
// to `unknown` — losing the per-story arg types entirely. Every story below
// supplies its own explicitly-typed `args`/`render`, so a loosely-typed
// `Meta` (rather than `Meta<typeof Table>`) is used here to sidestep that,
// unlike every other (non-generic) component's story file in this project.
const meta = {
  component: Table,
  tags: ['ai-generated'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Interactive: Story = {
  render: () => <ControlledTable />,
};

export const WithoutSelection: Story = {
  args: {
    columns: COLUMNS,
    rows: ALL_ROWS.slice(0, 10),
    getRowId: (row: DemoRow) => row.id,
    page: 1,
    pageSize: 10,
    totalRows: ALL_ROWS.length,
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
};

const handleSort = fn();

export const SortingAColumnInvokesOnSort: Story = {
  args: {
    columns: COLUMNS,
    rows: ALL_ROWS.slice(0, 10),
    getRowId: (row: DemoRow) => row.id,
    page: 1,
    pageSize: 10,
    totalRows: ALL_ROWS.length,
    onSort: handleSort,
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /name/i }));
    await expect(handleSort).toHaveBeenCalledWith('name');
  },
};

export const SelectingRowsAndSelectAll: Story = {
  render: () => <ControlledTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');
    const [selectAll, ...rowCheckboxes] = checkboxes;

    await userEvent.click(selectAll);
    for (const checkbox of rowCheckboxes) {
      await expect(checkbox).toBeChecked();
    }

    await userEvent.click(selectAll);
    for (const checkbox of rowCheckboxes) {
      await expect(checkbox).not.toBeChecked();
    }
  },
};

export const NavigatingPages: Story = {
  render: () => <ControlledTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Page 1 of 3')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /next page/i }));
    await expect(canvas.getByText('Page 2 of 3')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /last page/i }));
    await expect(canvas.getByText('Page 3 of 3')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /first page/i }));
    await expect(canvas.getByText('Page 1 of 3')).toBeVisible();
  },
};
