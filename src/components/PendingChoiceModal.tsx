import React, { useState } from 'react';
import { Personagem, PericiaName, Elemento, Ritual, Item } from '../core/types';
import { RITUAIS } from '../data/rituals';

interface PendingChoiceModalProps {
  agent: Personagem;
  pendingChoice: NonNullable<Personagem['habilidadesTrilhaPendentes']>[0];
  onConfirm: (updatedAgent: Personagem) => void;
  onDefer?: () => void;
}

export const PendingChoiceModal: React.FC<PendingChoiceModalProps> = ({ agent, pendingChoice, onConfirm, onDefer }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const { escolha, habilidade } = pendingChoice;

  const handleConfirm = () => {
    const updated = { ...agent };

    updated.habilidadesTrilhaPendentes = updated.habilidadesTrilhaPendentes?.filter(
        p => p.habilidade !== pendingChoice.habilidade
    );

    if (escolha.tipo === 'pericia') {
        const skills = escolha.quantidade === 1 ? [selectedOption] : selectedOptions;
        skills.forEach(skill => {
            const skillName = skill as PericiaName;


            if (habilidade === 'Esperto' || habilidade === 'Carteirada' || habilidade === 'Mascate') {

                 const current = updated.pericias[skillName];
                 if (current === 'Destreinado') updated.pericias[skillName] = 'Treinado';
                 else if (current === 'Treinado') updated.pericias[skillName] = 'Veterano';
                 else if (current === 'Veterano') updated.pericias[skillName] = 'Expert';
            }
        });

        const powerIndex = updated.poderes.findIndex(p => p.nome === habilidade);
        if (powerIndex >= 0) {
            updated.poderes[powerIndex] = {
                ...updated.poderes[powerIndex],
                descricao: `${updated.poderes[powerIndex].descricao} \n\n[Escolha: ${skills.join(', ')}]`
            };
        }
    } else if (escolha.tipo === 'ritual') {
        const ritualName = selectedOption;
        const ritualData = RITUAIS.find(r => r.nome === ritualName);
        if (ritualData) {
            updated.rituais = [...updated.rituais, ritualData];
            const powerIndex = updated.poderes.findIndex(p => p.nome === habilidade);
            if (powerIndex >= 0) {
                updated.poderes[powerIndex] = {
                    ...updated.poderes[powerIndex],
                    descricao: `${updated.poderes[powerIndex].descricao} \n\n[Ritual Escolhido: ${ritualName}]`
                };
            }
        }
    } else if (escolha.tipo === 'elemento' || escolha.tipo === 'arma' || escolha.tipo === 'custom') {
         const choice = selectedOption;
         const powerIndex = updated.poderes.findIndex(p => p.nome === habilidade);
         if (powerIndex >= 0) {
            updated.poderes[powerIndex] = {
                ...updated.poderes[powerIndex],
                descricao: `${updated.poderes[powerIndex].descricao} \n\n[Escolhido: ${choice}]`
            };
        }

        if (habilidade === 'Carteirada' && (choice === 'Diplomacia' || choice === 'Enganação')) {
             const skillName = choice as PericiaName;
             const current = updated.pericias[skillName];
             if (current === 'Destreinado') updated.pericias[skillName] = 'Treinado';
             else if (current === 'Treinado') updated.pericias[skillName] = 'Veterano';
        }
    }

    onConfirm(updated);
  };

  const renderOptions = () => {
      if (escolha.tipo === 'pericia') {
          const allSkills = [
            'Acrobacia', 'Adestramento', 'Artes', 'Atletismo', 'Atualidades',
            'Ciências', 'Crime', 'Diplomacia', 'Enganação', 'Fortitude',
            'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação',
            'Luta', 'Medicina', 'Ocultismo', 'Percepção', 'Pilotagem',
            'Pontaria', 'Profissão', 'Reflexos', 'Religião', 'Sobrevivência',
            'Tática', 'Tecnologia', 'Vontade'
          ];

          if (escolha.quantidade === 1) {
              return (
                  <select
                    className="w-full bg-ordem-ooze border border-ordem-border-light p-2 rounded text-white"
                    value={selectedOption}
                    onChange={e => setSelectedOption(e.target.value)}
                  >
                      <option value="">Selecione uma perícia...</option>
                      {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              );
          } else {
              return (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {allSkills.map(s => (
                          <label key={s} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedOptions.includes(s)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        if (selectedOptions.length < escolha.quantidade) {
                                            setSelectedOptions([...selectedOptions, s]);
                                        }
                                    } else {
                                        setSelectedOptions(selectedOptions.filter(o => o !== s));
                                    }
                                }}
                              />
                              {s}
                          </label>
                      ))}
                  </div>
              );
          }
      }

      if (escolha.tipo === 'ritual') {
          const rituals = RITUAIS.filter(r => r.circulo === 1);
          return (
              <select
                className="w-full bg-ordem-ooze border border-ordem-border-light p-2 rounded text-white"
                value={selectedOption}
                onChange={e => setSelectedOption(e.target.value)}
              >
                  <option value="">Selecione um ritual...</option>
                  {rituals.map(r => <option key={r.nome} value={r.nome}>{r.nome} ({r.elemento})</option>)}
              </select>
          );
      }

      if (escolha.tipo === 'elemento') {
          const elements = ['Sangue', 'Morte', 'Conhecimento', 'Energia'];
          return (
              <div className="flex gap-2">
                  {elements.map(el => (
                      <button
                        key={el}
                        onClick={() => setSelectedOption(el)}
                        className={`px-4 py-2 rounded border ${selectedOption === el ? 'bg-ordem-red border-ordem-red' : 'border-ordem-border-light hover:bg-ordem-ooze'}`}
                      >
                          {el}
                      </button>
                  ))}
              </div>
          );
      }

      if (escolha.tipo === 'custom' && escolha.opcoes) {
           return (
              <div className="flex flex-col gap-2">
                  {escolha.opcoes.map(op => (
                      <button
                        key={op}
                        onClick={() => setSelectedOption(op)}
                        className={`px-4 py-2 rounded border text-left ${selectedOption === op ? 'bg-ordem-red border-ordem-red' : 'border-ordem-border-light hover:bg-ordem-ooze'}`}
                      >
                          {op}
                      </button>
                  ))}
              </div>
          );
      }

      if (escolha.tipo === 'arma') {
           return (
               <input
                 type="text"
                 placeholder="Digite o nome da arma..."
                 className="w-full bg-ordem-ooze border border-ordem-border-light p-2 rounded text-white"
                 value={selectedOption}
                 onChange={e => setSelectedOption(e.target.value)}
               />
           );
      }

      return <p className="text-red-500">Tipo de escolha desconhecido.</p>;
  };

  const isValid = () => {
      if (escolha.quantidade > 1) return selectedOptions.length === escolha.quantidade;
      return !!selectedOption;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ordem-black/80 backdrop-blur-sm p-4">
      <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-serif text-ordem-red mb-2">ESCOLHA NECESSÁRIA</h2>
        <p className="text-ordem-text-secondary mb-4">
            A habilidade <span className="text-white font-bold">{habilidade}</span> requer uma escolha.
        </p>

        <div className="mb-6">
            {renderOptions()}
        </div>

        <div className="flex justify-end gap-2">
            {onDefer && (
                <button
                    onClick={onDefer}
                    className="px-4 py-2 border border-ordem-text-muted text-ordem-text-secondary rounded hover:text-white hover:border-white transition-colors font-mono text-sm"
                >
                    ESCOLHER DEPOIS
                </button>
            )}
            <button
                onClick={handleConfirm}
                disabled={!isValid()}
                className="px-4 py-2 bg-ordem-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wide"
            >
                CONFIRMAR ESCOLHA
            </button>
        </div>
      </div>
    </div>
  );
};
