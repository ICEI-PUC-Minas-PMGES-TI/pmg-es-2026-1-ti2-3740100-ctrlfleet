import EditarVeiculoPage from "../EditarVeiculoPage.jsx";

function App() {
  // Simulando que estamos editando o veículo de ID 1
  // No futuro, isso virá de uma lista ou rota
  const handleSucesso = (v) => console.log("Atualizado!", v);
  const handleCancelar = () => console.log("Cancelado");

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <EditarVeiculoPage 
          veiculoId={1} 
          onSucesso={handleSucesso} 
          onCancelar={handleCancelar} 
        />
      </div>
    </div>
  );
}

export default App;