export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500" />
    </div>
  );
}
