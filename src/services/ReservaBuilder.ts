import { Reserva, StatusReserva } from "../models/Reserva";
import { v4 as uuidv4 } from "uuid";
export class ReservaBuilder {
  private reserva: Partial<Reserva>;

  constructor() {
    this.reserva = {
      id: uuidv4(),
      status: StatusReserva.PENDENTE,
      dataCriacao: new Date(),
    };
  }

  definirImovel(imovelId: string): ReservaBuilder {
    this.reserva.imovelId = imovelId;
    return this;
  }

  definirHospede(hospedeId: string): ReservaBuilder {
    this.reserva.hospedeId = hospedeId;
    return this;
  }

  definirDatas(checkIn: Date, checkOut: Date): ReservaBuilder {
    this.reserva.dataCheckIn = checkIn;
    this.reserva.dataCheckOut = checkOut;
    return this;
  }
  definirNumeroHospedes(numero: number): ReservaBuilder {
    this.reserva.numeroHospedes = numero;
    return this;
  }

  definirValorTotal(valor: number): ReservaBuilder {
    this.reserva.valorTotal = valor;
    return this;
  }

  construir(): Reserva {
    if (
      !this.reserva.imovelId ||
      !this.reserva.hospedeId ||
      !this.reserva.dataCheckIn ||
      !this.reserva.dataCheckOut ||
      !this.reserva.numeroHospedes ||
      this.reserva.valorTotal === undefined
    ) {
      throw new Error("Dados obrigatórios da reserva não foram fornecidos");
    }

    return this.reserva as Reserva;
  }
}