import { useMemo, useState } from 'react';
import { selectStage } from '../game/systems/shopSystem';
import { loadSaveData, saveSaveData } from '../stores/saveData';
import { STAGE_SHOP_ITEMS, type StageId } from '../types/shop';
import { shopPreviewAssets } from './shopPreviewAssets';

type StageSelectScreenProps = {
  onClose: () => void;
};

const defaultStage = {
  id: 'stage_default' as StageId,
  name: 'いつもの うみ',
  description: 'さいしょから あそべる うみ',
  imageKey: 'stageDefault',
};

export function StageSelectScreen({ onClose }: StageSelectScreenProps) {
  const [saveData, setSaveData] = useState(() => loadSaveData());
  const [message, setMessage] = useState('');

  const stages = useMemo(
    () => [
      defaultStage,
      ...STAGE_SHOP_ITEMS.map((item) => ({
        id: item.id as StageId,
        name: item.name,
        description: item.description,
        imageKey: item.imageKey,
      })),
    ],
    [],
  );

  const chooseStage = (stageId: StageId, unlocked: boolean) => {
    if (!unlocked) {
      setMessage('まだ かぎが かかっているよ\nおみせで みてみよう♪');
      return;
    }

    const nextSaveData = selectStage(saveData, stageId);
    saveSaveData(nextSaveData);
    setSaveData(nextSaveData);
    setMessage('この うみで あそぶよ！');
  };

  return (
    <section className="overlay-panel" aria-label="うみをえらぶ">
      <div className="overlay-card shop-card">
        <h1>うみをえらぶ</h1>
        {message && <p className="shop-message">{message}</p>}
        <div className="shop-grid select-grid">
          {stages.map((stage) => {
            const unlocked = stage.id === 'stage_default' || saveData.purchasedItemIds.includes(stage.id);
            const selected = saveData.selectedStageId === stage.id;

            return (
              <button
                className={`select-card ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                key={stage.id}
                onClick={() => chooseStage(stage.id, unlocked)}
                type="button"
              >
                <span className={`shop-item-preview ${stage.imageKey}`} aria-hidden="true">
                  {shopPreviewAssets[stage.imageKey] && <img alt="" src={shopPreviewAssets[stage.imageKey]} />}
                </span>
                <strong>{stage.name}</strong>
                <span>{unlocked ? stage.description : 'おみせで かえるよ'}</span>
                <em>{selected ? 'えらんでるよ！' : unlocked ? 'これにする' : 'ロック'}</em>
              </button>
            );
          })}
        </div>
        <div className="overlay-actions">
          <button className="soft-button" onClick={() => window.dispatchEvent(new Event('mermaid:open-shop'))} type="button">
            おみせ
          </button>
          <button className="primary-button" onClick={onClose} type="button">
            もどる
          </button>
        </div>
      </div>
    </section>
  );
}
