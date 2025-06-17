import { Reserva, StatusReserva } from "../models/Reserva";
import { Imovel } from "../models/Imovel";
import { Proprietario, Hospede } from "../models/Usuarios";
import { Pagamento } from "../models/Pagamento";
import * as path from "path";
import * as fs from "fs";

export interface Database {
  imoveis: Imovel[];
  usuarios: (Proprietario | Hospede)[];
  reservas: Reserva[];
  pagamentos: Pagamento[];
}

interface DatabaseJSON {
  imoveis: any[];
  usuarios: any[];
  reservas: any[];
  pagamentos: any[];
}

export class GerenciadorDados {
  private static instance: GerenciadorDados;
  private database: Database;
  private readonly databasePath: string;

  private constructor() {
    console.log("Sistema de Aluguel de Imoveis inicializado!");
    this.databasePath = path.resolve(
      __dirname,
      "../../assets/data/database.json"
    );
    this.database = this.carregarDadosDoArquivo();
  }

  public static getInstance(): GerenciadorDados {
    if (!GerenciadorDados.instance) {
      GerenciadorDados.instance = new GerenciadorDados();
    }
    return GerenciadorDados.instance;
  }
  private carregarDadosDoArquivo(): Database {
    const dadosJSON = fs.readFileSync(this.databasePath, "utf8");
    const dados: DatabaseJSON = JSON.parse(dadosJSON);

    return {
      imoveis: dados.imoveis,
      usuarios: dados.usuarios,
      reservas: dados.reservas.map((reserva) => ({
        ...reserva,
        dataCheckIn: new Date(reserva.dataCheckIn),
        dataCheckOut: new Date(reserva.dataCheckOut),
        dataCriacao: new Date(reserva.dataCriacao),
        status: this.converterStringParaStatusReserva(reserva.status),
      })),
      pagamentos: dados.pagamentos.map((pagamento) => ({
        ...pagamento,
        dataPagamento: new Date(pagamento.dataPagamento),
      })),
    };
  }

  private converterStringParaStatusReserva(status: string): StatusReserva {
    switch (status.toLowerCase()) {
      case "pendente":
        return StatusReserva.PENDENTE;
      case "confirmada":
        return StatusReserva.CONFIRMADA;
      case "em_andamento":
        return StatusReserva.EM_ANDAMENTO;
      case "finalizada":
        return StatusReserva.FINALIZADA;
      case "cancelada":
        return StatusReserva.CANCELADA;
      default:
        return StatusReserva.PENDENTE;
    }
  }

  obterImoveis(): Imovel[] {
    return this.database.imoveis;
  }

  obterImovelPorId(id: string): Imovel | undefined {
    return this.database.imoveis.find((imovel) => imovel.id === id);
  }

  obterUsuarios(): (Proprietario | Hospede)[] {
    return this.database.usuarios;
  }

  obterUsuarioPorId(id: string): Proprietario | Hospede | undefined {
    return this.database.usuarios.find((usuario) => usuario.id === id);
  }

  obterReservas(): Reserva[] {
    return this.database.reservas;
  }

  obterReservaPorId(id: string): Reserva | undefined {
    return this.database.reservas.find((reserva) => reserva.id === id);
  }

  obterPagamentos(): Pagamento[] {
    return this.database.pagamentos;
  }

  obterPagamentoPorReserva(reservaId: string): Pagamento | undefined {
    return this.database.pagamentos.find((pag) => pag.reservaId === reservaId);
  }
  obterReservasPorStatus(status: StatusReserva): Reserva[] {
    return this.database.reservas.filter(
      (reserva) => reserva.status === status
    );
  }

  adicionarReserva(reserva: Reserva): void {
    this.database.reservas.push(reserva);
  }

  atualizarReserva(reservaAtualizada: Reserva): void {
    const index = this.database.reservas.findIndex(
      (r) => r.id === reservaAtualizada.id
    );
    if (index !== -1) {
      this.database.reservas[index] = reservaAtualizada;
    }
  }

  adicionarPagamento(pagamento: Pagamento): void {
    this.database.pagamentos.push(pagamento);
  }

  calcularValorReserva(
    imovelId: string,
    dataCheckIn: Date,
    dataCheckOut: Date
  ): number {
    const imovel = this.obterImovelPorId(imovelId);
    if (!imovel) return 0;

    const dias = Math.ceil(
      (dataCheckOut.getTime() - dataCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return dias * imovel.precoPorNoite;
  }
}
