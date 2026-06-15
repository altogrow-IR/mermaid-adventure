import { useMemo, useState } from 'react';
import { buyItem, canBuyItem, isPurchased } from '../game/systems/shopSystem';
import { loadSaveData, saveSaveData } from '../stores/saveData';
import { CASTLE_SHOP_ITEMS, STAGE_SHOP_ITEMS, type ShopItem } from '../types/shop';
import { shopPreviewAssets } from './shopPreviewAssets';

type ShopScreenProps = {
  onClose: () => void;
};

const itemGroups = [
  { title: 'あたらしい うみ', items: STAGE_SHOP_ITEMS },
  { title: 'うみの おしろ', items: CASTLE_SHOP_ITEMS },
];

export function ShopScreen({ onClose }: ShopScreenProps) {
  const [saveData, setSaveData] = useState(() => loadSaveData());
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [message, setMessage] = useState('');

  const sparkleText = useMemo(() => saveData.sparklePoint.toLocaleString('ja-JP'), [saveData.sparklePoint]);

  const requestBuy = (item: ShopItem) => {
    if (isPurchased(saveData, item.id)) {
      setMessage('もう かったよ！');
      return;
    }

    if (!canBuyItem(saveData, item)) {
      setMessage('キラキラが もうすこし いるよ\nまた あそんで あつめよう♪');
      return;
    }

    setConfirmItem(item);
    setMessage('');
  };

  const confirmBuy = () => {
    if (!confirmItem) {
      return;
    }

    const nextSaveData = buyItem(saveData, confirmItem);
    saveSaveData(nextSaveData);
    setSaveData(nextSaveData);
    setMessage(confirmItem.type === 'stage' ? 'かったよ！\nあたらしい うみで あそべるよ！' : 'かったよ！\nおしろを かざれるよ！');
    setConfirmItem(null);
  };

  return (
    <section className="overlay-panel" aria-label="おみせ">
      <div className="overlay-card shop-card">
        <header className="shop-header">
          <h1>おみせ</h1>
          <div className="sparkle-balance" aria-label="いまのキラキラ">
            <span>キラキラ</span>
            <strong>{sparkleText}こ</strong>
          </div>
        </header>

        {message && <p className="shop-message">{message}</p>}

        {itemGroups.map((group) => (
          <section className="shop-group" key={group.title}>
            <h2>{group.title}</h2>
            <div className="shop-grid">
              {group.items.map((item) => {
                const purchased = isPurchased(saveData, item.id);
                const affordable = canBuyItem(saveData, item);

                return (
                  <article className={`shop-item ${purchased ? 'is-owned' : ''}`} key={item.id}>
                    <div className={`shop-item-preview ${item.imageKey}`} aria-hidden="true">
                      {shopPreviewAssets[item.imageKey] && <img alt="" src={shopPreviewAssets[item.imageKey]} />}
                    </div>
                    <div className="shop-item-body">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <strong className="shop-price">キラキラ {item.price}こ</strong>
                    </div>
                    <button
                      className={`shop-buy-button ${purchased ? 'is-owned' : ''}`}
                      disabled={purchased}
                      onClick={() => requestBuy(item)}
                      type="button"
                    >
                      {purchased ? 'かったよ！' : affordable ? 'かう' : 'あとで'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <div className="shop-shortcuts">
          <button className="soft-button" onClick={() => window.dispatchEvent(new Event('mermaid:open-stage-select'))} type="button">
            うみをえらぶ
          </button>
          <button className="soft-button" onClick={() => window.dispatchEvent(new Event('mermaid:open-castle-select'))} type="button">
            おしろをえらぶ
          </button>
        </div>

        <div className="overlay-actions">
          <button className="primary-button" onClick={onClose} type="button">
            もどる
          </button>
        </div>
      </div>

      {confirmItem && (
        <div className="confirm-panel" role="dialog" aria-modal="true" aria-label="かうまえのかくにん">
          <div className="confirm-card">
            <h2>これを かう？</h2>
            <p>
              {confirmItem.name}
              <br />
              キラキラ {confirmItem.price}こ
            </p>
            <div className="overlay-actions">
              <button className="soft-button" onClick={() => setConfirmItem(null)} type="button">
                やめる
              </button>
              <button className="primary-button" onClick={confirmBuy} type="button">
                かう
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
