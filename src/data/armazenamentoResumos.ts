
import { resumos } from './resumos'
import type { Resumo } from './resumos'

const CHAVE_RESUMOS = 'brucaffe-resumos-v1'

// Recupera os resumos salvos no navegador.
export function carregarResumos(): Resumo[] {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_RESUMOS)

    // Na primeira visita, usa os resumos iniciais.
    if (dadosSalvos === null) {
      return resumos
    }

    const dados: unknown = JSON.parse(dadosSalvos)

    if (
      Array.isArray(dados) &&
      dados.every((item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'number' &&
        typeof item.materiaId === 'number' &&
        typeof item.titulo === 'string' &&
        typeof item.descricao === 'string' &&
        typeof item.tempoLeitura === 'number' &&
        Array.isArray(item.conteudo) &&
        item.conteudo.every(
          (secao: unknown) =>
            secao !== null &&
            typeof secao === 'object' &&
            'titulo' in secao &&
            'texto' in secao &&
            typeof secao.titulo === 'string' &&
            typeof secao.texto === 'string'
        )
      )
    ) {
      return dados as Resumo[]
    }
  } catch (erro) {
    console.error('Erro ao carregar resumos:', erro)
  }

  return resumos
}

// Salva a lista completa de resumos.
export function salvarResumos(lista: Resumo[]): boolean {
  try {
    localStorage.setItem(
      CHAVE_RESUMOS,
      JSON.stringify(lista)
    )

    return true
  } catch (erro) {
    console.error('Erro ao salvar resumos:', erro)
    return false
  }
}
