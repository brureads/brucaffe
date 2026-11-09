
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import html2pdf from 'html2pdf.js'

import {
  carregarResumos,
  salvarResumos,
} from './data/armazenamentoResumos'

import type { Resumo } from './data/resumos'
import EditorResumo from './EditorResumo'
import ModeloAcademico from './ModeloAcademico'

import './App.css'
import './disciplinas.css'
import './ajustes.css'
import './integracaoAcademica.css'

type Materia = {
  id: number
  nome: string
  descricao: string
  simbolo: string
  cor: string
}

const CHAVE_MATERIAS = 'brucaffe-disciplinas-v1'

const materiasIniciais: Materia[] = [
  {
    id: 1,
    nome: 'Estrutura de Dados',
    descricao: 'Java, algoritmos e organização de dados',
    simbolo: '⌘',
    cor: 'rosa',
  },
  {
    id: 2,
    nome: 'DevOps',
    descricao: 'Ferramentas, automação e infraestrutura',
    simbolo: '⚙',
    cor: 'caramelo',
  },
  {
    id: 3,
    nome: 'Engenharia de Requisitos',
    descricao: 'Planejamento e documentação de sistemas',
    simbolo: '✎',
    cor: 'lilas',
  },
  {
    id: 4,
    nome: 'Metodologias Ágeis',
    descricao: 'Organização e desenvolvimento de projetos',
    simbolo: '✿',
    cor: 'verde',
  },
]

const coresDisponiveis = [
  { valor: 'rosa', nome: 'Rosa' },
  { valor: 'caramelo', nome: 'Caramelo' },
  { valor: 'lilas', nome: 'Lilás' },
  { valor: 'verde', nome: 'Verde' },
]

