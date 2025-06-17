export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface Proprietario extends Usuario {
  imoveis: string[];
}

export interface Hospede extends Usuario {
  reservas: string[];
}
