
import type { Resumo } from './data/resumos'
import './modeloAcademico.css'

type Props = {
  resumo: Resumo
  disciplina: string
}

function ModeloAcademico({
  resumo,
  disciplina,
}: Props) {
  return (
    <article className="documento-academico">
      {/* CABEÇALHO INSTITUCIONAL */}

      <header className="documento-cabecalho">
        <div className="documento-instituicao">
          <img
            src="/imagens/logo-ceub.png"
            alt="Logotipo do CEUB"
            className="documento-logo"
          />

          <span>
            Centro Universitário de Brasília
          </span>
        </div>

        <div className="documento-informacoes">
          <p>
            <strong>Curso:</strong> Ciência da Computação
          </p>

          <p>
            <strong>Disciplina:</strong> {disciplina}
          </p>
        </div>
      </header>

      {/* TÍTULO DO RESUMO */}

      <div className="documento-titulo">
        <h1>{resumo.titulo}</h1>

        {resumo.descricao && (
          <p>{resumo.descricao}</p>
        )}
      </div>

      {/* CONTEÚDO */}

      <div className="documento-conteudo">
        {resumo.conteudo.map((secao, indice) => (
          <section
            key={indice}
            className="documento-secao"
          >
            {secao.titulo && (
              <h2>{secao.titulo}</h2>
            )}

            <p>{secao.texto}</p>
          </section>
        ))}
      </div>
    </article>
  )
}

export default ModeloAcademico