function carregarMaterias(): Materia[] {
  try {
    const salvo = localStorage.getItem(CHAVE_MATERIAS)

    if (salvo === null) {
      return materiasIniciais
    }

    const dados: unknown = JSON.parse(salvo)

    if (
      Array.isArray(dados) &&
      dados.every(
        (item) =>
          item !== null &&
          typeof item === 'object' &&
          typeof item.id === 'number' &&
          typeof item.nome === 'string' &&
          typeof item.descricao === 'string' &&
          typeof item.simbolo === 'string' &&
          typeof item.cor === 'string'
      )
    ) {
      return dados as Materia[]
    }
  } catch (erro) {
    console.error('Erro ao carregar disciplinas:', erro)
  }

  return materiasIniciais
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// CARTÃO DE DISCIPLINA

function MateriaCard({
  materia,
  resumos,
  onAbrirResumo,
  onExcluir,
}: {
  materia: Materia
  resumos: Resumo[]
  onAbrirResumo: (resumo: Resumo) => void
  onExcluir: (materia: Materia) => void
}) {
  const [aberto, setAberto] = useState(false)

  const resumosDaMateria = resumos.filter(
    (resumo) => resumo.materiaId === materia.id
  )

  return (
    <article className={`materia-card ${materia.cor}`}>
      <div className="cabecalho-card">
        <div className="materia-simbolo">
          {materia.simbolo}
        </div>

        <button
          type="button"
          className="botao-excluir-card"
          aria-label={`Excluir disciplina ${materia.nome}`}
          title="Excluir disciplina"
          onClick={() => onExcluir(materia)}
        >
          ✕
        </button>
      </div>

      <h3>{materia.nome}</h3>
      <p>{materia.descricao}</p>

      <button
        type="button"
        className="botao-materia"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
      >
        {aberto ? 'Fechar cardápio −' : 'Ver resumos +'}
      </button>

      {aberto && (
        <div className="lista-assuntos">
          <h4>Resumos disponíveis</h4>

          {resumosDaMateria.length > 0 ? (
            <div className="lista-resumos">
              {resumosDaMateria.map((resumo) => (
                <button
                  type="button"
                  key={resumo.id}
                  className="resumo-item"
                  onClick={() => onAbrirResumo(resumo)}
                >
                  <span>{resumo.titulo}</span>
                  <small>
                    {resumo.tempoLeitura} min de leitura →
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <p className="aviso-vazio">
              Esta disciplina ainda não tem resumos.
              Crie um usando o botão Novo resumo!
            </p>
          )}
        </div>
      )}
    </article>
  )
}

// LEITOR ACADÊMICO

function LeitorResumo({
  resumo,
  disciplina,
  onVoltar,
  onEditar,
  onExcluir,
}: {
  resumo: Resumo
  disciplina: string
  onVoltar: () => void
  onEditar: () => void
  onExcluir: () => void
}) {
  const referenciaDocumento = useRef<HTMLDivElement>(null)
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [erroPDF, setErroPDF] = useState(false)

  async function baixarPDF() {
    const elemento = referenciaDocumento.current

    if (!elemento || gerandoPDF) {
      return
    }

    setGerandoPDF(true)
    setErroPDF(false)

    const nome = normalizarTexto(resumo.titulo)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `brucaffe-${nome || 'resumo'}.pdf`,
          image: {
            type: 'jpeg',
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
        })
        .from(elemento)
        .save()
    } catch (erro) {
      console.error('Erro ao gerar PDF:', erro)
      setErroPDF(true)
    } finally {
      setGerandoPDF(false)
    }
  }

  return (
    <main className="pagina-leitura pagina-academica">
      <div className="controles-academicos">
        <button
          type="button"
          className="botao-voltar"
          onClick={onVoltar}
        >
          ← Voltar ao cardápio
        </button>

        <div className="acoes-resumo">
          <button
            type="button"
            className="botao-pdf"
            onClick={baixarPDF}
            disabled={gerandoPDF}
          >
            {gerandoPDF
              ? 'Gerando PDF...'
              : '↓ Salvar PDF'}
          </button>

          <button
            type="button"
            className="botao-imprimir"
            onClick={() => window.print()}
          >
            Imprimir
          </button>

          <button
            type="button"
            className="botao-imprimir"
            onClick={onEditar}
          >
            Editar resumo
          </button>

          <button
            type="button"
            className="botao-excluir-resumo"
            onClick={onExcluir}
          >
            Excluir resumo
          </button>
        </div>

        {erroPDF && (
          <p className="erro-pdf" role="alert">
            Não foi possível gerar o PDF.
            Tente novamente.
          </p>
        )}
      </div>

      <div
        ref={referenciaDocumento}
        className="documento-exportacao"
      >
        <ModeloAcademico
          resumo={resumo}
          disciplina={disciplina}
        />
      </div>
    </main>
  )
}

// APLICATIVO PRINCIPAL

function App() {
  const [materias, setMaterias] = useState<Materia[]>(
    carregarMaterias
  )

  const [todosResumos, setTodosResumos] = useState<Resumo[]>(
    carregarResumos
  )

  const [visitas, setVisitas] = useState(0)
  const [pesquisa, setPesquisa] = useState('')

  const [resumoAberto, setResumoAberto] =
    useState<Resumo | null>(null)

  const [editandoResumo, setEditandoResumo] =
    useState<Resumo | null>(null)

  const [mostrarEditor, setMostrarEditor] =
    useState(false)

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false)

  const [nomeNovaMateria, setNomeNovaMateria] =
    useState('')

  const [descricaoNovaMateria, setDescricaoNovaMateria] =
    useState('')

  const [corNovaMateria, setCorNovaMateria] =
    useState('rosa')

  const [erroSalvamento, setErroSalvamento] =
    useState(false)

  const [erroResumos, setErroResumos] =
    useState(false)

  // SALVAMENTO AUTOMÁTICO

  useEffect(() => {
    try {
      localStorage.setItem(
        CHAVE_MATERIAS,
        JSON.stringify(materias)
      )
      setErroSalvamento(false)
    } catch (erro) {
      console.error('Erro ao salvar disciplinas:', erro)
      setErroSalvamento(true)
    }
  }, [materias])

  useEffect(() => {
    const salvou = salvarResumos(todosResumos)
    setErroResumos(!salvou)
  }, [todosResumos])

  // DISCIPLINAS

  function criarMateria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const nome = nomeNovaMateria.trim()

    if (!nome) {
      return
    }

    const novoId =
      Math.max(
        4,
        ...materias.map((item) => item.id),
        ...todosResumos.map((item) => item.materiaId)
      ) + 1

    const novaMateria: Materia = {
      id: novoId,
      nome,
      descricao:
        descricaoNovaMateria.trim() ||
        'Meu novo cantinho de estudos',
      simbolo: '✿',
      cor: corNovaMateria,
    }

    setMaterias((anteriores) => [
      ...anteriores,
      novaMateria,
    ])

    setNomeNovaMateria('')
    setDescricaoNovaMateria('')
    setCorNovaMateria('rosa')
    setMostrarFormulario(false)
  }

  function excluirMateria(materia: Materia) {
    const quantidade = todosResumos.filter(
      (resumo) => resumo.materiaId === materia.id
    ).length

    const mensagem =
      `Excluir a disciplina "${materia.nome}"?` +
      (quantidade > 0
        ? `\n\nEla possui ${quantidade} resumo(s).` +
          '\nEles continuarão salvos, mas ficarão ocultos.'
        : '') +
      '\n\nEsta ação remove o cartão do Brucaffé.'

    if (!window.confirm(mensagem)) {
      return
    }

    setMaterias((anteriores) =>
      anteriores.filter(
        (item) => item.id !== materia.id
      )
    )
  }

  // GERENCIAMENTO DE RESUMOS

  function abrirResumo(resumo: Resumo) {
    setMostrarEditor(false)
    setResumoAberto(resumo)
    window.scrollTo(0, 0)
  }

  function iniciarNovoResumo() {
    if (materias.length === 0) {
      window.alert('Crie uma disciplina primeiro!')
      return
    }

    setEditandoResumo(null)
    setResumoAberto(null)
    setMostrarEditor(true)
    window.scrollTo(0, 0)
  }

  function iniciarEdicao(resumo: Resumo) {
    setEditandoResumo(resumo)
    setResumoAberto(null)
    setMostrarEditor(true)
    window.scrollTo(0, 0)
  }

  function guardarResumo(resumo: Resumo) {
    let resumoSalvo = resumo

    if (editandoResumo) {
      resumoSalvo = {
        ...resumo,
        id: editandoResumo.id,
      }

      setTodosResumos((anteriores) =>
        anteriores.map((item) =>
          item.id === editandoResumo.id
            ? resumoSalvo
            : item
        )
      )
    } else {
      const novoId =
        Math.max(
          0,
          ...todosResumos.map((item) => item.id)
        ) + 1

      resumoSalvo = {
        ...resumo,
        id: novoId,
      }

      setTodosResumos((anteriores) => [
        ...anteriores,
        resumoSalvo,
      ])
    }

    setMostrarEditor(false)
    setEditandoResumo(null)
    setResumoAberto(resumoSalvo)
    window.scrollTo(0, 0)
  }

  function excluirResumo(resumo: Resumo) {
    if (
      !window.confirm(
        `Deseja excluir "${resumo.titulo}"?` +
        '\n\nEsta ação não pode ser desfeita pelo editor.'
      )
    ) {
      return
    }

    setTodosResumos((anteriores) =>
      anteriores.filter(
        (item) => item.id !== resumo.id
      )
    )

    voltarAoCardapio()
  }

  // NAVEGAÇÃO

  function voltarAoCardapio() {
    setResumoAberto(null)
    setEditandoResumo(null)
    setMostrarEditor(false)

    setTimeout(() => {
      document
        .getElementById('materias')
        ?.scrollIntoView()
    }, 0)
  }

  function voltarParaInicio() {
    setResumoAberto(null)
    setEditandoResumo(null)
    setMostrarEditor(false)

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 0)
  }

  function irParaSobre() {
    setResumoAberto(null)
    setMostrarEditor(false)

    setTimeout(() => {
      document
        .getElementById('sobre')
        ?.scrollIntoView()
    }, 0)
  }

  // PESQUISA

  const textoPesquisado = normalizarTexto(
    pesquisa.trim()
  )

  const resultados = textoPesquisado
    ? todosResumos.filter((resumo) => {
        const materia = materias.find(
          (item) => item.id === resumo.materiaId
        )

        if (!materia) {
          return false
        }

        const secoes = resumo.conteudo
          .map(
            (secao) => `${secao.titulo} ${secao.texto}`
          )
          .join(' ')

        const textoCompleto = [
          resumo.titulo,
          resumo.descricao,
          materia.nome,
          materia.descricao,
          secoes,
        ].join(' ')

        return normalizarTexto(textoCompleto).includes(
          textoPesquisado
        )
      })
    : []

  const disciplinaDoResumo = resumoAberto
    ? materias.find(
        (materia) =>
          materia.id === resumoAberto.materiaId
      )?.nome ?? 'Disciplina não encontrada'
    : ''

  const exibindoPaginaPrincipal =
    !resumoAberto && !mostrarEditor

  return (
    <div className="brucaffe">
      <header className="cabecalho">
        <div className="logo">
          brucaffé<span>✳</span>
        </div>

        <nav className="navegacao">
          <a
            href="#inicio"
            onClick={(evento) => {
              evento.preventDefault()
              voltarParaInicio()
            }}
          >
            Início
          </a>

          <a
            href="#materias"
            onClick={(evento) => {
              evento.preventDefault()
              voltarAoCardapio()
            }}
          >
            Matérias
          </a>

          <a
            href="#sobre"
            onClick={(evento) => {
              evento.preventDefault()
              irParaSobre()
            }}
          >
            Sobre
          </a>
        </nav>
      </header>

      {mostrarEditor ? (
        <EditorResumo
          key={editandoResumo?.id ?? 'novo'}
          materias={materias}
          resumoInicial={editandoResumo ?? undefined}
          onSalvar={guardarResumo}
          onCancelar={voltarAoCardapio}
        />
      ) : resumoAberto ? (
        <LeitorResumo
          resumo={resumoAberto}
          disciplina={disciplinaDoResumo}
          onVoltar={voltarAoCardapio}
          onEditar={() => iniciarEdicao(resumoAberto)}
          onExcluir={() => excluirResumo(resumoAberto)}
        />
      ) : null}

      {exibindoPaginaPrincipal && (
        <>
          <main id="inicio" className="conteudo">
            <div className="etiqueta">
              CAFÉ FRESQUINHO + CONHECIMENTO
            </div>

            <h1>
              Seu cantinho de
              <br />
              <span>estudos & café.</span>
            </h1>

            <p className="descricao">
              Um lugar aconchegante para organizar matérias,
              compartilhar resumos e transformar estudos
              em momentos mais leves.
            </p>

            <a
              className="botao-principal"
              href="#materias"
            >
              Explorar matérias →
            </a>

            <div className="cartao-cafe">
              <span className="xicara">☕</span>
              <h2>Um cafezinho para começar?</h2>

              <p>
                Clique para registrar um café imaginário!
              </p>

              <button
                type="button"
                className="botao-cafe"
                onClick={() =>
                  setVisitas((anterior) => anterior + 1)
                }
              >
                Servir café
              </button>

              <p className="contador">
                Cafés servidos: {visitas}
              </p>
            </div>
          </main>

          <section
            id="materias"
            className="secao-materias"
          >
            <div className="etiqueta">
              NOSSO CARDÁPIO
            </div>

            <h2>Escolha sua matéria favorita</h2>

            <p className="subtitulo-materias">
              Cada matéria é uma receita diferente
              de conhecimento.
            </p>

            <div className="area-pesquisa">
              <label
                htmlFor="pesquisa-resumos"
                className="titulo-pesquisa"
              >
                Procurando alguma coisa?
              </label>

              <div className="campo-pesquisa">
                <span aria-hidden="true">⌕</span>

                <input
                  id="pesquisa-resumos"
                  type="search"
                  placeholder="Pesquisar Docker, Java, Git..."
                  value={pesquisa}
                  onChange={(evento) =>
                    setPesquisa(evento.target.value)
                  }
                />
              </div>

              {textoPesquisado && (
                <div className="resultados-pesquisa">
                  <h3>
                    {resultados.length === 1
                      ? '1 resumo encontrado'
                      : `${resultados.length} resumos encontrados`}
                  </h3>

                  {resultados.length > 0 ? (
                    <div className="lista-resultados">
                      {resultados.map((resumo) => {
                        const materia = materias.find(
                          (item) =>
                            item.id === resumo.materiaId
                        )

                        return (
                          <button
                            type="button"
                            key={resumo.id}
                            className="resultado-item"
                            onClick={() => abrirResumo(resumo)}
                          >
                            <strong>{resumo.titulo}</strong>

                            <span>
                              {materia?.nome ?? 'Matéria'}
                              {' • '}
                              {resumo.tempoLeitura} min
                            </span>

                            <small>Abrir resumo →</small>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="pesquisa-vazia">
                      <span aria-hidden="true">☕</span>
                      <p>
                        Ainda não temos esse sabor
                        no cardápio!
                      </p>
                      <small>
                        Experimente pesquisar outro assunto.
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(erroSalvamento || erroResumos) && (
              <p
                className="alerta-salvamento"
                role="alert"
              >
                Não foi possível salvar todos os dados.
                Faça uma cópia antes de fechar a página.
              </p>
            )}

            <div className="acoes-cardapio">
              <button
                type="button"
                className="botao-novo-resumo"
                onClick={iniciarNovoResumo}
              >
                + Novo resumo
              </button>
            </div>

            <div className="grade-materias">
              {materias.map((materia) => (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  resumos={todosResumos}
                  onAbrirResumo={abrirResumo}
                  onExcluir={excluirMateria}
                />
              ))}

              <button
                type="button"
                className="card-nova-materia"
                onClick={() =>
                  setMostrarFormulario(true)
                }
              >
                <span className="icone-adicionar">+</span>
                <strong>Nova disciplina</strong>
                <span>
                  Adicione uma matéria ao seu cardápio
                </span>
              </button>
            </div>

            <p className="mensagem-salvamento">
              Disciplinas e resumos são salvos
              automaticamente neste navegador.
            </p>
          </section>

          {mostrarFormulario && (
            <div
              className="fundo-modal"
              onClick={() =>
                setMostrarFormulario(false)
              }
            >
              <div
                className="modal-disciplina"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal"
                onClick={(evento) =>
                  evento.stopPropagation()
                }
              >
                <button
                  type="button"
                  className="fechar-modal"
                  aria-label="Fechar formulário"
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                >
                  ×
                </button>

                <span className="modal-etiqueta">
                  UM NOVO SABOR NO CARDÁPIO
                </span>

                <h2 id="titulo-modal">
                  Nova disciplina
                </h2>

                <p>
                  Vamos preparar um espaço especial
                  para seus estudos!
                </p>

                <form
                  className="formulario-disciplina"
                  onSubmit={criarMateria}
                >
                  <label htmlFor="nome-disciplina">
                    Nome da disciplina
                  </label>

                  <input
                    id="nome-disciplina"
                    type="text"
                    placeholder="Ex.: Banco de Dados"
                    maxLength={60}
                    value={nomeNovaMateria}
                    onChange={(evento) =>
                      setNomeNovaMateria(
                        evento.target.value
                      )
                    }
                    required
                    autoFocus
                  />

                  <label htmlFor="descricao-disciplina">
                    Descrição
                  </label>

                  <textarea
                    id="descricao-disciplina"
                    placeholder="Ex.: SQL, tabelas e relacionamentos"
                    maxLength={180}
                    rows={3}
                    value={descricaoNovaMateria}
                    onChange={(evento) =>
                      setDescricaoNovaMateria(
                        evento.target.value
                      )
                    }
                  />

                  <label htmlFor="cor-disciplina">
                    Cor do cartão
                  </label>

                  <select
                    id="cor-disciplina"
                    value={corNovaMateria}
                    onChange={(evento) =>
                      setCorNovaMateria(
                        evento.target.value
                      )
                    }
                  >
                    {coresDisponiveis.map((cor) => (
                      <option
                        key={cor.valor}
                        value={cor.valor}
                      >
                        {cor.nome}
                      </option>
                    ))}
                  </select>

                  <div
                    className={`preview-disciplina ${corNovaMateria}`}
                  >
                    <span>✿</span>
                    <strong>
                      {nomeNovaMateria.trim() ||
                        'Sua nova disciplina'}
                    </strong>
                    <small>
                      {descricaoNovaMateria.trim() ||
                        'Seu próximo cantinho de estudos'}
                    </small>
                  </div>

                  <div className="botoes-formulario">
                    <button
                      type="button"
                      className="cancelar-disciplina"
                      onClick={() =>
                        setMostrarFormulario(false)
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="salvar-disciplina"
                      disabled={!nomeNovaMateria.trim()}
                    >
                      Criar disciplina
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <footer id="sobre">
        Feito com carinho e cafeína — Brucaffé
      </footer>
    </div>
  )
}

export default App
