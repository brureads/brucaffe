
import type { Resumo } from './data/resumos'
import './modeloAcademico.css'

type Props = {
  resumo: Resumo
  disciplina: string
}

function ModeloAcademico({
  resumo,
}: Props) {
  return (
    <article className="documento-academico">

      {/* LOGOTIPO INSTITUCIONAL */}

      <header className="documento-cabecalho">
        <img
          src="/imagens/logo-ceub.png"
          alt="Logotipo do CEUB"
          className="documento-logo"
        />
      </header>

      {/* TÍTULO DO RESUMO */}

      <div className="documento-titulo">
        <h1>{resumo.titulo}</h1>

        {resumo.descricao && (
          <p>{resumo.descricao}</p>
        )}
      </div>

      {/* CONTEÚDO DO RESUMO */}

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
