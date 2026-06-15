import { useMemo, useState } from 'react';
import { selectCastle } from '../game/systems/shopSystem';
import { loadSaveData, saveSaveData } from '../stores/saveData';
import { CASTLE_SHOP_ITEMS, type CastleId } from '../types/shop';
import { shopPreviewAssets } from './shopPreviewAssets';

type CastleSelectScreenProps = {
  onClose: () => void;
};

const noCastle = {
  id: 'none' as CastleId,
  name: 'おしろなし',
  description: 'すっきりした うみで あそぶ',
  imageKey: 'castleNone',
};

export function CastleSelectScreen({ onClose }: CastleSelectScreenProps) {
  const [saveData, setSaveData] = useState(() => loadSaveData());
  const [message, setMessage] = useState('');

  const castles = useMemo(
    () => [
      noCastle,
      ...CASTLE_SHOP_ITEMS.map((item) => ({
        id: item.id as CastleId,
        name: item.name,
        description: item.description,
        imageKey: item.imageKey,
      })),
    ],
    [],
  );

  const chooseCastle = (castleId: CastleId, unlocked: boolean) => {
    if (!unlocked) {
      setMessage('まだ かぎが かかっているよ\nおみせで みてみよう♪');
      return;
    }

    const nextSaveData = selectCastle(saveData, castleId);
    saveSaveData(nextSaveData);
    setSaveData(nextSaveData);
    setMessage(castleId === 'none' ? 'おしろなしに したよ！' : 'おしろを かざったよ！');
  };

  return (
    <section className="overlay-panel" aria-label="おしろをえらぶ">
      <div className="overlay-card shop-card">
        <h1>おしろをえらぶ</h1>
        {message && <p className="shop-message">{message}</p>}
        <div className="shop-grid select-grid">
          {castles.map((castle) => {
            const unlocked = castle.id === 'none' || saveData.purchasedItemIds.includes(castle.id);
            const selected = saveData.selectedCastleId === castle.id;

            return (
              <button
                className={`select-card ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                key={castle.id}
                onClick={() => chooseCastle(castle.id, unlocked)}
                type="button"
              >
                <span className={`shop-item-preview ${castle.imageKey}`} aria-hidden="true">
                  {shopPreviewAssets[castle.imageKey] && <img alt="" src={shopPreviewAssets[castle.imageKey]} />}
                </span>
                <strong>{castle.name}</strong>
                <span>{unlocked ? castle.description : 'おみせで かえるよ'}</span>
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
