import React from 'react';
import { Panel } from '../ui/Panel';
import { EmptyState } from '../ui/EmptyState';

// Розділи пульта, що належать іншим підсистемам. Курсова робота охоплює лише
// підсистему журналу подій, тому решта розділів явно позначені як поза обсягом.
export const PlaceholderView = ({ title }) => {
  const heading = 'Розділ «' + title + '»';

  return (
    <Panel title={heading}>
      <EmptyState
        title="Розділ належить іншій підсистемі пульта"
        description="У цій курсовій роботі розроблено підсистему «Журнал подій» чергового оператора. Інші розділи пульта ARGUS входять до складу суміжних курсових проєктів і тут не реалізуються."
      />
    </Panel>
  );
};

export default PlaceholderView;
