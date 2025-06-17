import { GerenciadorDados } from "./GerenciadorDados";
import { ReservaBuilder } from "./ReservaBuilder";
import { GerenciadorEstadoReserva } from "./EstadoReserva";
import {
  AdapterStripe,
  AdapterPayPal,
  ProcessadorPagamento,
} from "./AdapterPagamento";
import { Reserva, StatusReserva } from "../models/Reserva";
import { Pagamento } from "../models/Pagamento";

export class SistemaAluguelImoveis {
  private gerenciadorDados: GerenciadorDados;
  private gerenciadorEstado: GerenciadorEstadoReserva;

  constructor() {
    this.gerenciadorDados = GerenciadorDados.getInstance();
    this.gerenciadorEstado = new GerenciadorEstadoReserva();
  }

  carregarDados(): void {
    console.log("Sistema inicializado com dados do arquivo JSON");
  }

  listarImoveis(): void {
    console.log("\nIMOVEIS DISPONIVEIS:");
    console.log("=".repeat(50));

    const imoveis = this.gerenciadorDados.obterImoveis();
    imoveis.forEach((imovel) => {
      console.log(`\n${imovel.titulo}`);
      console.log(`   R$ ${imovel.precoPorNoite}/noite`);
      console.log(`   ${imovel.endereco}`);
      console.log(`   Maximo ${imovel.capacidadeMaxima} pessoas`);
    });
  }

  listarReservas(): void {
    console.log("\nRESERVAS NO SISTEMA:");
    console.log("=".repeat(50));

    const reservas = this.gerenciadorDados.obterReservas();

    if (reservas.length === 0) {
      console.log("Nenhuma reserva encontrada.");
      return;
    }

    reservas.forEach((reserva) => {
      const imovel = this.gerenciadorDados.obterImovelPorId(reserva.imovelId);
      const hospede = this.gerenciadorDados.obterUsuarioPorId(
        reserva.hospedeId
      );

      console.log(`\nReserva: ${reserva.id}`);
      console.log(`Imovel: ${imovel?.titulo || "N/A"}`);
      console.log(`Hospede: ${hospede?.nome || "N/A"}`);
      console.log(`Status: ${reserva.status}`);
      console.log(`Valor: R$ ${reserva.valorTotal.toFixed(2)}`);
    });
  }

  listarReservasPorStatus(status: StatusReserva): void {
    console.log(`\nRESERVAS COM STATUS: ${status.toUpperCase()}`);
    console.log("=".repeat(50));

    const reservas = this.gerenciadorDados.obterReservasPorStatus(status);

    if (reservas.length === 0) {
      console.log("Nenhuma reserva encontrada com este status.");
      return;
    }

    reservas.forEach((reserva) => {
      const imovel = this.gerenciadorDados.obterImovelPorId(reserva.imovelId);
      const hospede = this.gerenciadorDados.obterUsuarioPorId(
        reserva.hospedeId
      );

      console.log(`\nReserva: ${reserva.id}`);
      console.log(`Imovel: ${imovel?.titulo || "N/A"}`);
      console.log(`Hospede: ${hospede?.nome || "N/A"}`);
      console.log(
        `Check-in: ${reserva.dataCheckIn.toISOString().split("T")[0]}`
      );
      console.log(
        `Check-out: ${reserva.dataCheckOut.toISOString().split("T")[0]}`
      );
      console.log(`Hospedes: ${reserva.numeroHospedes}`);
      console.log(`Valor Total: R$ ${reserva.valorTotal.toFixed(2)}`);
    });
  }

  criarReserva(dadosReserva: {
    imovelId: string;
    hospedeId: string;
    dataCheckIn: Date;
    dataCheckOut: Date;
    numeroHospedes: number;
  }): Reserva | null {
    console.log("\nCRIANDO NOVA RESERVA (usando padrao Builder)");
    console.log("=".repeat(50));

    try {
      const builder = new ReservaBuilder();

      builder
        .definirImovel(dadosReserva.imovelId)
        .definirHospede(dadosReserva.hospedeId)
        .definirDatas(dadosReserva.dataCheckIn, dadosReserva.dataCheckOut)
        .definirNumeroHospedes(dadosReserva.numeroHospedes);

      const valorTotal = this.gerenciadorDados.calcularValorReserva(
        dadosReserva.imovelId,
        dadosReserva.dataCheckIn,
        dadosReserva.dataCheckOut
      );

      builder.definirValorTotal(valorTotal);

      const reserva = builder.construir();

      this.gerenciadorDados.adicionarReserva(reserva);

      console.log(`Reserva ${reserva.id} criada com sucesso!`);
      console.log(`Valor total: R$ ${reserva.valorTotal.toFixed(2)}`);

      return reserva;
    } catch (error) {
      console.log(`Erro ao criar reserva: ${error}`);
      return null;
    }
  }

