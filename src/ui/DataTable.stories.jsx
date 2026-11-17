import React, { useState } from 'react';
import { action } from '@ladle/react';
import { DataTable } from './DataTable';
import { StatusTag } from './StatusTag';
import { Severity } from './Severity';

const columns = [
  {
    key: 'id',
    header: 'ID',
    width: '120px',
    render: (val) => <span className="mono">{val}</span>,
  },
  {
    key: 'name',
    header: 'Об\'єкт / Сектор',
  },
  {
    key: 'status',
    header: 'Статус',
    width: '160px',
    render: (val) => <StatusTag status={val} />,
  },
  {
    key: 'severity',
    header: 'Рівень',
    width: '140px',
    render: (val) => <Severity level={val} />,
  },
  {
    key: 'updated',
    header: 'Оновлено',
    width: '120px',
    render: (val) => <span className="mono">{val}</span>,
  },
];

const sampleData = [
  { id: 'trk-0042', name: 'БпЛА Shahed-136', status: 'unacknowledged', severity: 'high', updated: '14:02:11' },
  { id: 'zon-0003', name: 'Київ Північ (ЗРК)', status: 'acknowledged', severity: 'medium', updated: '13:58:04' },
  { id: 'trk-0089', name: 'Су-34 (ЕПР 2.4м²)', status: 'assigned', severity: 'high', updated: '13:51:22' },
  { id: 'zon-0012', name: 'Одеський маяк', status: 'collecting', severity: 'low', updated: '12:30:15' },
  { id: 'trk-0105', name: 'Мі-8 (Евакуація)', status: 'done', severity: 'low', updated: '11:15:00' },
];

export const Default = () => (
  <DataTable
    columns={columns}
    data={sampleData}
    onRowClick={action('row-clicked')}
    pageInfo={{
      showing: 5,
      total: 24,
      hasPrev: false,
      hasNext: true,
      onPrev: action('prev-page'),
      onNext: action('next-page'),
    }}
  />
);

export const SelectedRow = () => {
  const [selected, setSelected] = useState('trk-0089');
  return (
    <DataTable
      columns={columns}
      data={sampleData}
      selectedId={selected}
      onRowClick={(row) => setSelected(row.id)}
      pageInfo={{
        showing: 5,
        total: 24,
        hasPrev: true,
        hasNext: true,
        onPrev: action('prev-page'),
        onNext: action('next-page'),
      }}
    />
  );
};

export const Loading = () => (
  <DataTable columns={columns} data={[]} loading={true} />
);

export const Empty = () => (
  <DataTable columns={columns} data={[]} loading={false} />
);

