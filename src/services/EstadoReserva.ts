import { Reserva, StatusReserva } from "../models/Reserva";

export abstract class EstadoReserva {
  abstract confirmar(reserva: Reserva): void;
  abstract cancelar(reserva: Reserva): void;
  abstract iniciarEstadia(reserva: Reserva): void;
  abstract finalizar(reserva: Reserva): void;
  abstract obterStatus(): StatusReserva;
  abstract obterAcoesDisponiveis(): string[];
}

export class EstadoPendente extends EstadoReserva {
  confirmar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} foi confirmada!`);
    reserva.status = StatusReserva.CONFIRMADA;
  }

  cancelar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} foi cancelada.`);
    reserva.status = StatusReserva.CANCELADA;
  }

  iniciarEstadia(reserva: Reserva): void {
    console.log(
      "Nao e possivel iniciar estadia - reserva ainda esta pendente."
    );
  }

  finalizar(reserva: Reserva): void {
    console.log("Nao e possivel finalizar - reserva ainda esta pendente.");
  }

  obterStatus(): StatusReserva {
    return StatusReserva.PENDENTE;
  }

  obterAcoesDisponiveis(): string[] {
    return ["confirmar", "cancelar"];
  }
}

export class EstadoConfirmada extends EstadoReserva {
  confirmar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} ja esta confirmada.`);
  }

  cancelar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} foi cancelada.`);
    reserva.status = StatusReserva.CANCELADA;
  }

  iniciarEstadia(reserva: Reserva): void {
    console.log(`Estadia da reserva ${reserva.id} foi iniciada!`);
    reserva.status = StatusReserva.EM_ANDAMENTO;
  }

  finalizar(reserva: Reserva): void {
    console.log("Nao e possivel finalizar - a estadia ainda nao foi iniciada.");
  }

  obterStatus(): StatusReserva {
    return StatusReserva.CONFIRMADA;
  }

  obterAcoesDisponiveis(): string[] {
    return ["cancelar", "iniciarEstadia"];
  }
}

export class EstadoCancelada extends EstadoReserva {
  confirmar(reserva: Reserva): void {
    console.log("Nao e possivel confirmar - reserva foi cancelada.");
  }

  cancelar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} ja esta cancelada.`);
  }

  iniciarEstadia(reserva: Reserva): void {
    console.log("Nao e possivel iniciar estadia - reserva foi cancelada.");
  }

  finalizar(reserva: Reserva): void {
    console.log("Nao e possivel finalizar - reserva foi cancelada.");
  }

  obterStatus(): StatusReserva {
    return StatusReserva.CANCELADA;
  }

  obterAcoesDisponiveis(): string[] {
    return [];
  }
}

export class EstadoEmAndamento extends EstadoReserva {
  confirmar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} ja esta em andamento.`);
  }

  cancelar(reserva: Reserva): void {
    console.log("Nao e possivel cancelar - estadia ja esta em andamento.");
  }

  iniciarEstadia(reserva: Reserva): void {
    console.log(`Estadia da reserva ${reserva.id} ja esta em andamento.`);
  }

  finalizar(reserva: Reserva): void {
    console.log(`Estadia da reserva ${reserva.id} foi finalizada!`);
    reserva.status = StatusReserva.FINALIZADA;
  }

  obterStatus(): StatusReserva {
    return StatusReserva.EM_ANDAMENTO;
  }

  obterAcoesDisponiveis(): string[] {
    return ["finalizar"];
  }
}

export class EstadoFinalizada extends EstadoReserva {
  confirmar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} ja foi finalizada.`);
  }

  cancelar(reserva: Reserva): void {
    console.log("Nao e possivel cancelar - reserva ja foi finalizada.");
  }

  iniciarEstadia(reserva: Reserva): void {
    console.log("Nao e possivel iniciar estadia - reserva ja foi finalizada.");
  }

  finalizar(reserva: Reserva): void {
    console.log(`Reserva ${reserva.id} ja foi finalizada.`);
  }

  obterStatus(): StatusReserva {
    return StatusReserva.FINALIZADA;
  }

  obterAcoesDisponiveis(): string[] {
    return [];
  }
}

export class GerenciadorEstadoReserva {
  private estados: Map<StatusReserva, EstadoReserva>;

  constructor() {
    this.estados = new Map([
      [StatusReserva.PENDENTE, new EstadoPendente()],
      [StatusReserva.CONFIRMADA, new EstadoConfirmada()],
      [StatusReserva.CANCELADA, new EstadoCancelada()],
      [StatusReserva.EM_ANDAMENTO, new EstadoEmAndamento()],
      [StatusReserva.FINALIZADA, new EstadoFinalizada()],
    ]);
  }

  obterEstado(status: StatusReserva): EstadoReserva {
    const estado = this.estados.get(status);
    if (!estado) {
      throw new Error(`Estado ${status} não encontrado`);
    }
    return estado;
  }
}
