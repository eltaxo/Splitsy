export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F2C94C] mb-4"></div>
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}
