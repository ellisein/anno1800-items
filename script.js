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

    custom: (label, icon, val) => {
        if (typeof val === 'boolean') {
            return val ? `
                <li class="inline">
                    <img src="${icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${label}</span>
                </li>` : '';
        } else {
            return `
                <li class="inline">
                    <img src="${icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${label}</span> ${val}
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
        val.forEach(v => { html += `<div class="indented">${v}</div>`; });
        return html + `</li>`;
    },

    array_with_subtext: (conf, val, text) => {
        if (!Array.isArray(val) || val.length === 0) return '';
        let html = `
            <li>
                <div class="inline">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <div class="item-property-key">${conf.label}</div>
                </div>
                <div class="indented text-muted">${text}</div>`;
        val.forEach(v => { html += `<div class="indented">${v}</div>`; });
        return html + `</li>`;
    },

    nolabel: (conf, text) => {
        return `<li>
            <div class="indented text-muted">${text}</div>
        </li>`;
    },

    noicon: (conf, val) => {
        if (typeof val === 'boolean') {
            return val ? `<li><span class="item-property-key">${conf.label}</span></li>` : '';
        } else {
            return `<li><span class="item-property-key">${conf.label}</span> ${val}</li>`;
        }
    },

    nomargin: (conf, val) => {
        if (typeof val === 'boolean') {
            return val ? `
                <li class="inline margin-0">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${conf.label}</span>
                </li>` : '';
        } else {
            return `
                <li class="inline margin-0">
                    <img src="${conf.icon}" alt="icon" class="category-icon"/>
                    <span class="item-property-key">${conf.label}</span> ${val}
                </li>`;
        }
    }
};

const PROPERTY_CONFIGS = {
    'pipe_capacity': {
        label: '관개 시설 수용량',
        icon: 'data/ui/2kimages/main/3dicons/icon_water_drop.png'
    },
    'resolver_unit_count': {
        label: null,
        icon: null,
        render_unit: (conf, unit, val) => {
            if (unit === '경찰관') {
                return renderTemplate.custom('경찰관', 'data/ui/2kimages/main/icons/icon_police_2d.png', val);
            } else if (unit == '소방관') {
                return renderTemplate.custom('소방관', 'data/ui/2kimages/main/icons/icon_fire_brigade_2d.png', val);
            } else if (unit == '의사') {
                return renderTemplate.custom('의사', 'data/ui/2kimages/main/icons/icon_hospital_2d.png', val);
            } else if (unit == '레인저') {
                return renderTemplate.custom('레인저', 'data/ui/2kimages/main/icons/icon_ranger_station_2d.png', val);
            }
        }
    },
    'resolver_unit_decrease': {
        label: null,
        icon: null,
        render_unit: (conf, unit, val) => {
            if (unit === '경찰관') {
                return renderTemplate.custom('시행 속도', 'data/ui/2kimages/main/icons/icon_police_2d.png', val);
            } else if (unit == '소방관') {
                return renderTemplate.custom('진압 속도', 'data/ui/2kimages/main/icons/icon_fire_brigade_2d.png', val);
            } else if (unit == '의사') {
                return renderTemplate.custom('치유 속도', 'data/ui/2kimages/main/icons/icon_hospital_2d.png', val);
            } else if (unit == '레인저') {
                return renderTemplate.custom('지원 속도', 'data/ui/2kimages/main/icons/icon_ranger_station_2d.png', val);
            }
        }
    },
    'resolver_unit_movement_speed': {
        label: '범위',
        icon: 'data/ui/2kimages/main/icons/icon_forward.png',
    },
    'construction_cost': {
        label: '건설 비용',
        icon: 'data/ui/2kimages/main/icons/icon_big_shipyard_2d.png'
    },
    'productivity': {
        label: '생산성',
        icon: 'data/ui/2kimages/main/icons/icon_options.png'
    },
    'workforce': {
        label: '필요한 노동력',
        icon: 'data/ui/2kimages/main/icons/icon_build_menu.png'
    },
    'forward_speed': {
        label: '이동 속도',
        icon: 'data/ui/2kimages/main/icons/icon_forward.png'
    },
    'trade_price': {
        label: '구매 가격',
        icon: 'data/ui/2kimages/main/icons/icon_credits_2d.png'
    },
    'loading_speed': {
        label: '화물 선적 속도',
        icon: 'data/ui/2kimages/main/icons/icon_load_ships.png'
    },
    'ignore_weight_factor': {
        label: '화물에 의한 속도 저하',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_support_fleet.png'
    },
    'ignore_damage_factor': {
        label: '피해에 의한 속도 저하',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_support_fleet.png'
    },
    'maintenance': {
        label: '유지비',
        icon: 'data/ui/2kimages/main/icons/icon_resource_money_4.png'
    },
    'public_service_full_satisfaction_distance': {
        label: '범위',
        icon: 'data/ui/2kimages/main/icons/icon_forward.png'
    },
    'industrialization': {
        label: '전기 제공',
        icon: 'data/ui/2kimages/main/icons/icon_electricity.png'
    },
    'special_unit_happiness_threshold': {
        label: '동원 조건',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png',
        render_unit: (conf, unit, val) => renderTemplate.subtext(conf, val, `${unit}을(를) 동원하는 데 필요한 행복도가 감소합니다.`)
    },
    'stress': {
        label: '근로 여건에 미치는 영향',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png'
    },
    'additional_happiness': {
        label: '행복도',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png'
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
    'incident_arctic_illness': {
        label: '유행성 독감 확률',
        icon: 'data/ui/2kimages/main/icons/icon_snowflakes.png'
    },
    'benefit_additional_research': {
        label: '추가 연구 점수',
        icon: 'data/ui/2kimages/main/icons/icon_research_01.png',
        render: (conf, val) => {
            if (!val || typeof val !== 'object') return '';
            let html = '';
            for (const [amount, items] of Object.entries(val)) {
                let itemsStr = '';
                if (items.length === 1) {
                    itemsStr = items[0];
                } else {
                    const lastItem = items[items.length - 1];
                    const otherItems = items.slice(0, -1).join(', ');
                    itemsStr = `${otherItems}, 그리고 ${lastItem}`;
                }
                const text = `주민이 ${itemsStr}(으)로 추가 연구 점수를 제공합니다.`;
                html += renderTemplate.subtext(conf, amount, text);
            }
            return html;
        }
    },
    'benefit_additional_happiness': {
        label: '보너스 행복도',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png',
        render: (conf, val) => {
            if (!val || typeof val !== 'object') return '';
            let html = '';
            for (const [amount, items] of Object.entries(val)) {
                let itemsStr = '';
                if (items.length === 1) {
                    itemsStr = items[0];
                } else {
                    const lastItem = items[items.length - 1];
                    const otherItems = items.slice(0, -1).join(', ');
                    itemsStr = `${otherItems}, 그리고 ${lastItem}`;
                }
                const text = `주민들이 ${itemsStr}에서 보너스 행복도를 얻습니다.`;
                html += renderTemplate.subtext(conf, amount, text);
            }
            return html;
        }
    },
    'benefit_additional_money': {
        label: '보너스 수입',
        icon: 'data/ui/2kimages/main/icons/icon_resource_money_4.png',
        render: (conf, val) => {
            if (!val || typeof val !== 'object') return '';
            let html = '';
            for (const [amount, items] of Object.entries(val)) {
                let itemsStr = '';
                if (items.length === 1) {
                    itemsStr = items[0];
                } else {
                    const lastItem = items[items.length - 1];
                    const otherItems = items.slice(0, -1).join(', ');
                    itemsStr = `${otherItems}, 그리고 ${lastItem}`;
                }
                const text = `주민들이 ${itemsStr}에서 보너스 수입을 얻습니다.`;
                html += renderTemplate.subtext(conf, amount, text);
            }
            return html;
        }
    },
    'benefit_additional_supply': {
        label: '보너스 주민',
        icon: 'data/ui/2kimages/main/icons/icon_house.png',
        render: (conf, val) => {
            if (!val || typeof val !== 'object') return '';
            let html = '';
            for (const [amount, items] of Object.entries(val)) {
                let itemsStr = '';
                if (items.length === 1) {
                    itemsStr = items[0];
                } else {
                    const lastItem = items[items.length - 1];
                    const otherItems = items.slice(0, -1).join(', ');
                    itemsStr = `${otherItems}, 그리고 ${lastItem}`;
                }
                const text = `거주지가 ${itemsStr}에서 보너스 주민을 얻습니다.`;
                html += renderTemplate.subtext(conf, amount, text);
            }
            return html;
        }
    },
    'need_provide_need' : {
        label: '보너스 제공',
        icon: 'data/ui/2kimages/main/icons/icon_plus.png',
        render: (conf, val) => {
            const provide_needs = new Set(val.provide_needs);
            const subtitute_needs = new Set(val.subtitute_needs);
            return renderTemplate.subtext(conf, true, `${Array.from(subtitute_needs).join(', ')}이(가) 행정 건물 범위 내 주민들의 ${Array.from(provide_needs).join(', ')}에 대한 요구사항을 충족시켜줍니다.`);
        }
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
        icon: 'data/ui/2kimages/main/icons/icon_add_slot_guild.png',
        render: (conf, val) => renderTemplate.subtext(conf, val, `전문가가 도시를 방문할 확률이 증가합니다.`)
    },
    'module_limit': {
        label: '모듈 수',
        icon: 'data/ui/2kimages/main/3dicons/icon_general_module_01.png'
    },
    'heal_per_minute': {
        label: '수리 속도',
        icon: 'data/ui/2kimages/main/icons/icon_build_menu.png'
    },
    'heal_radius': {
        label: '수리 반경',
        icon: 'data/ui/2kimages/main/icons/icon_build_menu.png'
    },
    'white_flag': {
        label: '평화 모드',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_peace.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `배가 공격하거나 공격받지 않게 합니다.`)
    },
    'pirate_flag': {
        label: '해적 모드',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_war.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `배가 전쟁 상태가 아니더라도 공격할 수 있습니다.`)
    },
    'base_damage': {
        label: '포탄당 피해량',
        icon: 'data/ui/2kimages/main/icons/icon_damage.png'
    },
    'attack_range': {
        label: '사거리',
        icon: 'data/ui/2kimages/main/icons/icon_ship_in_combat.png'
    },
    'line_of_sight': {
        label: '시야 범위',
        icon: 'data/ui/2kimages/main/icons/icon_go_to.png'
    },
    'attack_speed': {
        label: '공격 속도',
        icon: 'data/ui/2kimages/main/icons/icon_go_to.png'
    },
    'max_hitpoints': {
        label: 'HP',
        icon: 'data/ui/2kimages/main/icons/icon_hitpoints.png'
    },
    'morale_power': {
        label: '사기',
        icon: 'data/ui/2kimages/main/icons/icon_morale_01.png'
    },
    'accuracy': {
        label: '명중률',
        icon: 'data/ui/2kimages/main/icons/icon_diplomacy_options_support_fleet.png'
    },
    'damage_receive_factor_normal': {
        label: '함선에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_stance_attack.png'
    },
    'damage_receive_factor_torpedo': {
        label: '어뢰에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_stance_attack.png'
    },
    'damage_receive_factor_cannon': {
        label: '해안 포대에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_stance_attack.png'
    },
    'damage_receive_factor_bigbertha': {
        label: '빅 베티에게 받는 피해',
        icon: 'data/ui/2kimages/main/icons/icon_stance_attack.png'
    },
    'self_heal': {
        label: '자가 수리',
        icon: 'data/ui/2kimages/main/icons/icon_hitpoints.png'
    },
    'self_heal_paused_time_if_attacked': {
        label: '수리 개시',
        icon: 'data/ui/2kimages/main/icons/icon_morale_01.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `구조물과 배가 전투 중에도 자동으로 수리됩니다.`)
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
        icon: 'data/ui/2kimages/main/3dicons/icon_resident.png',
        render: (conf, val) => renderTemplate.array_with_subtext(conf, val, '이 요구 사항은 비교적 적은 물품이나 낮은 근접성으로도 충족할 수 있습니다.')
    },
    'fertility': {
        label: '토착 자원',
        icon: '',
        render: (conf, val) => renderTemplate.noicon(conf, val)
    },
    'pier_speed': {
        label: '화물 선적 속도',
        icon: 'data/ui/2kimages/main/icons/icon_load_ships.png'
    },
    'block_buy_share': {
        label: '지분 거래 금지',
        icon: 'data/ui/2kimages/main/icons/icon_untic.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `해당 효과가 섬의 교역소에 적용되는 동안 섬의 지분 거래를 막아서 다른 세력이 당신의 지분을 구매하지 못하게 만듭니다.`)
    },
    'block_hostile_takeover': {
        label: '인수 금지',
        icon: 'data/ui/2kimages/main/icons/icon_untic.png'
    },
    'happiness_ignores_morale': {
        label: '강철 의지',
        icon: 'data/ui/2kimages/main/icons/icon_happy.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `전쟁을 치르는 동안에는 사기 저하로 인해 주민 행복도가 감소하지 않습니다.`)
    },
    'morale_damage': {
        label: '기개',
        icon: 'data/ui/2kimages/main/icons/icon_morale_loss.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `섬의 사기가 낮을 때 군사 건물이 입히는 피해량이 증가합니다.`)
    },
    'hitpoint_damage': {
        label: '불굴',
        icon: 'data/ui/2kimages/main/icons/icon_hitpoints.png',
        render: (conf, val) => renderTemplate.subtext(conf, true, `군사 건물의 HP가 낮을 때 입히는 피해량이 증가합니다.`)
    },
    'add_assembly_options': {
        label: '배 도면',
        icon: 'data/ui/2kimages/main/icons/icon_sail_shipyard_2d.png',
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            return renderTemplate.subtext(conf, true, `${val.join(', ')}을(를) 건조할 수 있습니다.`);
        }
    },
    'gen_probability': {
        label: '항구 활동',
        icon: 'data/ui/2kimages/main/icons/icon_activate_trade.png',
        render: (conf, val) => renderTemplate.nomargin(conf, val)
    },
    'reward_pool': {
        label: null,
        icon: null,
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            itemsText = '';
            if (val.length === 1) {
                if (val[0] === '코인') {
                    return renderTemplate.nolabel(conf, `교역소에서 소극적인 거래가 발생할 때마다 일정 확률로 500코인의 세금이 발생합니다.`);
                }
                itemsText += val[0];
            } else {
                const lastItem = val[val.length - 1];
                const otherItems = val.slice(0, -1).join(', ');
                itemsText += `${otherItems}, 또는 ${lastItem}`;
            }
            return renderTemplate.nolabel(conf, `교역소에서 소극적인 거래가 발생할 때마다 일정 확률로 ${itemsText} 5톤을 얻습니다.`);
        }
    },
    'scrap_amount': {
        label: '고철 인양량',
        icon: 'data/ui/2kimages/main/icons/icon_itemsockets_02.png'
    },
    'diving_museum': {
        label: '유물 발견 확률 증가',
        icon: 'data/ui/2kimages/main/icons/icon_museum_2d.png'
    },
    'diving_zoo': {
        label: '동물 발견 확률 증가',
        icon: 'data/ui/2kimages/main/icons/icon_zoo_2d.png'
    },
    'diving_machine': {
        label: '기계 발견 확률 증가',
        icon: 'data/ui/2kimages/main/icons/icon_guildhouse_2d.png'
    },
    'diving_rarity': {
        label: '잠수종 희귀도',
        icon: 'data/ui/2kimages/main/icons/icon_favourite.png',
        render: (conf, val) => {
            if (!Array.isArray(val) || val.length === 0) return '';
            const translated = val.map(r => RARITIES[r.toLowerCase()] || r);
            rarityTexts = '';
            if (translated.length === 1) {
                rarityTexts += translated[0];
            } else {
                const lastItem = translated[translated.length - 1];
                const otherItems = translated.slice(0, -1).join(', ');
                rarityTexts += `${otherItems}, 그리고 ${lastItem}`;
            }
            return renderTemplate.subtext(conf, true, `잠수 중에 ${rarityTexts} 희귀도 아이템 발견 확률이 증가합니다.`);
        }
    },
    'action_duration': {
        label: '지속 시간',
        icon: 'data/ui/2kimages/main/icons/icon_timer.png'
    },
    'action_cooldown': {
        label: '재사용 대기시간',
        icon: 'data/ui/2kimages/main/icons/icon_wait_till_full_light.png'
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
        const response = await fetch('items.json', { cache: 'no-store' });
        const rawData = await response.json();

        const rawMap = new Map(rawData.map(i => [i.guid, i]));
        
        allItems = rawData.map(item => {
            const keywords = [];
            
            if (item.name) {
                keywords.push(item.name);
            }

            if (item.properties && item.properties.active_buff) {
                const buff = rawMap.get(item.properties.active_buff);
                if (buff && buff.properties) {
                    Object.assign(item.properties, buff.properties);
                }
            }

            if (item.properties && item.properties.gen_pool) {
                const pool = rawMap.get(item.properties.gen_pool);
                if (pool && pool.properties) {
                    Object.assign(item.properties, pool.properties);
                }
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
                    } else if (key === 'need_provide_need' && Array.isArray(value)) {
                        value.forEach(val => {
                            valuesToPush.push(val.provide);
                            valuesToPush.push(val.substitute);
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
        if (!item.type || !(item.type.endsWith('Item') || item.type.endsWith('Specialist'))) {
            return;
        }

        if (!item.properties.rarity || !RARITIES[item.properties.rarity]) {
            return;
        }

        let propertiesHtml = '';
        if (item.properties) {
            for (const key of Object.keys(PROPERTY_CONFIGS)) {
                if (item.properties.hasOwnProperty(key)) {
                    const conf = PROPERTY_CONFIGS[key];
                    const value = item.properties[key];

                    if (conf.render_unit) {
                        propertiesHtml += conf.render_unit(conf, item.properties.unit, value);
                    } else if (conf.render) {
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
            if (item.properties.allocation) {
                if (item.properties.allocation === 'GuildHouse') {
                    typeText = "무역 연합";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_guildhouse.png";
                } else if (item.properties.allocation === 'Lodge') {
                    typeText = "북극 산장";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_community_lodge.png";
                } else if (item.properties.allocation === 'HarborOffice') {
                    typeText = "항만 관리소장실";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_harbour_kontor.png";
                } else if (item.properties.allocation === 'TownHall') {
                    typeText = "시청";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_townhall.png";
                } else if (item.properties.allocation === 'Ship') {
                    typeText = "배";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_ship_commandship.png";
                } else if (item.properties.allocation === 'SailShip') {
                    typeText = "범선";
                    typeSource = "";
                } else if (item.properties.allocation === 'SteamShip') {
                    typeText = "증기선";
                    typeSource = "";
                } else if (item.properties.allocation === 'Warship') {
                    typeText = "군함";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_ship_liner.png";
                } else if (item.properties.allocation === 'AirShip') {
                    typeText = "비행선";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_airship_artic.png";
                } else if (item.properties.allocation === 'DivingVessel') {
                    typeText = "인양선";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_ship_diving_vessel.png";
                }
            }
            else
            {
                if (item.type === 'GuildhouseItem') {
                    if (item.properties.dlc_dependency === '길') {
                        typeText = "북극 산장";
                        typeSource = "data/ui/2kimages/main/3dicons/icon_community_lodge.png";
                    } else {
                        typeText = "무역 연합";
                        typeSource = "data/ui/2kimages/main/3dicons/icon_guildhouse.png";
                    }
                } else if (item.type === 'HarborOfficeItem') {
                    typeText = "항만 관리소장실";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_harbour_kontor.png";
                } else if (item.type === 'TownhallItem') {
                    typeText = "시청";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_townhall.png";
                } else if (item.type === 'VehicleItem' || item.type === 'ShipSpecialist') {
                    typeText = "배";
                    typeSource = "data/ui/2kimages/main/3dicons/icon_ship_commandship.png";
                }
            }
        }
        const typeHtml = typeText ? `<li class="inline"><img src="${typeSource}" alt="icon" class="type-icon"/><span class="text-highlight">${typeText}</span>에 배치</li>` : '';

        let targetText = "";
        if (item.properties.targets && item.properties.targets.length > 0) {
            if (item.properties.active_buff) {
                targetText += '활성화 시 ';
            }

            if (item.properties.targets.length === 1) {
                targetText += item.properties.targets[0];
            } else {
                const lastItem = item.properties.targets[item.properties.targets.length - 1];
                const otherItems = item.properties.targets.slice(0, -1).join(', ');
                targetText += `${otherItems}, 그리고 ${lastItem}`;
            }
        }
        const targetsHtml = targetText ? `<li class="text-muted">${targetText}에 영향</li>` : '';

        const iconPath = item.icon ? item.icon : '';

        const card = document.createElement('div');
        card.className = `item-card ${item.properties.rarity}`;
        card.innerHTML = `
            <div class="flex-end">
                <span class="item-id">${item.guid}</span>
            </div>
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
    const inputValue = e.target.value.trim().toLowerCase();

    if (!inputValue) {
        allItems.forEach(item => {
            if (item.element) item.element.style.display = ''; 
        });
        return;
    }

    const keywords = inputValue.split(/\s+/);
    const decomposedKeywords = keywords.map(kw => decomposeKorean(kw));

    allItems.forEach(item => {
        if (!item.element) {
            return;
        }

        const isMatch = keywords.every((kw, index) => {
            return item.searchRaw.includes(kw) || item.searchDecomposed.includes(decomposedKeywords[index]);
        });

        if (isMatch) {
            item.element.style.display = '';
        } else {
            item.element.style.display = 'none';
        }
    });
});

window.addEventListener('scroll', () => {
    const searchContainer = document.querySelector('.search-container');
    if (window.scrollY > 102) {
        searchContainer.classList.add('scrolled');
    } else {
        searchContainer.classList.remove('scrolled');
    }
});

fetchItems();
