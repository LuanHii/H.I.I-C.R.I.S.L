import React, { useState, useEffect } from 'react';
import { Ameaca, AtributoKey, Elemento } from '../../core/types';

interface MonsterEditorProps {
  initialData?: Ameaca;
  onSave: (monster: Ameaca) => void;
  onCancel: () => void;
}

const DEFAULT_MONSTER: Ameaca = {
  nome: '',
  vd: 0,
  tipo: 'Sangue',
  tamanho: 'Médio',
  vida: 10,
  defesa: 10,
  atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
  pericias: {},
  acoes: [],
  habilidades: [],
  livro: 'Regras Básicas',
  resistencias: [],
  imunidades: [],
  vulnerabilidades: []
};

export const MonsterEditor: React.FC<MonsterEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [monster, setMonster] = useState<Ameaca>(initialData || DEFAULT_MONSTER);

  const handleChange = (field: keyof Ameaca, value: any) => {
    setMonster(prev => ({ ...prev, [field]: value }));
  };

  const handleAtributo = (attr: AtributoKey, value: number) => {
    setMonster(prev => ({
      ...prev,
      atributos: { ...prev.atributos, [attr]: value }
    }));
  };

  const addArrayItem = (field: 'acoes' | 'habilidades') => {
    if (field === 'acoes') {
      setMonster(prev => ({
        ...prev,
        acoes: [...prev.acoes, { nome: 'Nova Ação', descricao: 'Descrição da ação', tipo: 'Padrão' }]
      }));
    } else {
      setMonster(prev => ({
        ...prev,
        habilidades: [...prev.habilidades, { nome: 'Nova Habilidade', descricao: 'Descrição da habilidade' }]
      }));
    }
  };

  const updateArrayItem = (field: 'acoes' | 'habilidades', index: number, subField: string, value: string) => {
    setMonster(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [subField]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const removeArrayItem = (field: 'acoes' | 'habilidades', index: number) => {
    setMonster(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-ordem-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-ordem-ooze border border-ordem-border-light rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <div className="flex justify-between items-center mb-6 border-b border-ordem-border pb-4">
          <h2 className="text-2xl font-serif text-white">Editor de Ameaça</h2>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-ordem-text-secondary hover:text-white border border-ordem-border-light rounded">Cancelar</button>
            <button onClick={() => onSave(monster)} className="px-4 py-2 text-sm bg-ordem-red text-white rounded hover:bg-red-700">Salvar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-1">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Nome</label>
                <input
                  type="text"
                  value={monster.nome}
                  onChange={e => handleChange('nome', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">VD</label>
                <input
                  type="number"
                  value={monster.vd}
                  onChange={e => handleChange('vd', Number(e.target.value))}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Elemento</label>
                <select
                  value={monster.tipo}
                  onChange={e => handleChange('tipo', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                >
                  {['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(el => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Tamanho</label>
                <select
                  value={monster.tamanho}
                  onChange={e => handleChange('tamanho', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                >
                  {['Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-1 mt-6">Atributos</h3>
            <div className="grid grid-cols-5 gap-2">
              {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map(attr => (
                <div key={attr} className="text-center">
                  <label className="block text-xs text-ordem-text-muted mb-1">{attr}</label>
                  <input
                    type="number"
                    value={monster.atributos[attr]}
                    onChange={e => handleAtributo(attr, Number(e.target.value))}
                    className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-1 py-2 text-center text-white focus:border-ordem-red outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-1">Combate</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Vida</label>
                <input
                  type="number"
                  value={monster.vida}
                  onChange={e => handleChange('vida', Number(e.target.value))}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Defesa</label>
                <input
                  type="number"
                  value={monster.defesa}
                  onChange={e => handleChange('defesa', Number(e.target.value))}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Deslocamento</label>
                <input
                  type="text"
                  value={monster.deslocamento || ''}
                  onChange={e => handleChange('deslocamento', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-3 py-2 text-white focus:border-ordem-red outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Fortitude</label>
                <input
                  type="text"
                  value={monster.fortitude || ''}
                  onChange={e => handleChange('fortitude', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-2 py-2 text-white focus:border-ordem-red outline-none text-sm"
                  placeholder="Ex: 2d20+5"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Reflexos</label>
                <input
                  type="text"
                  value={monster.reflexos || ''}
                  onChange={e => handleChange('reflexos', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-2 py-2 text-white focus:border-ordem-red outline-none text-sm"
                  placeholder="Ex: O"
                />
              </div>
              <div>
                <label className="block text-xs text-ordem-text-muted mb-1">Vontade</label>
                <input
                  type="text"
                  value={monster.vontade || ''}
                  onChange={e => handleChange('vontade', e.target.value)}
                  className="w-full bg-ordem-black/40 border border-ordem-border-light rounded px-2 py-2 text-white focus:border-ordem-red outline-none text-sm"
                  placeholder="Ex: 3d20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2 border-b border-ordem-border pb-1">
              <h3 className="text-ordem-red font-mono text-sm uppercase">Ações</h3>
              <button onClick={() => addArrayItem('acoes')} className="text-xs text-green-500 hover:text-green-400">+ Adicionar</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {monster.acoes.map((acao, idx) => (
                <div key={idx} className="bg-ordem-black/40 p-3 rounded border border-ordem-border">
                  <div className="flex justify-between mb-2">
                    <input
                      value={acao.nome}
                      onChange={e => updateArrayItem('acoes', idx, 'nome', e.target.value)}
                      className="bg-transparent border-b border-ordem-border-light text-white text-sm font-bold w-2/3 focus:border-ordem-red outline-none"
                      placeholder="Nome da Ação"
                    />
                    <button onClick={() => removeArrayItem('acoes', idx)} className="text-red-500 text-xs">Remover</button>
                  </div>
                  <textarea
                    value={acao.descricao}
                    onChange={e => updateArrayItem('acoes', idx, 'descricao', e.target.value)}
                    className="w-full bg-transparent text-ordem-white-muted text-xs resize-none focus:bg-ordem-black/20 outline-none rounded p-1"
                    rows={2}
                    placeholder="Descrição..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 border-b border-ordem-border pb-1">
              <h3 className="text-ordem-red font-mono text-sm uppercase">Habilidades</h3>
              <button onClick={() => addArrayItem('habilidades')} className="text-xs text-green-500 hover:text-green-400">+ Adicionar</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {monster.habilidades.map((hab, idx) => (
                <div key={idx} className="bg-ordem-black/40 p-3 rounded border border-ordem-border">
                  <div className="flex justify-between mb-2">
                    <input
                      value={hab.nome}
                      onChange={e => updateArrayItem('habilidades', idx, 'nome', e.target.value)}
                      className="bg-transparent border-b border-ordem-border-light text-white text-sm font-bold w-2/3 focus:border-ordem-red outline-none"
                      placeholder="Nome da Habilidade"
                    />
                    <button onClick={() => removeArrayItem('habilidades', idx)} className="text-red-500 text-xs">Remover</button>
                  </div>
                  <textarea
                    value={hab.descricao}
                    onChange={e => updateArrayItem('habilidades', idx, 'descricao', e.target.value)}
                    className="w-full bg-transparent text-ordem-white-muted text-xs resize-none focus:bg-ordem-black/20 outline-none rounded p-1"
                    rows={2}
                    placeholder="Descrição..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
