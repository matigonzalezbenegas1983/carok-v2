export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-green-700 mb-4">CarOK</h1>
        <p className="text-xl text-gray-600 mb-8">Tu próximo auto</p>
        <p className="text-gray-700 mb-6">Concesionaria premium con más de 500 vehículos: sedanes, SUVs, pickups, 0 km y usados. Financiación y entrega a todo el país.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2">500+ Vehículos</h3>
            <p className="text-gray-600">Amplio inventario de autos nuevos y usados</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Financiación</h3>
            <p className="text-gray-600">Opciones de crédito flexibles y accesibles</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Entrega Nacional</h3>
            <p className="text-gray-600">Llevamos tu auto a todo el país</p>
          </div>
        </div>
      </div>
    </main>
  )
}
