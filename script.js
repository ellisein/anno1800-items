let allItems = [];

const renderTemplate = {
    default: (conf, val) => {
        if (typeof val === 'boolean') {
            return val ? `
                <li class="inline">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${conf.label}</span>
                </li>` : '';
        } else {
            return `
                <li class="inline">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${conf.label}</span> ${val}
                </li>`;
        }
    },
    
    subtext: (conf, val, text) => {
        if (typeof val === 'boolean') {
            return val ? `
                <li>
                    <div class="inline">
                        <img src="${conf.icon}" alt="icon" class="category-icon"/>
                        <span class="item-property-key">${conf.label}</span>
                    </div>
                    <div class="indented text-muted">${text}</div>
                </li>` : '';
        } else {
            return `
                <li>
                    <div class="inline">
                        <img src="${conf.icon}" alt="icon" class="category-icon"/>
                        <span class="item-property-key">${conf.label}</span> ${val}
                    </div>
                    <div class="indented text-muted">${text}</div>
                </li>`;
        }
    },
        
    array: (conf, val) => {
        if (!Array.isArray(val) || val.length === 0) return '';
        let html = `
            <li>
                <div class="inline">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <div class="item-property-key">${conf.label}</div>
                </div>`;
        val.forEach(v => { html += `<div class="indented text-muted">${v}</div>`; });
        return html + `</li>`;
    },

    noicon: (conf, val) => {
        if (typeof val === 'boolean') {
            return val ? `<li><span class="item-property-key">${conf.label}</span></li>` : '';
        } else {
            return `<li><span class="item-property-key">${conf.label}</span> ${val}</li>`;
        }
    }
};

