import xml.etree.ElementTree as ET
import json

def load_korean_texts(xml_path):
    print("1/3: Loading Korean translations from texts_korean.xml...")
    texts_dict = {}
    try:
        tree = ET.parse(xml_path)
        for text_node in tree.getroot().findall('.//Text'):
            guid = text_node.findtext('GUID')
            text_val = text_node.findtext('Text')
            if guid and text_val:
                texts_dict[guid.strip()] = text_val.strip()
        print(f" -> Loaded {len(texts_dict):,} translations.\n")
        return texts_dict
    except Exception as e:
        print(f"Error loading translation file: {e}")
        return {}

def extract_items_data(assets_path, texts_dict):
    print("2/3: Extracting assets...")
    items_list = []
    
    context = ET.iterparse(assets_path, events=('end',))
    
    for event, elem in context:
        if elem.tag == 'Asset':
            template = elem.findtext('Template')

            # ['GuildhouseItem', 'VehicleItem', 'ActiveItem', 'HarborOfficeItem', 'CultureItem', 'TownhallItem']
            if template and template in ['GuildhouseItem', 'HarborOfficeItem']:
                standard = elem.find('./Values/Standard')

                if standard is not None:
                    item_guid = standard.findtext('GUID')
                    icon_path = standard.findtext('IconFilename')

                    if item_guid and item_guid in texts_dict and icon_path:
                        item_name = texts_dict[item_guid]
                        icon_path = icon_path.replace('\\', '/')

                        item_properties = {}

                        item_node = elem.find('./Values/Item')
                        if item_node is not None:
                            # 아이템 등급 (rarity)
                            rarity = item_node.findtext('Rarity')
                            item_properties['rarity'] = rarity.lower() if rarity else 'common'

                        locked_node = elem.find('./Values/Locked')
                        if locked_node is not None:
                            # 필요 DLC (dlc_dependency)
                            dlc_guid = locked_node.findtext('DLCDependency')
                            if dlc_guid and dlc_guid in texts_dict:
                                item_properties['dlc_dependency'] = texts_dict[dlc_guid]

                        item_effect_node = elem.find('./Values/ItemEffect')
                        if item_effect_node is not None:
                            # 적용 대상 (targets)
                            item_properties['targets'] = []
                            for target in item_effect_node.findall('EffectTargets/Item'):
                                target_guid = target.findtext('GUID')
                                if target_guid and target_guid in texts_dict:
                                    item_properties['targets'].append(texts_dict[target_guid])

                        factory_upgrade_node = elem.find('./Values/FactoryUpgrade')
                        if factory_upgrade_node is not None:
                            # 생산성 (productivity)
                            productivity = get_value(factory_upgrade_node.find('ProductivityUpgrade'))
                            if productivity:
                                item_properties['productivity'] = productivity

                            # 산림 밀도 (needed_area)
                            needed_area = get_value(factory_upgrade_node.find('NeededAreaPercentUpgrade'), force_percental=True, reverse_sign=True)
                            if needed_area:
                                item_properties['needed_area'] = needed_area

                            # 새로운 투입물 (replaced_inputs)
                            replace_inputs_node = factory_upgrade_node.find('ReplaceInputs')
                            if replace_inputs_node is not None:
                                replaced_inputs = []
                                for item in replace_inputs_node.findall('Item'):
                                    old_guid = item.findtext('OldInput')
                                    new_guid = item.findtext('NewInput')
                                    if old_guid and new_guid and old_guid in texts_dict and new_guid in texts_dict:
                                        old_name = texts_dict[old_guid]
                                        new_name = texts_dict[new_guid]
                                        replaced_inputs.append({
                                            "old": old_name,
                                            "new": new_name
                                        })
                                if len(replaced_inputs) > 0:
                                    item_properties['replaced_inputs'] = replaced_inputs

                            # 추가 물품 (additional_outputs)
                            additional_output_node = factory_upgrade_node.find('AdditionalOutput')
                            if additional_output_node is not None:
                                additional_outputs = []
                                for item in additional_output_node.findall('Item'):
                                    same = item.findtext('ForceProductSameAsFactoryOutput')
                                    prod_guid = item.findtext('Product')
                                    cycle = item.findtext('AdditionalOutputCycle')
                                    amount = item.findtext('Amount')
                                    if same and same.strip() == '1':
                                        additional_outputs.append(f"+{amount}/{cycle}")
                                    elif prod_guid and prod_guid in texts_dict:
                                        prod_name = texts_dict[prod_guid]
                                        additional_outputs.append(f"{prod_name} +{amount}/{cycle}")
                                if len(additional_outputs) > 0:
                                    item_properties['additional_outputs'] = additional_outputs

                            # 투입 자원 제거 (removed_inputs)
                            input_amount_node = factory_upgrade_node.find('InputAmountUpgrade')
                            if input_amount_node is not None:
                                removed_inputs = []
                                for item in input_amount_node.findall('Item'):
                                    prod_guid = item.findtext('Product')
                                    amount = item.findtext('Amount')
                                    if prod_guid and prod_guid in texts_dict:
                                        if amount and int(amount) < 0:
                                            prod_name = texts_dict[prod_guid]
                                            removed_inputs.append(prod_name)
                                if len(removed_inputs) > 0:
                                    item_properties['removed_inputs'] = removed_inputs

                            # 토착 자원 제공 (fertility)
                            added_fertility_node = factory_upgrade_node.find('AddedFertility')
                            if added_fertility_node is not None:
                                fertility_guid = added_fertility_node.text
                                if fertility_guid and fertility_guid in texts_dict:
                                    item_properties['fertility'] = texts_dict[fertility_guid]

                        building_upgrade_node = elem.find('./Values/BuildingUpgrade')
                        if building_upgrade_node is not None:
                            # 필요한 노동력 (workforce)
                            workforce = get_value(building_upgrade_node.find('WorkforceAmountUpgrade'))
                            if workforce:
                                item_properties['workforce'] = workforce

                            # 유지비 (maintenance)
                            maintenance = get_value(building_upgrade_node.find('MaintenanceUpgrade'))
                            if maintenance:
                                item_properties['maintenance'] = maintenance

                            # 대체 노동력 (replacing_workforce)
                            replacing_workforce_guid = building_upgrade_node.findtext('ReplacingWorkforce')
                            if replacing_workforce_guid and replacing_workforce_guid in texts_dict:
                                item_properties['replacing_workforce'] = texts_dict[replacing_workforce_guid]

                        shipyard_upgrade_node = elem.find('./Values/ShipyardUpgrade')
                        if shipyard_upgrade_node is not None:
                            # 건설 비용 (construction_cost)
                            construction_cost = get_value(shipyard_upgrade_node.find('ConstructionCostInPercent'))
                            if construction_cost:
                                item_properties['construction_cost'] = construction_cost

                            # 배 도면 (add_assembly_options)
                            add_assembly_options_node = shipyard_upgrade_node.find('AddAssemblyOptions')
                            if add_assembly_options_node is not None:
                                assemblies = []
                                for item in add_assembly_options_node.findall('Item'):
                                    guid = item.findtext('NewOption')
                                    if guid and guid in texts_dict:
                                        assemblies.append(texts_dict[guid])
                                if len(assemblies) > 0:
                                    item_properties['add_assembly_options'] = assemblies

                        incident_infectable_upgrade_node = elem.find('./Values/IncidentInfectableUpgrade')
                        if incident_infectable_upgrade_node is not None:
                            # 화재 확률 (incident_fire)
                            incident_fire = get_value(incident_infectable_upgrade_node.find('IncidentFireIncreaseUpgrade'))
                            if incident_fire:
                                item_properties['incident_fire'] = incident_fire

                            # 질병 확률 (incident_illness)
                            incident_illness = get_value(incident_infectable_upgrade_node.find('IncidentIllnessIncreaseUpgrade'))
                            if incident_illness:
                                item_properties['incident_illness'] = incident_illness

                            # 폭동 확률 (incident_riot)
                            incident_riot = get_value(incident_infectable_upgrade_node.find('IncidentRiotIncreaseUpgrade'))
                            if incident_riot:
                                item_properties['incident_riot'] = incident_riot

                            # 폭발 확률 (incident_explosion)
                            incident_explosion = get_value(incident_infectable_upgrade_node.find('IncidentExplosionIncreaseUpgrade'))
                            if incident_explosion:
                                item_properties['incident_explosion'] = incident_explosion

                        culture_upgrade_node = elem.find('./Values/CultureUpgrade')
                        if culture_upgrade_node is not None:
                            # 매력도 (attractiveness) / 부정적인 매력도 (negative_attractiveness)
                            attractiveness = get_value(culture_upgrade_node.find('AttractivenessUpgrade'))
                            if attractiveness:
                                if attractiveness.startswith('-') and attractiveness.endswith('%'):
                                    item_properties['negative_attractiveness'] = attractiveness
                                else:
                                    item_properties['attractiveness'] = attractiveness

                        visitor_harbor_upgrade_node = elem.find('./Values/VisitorHarborUpgrade')
                        if visitor_harbor_upgrade_node is not None:
                            # 방문 증가 (spawn_probability)
                            spawn_probability = get_value(visitor_harbor_upgrade_node.find('SpawnProbabilityFactor'))
                            if spawn_probability:
                                item_properties['spawn_probability'] = spawn_probability

                        module_owner_upgrade_node = elem.find('./Values/ModuleOwnerUpgrade')
                        if module_owner_upgrade_node is not None:
                            # 모듈 수 (module_limit)
                            module_limit = get_value(module_owner_upgrade_node.find('ModuleLimitPercent'))
                            if module_limit:
                                item_properties['module_limit'] = module_limit

                        residence_upgrade_node = elem.find('./Values/ResidenceUpgrade')
                        if residence_upgrade_node is not None:
                            # 물품 소비량 (good_consumption)
                            good_consumption_node = residence_upgrade_node.find('GoodConsumptionUpgrade')
                            if good_consumption_node is not None:
                                good_consumption = []
                                for item in good_consumption_node.findall('Item'):
                                    guid = item.findtext('ProvidedNeed')
                                    amount = get_value(item.find('AmountInPercent'))
                                    if guid and guid in texts_dict and amount:
                                        name = texts_dict[guid]
                                        good_consumption.append(f"{name} {amount}")
                                if len(good_consumption) > 0:
                                    item_properties['good_consumption'] = good_consumption

                        repair_crane_upgrade_node = elem.find('./Values/RepairCraneUpgrade')
                        if repair_crane_upgrade_node is not None:
                            # 수리 반경 (heal_radius)
                            heal_radius = get_value(repair_crane_upgrade_node.find('HealRadiusUpgrade'))
                            if heal_radius:
                                item_properties['heal_radius'] = heal_radius

                            # 수리 속도 (heal_per_minute)
                            heal_per_minute = get_value(repair_crane_upgrade_node.find('HealPerMinuteUpgrade'))
                            if heal_per_minute:
                                item_properties['heal_per_minute'] = heal_per_minute

                            # 건물 수리 속도 (heal_buildings_per_minute)
                            heal_buildings_per_minute = get_value(repair_crane_upgrade_node.find('HealBuildingsPerMinuteUpgrade'))
                            if heal_buildings_per_minute:
                                item_properties['heal_buildings_per_minute'] = heal_buildings_per_minute

                        industrializable_upgrade_node = elem.find('./Values/IndustrializableUpgrade')
                        if industrializable_upgrade_node is not None:
                            # 전기 제공 (industrialization)
                            provide_industrialization = industrializable_upgrade_node.findtext('ProvideIndustrialization')
                            if provide_industrialization and provide_industrialization.strip() == '1':
                                item_properties['industrialization'] = True

                        passive_trade_good_gen_upgrade_node = elem.find('./Values/PassiveTradeGoodGenUpgrade')
                        if passive_trade_good_gen_upgrade_node is not None:
                            # 항구 활동 (gen_probability)
                            gen_probability = get_value(passive_trade_good_gen_upgrade_node.find('GenProbability'), force_percental=True)
                            if gen_probability:
                                item_properties['gen_probability'] = gen_probability
                            
                        kontor_upgrade_node = elem.find('./Values/KontorUpgrade')
                        if kontor_upgrade_node is not None:
                            # 지분 거래 금지 (block_buy_share)
                            block_buy_share = kontor_upgrade_node.findtext('BlockBuyShare')
                            if block_buy_share and block_buy_share.strip() == '1':
                                item_properties['block_buy_share'] = True

                            # 인수 금지 (block_hostile_takeover)
                            block_hostile_takeover = kontor_upgrade_node.findtext('BlockHostileTakeover')
                            if block_hostile_takeover and block_hostile_takeover.strip() == '1':
                                item_properties['block_hostile_takeover'] = True    

                            # 강철 의지 (happiness_ignores_morale)
                            happiness_ignores_morale = kontor_upgrade_node.findtext('HappinessIgnoresMorale')
                            if happiness_ignores_morale and happiness_ignores_morale.strip() == '1':
                                item_properties['happiness_ignores_morale'] = True

                        pier_upgrade_node = elem.find('./Values/PierUpgrade')
                        if pier_upgrade_node is not None:
                            # 화물 선적 속도 (pier_speed)
                            pier_speed = get_value(pier_upgrade_node.find('PierSpeedUpgrade'))
                            if pier_speed:
                                item_properties['pier_speed'] = pier_speed

                        attacker_upgrade_node = elem.find('./Values/AttackerUpgrade')
                        if attacker_upgrade_node is not None:
                            # 사거리 (attack_range)
                            attack_range = get_value(attacker_upgrade_node.find('AttackRangeUpgrade'))
                            if attack_range:
                                item_properties['attack_range'] = attack_range

                            # 시야 범위 (line_of_sight)
                            line_of_sight = get_value(attacker_upgrade_node.find('LineOfSightUpgrade'))
                            if line_of_sight:
                                item_properties['line_of_sight'] = line_of_sight

                            # 명중률 (accuracy)
                            accuracy = get_value(attacker_upgrade_node.find('AccuracyUpgrade'))
                            if accuracy:
                                item_properties['accuracy'] = accuracy

                        attackable_upgrade_node = elem.find('./Values/AttackableUpgrade')
                        if attackable_upgrade_node is not None:
                            # HP (max_hitpoints)
                            max_hitpoint = get_value(attackable_upgrade_node.find('MaxHitpointsUpgrade'))
                            if max_hitpoint:
                                item_properties['max_hitpoints'] = max_hitpoint

                            # 받는 피해 (damage_receive_factor)
                            factor = attackable_upgrade_node.find('DamageReceiveFactor')
                            if factor is not None:
                                normal = factor.find('Normal')
                                if normal is not None:
                                    item_properties['damage_receive_factor_normal'] = get_factor(normal)
                                torpedo = factor.find('Torpedo')
                                if torpedo is not None:
                                    item_properties['damage_receive_factor_torpedo'] = get_factor(torpedo)
                                cannon = factor.find('Cannon')
                                if cannon is not None:
                                    item_properties['damage_receive_factor_cannon'] = get_factor(cannon)
                                bigbertha = factor.find('BigBertha')
                                if bigbertha is not None:
                                    item_properties['damage_receive_factor_bigbertha'] = get_factor(bigbertha)

                        items_list.append({
                            "guid": int(item_guid),
                            "type": template,
                            "name": item_name,
                            "icon": icon_path,
                            "properties": item_properties
                        })
                        
            elem.clear()
            
    print(f" -> Extracted {len(items_list):,} items.\n")
    return items_list

def get_value(node, force_percental=False, reverse_sign=False):
    if node is None:
        return None
    
    val = node.findtext('Value')

    if val is not None:
        percental = node.findtext('Percental')
        is_percental = force_percental or (percental and percental.strip() == '1')
    else:
        if not node.text or not node.text.strip():
            return None
        val = node.text.strip()
        is_percental = force_percental or node.tag.endswith('Percent')

    try:
        val_int = int(val)
        if reverse_sign:
            val_int = -val_int
        prefix = "+" if val_int > 0 else ""
        suffix = "%" if is_percental else ""
        return f"{prefix}{val_int}{suffix}"
    except ValueError:
        return val
    
def get_factor(node):
    if node is None:
        return None
    
    factor = node.findtext('Factor')
    if factor is None:
        factor = node.text

    try:
        factor_float = float(factor)
        return f"{(int)(factor_float*100)}%"
    except ValueError:
        return factor

def save_to_json(data, output_path):
    print(f"3/3: Saving data to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(" -> Successfully saved! 🎉")

if __name__ == "__main__":
    korean_texts = load_korean_texts("texts_korean.xml")
    items_data = extract_items_data("assets.xml", korean_texts)
    save_to_json(items_data, "items.json")
