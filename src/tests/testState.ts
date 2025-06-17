import { SistemaAluguelImoveis } from "../services/SistemaAluguelImoveis";

async function testState() {
  console.log("TESTE DO PADRAO STATE");
  console.log("============================================================");

  const sistema = new SistemaAluguelImoveis();
  sistema.carregarDados();

  // Criar uma reserva para testar as transições
  const reserva = sistema.criarReserva({
    imovelId: "imovel_002",
    hospedeId: "hosp_002",
    dataCheckIn: new Date("2025-12-20"),
    dataCheckOut: new Date("2025-12-25"),
    numeroHospedes: 4,
  });

  if (reserva) {
    console.log("\n2. DEMONSTRACAO DO PADRAO STATE");
    console.log("=".repeat(50));

    console.log("Status inicial: PENDENTE");
    console.log(
      "Transicoes validas: PENDENTE → CONFIRMADA → EM_ANDAMENTO → FINALIZADA"
    );

    console.log("\n🔄 Iniciando transicoes de estado...");

    console.log("\n--- 1. Confirmando a reserva (PENDENTE → CONFIRMADA) ---");
    sistema.alterarStatusReserva(reserva.id, "confirmar");

    console.log("\n--- 2. Iniciando a estadia (CONFIRMADA → EM_ANDAMENTO) ---");
    sistema.alterarStatusReserva(reserva.id, "iniciarEstadia");

    console.log(
      "\n--- 3. Finalizando a estadia (EM_ANDAMENTO → FINALIZADA) ---"
    );
    sistema.alterarStatusReserva(reserva.id, "finalizar");
  }

  console.log("\n============================================================");
  console.log("Teste do State Pattern concluido!");
  console.log("============================================================");
}

testState().catch(console.error);