const PROPERTY_CONFIGS = {
    'productivity': {
        label: '생산성',
        icon: 'data/ui/2kimages/main/icons/icon_options.png'
    },
    'workforce': {
        label: '필요한 노동력',
        icon: 'data/ui/2kimages/main/icons/icon_build_menu.png'
    },
    'maintenance': {
        label: '유지비',
        icon: 'data/ui/2kimages/main/icons/icon_resource_money_4.png'
    },
    'construction_cost': {
        label: '건설 비용',
        icon: 'data/ui/2kimages/main/icons/icon_sail_shipyard_2d.png'
    },
    'industrialization': {
        label: '전기 제공',
        icon: 'data/ui/2kimages/main/icons/icon_electricity.png'
    },
    'incident_fire': {
        label: '화재 확률',
        icon: 'data/ui/2kimages/main/icons/icon_incident_fire_01.png'
    },
    'incident_illness': {
        label: '질병 확률',
        icon: 'data/ui/2kimages/main/icons/icon_incident_diseases.png'
    },
    'incident_riot': {
        label: '폭동 확률',
        icon: 'data/ui/2kimages/main/icons/icon_riot.png'
    },
    'incident_explosion': {
        label: '폭발 확률',
        icon: 'data/ui/2kimages/main/icons/icon_bomb.png'
    },
    'attractiveness': {
        label: '매력도',
        icon: 'data/ui/2kimages/main/icons/icon_attractiveness.png'
    },
    'needed_area': {
        label: '산림 밀도',
        icon: 'data/ui/2kimages/main/icons/icon_tree_progress.png',
        render: (conf, val) => renderTemplate.subtext(conf, val, `최적 생산성에 도달하는 데 필요한 나무 수가 감소합니다.`)
    },
    'negative_attractiveness': {
        label: '부정적인 매력도',
        icon: 'data/ui/2kimages/main/icons/icon_attractiveness.png'
    },
    'spawn_probability': {
        label: '방문 증가',
        icon: 'data/ui/2kimages/main/icons/icon_increase_population_2.png'
    },
    'module_limit': {
        label: '모듈 수',
        icon: 'data/ui/2kimages/main/3dicons/icon_general_module_01.png'
    },
    'heal_radius': {
        label: '수리 반경',
        icon: 'data/ui/2kimages/main/icons/icon_repair_crane_2d.png'
    },
    'heal_per_minute': {
        label: '수리 속도',
        icon: 'data/ui/2kimages/main/icons/icon_repair_crane_2d.png'
    },
    'max_hitpoints': {
        label: 'HP',
        icon: 'data/ui/2kimages/main/icons/icon_hitpoints.png'
    },
    'attack_range': {
        label: '사거리',
        icon: 'data/ui/2kimages/main/icons/icon_ship_in_combat.png'
    },
    'line_of_sight': {
        label: '시야 범위',
        icon: 'data/ui/2kimages/main/icons/icon_go_to.png'
    },
    'accuracy': {
        label: '명중률',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_support_fleet.png'
    },
    'damage_receive_factor_normal': {
        label: '함선에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png'
    },
    'damage_receive_factor_torpedo': {
        label: '어뢰에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png'
    },
    'damage_receive_factor_cannon': {
        label: '해안 포대에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png'
    },
    'damage_receive_factor_bigbertha': {
        label: '빅 베티에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png'
    },
    'replacing_workforce': {
        label: '대체 노동력',
        icon: 'data/ui/2kimages/main/icons/icon_build_menu.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `건물에서 기존 노동력 대신 ${val}을(를) 고용합니다.`)
    },
    'replaced_inputs': {
        label: '새로운 투입물',
        icon: 'data/ui/2kimages/main/icons/icon_trade.png',
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            const oldInputs = new Set(val.map(v => v.old));
            const newInputs = new Set(val.map(v => v.new));
            return renderTemplate.subtext(conf, true, `건물에서 ${Array.from(oldInputs).join(', ')} 대신 ${Array.from(newInputs).join(', ')}을(를) 처리합니다.`);
        }
    },
    'additional_outputs': {
        label: '추가 물품',
        icon: 'data/ui/2kimages/main/icons/icon_plus.png',
        render: (conf, val) => renderTemplate.array(conf, val)
    },
    'removed_inputs': {
        label: '투입 자원 제거',
        icon: 'data/ui/2kimages/main/icons/icon_productivity_buff.png',
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            return renderTemplate.subtext(conf, true, `이 건물은 ${val.join(', ')} 없이 물품을 생산합니다.`);
        }
    },
    'good_consumption': {
        label: '물품 소비량',
        icon: 'data/ui/2kimages/main/icons/icon_marketplace_2d.png',
        render: (conf, val) => renderTemplate.array(conf, val)
    },
    'fertility': {
        label: '토착 자원',
        icon: '',
        render: (conf, val) => renderTemplate.noicon(conf, val)
    },
    'gen_probability': {
        label: '항구 활동',
        icon: 'data/ui/2kimages/main/icons/icon_activate_trade.png'
    },
    'pier_speed': {
        label: '화물 선적 속도',
        icon: 'data/ui/2kimages/main/icons/icon_load_ships.png'
    },
    'block_buy_share': {
        label: '지분 거래 금지',
        icon: 'data/ui/2kimages/main/icons/icon_untic.png'
    },
    'block_hostile_takeover': {
        label: '인수 금지',
        icon: 'data/ui/2kimages/main/icons/icon_untic.png'
    },
    'happiness_ignores_morale': {
        label: '강철 의지',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png'
    },
    'add_assembly_options': {
        label: '배 도면',
        icon: 'data/ui/2kimages/main/icons/icon_sail_shipyard_2d.png',
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            return renderTemplate.subtext(conf, true, `${val.join(', ')}을(를) 건조할 수 있습니다.`);
        }
    }
};

const RARITIES = {
    'common': '일반',
    'uncommon': '특별',
    'rare': '희귀',
    'epic': '에픽',
    'legendary': '전설'
}

