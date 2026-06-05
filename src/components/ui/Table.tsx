interface TableShellProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  columns: string[];
}

interface TableEmptyRowProps {
  colSpan: number;
  message: string;
}

export function TableShell({ children, className = '' }: TableShellProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-gray-200 bg-gray-100">
        {columns.map((column) => (
          <th
            key={column}
            className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableEmptyRow({ colSpan, message }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-400">
        {message}
      </td>
    </tr>
  );
}
