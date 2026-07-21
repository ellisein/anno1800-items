let allItems = [];

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

                    if (categories[key]) {
                        keywords.push(categories[key]);
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

const rarities = {
    'common': '일반',
    'uncommon': '특별',
    'rare': '희귀',
    'epic': '에픽',
    'legendary': '전설'
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
    'attractiveness': '매력도',
    'needed_area': '산림 밀도',
    'negative_attractiveness': '부정적인 매력도',
    'spawn_probability': '방문 증가',
    'module_limit': '모듈 수',
    'heal_radius': '수리 반경',
    'heal_per_minute': '수리 속도',
    'max_hitpoints': 'HP',
    'attack_range': '사거리',
    'line_of_sight': '시야 범위',
    'accuracy': '명중률',
    'damage_receive_factor_normal': '함선에게 받는 피해',
    'damage_receive_factor_torpedo': '어뢰에게 받는 피해',
    'damage_receive_factor_cannon': '해안 포대에게 받는 피해',
    'damage_receive_factor_bigbertha': '빅 베티에게 받는 피해',
    'industrialization': '전기 제공',
    'replaced_workforce': '대체 노동력',
    'replaced_inputs': '새로운 투입물',
    'additional_outputs': '추가 물품',
    'removed_inputs': '투입 자원 제거',
    'good_consumption': '물품 소비량',
    'fertility': '토착 자원',
    'gen_probability': '항구 활동',
    'pier_speed': '화물 선적 속도',
    'block_buy_share': '지분 거래 금지',
    'block_hostile_takeover': '인수 금지',
    'happiness_ignores_morale': '강철 의지',
    'add_assembly_options': '배 도면'
};

const category_icons = {
    'productivity': 'data/ui/2kimages/main/icons/icon_options.png',
    'workforce': 'data/ui/2kimages/main/icons/icon_build_menu.png',
    'maintenance': 'data/ui/2kimages/main/icons/icon_resource_money_4.png',
    'construction_cost': 'data/ui/2kimages/main/icons/icon_sail_shipyard_2d.png',
    'incident_fire': 'data/ui/2kimages/main/icons/icon_incident_fire_01.png',
    'incident_illness': 'data/ui/2kimages/main/icons/icon_incident_diseases.png',
    'incident_riot': 'data/ui/2kimages/main/icons/icon_riot.png',
    'incident_explosion': 'data/ui/2kimages/main/icons/icon_bomb.png',
    'attractiveness': 'data/ui/2kimages/main/icons/icon_attractiveness.png',
    'needed_area': 'data/ui/2kimages/main/icons/icon_tree_progress.png',
    'negative_attractiveness': 'data/ui/2kimages/main/icons/icon_attractiveness.png',
    'spawn_probability': 'data/ui/2kimages/main/icons/icon_increase_population_2.png',
    'module_limit': 'data/ui/2kimages/main/3dicons/icon_general_module_01.png',
    'heal_radius': 'data/ui/2kimages/main/icons/icon_repair_crane_2d.png',
    'heal_per_minute': 'data/ui/2kimages/main/icons/icon_repair_crane_2d.png',
    'max_hitpoints': 'data/ui/2kimages/main/icons/icon_hitpoints.png',
    'attack_range': 'data/ui/2kimages/main/icons/icon_ship_in_combat.png',
    'line_of_sight': 'data/ui/2kimages/main/icons/icon_go_to.png',
    'accuracy': 'data/ui/2kimages/main/icons/icon_diplomacy_options_support_fleet.png',
    'damage_receive_factor_normal': 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png',
    'damage_receive_factor_torpedo': 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png',
    'damage_receive_factor_cannon': 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png',
    'damage_receive_factor_bigbertha': 'data/ui/2kimages/main/icons/icon_armor_damage_ammunition.png',
    'industrialization': 'data/ui/2kimages/main/icons/icon_electricity.png',
    'replaced_workforce': 'data/ui/2kimages/main/icons/icon_build_menu.png',
    'replaced_inputs': 'data/ui/2kimages/main/icons/icon_trade.png',
    'additional_outputs': 'data/ui/2kimages/main/icons/icon_plus.png',
    'removed_inputs': 'data/ui/2kimages/main/icons/icon_productivity_buff.png',
    'good_consumption': 'data/ui/2kimages/main/icons/icon_marketplace_2d.png',
    'fertility': '',
    'gen_probability': 'data/ui/2kimages/main/icons/icon_activate_trade.png',
    'pier_speed': 'data/ui/2kimages/main/icons/icon_load_ships.png',
    'block_buy_share': 'data/ui/2kimages/main/icons/icon_untic.png',
    'block_hostile_takeover': 'data/ui/2kimages/main/icons/icon_untic.png',
    'happiness_ignores_morale': 'data/ui/2kimages/main/icons/icon_happy.png',
    'add_assembly_options': 'data/ui/2kimages/main/icons/icon_sail_shipyard_2d.png'
}

function renderItems(items) {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '';

    items.forEach(item => {
        let propertiesHtml = '';
        if (item.properties) {
            for (const key of Object.keys(categories)) {
                if (item.properties.hasOwnProperty(key)) {
                    const value = item.properties[key];

                    if (key === 'replaced_workforce') {
                        propertiesHtml += `<li><div class="item-property-key">${categories[key]}:</div><div class="indented text-muted">건물에서 기존 노동력 대신 ${value}을(를) 고용합니다.</div></li>`;
                    } else if (key === 'replaced_inputs' && Array.isArray(value) && value.length > 0) {
                        const oldInputs = value.map(val => val.old).join(', ');
                        const newInputs = value.map(val => val.new).join(', ');
                        propertiesHtml += `
                            <li>
                                <div class="inline">
                                    <img src="${category_icons[key]}" alt="icon" class="category-icon"/>
                                    <span class="item-property-key">${categories[key]}</span>
                                </div>
                                <div class="indented text-muted">건물에서 ${oldInputs} 대신 ${newInputs}을(를) 처리합니다.</div>
                            </li>
                        `;
                    } else if ((key === 'additional_outputs' || key === 'good_consumption') && Array.isArray(value) && value.length > 0) {
                        propertiesHtml += `<li><div class="inline"><img src="${category_icons[key]}" alt="icon" class="category-icon"/><div class="item-property-key">${categories[key]}</div></div>`;
                        value.forEach(val => {
                            propertiesHtml += `<div class=" indented text-muted">${val}</div>`;
                        });
                        propertiesHtml += `</li>`;
                    } else if (key === 'removed_inputs' && Array.isArray(value) && value.length > 0) {
                        propertiesHtml += `
                            <li>
                                <div class="inline">
                                    <img src="${category_icons[key]}" alt="icon" class="category-icon"/>
                                    <span class="item-property-key">${categories[key]}</span>
                                </div>
                                <div class="indented text-muted">이 건물은 ${value.join(', ')} 없이 물품을 생산합니다.</div>
                            </li>
                        `;
                    } else if (key === 'fertility') {
                        propertiesHtml += `<li><span class="item-property-key">${value} 제공</span></li>`;
                    } else if ((key === 'industrialization' || key === 'block_buy_share' || key === 'block_hostile_takeover' || key === 'happiness_ignores_morale') && value === true) {
                        propertiesHtml   += `<li class="inline"><img src="${category_icons[key]}" alt="icon" class="category-icon"/><span class="item-property-key">${categories[key]}</span></li>`;
                    } else if (key === 'add_assembly_options' && Array.isArray(value) && value.length > 0) {
                        propertiesHtml += `
                            <li>
                                <div class="inline">
                                    <img src="${category_icons[key]}" alt="icon" class="category-icon"/>
                                    <span class="item-property-key">${categories[key]}</span>
                                </div>
                                <div class="indented text-muted">${value.join(', ')}을(를) 건조할 수 있습니다.</div>
                            </li>
                        `;
                    } else if (key === 'needed_area') {
                        propertiesHtml += `
                            <li>
                                <div class="inline">
                                    <img src="${category_icons[key]}" alt="icon" class="category-icon"/>
                                    <div><span class="item-property-key">${categories[key]}</span> ${value}</div>
                                </div>
                                <div class="indented text-muted">최적 생산성에 도달하는 데 필요한 나무 수가 감소합니다.</div>
                            </li>
                        `;
                    } else if (Array.isArray(value)) {
                        value.forEach(val => {
                            propertiesHtml += `<li><span class="item-property-key">${categories[key]}</span> ${val}</li>`;
                        });
                    }
                    else {
                        propertiesHtml += `<li class="inline"><img src="${category_icons[key]}" alt="icon" class="category-icon"/><span class="item-property-key">${categories[key]}</span> ${value}</li>`;
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
                        <span class="item-rarity ${item.properties.rarity}">${rarities[item.properties.rarity]}</span>
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