  alterarStatusReserva(
    reservaId: string,
    acao: "confirmar" | "cancelar" | "iniciarEstadia" | "finalizar"
  ): void {
    console.log(`\nALTERANDO STATUS DA RESERVA (usando padrao State)`);
    console.log("=".repeat(50));

    const reserva = this.gerenciadorDados.obterReservaPorId(reservaId);
    if (!reserva) {
      console.log(`Reserva ${reservaId} nao encontrada.`);
      return;
    }

    const estadoAtual = this.gerenciadorEstado.obterEstado(reserva.status);

    console.log(`Status atual: ${reserva.status}`);
    console.log(`Acao solicitada: ${acao}`);

    switch (acao) {
      case "confirmar":
        estadoAtual.confirmar(reserva);
        break;
      case "cancelar":
        estadoAtual.cancelar(reserva);
        break;
      case "iniciarEstadia":
        estadoAtual.iniciarEstadia(reserva);
        break;
      case "finalizar":
        estadoAtual.finalizar(reserva);
        break;
    }

    this.gerenciadorDados.atualizarReserva(reserva);
    console.log(`Novo status: ${reserva.status}`);
  }

  async processarPagamento(
    reservaId: string,
    metodoPagamento: "stripe" | "paypal"
  ): Promise<void> {
    console.log(`\nPROCESSANDO PAGAMENTO (usando padrao Adapter)`);
    console.log("=".repeat(50));

    const reserva = this.gerenciadorDados.obterReservaPorId(reservaId);
    if (!reserva) {
      console.log(`Reserva ${reservaId} nao encontrada.`);
      return;
    }

    try {
      let processador: ProcessadorPagamento;

      switch (metodoPagamento.toLowerCase()) {
        case "stripe":
          processador = new AdapterStripe();
          break;
        case "paypal":
          processador = new AdapterPayPal();
          break;
        default:
          console.log(`Metodo de pagamento ${metodoPagamento} nao suportado`);
          console.log(`Metodos disponiveis: Stripe, PayPal`);
          return;
      }

      console.log(`Metodo selecionado: ${processador.obterNome()}`);

      const resultado = await processador.processarPagamento(
        reserva.valorTotal
      );

      console.log(`Resultado: ${resultado.mensagem}`);

      if (resultado.sucesso) {
        const pagamento: Pagamento = {
          id: `pag_${Date.now()}`,
          reservaId: reserva.id,
          valor: resultado.valorProcessado,
          metodoPagamento: processador.obterNome(),
          status: "pago",
          dataPagamento: new Date(),
        };

        this.gerenciadorDados.adicionarPagamento(pagamento);
        console.log(`Pagamento registrado com ID: ${pagamento.id}`);
        console.log(
          `Valor processado: R$ ${resultado.valorProcessado.toFixed(2)}`
        );
      }
    } catch (error) {
      console.log(`Erro no processamento: ${error}`);
    }
  }

  mostrarDetalhesReserva(reservaId: string): void {
    console.log(`\nDETALHES DA RESERVA`);
    console.log("=".repeat(50));

    const reserva = this.gerenciadorDados.obterReservaPorId(reservaId);
    if (!reserva) {
      console.log(`Reserva ${reservaId} nao encontrada.`);
      return;
    }

    const imovel = this.gerenciadorDados.obterImovelPorId(reserva.imovelId);
    const hospede = this.gerenciadorDados.obterUsuarioPorId(reserva.hospedeId);
    const pagamento = this.gerenciadorDados.obterPagamentoPorReserva(
      reserva.id
    );
    const estado = this.gerenciadorEstado.obterEstado(reserva.status);

    console.log(`ID: ${reserva.id}`);
    console.log(`Imovel: ${imovel?.titulo || "N/A"}`);
    console.log(
      `Hospede: ${hospede?.nome || "N/A"} (${hospede?.email || "N/A"})`
    );
    console.log(
      `Check-in: ${reserva.dataCheckIn.toISOString().split("T")[0]} as 14:00`
    );
    console.log(
      `Check-out: ${reserva.dataCheckOut.toISOString().split("T")[0]} as 11:00`
    );
    console.log(`Numero de hospedes: ${reserva.numeroHospedes}`);
    console.log(`Status: ${reserva.status}`);
    console.log(`Valor total: R$ ${reserva.valorTotal.toFixed(2)}`);

    if (pagamento) {
      console.log(
        `\nPagamento: ${pagamento.metodoPagamento} - ${pagamento.status}`
      );
      console.log(
        `Data do pagamento: ${
          pagamento.dataPagamento.toISOString().split("T")[0]
        }`
      );
    }

    console.log(
      `\nAcoes disponiveis: ${estado.obterAcoesDisponiveis().join(", ")}`
    );
  }
}
