export enum StatusReserva {
  PENDENTE = "pendente",
  CONFIRMADA = "confirmada",
  CANCELADA = "cancelada",
  EM_ANDAMENTO = "em_andamento",
  FINALIZADA = "finalizada",
}

export interface Reserva {
  id: string;
  imovelId: string;
  hospedeId: string;
  dataCheckIn: Date;
  dataCheckOut: Date;
  numeroHospedes: number;
  valorTotal: number;
  status: StatusReserva;
  dataCriacao: Date;
}
