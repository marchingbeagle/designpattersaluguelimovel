# 🏠 Sistema de Aluguel de Imóveis

## 📖 Problema e Contexto

Este projeto implementa um sistema fictício de aluguel de imóveis similar ao Airbnb, desenvolvido em TypeScript. O sistema gerencia imóveis, reservas, pagamentos e o ciclo completo de uma reserva (desde pendente até finalizada).

### Funcionalidades Principais

- 🏠 Gerenciamento de imóveis disponíveis para aluguel
- 👥 Controle de usuários (proprietários e hóspedes)
- 📅 Sistema de reservas com controle automático de status
- 💳 Processamento de pagamentos simulado através de Stripe e PayPal
- 🔄 Controle rigoroso de estados da reserva com transições válidas
- 📊 Listagem e filtragem de reservas por status
- 💾 Persistência de dados em arquivo JSON local

## 🎯 Design Patterns Implementados

Este projeto demonstra a aplicação prática de três padrões de design fundamentais:

### 1. 🏗️ Padrão Criacional - Builder

**Onde foi usado:** `ReservaBuilder.ts`

**Por que foi usado:**

- As reservas são objetos complexos com múltiplos atributos obrigatórios
- Permite construir reservas passo a passo de forma legível e fluente
- Garante que apenas reservas válidas sejam criadas (validação no método `construir()`)
- Automatiza a geração de ID único e data de criação

**Métodos disponíveis:**

- `definirImovel(imovelId)` - Define o imóvel da reserva
- `definirHospede(hospedeId)` - Define o hóspede da reserva
- `definirDatas(checkIn, checkOut)` - Define as datas de check-in e check-out
- `definirNumeroHospedes(numero)` - Define o número de hóspedes
- `definirValorTotal(valor)` - Define o valor total da reserva
- `construir()` - Valida e constrói a reserva final

**Exemplo de uso no sistema:**

```typescript
// O sistema usa o Builder internamente no método criarReserva()
const reserva = sistema.criarReserva({
  imovelId: "imovel_001",
  hospedeId: "hosp_001",
  dataCheckIn: new Date("2025-12-15"),
  dataCheckOut: new Date("2025-12-18"),
  numeroHospedes: 2,
});
```

### 2. 🔄 Padrão Comportamental - State

**Onde foi usado:** `EstadoReserva.ts`

**Por que foi usado:**

- Reservas possuem diferentes estados com comportamentos específicos
- Cada estado define quais ações são permitidas
- Evita códigos condicionais complexos
- Garante transições válidas entre estados

**Estados implementados:**

- **Pendente:** Pode ser confirmada ou cancelada
- **Confirmada:** Pode ser cancelada ou ter estadia iniciada
- **Cancelada:** Estado final, nenhuma ação permitida
- **Em Andamento:** Pode apenas ser finalizada
- **Finalizada:** Estado final, nenhuma ação permitida

**Exemplo de uso:**

```typescript
const estado = gerenciadorEstado.obterEstado(reserva.status);
estado.confirmar(reserva); // Só funciona se estiver no estado correto
```

### 3. 🔌 Padrão Estrutural - Adapter

**Onde foi usado:** `AdapterPagamento.ts`

**Por que foi usado:**

- Diferentes sistemas de pagamento possuem APIs distintas
- Permite integração uniforme com Stripe e PayPal
- Facilita adição de novos métodos de pagamento
- Isola a complexidade de cada sistema de pagamento

**Sistemas adaptados:**

- **Stripe:** Gateway de pagamento internacional (lê dados de arquivo JSON)
- **PayPal:** Sistema de pagamentos online (lê dados de arquivo XML)

**Implementação:** O padrão Adapter usa **arquivos reais** como fonte de dados:

- 📄 **Stripe:** Lê transações do arquivo `assets/data/stripe_response.json`
- 📄 **PayPal:** Lê pagamentos do arquivo `assets/data/paypal_response.xml` usando parser XML

**Funcionalidades implementadas:**

- Busca de transações por valor aproximado (tolerância de R$ 1,00)
- Conversão automática de centavos para reais (Stripe)
- Parsing de XML para JSON (PayPal)
- Fallback para primeira transação se valor não for encontrado

**Exemplo de uso no sistema:**

```typescript
// Processamento via Stripe
await sistema.processarPagamento(reserva.id, "stripe");

// Processamento via PayPal
await sistema.processarPagamento(reserva.id, "paypal");
```

## 🗂️ Estrutura do Projeto

