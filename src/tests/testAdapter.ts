import { SistemaAluguelImoveis } from "../services/SistemaAluguelImoveis";

async function testAdapter() {
  console.log("TESTE DO PADRAO ADAPTER");
  console.log("============================================================");

  const sistema = new SistemaAluguelImoveis();
  sistema.carregarDados();

  const reserva = sistema.criarReserva({
    imovelId: "imovel_003",
    hospedeId: "hosp_001",
    dataCheckIn: new Date("2025-12-10"),
    dataCheckOut: new Date("2025-12-12"),
    numeroHospedes: 1,
  });

  if (reserva) {
    console.log("\n3. DEMONSTRACAO DO PADRAO ADAPTER");
    console.log("=".repeat(50));
    console.log(
      "Testando diferentes metodos de pagamento com APIs distintas..."
    );

    console.log("\n💳 Processando pagamentos usando Adapter Pattern:");

    console.log(
      "\n--- 1. Processando via Stripe (le dados de arquivo JSON) ---"
    );
    console.log(
      "Adapter Stripe: converte centavos para reais, busca por valor aproximado"
    );
    await sistema.processarPagamento(reserva.id, "stripe");

    console.log(
      "\n--- 2. Processando via PayPal (le dados de arquivo XML) ---"
    );
    console.log(
      "Adapter PayPal: faz parsing de XML, busca por valor aproximado"
    );
    await sistema.processarPagamento(reserva.id, "paypal");

    console.log("\n🔄 Testando metodo de pagamento invalido...");
    console.log("\n--- 3. Tentando metodo inexistente (deve falhar) ---");

    await sistema.processarPagamento(reserva.id, "bitcoin");

    console.log("Dados foram lidos de arquivos JSON (Stripe) e XML (PayPal).");
  }

  console.log("\n============================================================");
  console.log("Teste do Adapter Pattern concluido!");
  console.log("============================================================");
}

testAdapter().catch(console.error);
