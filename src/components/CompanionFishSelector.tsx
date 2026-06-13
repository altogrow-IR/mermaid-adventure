import { useMemo, useState } from 'react';
import { companionFishCatalog, type CompanionFishId } from '../types/companionFish';
import { loadSaveData, saveSaveData } from '../stores/saveData';

type CompanionFishSelectorProps = {
  onClose: () => void;
};

export function CompanionFishSelector({ onClose }: CompanionFishSelectorProps) {
  const [saveData, setSaveData] = useState(() => loadSaveData());

  const fishList = useMemo(
    () =>
      companionFishCatalog.map((fish) => ({
        ...fish,
        unlocked: saveData.companionFish.unlockedIds.includes(fish.id),
        selected: saveData.companionFish.selectedIds.includes(fish.id),
      })),
    [saveData],
  );

  const toggleFish = (id: CompanionFishId, unlocked: boolean) => {
    if (!unlocked) {
      return;
    }

    setSaveData((current) => {
      const selectedIds = current.companionFish.selectedIds.includes(id)
        ? current.companionFish.selectedIds.filter((selectedId) => selectedId !== id)
        : [...current.companionFish.selectedIds, id].slice(0, 3);

      return {
        ...current,
        companionFish: {
          ...current.companionFish,
          selectedIds: selectedIds.length > 0 ? selectedIds : ['clownfish'],
        },
      };
    });
  };

  const saveAndClose = () => {
    saveSaveData(saveData);
    onClose();
  };

  return (
    <section className="overlay-panel" aria-label="なかまをえらぶ">
      <div className="overlay-card">
        <h1>なかま</h1>
        <div className="choice-grid">
          {fishList.map((fish) => (
            <button
              className={`choice-button ${fish.selected ? 'is-selected' : ''}`}
              disabled={!fish.unlocked}
              key={fish.id}
              onClick={() => toggleFish(fish.id, fish.unlocked)}
              type="button"
            >
              <span className="choice-icon">{fish.unlocked ? '🐠' : '🔒'}</span>
              <span>{fish.unlocked ? fish.name : '？？？'}</span>
            </button>
          ))}
        </div>
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
