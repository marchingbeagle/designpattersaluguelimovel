export interface Pagamento {
  id: string;
  reservaId: string;
  valor: number;
  metodoPagamento: string;
  status: string;
  dataPagamento: Date;
}
