import { useMemo, useState } from 'react';
import { defaultDressUpState, dressUpCatalog, type DressUpCategory } from '../types/dressUp';
import { loadSaveData, saveSaveData } from '../stores/saveData';

type DressUpScreenProps = {
  onClose: () => void;
};

const categoryLabels: Record<DressUpCategory, string> = {
  tail: 'しっぽ',
  hairAccessory: 'かみかざり',
  tiara: 'ティアラ',
};

export function DressUpScreen({ onClose }: DressUpScreenProps) {
  const [saveData, setSaveData] = useState(() => loadSaveData());

  const itemsByCategory = useMemo(() => {
    return dressUpCatalog.reduce<Record<DressUpCategory, typeof dressUpCatalog>>(
      (groups, item) => {
        groups[item.category] = [...groups[item.category], item];
        return groups;
      },
      {
        tail: [],
        hairAccessory: [],
        tiara: [],
      },
    );
  }, []);

  const selectItem = (category: DressUpCategory, id: string, unlocked: boolean) => {
    if (!unlocked) {
      return;
    }

    setSaveData((current) => ({
      ...current,
      dressUp: {
        ...current.dressUp,
        [category]: id,
      },
    }));
  };

  const saveAndClose = () => {
    saveSaveData(saveData);
    onClose();
  };

  return (
    <section className="overlay-panel" aria-label="おきがえ">
      <div className="overlay-card dress-up-card">
        <h1>おきがえ</h1>
        <div className="mermaid-preview">
          <span className="preview-tiara">{saveData.dressUp.tiara === defaultDressUpState.tiara ? '♛' : '✦'}</span>
          <span className="preview-face">🧜‍♀️</span>
          <span className={`preview-tail ${saveData.dressUp.tail}`}>しっぽ</span>
        </div>
        {(Object.keys(categoryLabels) as DressUpCategory[]).map((category) => (
          <div className="dress-row" key={category}>
            <h2>{categoryLabels[category]}</h2>
            <div className="choice-grid compact">
              {itemsByCategory[category].map((item) => {
                const unlocked = saveData.unlockedDressUpItemIds.includes(item.id);
                const selected = saveData.dressUp[category] === item.id;
                return (
                  <button
                    className={`choice-button ${selected ? 'is-selected' : ''}`}
                    disabled={!unlocked}
                    key={item.id}
                    onClick={() => selectItem(category, item.id, unlocked)}
                    type="button"
                  >
                    <span className="choice-icon">{unlocked ? '✨' : '🔒'}</span>
                    <span>{unlocked ? item.name : '？？？'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="overlay-actions">
          <button className="soft-button" onClick={onClose} type="button">
            もどる
          </button>
          <button className="primary-button" onClick={saveAndClose} type="button">
            けってい
          </button>
        </div>
      </div>
    </section>
  );
}
