
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Resumo } from './data/resumos'

type Props = {
  materias: {
    id: number
    nome: string
  }[]
  onSalvar: (resumo: Resumo) => void
  onCancelar: () => void
  resumoInicial?: Resumo
}

function EditorResumo({
  materias,
  onSalvar,
  onCancelar,
  resumoInicial,
}: Props) {
  const [titulo, setTitulo] = useState(
    resumoInicial?.titulo ?? ''
  )

  const [descricao, setDescricao] = useState(
    resumoInicial?.descricao ?? ''
  )

  const [materiaId, setMateriaId] = useState(
    resumoInicial?.materiaId ?? materias[0]?.id ?? 0
  )

  const [tempoLeitura, setTempoLeitura] = useState(
    resumoInicial?.tempoLeitura ?? 5
  )

  const [conteudo, setConteudo] = useState(
    resumoInicial?.conteudo ?? [
      { titulo: '', texto: '' },
    ]
  )

  function adicionarSecao() {
    setConteudo([
      ...conteudo,
      { titulo: '', texto: '' },
    ])
  }

  function atualizarSecao(
    indice: number,
    campo: 'titulo' | 'texto',
    valor: string
  ) {
    setConteudo((anterior) =>
      anterior.map((secao, posicao) =>
        posicao === indice
          ? { ...secao, [campo]: valor }
          : secao
      )
    )
  }

  function removerSecao(indice: number) {
    setConteudo((anterior) =>
      anterior.filter((_, posicao) => posicao !== indice)
    )
  }

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!titulo.trim() || materiaId === 0) {
      return
    }

    const resumo: Resumo = {
      id: resumoInicial?.id ?? Date.now(),
      materiaId,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tempoLeitura,
      conteudo: conteudo
        .filter(
          (secao) =>
            secao.titulo.trim() || secao.texto.trim()
        )
        .map((secao) => ({
          titulo: secao.titulo.trim(),
          texto: secao.texto.trim(),
        })),
    }

    onSalvar(resumo)
  }

  return (
    <main className="pagina-leitura">
      <button
        type="button"
        className="botao-voltar"
        onClick={onCancelar}
      >
        ← Cancelar
      </button>

      <article className="folha-resumo">
        <div className="resumo-cabecalho">
          <span className="resumo-etiqueta">
            EDITOR DO BRUCAFFÉ
          </span>

          <h1>
            {resumoInicial
              ? 'Editar resumo'
              : 'Novo resumo'}
          </h1>

          <p>
            Organize suas anotações como um
            material acadêmico.
          </p>
        </div>

        <form
          className="formulario-disciplina"
          onSubmit={salvar}
        >
          <label htmlFor="titulo-resumo">
            Título do resumo
          </label>

          <input
            id="titulo-resumo"
            value={titulo}
            onChange={(evento) =>
              setTitulo(evento.target.value)
            }
            placeholder="Ex.: Introdução ao Docker"
            required
          />

          <label htmlFor="materia-resumo">
            Disciplina
          </label>

          <select
            id="materia-resumo"
            value={materiaId}
            onChange={(evento) =>
              setMateriaId(Number(evento.target.value))
            }
            required
          >
            {materias.map((materia) => (
              <option
                key={materia.id}
                value={materia.id}
              >
                {materia.nome}
              </option>
            ))}
          </select>

          <label htmlFor="descricao-resumo">
            Descrição
          </label>

          <textarea
            id="descricao-resumo"
            value={descricao}
            onChange={(evento) =>
              setDescricao(evento.target.value)
            }
            placeholder="Uma breve apresentação do conteúdo"
            rows={3}
          />

          <label htmlFor="tempo-resumo">
            Tempo de leitura (minutos)
          </label>

          <input
            id="tempo-resumo"
            type="number"
            min="1"
            max="120"
            value={tempoLeitura}
            onChange={(evento) =>
              setTempoLeitura(Number(evento.target.value))
            }
          />

          <h2>Conteúdo do resumo</h2>

          {conteudo.map((secao, indice) => (
            <div
              key={indice}
              className="lista-assuntos"
            >
              <label>
                Título da seção {indice + 1}
              </label>

              <input
                value={secao.titulo}
                onChange={(evento) =>
                  atualizarSecao(
                    indice,
                    'titulo',
                    evento.target.value
                  )
                }
                placeholder="Ex.: O que é Docker?"
              />

              <label>Explicação</label>

              <textarea
                value={secao.texto}
                onChange={(evento) =>
                  atualizarSecao(
                    indice,
                    'texto',
                    evento.target.value
                  )
                }
                placeholder="Escreva suas anotações..."
                rows={6}
              />

              {conteudo.length > 1 && (
                <button
                  type="button"
                  className="botao-imprimir"
                  onClick={() => removerSecao(indice)}
                >
                  Remover seção
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="botao-imprimir"
            onClick={adicionarSecao}
          >
            + Adicionar seção
          </button>

          <button
            type="submit"
            className="botao-pdf"
            disabled={materias.length === 0}
          >
            Salvar resumo
          </button>
        </form>
      </article>
    </main>
  )
}

export default EditorResumo
