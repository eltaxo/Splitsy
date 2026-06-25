interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  emoji = '📝',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-6xl mb-6">{emoji}</p>
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-gray-500 mb-6">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary max-w-xs mx-auto"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
