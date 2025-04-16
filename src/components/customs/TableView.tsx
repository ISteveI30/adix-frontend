import React from 'react';

export type ColumnDefinition<T extends { id: string }> =  {
  header: string;
  accessor: keyof T | 'info' | 'actions';
  className?: string;
};

type TableViewProps<T extends { id: string }> = {
  columns: ColumnDefinition<T>[];
  renderRow: (item: T) => React.ReactNode; 
  data: T[];
};

const TableView = <T extends { id: string }> ({
  columns,
  renderRow,
  data,
}: TableViewProps<T>) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col) => (
            <th key={col.accessor.toLocaleString()} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => renderRow(item))}
      </tbody>
    </table>
  );
};

export default TableView;