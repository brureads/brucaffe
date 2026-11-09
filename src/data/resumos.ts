
export type Resumo = {
  id: number
  materiaId: number
  titulo: string
  descricao: string
  tempoLeitura: number
  conteudo: {
    titulo: string
    texto: string
  }[]
}

export const resumos: Resumo[] = [
  {
    id: 1,
    materiaId: 2,
    titulo: 'Introdução ao Docker',
    descricao: 'Entenda contêineres, imagens e Dockerfile.',
    tempoLeitura: 5,
    conteudo: [
      {
        titulo: 'O que é Docker?',
        texto:
          'Docker é uma plataforma que permite criar, executar e distribuir aplicações dentro de contêineres.',
      },
      {
        titulo: 'O que é um contêiner?',
        texto:
          'É um ambiente isolado que reúne uma aplicação e os recursos necessários para executá-la. Os contêineres compartilham o kernel do sistema operacional do host.',
      },
      {
        titulo: 'Uma analogia simples',
        texto:
          'Imagine uma cafeteria. Cada pedido é preparado seguindo uma receita padronizada. A imagem Docker funciona como essa receita, enquanto o contêiner é o pedido preparado e pronto para uso.',
      },
      {
        titulo: 'O que é uma imagem Docker?',
        texto:
          'É um modelo imutável usado para criar contêineres. Ela contém as instruções e os arquivos necessários para executar a aplicação.',
      },
      {
        titulo: 'O que é um Dockerfile?',
        texto:
          'É um arquivo de texto com instruções para construir uma imagem Docker. Ele define, por exemplo, a imagem base, os arquivos copiados e os comandos executados.',
      },
      {
        titulo: 'Comandos básicos',
        texto:
          'docker build -t meu-app . → constrói uma imagem.\n' +
          'docker run meu-app → cria e inicia um contêiner.\n' +
          'docker ps → lista os contêineres em execução.\n' +
          'docker images → lista as imagens disponíveis.',
      },
    ],
  },
]
