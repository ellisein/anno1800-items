import xml.etree.ElementTree as ET
import json

TEMPLATES = [
    # Items
    'GuildhouseItem',
    'VehicleItem',
    'ActiveItem',
    'HarborOfficeItem',
    'TownhallItem',
    'ShipSpecialist',

    # Additional data
    'HarbourOfficeBuff',
    'VehicleBuff',
    'RewardPool'
];

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
    text_overrides = {}
    items_list = []
    
    context_1 = ET.iterparse(assets_path, events=('end',))
    for event, elem in context_1:
        if elem.tag == 'Asset':
            template = elem.findtext('Template')
            if template and template == 'ItemEffectTargetPool':
                guid = elem.findtext('./Values/Standard/GUID')
                text = elem.findtext('./Values/Text/TextOverride')
                if guid and text:
                    text_overrides[guid] = text
            elem.clear()
    
    context_2 = ET.iterparse(assets_path, events=('end',))
    for event, elem in context_2:
        if elem.tag == 'Asset':
            template = elem.findtext('Template')

            if template and template in TEMPLATES:
                standard = elem.find('./Values/Standard')

                if standard is not None:
                    item_guid = standard.findtext('GUID')
                    icon_path = standard.findtext('IconFilename')

                    if icon_path:
                        icon_path = icon_path.replace('\\', '/')

                    if item_guid:
                        if item_guid in texts_dict:
                            item_name = texts_dict[item_guid]
                        else:
                            item_name = None

                        item_properties = {}

                        item_node = elem.find('./Values/Item')
                        if item_node is not None:
                            # 아이템 등급 (rarity)
                            rarity = item_node.findtext('Rarity')
                            item_properties['rarity'] = rarity.lower() if rarity else 'common'

                            # 배치 (allocation)
                            allocation = item_node.findtext('Allocation')
                            if allocation:
                                item_properties['allocation'] = allocation

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
                                if target_guid:
                                    if target_guid in text_overrides:
                                        item_properties['targets'].append(texts_dict[text_overrides[target_guid]])
                                    elif target_guid in texts_dict:
                                        item_properties['targets'].append(texts_dict[target_guid])
                                if target_guid == '190775':
                                    item_properties['unit'] = '소방관'
                                elif target_guid in ['8905', '190776']:
                                    item_properties['unit'] = '경찰관'
                                elif target_guid == '190777':
                                    item_properties['unit'] = '의사'
                                elif target_guid == '112669':
                                    item_properties['unit'] = '레인저'

                        item_action_node = elem.find('./Values/ItemAction')
                        if item_action_node is not None:
                            # 재사용 대기시간 (action_cooldown)
                            action_cooldown = item_action_node.findtext('ActionCooldown')
                            if action_cooldown:
                                item_properties['action_cooldown'] = format_time_ms(action_cooldown)

                            # 지속 시간 (action_duration)
                            action_duration = item_action_node.findtext('ActionDuration')
                            if action_duration:
                                item_properties['action_duration'] = format_time_ms(action_duration)

                            # 활성 버프
                            active_buff = item_action_node.findtext('ActiveBuff')
                            if active_buff:
                                item_properties['active_buff'] = int(active_buff)

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

                            # 범위 (public_service_full_satisfaction_distance)
                            public_service_full_satisfaction_distance = get_value(building_upgrade_node.find('PublicServiceFullSatisfactionDistance'))
                            if public_service_full_satisfaction_distance:
                                item_properties['public_service_full_satisfaction_distance'] = public_service_full_satisfaction_distance

                            # 대체 노동력 (replacing_workforce)
                            replacing_workforce_guid = building_upgrade_node.findtext('ReplacingWorkforce')
                            if replacing_workforce_guid and replacing_workforce_guid in texts_dict:
                                item_properties['replacing_workforce'] = texts_dict[replacing_workforce_guid]

                            # 추가 유닛 (resolver_unit_count)
                            resolver_unit_count = get_value(building_upgrade_node.find('ResolverUnitCountUpgrade'))
                            if resolver_unit_count:
                                item_properties['resolver_unit_count'] = resolver_unit_count

                            # 시행 속도 (resolver_unit_decrease)
                            resolver_unit_decrease = get_value(building_upgrade_node.find('ResolverUnitDecreaseUpgrade'))
                            if resolver_unit_decrease:
                                item_properties['resolver_unit_decrease'] = resolver_unit_decrease

                            # 범위 (resolver_unit_movement_speed)
                            resolver_unit_movement_speed = get_value(building_upgrade_node.find('ResolverUnitMovementSpeedUpgrade'))
                            if resolver_unit_movement_speed:
                                item_properties['resolver_unit_movement_speed'] = resolver_unit_movement_speed

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
                                if not incident_fire.endswith('%'): incident_fire += '0%'
                                item_properties['incident_fire'] = incident_fire

                            # 질병 확률 (incident_illness)
                            incident_illness = get_value(incident_infectable_upgrade_node.find('IncidentIllnessIncreaseUpgrade'))
                            if incident_illness:
                                if not incident_illness.endswith('%'): incident_illness += '0%'
                                item_properties['incident_illness'] = incident_illness

                            # 폭동 확률 (incident_riot)
                            incident_riot = get_value(incident_infectable_upgrade_node.find('IncidentRiotIncreaseUpgrade'))
                            if incident_riot:
                                if not incident_riot.endswith('%'): incident_riot += '0%'
                                item_properties['incident_riot'] = incident_riot

                            # 폭발 확률 (incident_explosion)
                            incident_explosion = get_value(incident_infectable_upgrade_node.find('IncidentExplosionIncreaseUpgrade'))
                            if incident_explosion:
                                if not incident_explosion.endswith('%'): incident_explosion += '0%'
                                item_properties['incident_explosion'] = incident_explosion

                            # 유행성 독감 확률 (incident_arctic_illness)
                            incident_arctic_illness = get_value(incident_infectable_upgrade_node.find('IncidentArcticIllnessIncreaseUpgrade'))
                            if incident_arctic_illness:
                                if not incident_arctic_illness.endswith('%'): incident_arctic_illness += '0%'
                                item_properties['incident_arctic_illness'] = incident_arctic_illness

                        incident_influencer_upgrade_node = elem.find('./Values/IncidentInfluencerUpgrade')
                        if incident_influencer_upgrade_node is not None:
                            # 동원 조건 (special_unit_happiness_threshold)
                            special_unit_happiness_threshold = get_value(incident_influencer_upgrade_node.find('SpecialUnitHappinessThresholdUpgrade'))
                            if special_unit_happiness_threshold:
                                item_properties['special_unit_happiness_threshold'] = special_unit_happiness_threshold

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

                            # 행복도
                            additional_happiness = get_value(residence_upgrade_node.find('AdditionalHappiness'))
                            if additional_happiness:
                                item_properties['additional_happiness'] = additional_happiness

                            # 보너스 제공 (need_provide_need)
                            need_provide_need_node = residence_upgrade_node.find('NeedProvideNeedUpgrade')
                            if need_provide_need_node is not None:
                                provide_needs = []
                                subtitute_needs = []
                                for item in need_provide_need_node.findall('Item'):
                                    provide_need = item.findtext('ProvidedNeed')
                                    substitute_need = item.findtext('SubstituteNeed')
                                    if provide_need and provide_need in texts_dict and substitute_need and substitute_need in texts_dict:
                                        provide_needs.append(texts_dict[provide_need])
                                        subtitute_needs.append(texts_dict[substitute_need])
                                if len(provide_needs) > 0 and len(subtitute_needs) > 0:
                                    item_properties['need_provide_need'] = {
                                        'provide_needs': provide_needs,
                                        'subtitute_needs': subtitute_needs
                                    }

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
                            gen_probability = get_value(passive_trade_good_gen_upgrade_node.find('GenProbability'), force_percental=True, hide_sign=True)
                            if gen_probability:
                                item_properties['gen_probability'] = gen_probability
                            gen_pool = passive_trade_good_gen_upgrade_node.findtext('GenPool')
                            if gen_pool:
                                item_properties['gen_pool'] = int(gen_pool)
                            
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
                            # 포탄당 피해량 (base_damage)
                            base_damage = get_value(attacker_upgrade_node.find('BaseDamageUpgrade'))
                            if base_damage:
                                item_properties['base_damage'] = base_damage

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

                            # 공격 속도 (attack_speed)
                            attack_speed = get_value(attacker_upgrade_node.find('AttackSpeedUpgrade'), force_percental=True)
                            if attack_speed:
                                item_properties['attack_speed'] = attack_speed

                            # 기개 (morale_damage)
                            morale_damage = attacker_upgrade_node.find('MoraleDamage')
                            if morale_damage is not None:
                                item = morale_damage.find('Item')
                                if item is not None:
                                    item_properties['morale_damage'] = get_factor(item, field_name='MinDamageFactor')

                            # 불굴 (hitpoint_damage)
                            hitpoint_damage = attacker_upgrade_node.find('HitpointDamage')
                            if hitpoint_damage is not None:
                                item = hitpoint_damage.find('Item')
                                if item is not None:
                                    item_properties['hitpoint_damage'] = get_factor(item, field_name='MinDamageFactor')

                        attackable_upgrade_node = elem.find('./Values/AttackableUpgrade')
                        if attackable_upgrade_node is not None:
                            # HP (max_hitpoints)
                            max_hitpoint = get_value(attackable_upgrade_node.find('MaxHitpointsUpgrade'))
                            if max_hitpoint:
                                item_properties['max_hitpoints'] = max_hitpoint

                            # 자가 수리 (self_heal)
                            self_heal = get_value(attackable_upgrade_node.find('SelfHealUpgrade'))
                            if self_heal:
                                item_properties['self_heal'] = self_heal

                            # 수리 개시 (self_heal_paused_time_if_attacked)
                            self_heal_paused_time_if_attacked = get_value(attackable_upgrade_node.find('SelfHealPausedTimeIfAttackedUpgrade'))
                            if self_heal_paused_time_if_attacked:
                                item_properties['self_heal_paused_time_if_attacked'] = self_heal_paused_time_if_attacked

                            # 받는 피해 (damage_receive_factor)
                            damage_receive_factor = attackable_upgrade_node.find('DamageReceiveFactor')
                            if damage_receive_factor is not None:
                                normal = damage_receive_factor.find('Normal')
                                if normal is not None:
                                    item_properties['damage_receive_factor_normal'] = get_factor(normal)
                                torpedo = damage_receive_factor.find('Torpedo')
                                if torpedo is not None:
                                    item_properties['damage_receive_factor_torpedo'] = get_factor(torpedo)
                                cannon = damage_receive_factor.find('Cannon')
                                if cannon is not None:
                                    item_properties['damage_receive_factor_cannon'] = get_factor(cannon)
                                bigbertha = damage_receive_factor.find('BigBertha')
                                if bigbertha is not None:
                                    item_properties['damage_receive_factor_bigbertha'] = get_factor(bigbertha)

                            # 사기 (morale_power)
                            morale_power = get_value(attackable_upgrade_node.find('MoralePowerUpgrade'))
                            if morale_power:
                                item_properties['morale_power'] = morale_power

                        irrigation_upgrade_node = elem.find('./Values/IrrigationUpgrade')
                        if irrigation_upgrade_node is not None:
                            # 관개 시설 수용량 (pipe_capacity)
                            pipe_capacity = get_value(irrigation_upgrade_node.find('PipeCapacityUpgrade'))
                            if pipe_capacity:
                                item_properties['pipe_capacity'] = pipe_capacity

                        vehicle_upgrade_node = elem.find('./Values/VehicleUpgrade')
                        if vehicle_upgrade_node is not None:
                            # 이동 속도 (forward_speed)
                            forward_speed = get_value(vehicle_upgrade_node.find('ForwardSpeedUpgrade'))
                            if forward_speed:
                                item_properties['forward_speed'] = forward_speed

                            # 유지비 (maintenance)
                            maintenance = get_value(vehicle_upgrade_node.find('MaintainanceUpgrade'))
                            if maintenance:
                                item_properties['maintenance'] = maintenance

                            # 화물에 의한 속도 저하 (ignore_weight_factor)
                            ignore_weight_factor = get_value(vehicle_upgrade_node.find('IgnoreWeightFactorUpgrade'), reverse_sign=True)
                            if ignore_weight_factor:
                                item_properties['ignore_weight_factor'] = ignore_weight_factor

                            # 피해에 의한 속도 저하 (ignore_damage_factor)
                            ignore_damage_factor = get_value(vehicle_upgrade_node.find('IgnoreDamageFactorUpgrade'), reverse_sign=True)
                            if ignore_damage_factor:
                                item_properties['ignore_damage_factor'] = ignore_damage_factor

                            # 평화 모드 (white_flag)
                            white_flag = vehicle_upgrade_node.findtext('ActivateWhiteFlag')
                            if white_flag and white_flag.strip() == '1':
                                item_properties['white_flag'] = True

                            # 해적 모드 (pirate_flag)
                            pirate_flag = vehicle_upgrade_node.findtext('ActivatePirateFlag')
                            if pirate_flag and pirate_flag.strip() == '1':
                                item_properties['pirate_flag'] = True

                        trade_ship_upgrade_node = elem.find('./Values/TradeShipUpgrade')
                        if trade_ship_upgrade_node is not None:
                            # 구매 가격 (trade_price)
                            trade_price = get_factor(trade_ship_upgrade_node.find('ActiveTradePriceInPercent'), is_percental=True)
                            if trade_price:
                                item_properties['trade_price'] = trade_price

                            # 화물 선적 속도 (loading_speed)
                            loading_speed = get_value(trade_ship_upgrade_node.find('LoadingSpeedUpgrade'))
                            if loading_speed:
                                item_properties['loading_speed'] = loading_speed

                        diving_bell_upgrade_node = elem.find('./Values/DivingBellUpgrade')
                        if diving_bell_upgrade_node is not None:
                            # 고철 인양량 (scrap_amount)
                            scrap_amount = get_value(diving_bell_upgrade_node.find('ScrapAmountLevelUpgrade'))
                            if scrap_amount:
                                if not scrap_amount.endswith('%'): scrap_amount += '0%'
                                item_properties['scrap_amount'] = scrap_amount

                            # 유물 발견 확률 증가 (diving_museum)
                            diving_museum = diving_bell_upgrade_node.find('AllocationWeightUpgrade/Museum')
                            if diving_museum is not None:
                                item_properties['diving_museum'] = True

                            # 동물 발견 확률 증가 (diving_zoo)
                            diving_zoo = diving_bell_upgrade_node.find('AllocationWeightUpgrade/Zoo')
                            if diving_zoo is not None:
                                item_properties['diving_zoo'] = True

                            # 기계 발견 확률 증가 (diving_machine)
                            diving_machine = diving_bell_upgrade_node.find('AllocationWeightUpgrade/GuildHouse')
                            if diving_machine is not None:
                                item_properties['diving_machine'] = True

                            # 잠수종 희귀도 (diving_rarity)
                            rarity_weight_upgrade_node = diving_bell_upgrade_node.find('RarityWeightUpgrade')
                            diving_rarities = []
                            if rarity_weight_upgrade_node is not None:
                                for rarity_node in rarity_weight_upgrade_node:
                                    diving_rarities.append(rarity_node.tag.lower())
                            if len(diving_rarities) > 0:
                                item_properties['diving_rarity'] = diving_rarities

                        reward_pool_node = elem.find('./Values/RewardPool')
                        if reward_pool_node is not None:
                            items = []
                            for item in reward_pool_node.findall('ItemsPool/Item'):
                                item_link = item.findtext('ItemLink')
                                if item_link and item_link in texts_dict:
                                    name = texts_dict[item_link]
                                    if name:
                                        items.append(name)
                            if len(items) > 0:
                                item_properties['reward_pool'] = items

                        population_upgrade_node = elem.find('./Values/PopulationUpgrade')
                        if population_upgrade_node is not None:
                            # 근로 여건에 미치는 영향 (stress)
                            stress = get_value(population_upgrade_node.find('StressUpgrade'))
                            if stress:
                                item_properties['stress'] = stress

                            input_benefit_modifier = population_upgrade_node.find('InputBenefitModifier')
                            if input_benefit_modifier is not None:
                                benefit_additional_happiness_list = {}
                                benefit_additional_money_list = {}
                                benefit_additional_supply_list = {}
                                benefit_additional_research_list = {}
                                for item in input_benefit_modifier.findall('Item'):
                                    guid = item.findtext('Product')
                                    if guid and guid in texts_dict:
                                        name = texts_dict[guid]

                                        # 보너스 행복도 (benefit_additional_happiness)
                                        additional_happiness = get_value(item.find('AdditionalHappiness'))
                                        if additional_happiness:
                                            if additional_happiness in benefit_additional_happiness_list:
                                                benefit_additional_happiness_list[additional_happiness].append(name)
                                            else:
                                                benefit_additional_happiness_list[additional_happiness] = [name]

                                        # 보너스 수입 (benefit_additional_money)
                                        additional_money = get_value(item.find('AdditionalMoney'))
                                        if additional_money:
                                            if additional_money in benefit_additional_money_list:
                                                benefit_additional_money_list[additional_money].append(name)
                                            else:
                                                benefit_additional_money_list[additional_money] = [name]

                                        # 보너스 주민 (benefit_additional_supply)
                                        additional_supply = get_value(item.find('AdditionalSupply'))
                                        if additional_supply:
                                            if additional_supply in benefit_additional_supply_list:
                                                benefit_additional_supply_list[additional_supply].append(name)
                                            else:
                                                benefit_additional_supply_list[additional_supply] = [name]

                                        # 추가 연구 점수 (benefit_additional_research)
                                        additional_research = get_value(item.find('AdditionalResearch'))
                                        if additional_research:
                                            if additional_research in benefit_additional_research_list:
                                                benefit_additional_research_list[additional_research].append(name)
                                            else:
                                                benefit_additional_research_list[additional_research] = [name]

                                if len(benefit_additional_happiness_list) > 0:
                                    item_properties['benefit_additional_happiness'] = benefit_additional_happiness_list
                                if len(benefit_additional_money_list) > 0:
                                    item_properties['benefit_additional_money'] = benefit_additional_money_list
                                if len(benefit_additional_supply_list) > 0:
                                    item_properties['benefit_additional_supply'] = benefit_additional_supply_list
                                if len(benefit_additional_research_list) > 0:
                                    item_properties['benefit_additional_research'] = benefit_additional_research_list

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

def get_value(node, force_percental=False, reverse_sign=False, hide_sign=False):
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
        prefix = "+" if val_int > 0 and not hide_sign else ""
        suffix = "%" if is_percental else ""
        return f"{prefix}{val_int}{suffix}"
    except ValueError:
        return val
    
def get_factor(node, field_name='Factor', is_percental=False):
    if node is None:
        return None
    
    factor = node.findtext(field_name)
    if factor is None:
        factor = node.text

    try:
        factor_float = float(factor)
        if not is_percental:
            factor_float = factor_float * 100
        factor_int = (int)(factor_float) - 100
        prefix = "+" if factor_int > 0 else ""
        return f"{prefix}{factor_int}%"
    except ValueError:
        return factor
    
def format_time_ms(ms):
    try:
        total_seconds = int(ms) // 1000
    except (ValueError, TypeError):
        return ms

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes:02d}:{seconds:02d}"

def save_to_json(data, output_path):
    print(f"3/3: Saving data to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(" -> Successfully saved! 🎉")

if __name__ == "__main__":
    korean_texts = load_korean_texts("texts_korean.xml")
    items_data = extract_items_data("assets.xml", korean_texts)
    save_to_json(items_data, "items.json")
