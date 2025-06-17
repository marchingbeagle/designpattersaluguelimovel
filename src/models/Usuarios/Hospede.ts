import { Usuario } from "./Usuario";

export interface Hospede extends Usuario {
  reservas: string[];
}
