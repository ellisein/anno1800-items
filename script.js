let allItems = [];

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function decomposeKorean(str) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const index = code - 0xAC00;
            const cho = Math.floor(index / 588);
            const jung = Math.floor((index - (cho * 588)) / 28);
            const jong = index % 28;
            result += CHO[cho] + JUNG[jung] + (jong ? JONG[jong] : "");
        } else {
            result += str[i];
        }
    }
    return result;
}

async function fetchItems() {
    try {
        const response = await fetch('items.json');
        const rawData = await response.json();
        
        allItems = rawData.map(item => {
            const rawText = `
                ${item.name || ''} 
                ${item.rarity || ''}
                ${item.targets ? item.targets.join('') : ''} 
                ${JSON.stringify(item.effects || {})}
            `.replace(/\s+/g, '').toLowerCase();
            
            return {
                ...item,
                searchRaw: rawText,
                searchJamo: decomposeKorean(rawText)
            };
        });

        renderItems(allItems);
    } catch (error) {
        console.error('데이터를 불러오지 못했습니다:', error);
        document.getElementById('itemGrid').innerHTML = '<p>데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function renderItems(items) {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '';

    items.forEach(item => {
        let effectsHtml = '';
        if (item.effects) {
            for (const [key, value] of Object.entries(item.effects)) {
                if (key === '새로운 투입물' && Array.isArray(value)) {
                    value.forEach(val => {
                        effectsHtml += `<li><span class="effect-key">새로운 투입물:</span> 건물에서 ${val.기존} 대신 ${val.대체}을(를) 처리합니다.</li>`;
                    });
                } else if (key === '대체 노동력') {
                    effectsHtml += `<li><span class="effect-key">대체 노동력:</span> 건물에서 기존 노동력 대신 ${value}을(를) 고용합니다.</li>`;
                } else if (key === '전기 제공') {
                    effectsHtml += `<li><span class="effect-key">전기 제공</span></li>`;
                } else if (Array.isArray(value)) {
                    value.forEach(val => {
                        effectsHtml += `<li><span class="effect-key">${key}:</span> ${val}</li>`;
                    });
                } 
                else {
                    effectsHtml += `<li><span class="effect-key">${key}:</span> ${value}</li>`;
                }
            }
        }

        let expHtml = '';
        if (item.expedition && Object.keys(item.expedition).length > 0) {
            const expStats = Object.entries(item.expedition)
                                   .map(([k, v]) => `${k} ${v}`)
                                   .join(', ');
            expHtml = `<li><span class="effect-key">탐험:</span> ${expStats}</li>`;
        }

        const targetsHtml = item.targets && item.targets.length > 0 
            ? `<li><span class="effect-key">장착:</span> ${item.targets.join(', ')}</li>` 
            : '';

        const iconPath = item.icon ? item.icon : '';

        const card = document.createElement('div');
        card.className = `item-card ${item.rarity || '일반'}`;
        card.innerHTML = `
            <div class="card-header">
                <img src="${iconPath}" alt="icon" class="item-icon" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'64\\' height=\\'64\\'%3E%3Crect width=\\'64\\' height=\\'64\\' fill=\\'%23333\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%23999\\' dy=\\'.3em\\' text-anchor=\\'middle\\'%3ENo Img%3C/text%3E%3C/svg%3E'">
                <div>
                    <h3 class="item-title">${item.name}</h3>
                    <span class="item-rarity">${item.rarity || '일반'}</span>
                </div>
            </div>
            <ul class="effect-list">
                ${targetsHtml}
                ${effectsHtml}
                ${expHtml}
            </ul>
            ${item.description ? `<p class="item-desc">${item.description}</p>` : ''}
        `;
        
        grid.appendChild(card);
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.replace(/\s+/g, '').toLowerCase();
    
    if (!keyword) {
        renderItems(allItems);
        return;
    }

    const jamoKeyword = decomposeKorean(keyword);

    const filtered = allItems.filter(item => {
        if (item.searchRaw.includes(keyword)) return true;
        if (item.searchJamo.includes(jamoKeyword)) return true;

        return false;
    });

    renderItems(filtered);
});

fetchItems();
