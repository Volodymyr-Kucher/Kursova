import React from 'react';
import './ui.css';
import { Skeleton } from './Skeleton';
import { Button } from './Button';

export const DataTable = ({
  columns = [],
  data = [],
  selectedId = null,
  onRowClick = null,
  loading = false,
  pageInfo = null, // e.g. { showing: 5, total: 24, onPrev, onNext, hasPrev, hasNext }
  className = '',
  ...props
}) => {
  return (
    <div className={`argus-table-container ${className}`.trim()} {...props}>
      <table className="argus-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || 'left' }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr key={`loading-${rIdx}`}>
                {columns.map((col, cIdx) => (
                  <td key={`loading-cell-${cIdx}`}>
                    <Skeleton width={cIdx === 0 ? '70%' : '50%'} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}
              >
                Немає записів для відображення
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const isSelected = selectedId != null && row.id === selectedId;
              return (
                <tr
                  key={row.id}
                  className={isSelected ? 'is-selected' : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {pageInfo && (
        <div className="argus-table-footer">
          <span>
            Показано {pageInfo.showing} з {pageInfo.total}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-02)' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pageInfo.hasPrev}
              onClick={pageInfo.onPrev}
              aria-label="Попередня сторінка"
            >
              ←
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pageInfo.hasNext}
              onClick={pageInfo.onNext}
              aria-label="Наступна сторінка"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

