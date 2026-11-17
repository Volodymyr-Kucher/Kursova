import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../src/ui/Select.jsx';
import { EmptyState } from '../src/ui/EmptyState.jsx';
import { DataTable } from '../src/ui/DataTable.jsx';
import { ConnectionBadge } from '../src/layout/ConnectionBadge.jsx';
import { Severity } from '../src/ui/Severity.jsx';

const OPTIONS = [
  { value: 'all', label: 'Усі рівні' },
  { value: 'high', label: 'High' },
];

describe('Select', () => {
  it('показує підпис і всі варіанти', () => {
    render(<Select id="sev" label="Важливість" value="all" onChange={() => {}} options={OPTIONS} />);

    expect(screen.getByLabelText('Важливість')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('передає вибране значення назовні', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Select id="sev" label="Важливість" value="all" onChange={handleChange} options={OPTIONS} />);

    await user.selectOptions(screen.getByLabelText('Важливість'), 'high');
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('EmptyState', () => {
  it('показує заголовок, опис і дію', () => {
    render(
      <EmptyState title="Журнал порожній" description="Подій немає" action={<button>Оновити</button>} />
    );

    expect(screen.getByText('Журнал порожній')).toBeInTheDocument();
    expect(screen.getByText('Подій немає')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оновити' })).toBeInTheDocument();
  });
});

describe('ConnectionBadge', () => {
  it('позначає стан потоку текстом, а не лише кольором', () => {
    const { rerender } = render(<ConnectionBadge connection="open" />);
    expect(screen.getByRole('status')).toHaveTextContent('Потік: онлайн');

    rerender(<ConnectionBadge connection="connecting" />);
    expect(screen.getByRole('status')).toHaveTextContent('Потік: підключення');

    rerender(<ConnectionBadge connection="closed" />);
    expect(screen.getByRole('status')).toHaveTextContent('Потік: офлайн');
  });
});

describe('DataTable', () => {
  const columns = [{ key: 'title', header: 'Подія' }];

  it('показує повідомлення, коли записів немає', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('Немає записів для відображення')).toBeInTheDocument();
  });

  it('показує рядки та керує сторінками', async () => {
    const handleNext = vi.fn();
    const user = userEvent.setup();

    render(
      <DataTable
        columns={columns}
        data={[{ id: 'evt-1', title: 'Перша подія' }]}
        pageInfo={{
          showing: 1,
          total: 20,
          onPrev: () => {},
          onNext: handleNext,
          hasPrev: false,
          hasNext: true,
        }}
      />
    );

    expect(screen.getByText('Перша подія')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Попередня сторінка' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Наступна сторінка' }));
    expect(handleNext).toHaveBeenCalled();
  });
});

describe('Severity', () => {
  it('зводить рівні сервера до трьох груп і підписує їх', () => {
    const { container, rerender } = render(<Severity level="critical" />);
    expect(container.firstChild).toHaveClass('argus-severity--high');
    expect(screen.getByText('Critical')).toBeInTheDocument();

    rerender(<Severity level="info" />);
    expect(container.firstChild).toHaveClass('argus-severity--low');
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});
