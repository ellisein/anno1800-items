import xml.etree.ElementTree as ET
import json
import os

RARITY_MAP = {
    'Common': '일반',
    'Uncommon': '특별',
    'Rare': '희귀',
    'Epic': '에픽',
    'Legendary': '전설'
}

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
            if template and template in ['GuildhouseItem']:
                standard = elem.find('./Values/Standard')

                if standard is not None:
                    guid = standard.findtext('GUID')
                    icon_path = standard.findtext('IconFilename')

                    if guid and icon_path and guid.strip() in texts_dict:
                        guid = guid.strip()
                        item_name = texts_dict[guid]
                        icon_path = icon_path.replace('\\', '/')

                        item_node = elem.find('./Values/Item')
                        rarity = ""
                        if item_node is not None:
                            rarity_en = item_node.findtext('Rarity')
                            rarity = RARITY_MAP.get(rarity_en, rarity_en) if rarity_en else ""

                        effect_targets_node = elem.find('./Values/ItemEffect/EffectTargets')
                        targets = []
                        if effect_targets_node is not None:
                            for target in effect_targets_node.findall('./Item'):
                                target_guid = target.findtext('GUID')
                                if target_guid and target_guid in texts_dict:
                                    targets.append(texts_dict[target_guid])

                        locked_node = elem.find('./Values/Locked')
                        dlc_dependency = ""
                        if locked_node is not None:
                            locked_guid = locked_node.findtext('DLCDependency')
                            if locked_guid and locked_guid in texts_dict:
                                dlc_dependency = f"{texts_dict[locked_guid]}"

                        effects = {}
                        for upgrade_type in ['FactoryUpgrade', 'BuildingUpgrade', 'ModuleOwnerUpgrade', 'IncidentInfectableUpgrade', 'CultureUpgrade', 'IndustrializableUpgrade']:
                            upgrade_node = elem.find(f'./Values/{upgrade_type}')
                            if upgrade_node is not None:
                                for child in upgrade_node:
                                    if child.tag == 'ProductivityUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            effects["생산성"] = f"+{val}%" if int(val) > 0 else f"{val}%"

                                    elif child.tag in ('WorkforceModifierInPercent', 'WorkforceAmountUpgrade'):
                                        val = child.findtext('Value')
                                        if val:
                                            effects["필요한 노동력"] = f"+{val}%" if int(val) > 0 else f"{val}%"
                                            
                                    elif child.tag == 'MaintenanceUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            effects["유지비"] = f"+{val}%" if int(val) > 0 else f"{val}%"

                                    elif child.tag == 'IncidentFireIncreaseUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            val_int = int(val) * 10
                                            effects["화재 확률"] = f"+{val_int}%" if val_int > 0 else f"{val_int}%"

                                    elif child.tag == 'IncidentIllnessIncreaseUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            val_int = int(val) * 10
                                            effects["질병 확률"] = f"+{val_int}%" if val_int > 0 else f"{val_int}%"

                                    elif child.tag == 'IncidentRiotIncreaseUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            effects["폭동 확률"] = f"+{val}%" if int(val) > 0 else f"{val}%"

                                    elif child.tag == 'IncidentExplosionIncreaseUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            val_int = int(val) * 10
                                            effects["폭발 확률"] = f"+{val_int}%" if val_int > 0 else f"{val_int}%"

                                    elif child.tag == 'NeededAreaPercentUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            val_int = int(val) * (-1)
                                            effects["산림 밀도"] = f"+{val_int}%" if val_int > 0 else f"{val_int}%"
                                            
                                    elif child.tag == 'AttractivenessUpgrade':
                                        val = child.findtext('Value')
                                        if val:
                                            percental = child.findtext('Percental')
                                            if percental and percental.strip() == '1':
                                                if int(val) > 0:
                                                    effects["매력도"] = f"+{val}%"
                                                else:
                                                    effects["부정적인 매력도"] = f"{val}%"
                                            else:
                                                effects["매력도"] = f"+{val}" if int(val) > 0 else f"{val}"
                                            
                                    elif child.tag == 'ModuleLimitPercent':
                                        val = child.text
                                        if val and val.strip():
                                            num = int(val.strip())
                                            effects["모듈 수"] = f"+{num}%" if num > 0 else f"{num}%"

                                    elif child.tag == 'ProvideIndustrialization':
                                        val = child.text
                                        if val and val.strip() == '1':
                                            effects["전기 제공"] = True

                                    elif child.tag == 'ReplacingWorkforce':
                                        val = child.text
                                        if val and val.strip():
                                            workforce_guid = val.strip()
                                            effects["대체 노동력"] = texts_dict[workforce_guid]

                                    elif child.tag == 'ReplaceInputs':
                                        replacements = []
                                        for rep_item in child.findall('.//Item'):
                                            old_guid = rep_item.findtext('OldInput')
                                            new_guid = rep_item.findtext('NewInput')
                                            
                                            if old_guid and new_guid and old_guid in texts_dict and new_guid in texts_dict:
                                                old_name = texts_dict[old_guid]
                                                new_name = texts_dict[new_guid]
                                                
                                                replacements.append({
                                                    "기존": old_name,
                                                    "대체": new_name
                                                })
                                                
                                        if replacements:
                                            effects['새로운 투입물'] = replacements

                                    elif child.tag == 'AdditionalOutput':
                                        additional_outputs = []
                                        for add_item in child.findall('.//Item'):
                                            same = add_item.findtext('ForceProductSameAsFactoryOutput')
                                            prod_guid = add_item.findtext('Product')
                                            cycle = add_item.findtext('AdditionalOutputCycle')
                                            amount = add_item.findtext('Amount')
                                            
                                            if same and same.strip() == '1':
                                                additional_outputs.append(f"기존 생산물 +{amount}/{cycle}")
                                            elif prod_guid and prod_guid in texts_dict:
                                                prod_name = texts_dict[prod_guid]
                                                additional_outputs.append(f"{prod_name} +{amount}/{cycle}")
                                                
                                        if additional_outputs:
                                            effects['추가 물품'] = additional_outputs

                                    elif child.tag == 'InputAmountUpgrade':
                                        removed_inputs = []
                                        for input_item in child.findall('.//Item'):
                                            prod_guid = input_item.findtext('Product')
                                            amount = input_item.findtext('Amount')
                                            
                                            if prod_guid and prod_guid in texts_dict:
                                                if amount and int(amount) < 0:
                                                    prod_name = texts_dict[prod_guid]
                                                    removed_inputs.append(prod_name)
                                                    
                                        if removed_inputs:
                                            effects['투입 자원 제거'] = removed_inputs

                                    elif child.tag == 'AddedFertility':
                                        fertility_guid = child.text
                                        if fertility_guid and fertility_guid in texts_dict:
                                            effects['토착 자원 제공'] = texts_dict[fertility_guid]
                        
                        items_list.append({
                            "guid": int(guid),
                            "type": template,
                            "name": item_name,
                            "rarity": rarity,
                            "dlc_dependency": dlc_dependency,
                            "icon": icon_path,
                            "targets": targets,
                            "effects": effects
                        })
                        
            elem.clear()
            
    print(f" -> Extracted {len(items_list):,} items.\n")
    return items_list

def save_to_json(data, output_path):
    print(f"3/3: Saving data to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(" -> Successfully saved! 🎉")

if __name__ == "__main__":
    korean_texts = load_korean_texts("texts_korean.xml")
    items_data = extract_items_data("assets.xml", korean_texts)
    save_to_json(items_data, "items.json")
