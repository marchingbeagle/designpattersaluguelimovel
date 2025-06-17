import * as fs from "fs";
import * as path from "path";
import { parseStringPromise } from "xml2js";

export interface ProcessadorPagamento {
  processarPagamento(
    valor: number,
    dadosCartao?: any
  ): Promise<ResultadoPagamento>;
  obterNome(): string;
}

export interface ResultadoPagamento {
  sucesso: boolean;
  transacaoId: string;
  mensagem: string;
  valorProcessado: number;
}

class SistemaStripe {
  private caminhoArquivo: string;

  constructor() {
    this.caminhoArquivo = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "data",
      "stripe_response.json"
    );
  }

  async buscarTransacao(valor: number): Promise<any | null> {
    const dadosJson = fs.readFileSync(this.caminhoArquivo, "utf8");
    const dados = JSON.parse(dadosJson);

    const valorCentavos = valor * 100;
    const transacao = dados.transactions.find(
      (t: any) => Math.abs(t.amount_cents - valorCentavos) < 100
    );

    return transacao || dados.transactions[0];
  }
}

class SistemaPayPal {
  private caminhoArquivo: string;

  constructor() {
    this.caminhoArquivo = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "data",
      "paypal_response.xml"
    );
  }

  async buscarPagamento(valor: number): Promise<any | null> {
    const dadosXml = fs.readFileSync(this.caminhoArquivo, "utf8");
    const resultado = await parseStringPromise(dadosXml);

    const payments = resultado.paypal_response.payments[0].payment;

    const pagamento = payments.find((p: any) => {
      const total = parseFloat(
        p.transactions[0].transaction[0].amount[0].total[0]
      );
      return Math.abs(total - valor) < 1;
    });

    return pagamento || payments[0];
  }
}

export class AdapterStripe implements ProcessadorPagamento {
  private sistemaStripe: SistemaStripe;

  constructor() {
    this.sistemaStripe = new SistemaStripe();
  }
  async processarPagamento(
    valor: number,
    dadosCartao: any = {}
  ): Promise<ResultadoPagamento> {
    console.log(`Processando pagamento Stripe de R$ ${valor.toFixed(2)}`);
    console.log(`Buscando dados de transacao no arquivo JSON...`);

    const transacao = await this.sistemaStripe.buscarTransacao(valor);

    if (!transacao) {
      return {
        sucesso: false,
        transacaoId: "erro_arquivo",
        mensagem: "Erro ao acessar dados de transacao Stripe",
        valorProcessado: 0,
      };
    }

    const valorReal = transacao.amount_cents / 100;

    console.log(
      `Dados encontrados: ID=${transacao.charge_id}, Status=${transacao.status}, Valor=R$${valorReal}`
    );

    return {
      sucesso: transacao.status === "succeeded" && transacao.paid,
      transacaoId: transacao.charge_id,
      mensagem:
        transacao.status === "succeeded"
          ? `Pagamento Stripe processado com sucesso! Valor: R$ ${valorReal.toFixed(
              2
            )}`
          : `Falha no processamento Stripe: ${transacao.status}`,
      valorProcessado: valorReal,
    };
  }

  obterNome(): string {
    return "Stripe";
  }
}

export class AdapterPayPal implements ProcessadorPagamento {
  private sistemaPayPal: SistemaPayPal;

  constructor() {
    this.sistemaPayPal = new SistemaPayPal();
  }
  async processarPagamento(valor: number): Promise<ResultadoPagamento> {
    console.log(`Processando pagamento PayPal de R$ ${valor.toFixed(2)}`);
    console.log(`Buscando dados de pagamento no arquivo XML...`);

    const payment = await this.sistemaPayPal.buscarPagamento(valor);

    if (!payment) {
      return {
        sucesso: false,
        transacaoId: "erro_arquivo",
        mensagem: "Erro ao acessar dados de pagamento PayPal",
        valorProcessado: 0,
      };
    }

    const valorReal = parseFloat(
      payment.transactions[0].transaction[0].amount[0].total[0]
    );

    console.log(
      `Dados encontrados: ID=${payment.id[0]}, Status=${payment.state[0]}, Valor=R$${valorReal}`
    );

    return {
      sucesso: payment.state[0] === "approved",
      transacaoId: payment.id[0],
      mensagem:
        payment.state[0] === "approved"
          ? `Pagamento PayPal aprovado com sucesso! Valor: R$ ${valorReal.toFixed(
              2
            )}`
          : `Pagamento PayPal falhou: ${payment.state[0]}`,
      valorProcessado: valorReal,
    };
  }

  obterNome(): string {
    return "PayPal";
  }
}
