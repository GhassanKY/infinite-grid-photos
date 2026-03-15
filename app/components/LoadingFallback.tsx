export function LoadingFallback() {
  return (
    <div className="w-full flex justify-center py-8 overflow-hidden">
      <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
    </div>
  );
}
