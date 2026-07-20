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

const categories = {
    'productivity': '생산성',
    'workforce': '필요한 노동력',
    'maintenance': '유지비',
    'construction_cost': '건설 비용',
    'incident_fire': '화재 확률',
    'incident_illness': '질병 확률',
    'incident_riot': '폭동 확률',
    'incident_explosion': '폭발 확률',
    'area': '산림 밀도',
    'attractiveness': '매력도',
    'negative_attractiveness': '부정적인 매력도',
    'spawn_probability': '방문 증가',
    'module_limit': '모듈 수',
    'industrialization': '전기 제공',
    'replaced_workforce': '대체 노동력',
    'replaced_inputs': '새로운 투입물',
    'additional_outputs': '추가 물품',
    'removed_inputs': '투입 자원 제거',
    'fertility': '토착 자원',
    'gen_probability': '항구 활동',
    'pier_speed': '화물 선적 속도',
    'block_buy_share': '지분 거래 금지',
    'assemblies': '배 도면'
};

function renderItems(items) {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '';

    items.forEach(item => {
        let effectsHtml = '';
        if (item.effects) {
            for (const [key, value] of Object.entries(item.effects)) {
                if (key === 'industrialization' && value === true) {
                    effectsHtml += `<li><span class="effect-key">${categories[key]}</span></li>`;
                } else if (key === 'replaced_workforce') {
                    effectsHtml += `<li><div class="effect-key">${categories[key]}:</div><div class="indented text-muted">건물에서 기존 노동력 대신 ${value}을(를) 고용합니다.</div></li>`;
                } else if (key === 'replaced_inputs' && Array.isArray(value) && value.length > 0) {
                    const oldInputs = value.map(val => val.old).join(', ');
                    const newInputs = value.map(val => val.new).join(', ');

                    effectsHtml += `
                        <li>
                            <div class="effect-key">${categories[key]}</div>
                            <div class="indented text-muted">건물에서 ${oldInputs} 대신 ${newInputs}을(를) 처리합니다.</div>
                        </li>
                    `;
                } else if (key === 'additional_outputs' && Array.isArray(value) && value.length > 0) {
                    effectsHtml += `<li><div class="effect-key">${categories[key]}</div>`;
                    value.forEach(val => {
                        effectsHtml += `<div class=" indented text-muted">${val}</div>`;
                    });
                    effectsHtml += `</li>`;
                } else if (key === 'removed_inputs' && Array.isArray(value) && value.length > 0) {
                    effectsHtml += `
                        <li>
                            <div class="effect-key">${categories[key]}</div>
                            <div class="indented text-muted">이 건물은 ${value.join(', ')} 없이 물품을 생산합니다.</div>
                        </li>
                    `;
                } else if (key === 'fertility') {
                    effectsHtml += `<li><span class="effect-key">${value} 제공</span></li>`;
                } else if (key === 'block_buy_share' && value === true) {
                    effectsHtml += `<li><span class="effect-key">${categories[key]}</span></li>`;
                } else if (key === 'assemblies' && Array.isArray(value) && value.length > 0) {
                    effectsHtml += `
                        <li>
                            <div class="effect-key">${categories[key]}</div>
                            <div class="indented text-muted">${value.join(', ')}을(를) 건조할 수 있습니다.</div>
                        </li>
                    `;
                } else if (Array.isArray(value)) {
                    value.forEach(val => {
                        effectsHtml += `<li><span class="effect-key">${categories[key]}</span> ${val}</li>`;
                    });
                }
                else {
                    effectsHtml += `<li><span class="effect-key">${categories[key]}</span> ${value}</li>`;
                }
            }
        }

        let typeText = "";
        let typeSource = "";
        if (item.type) {
            if (item.type === 'GuildhouseItem') {
                typeText = "무역 연합";
                typeSource = "data/ui/2kimages/main/3dicons/icon_guildhouse.png";
            } else if (item.type === 'HarborOfficeItem') {
                typeText = "항만 관리소장실";
                typeSource = "data/ui/2kimages/main/3dicons/icon_harbour_kontor.png";
            }
        }
        const typeHtml = typeText ? `<li style="display: flex; align-items: center;"><img src="${typeSource}" alt="icon" class="type-icon" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\'%3E%3Crect width=\\'16\\' height=\\'16\\' fill=\\'%23333\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%23999\\' dy=\\'.3em\\' text-anchor=\\'middle\\'%3ENo Img%3C/text%3E%3C/svg%3E'"><b>${typeText}</b>에 배치</li>` : '';

        let targetText = "";
        if (item.targets && item.targets.length > 0) {
            if (item.targets.length === 1) {
                targetText = item.targets[0];
            } else {
                const lastItem = item.targets[item.targets.length - 1];
                const otherItems = item.targets.slice(0, -1).join(', ');
                targetText = `${otherItems}, 그리고 ${lastItem}`;
            }
        }
        const targetsHtml = targetText ? `<li class="text-muted">${targetText}에 영향</li>` : '';

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
                ${typeHtml}
                ${targetsHtml}
                ${effectsHtml}
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
