
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './backup.css'

const CHAVE_MATERIAS = 'brucaffe-disciplinas-v1'
const CHAVE_RESUMOS = 'brucaffe-resumos-v1'

type MateriaSalva = {
  id: number
  nome: string
  descricao: string
  simbolo: string
  cor: string
}

type ResumoSalvo = {
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

type BackupV1 = {
  aplicativo: 'Brucaffé'
  versao: 1
  criadoEm: string
  disciplinas: MateriaSalva[]
}

type BackupV2 = {
  aplicativo: 'Brucaffé'
  versao: 2
  criadoEm: string
  disciplinas: MateriaSalva[]
  resumos: ResumoSalvo[]
}

function validarDisciplinas(
  dados: unknown
): dados is MateriaSalva[] {
  if (!Array.isArray(dados)) return false

  const ids = new Set<number>()

  return dados.every((item) => {
    if (
      item === null ||
      typeof item !== 'object' ||
      !Number.isSafeInteger(item.id) ||
      item.id < 1 ||
      typeof item.nome !== 'string' ||
      !item.nome.trim() ||
      typeof item.descricao !== 'string' ||
      typeof item.simbolo !== 'string' ||
      typeof item.cor !== 'string' ||
      ids.has(item.id)
    ) {
      return false
    }

    ids.add(item.id)
    return true
  })
}

function validarResumos(
  dados: unknown
): dados is ResumoSalvo[] {
  if (!Array.isArray(dados)) return false

  const ids = new Set<number>()

  return dados.every((item) => {
    if (
      item === null ||
      typeof item !== 'object' ||
      !Number.isSafeInteger(item.id) ||
      item.id < 1 ||
      !Number.isSafeInteger(item.materiaId) ||
      item.materiaId < 1 ||
      typeof item.titulo !== 'string' ||
      !item.titulo.trim() ||
      typeof item.descricao !== 'string' ||
      typeof item.tempoLeitura !== 'number' ||
      !Number.isFinite(item.tempoLeitura) ||
      !Array.isArray(item.conteudo) ||
      ids.has(item.id)
    ) {
      return false
    }

    const secoesValidas = item.conteudo.every(
      (secao: unknown) =>
        secao !== null &&
        typeof secao === 'object' &&
        'titulo' in secao &&
        'texto' in secao &&
        typeof secao.titulo === 'string' &&
        typeof secao.texto === 'string'
    )

    if (!secoesValidas) return false

    ids.add(item.id)
    return true
  })
}

function validarBackup(
  dados: unknown
): dados is BackupV1 | BackupV2 {
  if (
    dados === null ||
    typeof dados !== 'object'
  ) {
    return false
  }

  const arquivo = dados as Record<string, unknown>

  if (
    arquivo.aplicativo !== 'Brucaffé' ||
    typeof arquivo.criadoEm !== 'string' ||
    !validarDisciplinas(arquivo.disciplinas)
  ) {
    return false
  }

  if (arquivo.versao === 1) {
    return true
  }

  if (arquivo.versao === 2) {
    return validarResumos(arquivo.resumos)
  }

  return false
}

function BackupManager() {
  const [aberto, setAberto] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)

  const inputArquivo = useRef<HTMLInputElement>(null)

  function exportarBackup() {
    try {
      const materiasSalvas =
        localStorage.getItem(CHAVE_MATERIAS)

      const resumosSalvos =
        localStorage.getItem(CHAVE_RESUMOS)

      if (
        materiasSalvas === null ||
        resumosSalvos === null
      ) {
        throw new Error(
          'Os dados ainda não estão disponíveis.'
        )
      }

      const disciplinas: unknown =
        JSON.parse(materiasSalvas)

      const resumos: unknown =
        JSON.parse(resumosSalvos)

      if (
        !validarDisciplinas(disciplinas) ||
        !validarResumos(resumos)
      ) {
        throw new Error('Dados inválidos.')
      }

      const backup: BackupV2 = {
        aplicativo: 'Brucaffé',
        versao: 2,
        criadoEm: new Date().toISOString(),
        disciplinas,
        resumos,
      }

      const conteudo = JSON.stringify(backup, null, 2)

      const arquivo = new Blob([conteudo], {
        type: 'application/json',
      })

      const endereco = URL.createObjectURL(arquivo)

      const data = new Date()
        .toISOString()
        .slice(0, 10)

      const link = document.createElement('a')

      link.href = endereco
      link.download = `brucaffe-backup-${data}.json`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => {
        URL.revokeObjectURL(endereco)
      }, 1000)

      setErro(false)
      setMensagem(
        `Backup preparado! ${disciplinas.length} ` +
        `disciplina(s) e ${resumos.length} resumo(s).`
      )
    } catch (falha) {
      console.error('Erro ao exportar:', falha)
      setErro(true)
      setMensagem(
        'Não foi possível exportar os dados. ' +
        'Verifique o armazenamento do navegador.'
      )
    }
  }

  function selecionarArquivo() {
    inputArquivo.current?.click()
  }

  async function restaurarBackup(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0]

    if (!arquivo) return

    evento.target.value = ''

    try {
      if (arquivo.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande.')
      }

      const texto = await arquivo.text()
      const dados: unknown = JSON.parse(texto)

      if (!validarBackup(dados)) {
        throw new Error('Backup inválido.')
      }

      const backup = dados

      const antigo = backup.versao === 1

      const quantidadeResumos =
        backup.versao === 2
          ? backup.resumos.length
          : 0

      const explicacao = antigo
        ? 'Este é um backup antigo, que contém apenas ' +
          'disciplinas. Seus resumos atuais serão mantidos.'
        : 'As disciplinas e os resumos atuais serão ' +
          'substituídos pelos dados deste arquivo.'

      const confirmado = window.confirm(
        'Deseja restaurar este backup?\n\n' +
        `Disciplinas: ${backup.disciplinas.length}\n` +
        `Resumos no arquivo: ${quantidadeResumos}\n\n` +
        explicacao +
        '\n\nRecomendamos exportar um backup atual antes.'
      )

      if (!confirmado) return

      // Guarda os dados anteriores caso ocorra um erro.
      const materiasAnteriores =
        localStorage.getItem(CHAVE_MATERIAS)

      const resumosAnteriores =
        localStorage.getItem(CHAVE_RESUMOS)

      try {
        localStorage.setItem(
          CHAVE_MATERIAS,
          JSON.stringify(backup.disciplinas)
        )

        // Backups antigos não substituem os resumos.
        if (backup.versao === 2) {
          localStorage.setItem(
            CHAVE_RESUMOS,
            JSON.stringify(backup.resumos)
          )
        }
      } catch (falha) {
        // Tenta recuperar os dados anteriores.
        if (materiasAnteriores === null) {
          localStorage.removeItem(CHAVE_MATERIAS)
        } else {
          localStorage.setItem(
            CHAVE_MATERIAS,
            materiasAnteriores
          )
        }

        if (resumosAnteriores === null) {
          localStorage.removeItem(CHAVE_RESUMOS)
        } else {
          localStorage.setItem(
            CHAVE_RESUMOS,
            resumosAnteriores
          )
        }

        throw falha
      }

      window.location.reload()
    } catch (falha) {
      console.error('Erro ao restaurar:', falha)
      setErro(true)
      setMensagem(
        'Não foi possível restaurar o backup. ' +
        'Confira se o arquivo JSON é válido.'
      )
    }
  }

  return (
    <div className="backup-area">
      <button
        type="button"
        className="backup-atalho"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-controls="backup-painel"
      >
        {aberto ? '✕ Fechar' : '◈ Meu backup'}
      </button>

      {aberto && (
        <section
          id="backup-painel"
          className="backup-painel"
          aria-label="Gerenciar backup"
        >
          <div className="backup-cabecalho">
            <span className="backup-icone">☕</span>

            <div>
              <h2>Meu backup</h2>
              <p>Seu cantinho de estudos protegido!</p>
            </div>
          </div>

          <p className="backup-descricao">
            Guarde suas disciplinas e todos os seus
            resumos em um arquivo de segurança.
          </p>

          <button
            type="button"
            className="backup-exportar"
            onClick={exportarBackup}
          >
            ↓ Exportar backup completo
          </button>

          <button
            type="button"
            className="backup-restaurar"
            onClick={selecionarArquivo}
          >
            ↑ Restaurar backup
          </button>

          <input
            ref={inputArquivo}
            type="file"
            accept=".json,application/json"
            onChange={restaurarBackup}
            className="backup-input-oculto"
            aria-label="Selecionar arquivo de backup"
          />

          {mensagem && (
            <p
              className={
                erro
                  ? 'backup-mensagem erro'
                  : 'backup-mensagem'
              }
              role="status"
            >
              {mensagem}
            </p>
          )}

          <p className="backup-aviso">
            O backup completo guarda disciplinas,
            resumos e seções. Restaurar um backup
            novo substitui os dados atuais.
          </p>
        </section>
      )}
    </div>
  )
}

export default BackupManager