```text
src/
├── models/
│   ├── Imovel.ts              # Interface para imóveis
│   ├── Usuario.ts             # Interfaces para usuários
│   ├── Reserva.ts             # Interface e enums para reservas
│   ├── Pagamento.ts           # Interface para pagamentos
│   └── Usuarios/              # Estrutura detalhada de usuários
│       ├── Usuario.ts         # Interface base de usuário
│       ├── Proprietario.ts    # Interface para proprietários
│       ├── Hospede.ts         # Interface para hóspedes
│       └── index.ts           # Exportações dos tipos de usuário
├── services/
│   ├── ReservaBuilder.ts      # 🏗️ Padrão Builder
│   ├── EstadoReserva.ts       # 🔄 Padrão State
│   ├── AdapterPagamento.ts    # 🔌 Padrão Adapter (USA ARQUIVOS REAIS)
│   ├── GerenciadorDados.ts    # Simulação de banco de dados (Singleton)
│   └── SistemaAluguelImoveis.ts # Classe principal do sistema
└── main.ts                    # Arquivo principal com demonstrações
assets/
└── data/
    ├── database.json          # Dados fictícios do sistema
    ├── stripe_response.json   # 📄 Dados reais do Stripe (JSON)
    └── paypal_response.xml    # 📄 Dados reais do PayPal (XML)
```

## 🚀 Como Executar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar o sistema:**

   ```bash
   npm run dev
   ```

3. **Saída esperada:**
   - Listagem de imóveis disponíveis
   - Demonstração da criação de reservas (Builder)
   - Demonstração de mudanças de estado (State)
   - Demonstração de processamento de pagamentos (Adapter)
   - Manipulação de reservas existentes
   - Teste de restrições dos estados

## 📊 Dados Fictícios

O sistema utiliza múltiplos arquivos de dados para demonstrar diferentes formatos:

**`assets/data/database.json`** contém:

- 3 imóveis (Rio de Janeiro, Salvador, São Paulo)
- 5 usuários (3 proprietários, 2 hóspedes)
- 3 reservas em diferentes estados
- 2 pagamentos processados

**`assets/data/stripe_response.json`** contém:

- 3 transações Stripe com diferentes status (succeeded/failed)
- Valores em centavos, dados de clientes e métodos de pagamento
- Usado pelo Adapter Stripe para buscar dados reais

**`assets/data/paypal_response.xml`** contém:

- 3 pagamentos PayPal em formato XML
- Estados approved/failed, valores em BRL
- Usado pelo Adapter PayPal para demonstrar parsing de XML

## 🎮 Demonstrações Implementadas

O sistema executa automaticamente diversas demonstrações no arquivo `main.ts`:

### 1. **Inicialização e Listagem de Dados**

- Carregamento automático dos dados do arquivo `database.json`
- Listagem de todos os imóveis disponíveis
- Exibição de todas as reservas existentes no sistema

### 2. **Padrão Builder - Criação de Reservas**

- Criação de novas reservas usando interface fluente
- Validação automática de dados obrigatórios
- Cálculo automático de valor total baseado no preço por noite

### 3. **Padrão State - Transições de Estado**

- Alteração de status das reservas (pendente → confirmada → em andamento → finalizada)
- Demonstração de restrições (tentativas de ações inválidas)
- Listagem de ações disponíveis para cada estado

### 4. **Padrão Adapter - Processamento de Pagamentos**

- Processamento via Stripe (leitura de arquivo JSON)
- Processamento via PayPal (parsing de arquivo XML)
- Registro automático de pagamentos bem-sucedidos

### 5. **Manipulação de Reservas Existentes**

- Visualização detalhada de reservas específicas
- Alteração de status de reservas pré-existentes
- Processamento de pagamentos para reservas confirmadas

### 6. **Validações e Restrições**

- Tentativas de cancelar reservas finalizadas
- Tentativas de confirmar reservas em estado inadequado
- Demonstração das regras de negócio implementadas

### 7. **Filtragem de Dados**

- Listagem de reservas por status específico
- Visualização de reservas pendentes, confirmadas e finalizadas

## 🛠️ Tecnologias Utilizadas

- **TypeScript:** Linguagem principal
- **Node.js:** Runtime de execução
- **ts-node:** Execução direta de TypeScript
- **xml2js:** Parser para arquivos XML (usado pelo Adapter PayPal)
- **JSON:** Simulação de banco de dados e dados do Stripe

## 📝 Observações

- Este é um sistema fictício para fins educacionais
- Não possui interface gráfica, apenas saídas no console
- Os pagamentos são simulados (não há integração real)
- Os dados são salvos/carregados de um arquivo JSON local

## 🎯 Objetivo Educacional

Este projeto demonstra como os padrões de design podem ser aplicados em cenários reais, facilitando:

- **Manutenibilidade:** Código organizado e extensível
- **Flexibilidade:** Fácil adição de novos recursos
- **Robustez:** Controle rigoroso de estados e validações
- **Reutilização:** Componentes bem definidos e desacoplados
