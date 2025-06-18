import { SistemaAluguelImoveis } from "../services/SistemaAluguelImoveis";

async function testBuilder() {
  console.log("TESTE DO PADRAO BUILDER");
  console.log("============================================================");

  const sistema = new SistemaAluguelImoveis();
  sistema.carregarDados();

  console.log("Criando reserva usando interface fluente...");

  const novaReserva = sistema.criarReserva({
    imovelId: "imovel_001",
    hospedeId: "hosp_001",
    dataCheckIn: new Date("2025-12-15"),
    dataCheckOut: new Date("2025-12-18"),
    numeroHospedes: 2,
  });

  if (novaReserva) {
    console.log("\n✅ Reserva criada com sucesso usando Builder Pattern!");
    console.log(`ID da reserva: ${novaReserva.id}`);
    console.log(`Status inicial: ${novaReserva.status}`);
    console.log(`Valor total: R$ ${novaReserva.valorTotal.toFixed(2)}`);

    console.log("\n📋 Detalhes da reserva criada:");
    sistema.mostrarDetalhesReserva(novaReserva.id);
  } else {
    console.log("\n❌ Falha ao criar reserva");
  }

  console.log("\n============================================================");
  console.log("Teste do Builder Pattern concluido!");
  console.log("============================================================");
}

testBuilder().catch(console.error);
