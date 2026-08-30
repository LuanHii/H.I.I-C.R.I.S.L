import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assinarFichaOp2, ehDocumentoOp2 } from '../nuvem/agentes';

const onSnapshotMock = vi.fn();

vi.mock('@/core/firebase/config', () => ({ db: {}, auth: { currentUser: null } }));

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => ({ caminho: args }),
  onSnapshot: (...args: unknown[]) => onSnapshotMock(...args),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));


type Ouvinte = (referencia: { exists: () => boolean; data: () => unknown }) => void;
type OuvinteDeErro = (erro: unknown) => void;

function capturarOuvintes(): { proximo: Ouvinte; erro: OuvinteDeErro } {
  const [, proximo, erro] = onSnapshotMock.mock.calls[0] as [unknown, Ouvinte, OuvinteDeErro];
  return { proximo, erro };
}

describe('assinatura da ficha publica de Ordem 2', () => {
  beforeEach(() => {
    onSnapshotMock.mockReset();
    onSnapshotMock.mockReturnValue(() => undefined);
  });

  it('um documento op2 chega ao ouvinte', () => {
    const recebidos: unknown[] = [];
    assinarFichaOp2('id', (ficha) => recebidos.push(ficha));

    const documento = { sistema: 'op2', nome: 'Alan' };
    capturarOuvintes().proximo({ exists: () => true, data: () => documento });

    expect(recebidos).toEqual([documento]);
  });

  it('um documento do Ordem 1 e tratado como ausente, para a pagina cair no fluxo antigo', () => {
    const recebidos: unknown[] = [];
    assinarFichaOp2('id', (ficha) => recebidos.push(ficha));

    capturarOuvintes().proximo({ exists: () => true, data: () => ({ classe: 'Combatente' }) });

    expect(recebidos).toEqual([null]);
  });

  it('documento inexistente resolve como ausente', () => {
    const recebidos: unknown[] = [];
    assinarFichaOp2('id', (ficha) => recebidos.push(ficha));

    capturarOuvintes().proximo({ exists: () => false, data: () => undefined });

    expect(recebidos).toEqual([null]);
  });

  it('ERRO na assinatura resolve como ausente em vez de deixar pendente para sempre', () => {
    const recebidos: unknown[] = [];
    assinarFichaOp2('id', (ficha) => recebidos.push(ficha));

    const { erro } = capturarOuvintes();
    expect(erro).toBeTypeOf('function');

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    erro(new Error('permission-denied'));

    expect(recebidos).toEqual([null]);
  });

  it('a assinatura sempre registra um ouvinte de erro: sem ele a ficha do Ordem 1 trava no spinner', () => {
    assinarFichaOp2('id', () => undefined);
    expect(onSnapshotMock.mock.calls[0]).toHaveLength(3);
  });
});

describe('discriminante do documento', () => {
  it('so reconhece op2 pelo campo sistema', () => {
    expect(ehDocumentoOp2({ sistema: 'op2' })).toBe(true);
    expect(ehDocumentoOp2({ sistema: 'op1' })).toBe(false);
    expect(ehDocumentoOp2({ classe: 'Ocultista', nex: 25 })).toBe(false);
    expect(ehDocumentoOp2(null)).toBe(false);
    expect(ehDocumentoOp2(undefined)).toBe(false);
    expect(ehDocumentoOp2('op2')).toBe(false);
  });
});
