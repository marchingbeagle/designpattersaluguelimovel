import { Usuario } from "./Usuario";

export interface Proprietario extends Usuario {
  imoveis: string[];
}
