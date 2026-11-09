
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
      <header className="documento-cabecalho">
        <div className="documento-instituicao">
          <strong>CEUB</strong>
          <span>Centro Universitário de Brasília</span>
        </div>

        <div className="documento-informacoes">
          <p>Curso: Ciência da Computação</p>
          <p>Disciplina: {disciplina}</p>
        </div>
      </header>

      <div className="documento-titulo">
        <h1>{resumo.titulo}</h1>

        {resumo.descricao && (
          <p>{resumo.descricao}</p>
        )}
      </div>

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