async function fetchItems() {
    try {
        const response = await fetch('items.json');
        const rawData = await response.json();
        
        allItems = rawData.map(item => {
            const keywords = [];
            
            if (item.name) {
                keywords.push(item.name);
            }

            if (item.properties) {
                for (const [key, value] of Object.entries(item.properties)) {
                    if (key === 'rarity' || key === 'dlc_dependency') {
                        continue;
                    }

                    if (PROPERTY_CONFIGS[key]) {
                        keywords.push(PROPERTY_CONFIGS[key].label);
                    }
                    
                    let valuesToPush = [];
                    
                    if (key === 'replaced_inputs' && Array.isArray(value)) {
                        value.forEach(val => {
                            valuesToPush.push(val.old);
                            valuesToPush.push(val.new);
                        });
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        valuesToPush.push(String(value));
                    } else if (Array.isArray(value)) {
                        valuesToPush.push(...value); 
                    }

                    valuesToPush.forEach(valText => {
                        const cleaned = valText.replace(/[0-9\+\-\%\/]/g, '').trim();
                        if (cleaned) {
                            keywords.push(cleaned);
                        }
                    });
                }
            }

            const rawText = keywords.join('|').replace(/\s+/g, '').toLowerCase();
            
            return {
                ...item,
                searchRaw: rawText,
                searchDecomposed: decomposeKorean(rawText)
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
        let propertiesHtml = '';
        if (item.properties) {
            for (const key of Object.keys(PROPERTY_CONFIGS)) {
                if (item.properties.hasOwnProperty(key)) {
                    const conf = PROPERTY_CONFIGS[key];
                    const value = item.properties[key];

                    if (conf.render) {
                        propertiesHtml += conf.render(conf, value);
                    } else if (conf.type === 'boolean') {
                        propertiesHtml += renderTemplate.boolean(conf, value);
                    } else if (Array.isArray(value)) {
                        propertiesHtml += renderTemplate.defaultArray(conf, value);
                    } else {
                        propertiesHtml += renderTemplate.default(conf, value);
                    }
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
        const typeHtml = typeText ? `<li class="inline"><img src="${typeSource}" alt="icon" class="type-icon"/><b>${typeText}</b>에 배치</li>` : '';

        let targetText = "";
        if (item.properties.targets && item.properties.targets.length > 0) {
            if (item.properties.targets.length === 1) {
                targetText = item.properties.targets[0];
            } else {
                const lastItem = item.properties.targets[item.properties.targets.length - 1];
                const otherItems = item.properties.targets.slice(0, -1).join(', ');
                targetText = `${otherItems}, 그리고 ${lastItem}`;
            }
        }
        const targetsHtml = targetText ? `<li class="text-muted">${targetText}에 영향</li>` : '';

        const iconPath = item.icon ? item.icon : '';

        const card = document.createElement('div');
        card.className = `item-card ${item.properties.rarity}`;
        card.innerHTML = `
            <div class="card-header">
                <img src="${iconPath}" alt="icon" class="item-icon"/>
                <div class="w-100">
                    <h3 class="item-title">${item.name}</h3>
                    <div class="flex-between">
                        <span class="item-rarity ${item.properties.rarity}">${RARITIES[item.properties.rarity]}</span>
                        ${item.properties.dlc_dependency ? `<span class="item-dlc">${item.properties.dlc_dependency} DLC</span>` : ''}
                    </div>
                </div>
            </div>
            <ul class="item-property-list">
                ${typeHtml}
                ${targetsHtml}
                ${propertiesHtml}
            </ul>
            ${item.description ? `<p class="item-desc">${item.description}</p>` : ''}
        `;
        
        grid.appendChild(card);

        item.element = card;
    });
}

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

document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.replace(/\s+/g, '').toLowerCase();
    const decomposedKeyword = decomposeKorean(keyword);

    allItems.forEach(item => {
        if (!keyword) {
            item.element.style.display = ''; 
            return;
        }

        const isMatch = item.searchRaw.includes(keyword) || item.searchDecomposed.includes(decomposedKeyword);

        if (isMatch) {
            item.element.style.display = '';
        } else {
            item.element.style.display = 'none';
        }
    });
});

fetchItems();
