import { items, itemsArray } from "../data/website-data";

export const addStoneDataToEquip = (baseItem, stoneData) => {
  if (!baseItem || !stoneData) return {};
  return Object.keys(stoneData)?.reduce((res, statName) => {
    if (statName === 'UQ1txt' || statName === 'UQ2txt') {
      return { ...res, [statName]: baseItem?.[statName] || stoneData?.[statName] };
    }
    const baseItemStat = baseItem?.[statName];
    const stoneStat = stoneData?.[statName];
    let sum = baseItemStat;
    if (isNaN(stoneStat) || stoneStat < 0) return { ...res, [statName]: stoneStat };
    sum = (baseItemStat || 0) + stoneStat;
    return { ...res, [statName]: parseFloat(sum) };
  }, {});
}

export const calculateItemTotalAmount = (array, itemName, exact) => {
  return array?.reduce((result, item) => {
    if (exact) {
      if (itemName === item?.name) {
        result += item?.amount;
      }
    } else {
      if (item?.name?.includes(itemName)) {
        result += item?.amount;
      }
    }
    return result;
  }, 0);
}

export const getStatFromEquipment = (item, statName) => {
  // %_SKILL_EXP
  const misc1 = item?.UQ1txt === statName ? item?.UQ1val : 0;
  const misc2 = item?.UQ2txt === statName ? item?.UQ2val : 0;
  return misc1 + misc2;
}

export const createItemsWithUpgrades = (charItems, stoneData, owner) => {
  return Array.from(Object.values(charItems)).reduce((res, item, itemIndex) => {
    const stoneResult = addStoneDataToEquip(items?.[item], stoneData?.[itemIndex]);
    return item ? [...res, {
      name: items?.[item]?.displayName, rawName: item,
      owner,
      ...(item === 'Blank' ? {} : { ...items?.[item], ...stoneResult })
    }] : res
  }, []);
}


export const getTotalStatFromEquipment = (arr, statKey, statName) => {
  return arr?.reduce((sum, item) => {
    if (item?.[statKey] && item?.[statKey] === statName) {
      return sum + item?.Amount;
    }
    return sum;
  }, 0);
}

export const findItemInInventory = (arr, itemName) => {
  if (!itemName) return {};
  return arr.reduce((res, item) => {
    const { name, owner, amount } = item;
    if (name === itemName) {
      if (res?.[owner]) {
        return { ...res, [owner]: { amount: res?.[owner]?.amount + 1 } };
      } else {
        return { ...res, [owner]: { amount } };
      }
    }
    return res;
  }, {});
};

export const findItemByDescriptionInInventory = (arr, desc) => {
  if (!desc) return {};
  const relevantItems = arr.filter(({
                                      misc,
                                      description
                                    }) => description?.toLowerCase()?.includes(desc?.toLowerCase()) || misc?.toLowerCase()?.includes(desc?.toLowerCase()), [])
    .map((item) => ({ ...item, ...items?.[item?.rawName] }));
  return relevantItems?.reduce((res, item) => {
    const itemExistsIndex = res?.findIndex((i) => i?.rawName === item?.rawName);
    const itemExists = res?.[itemExistsIndex];
    if (itemExists) {
      res?.splice(itemExistsIndex, 1);
      res = [...res, { ...item, owners: [...(itemExists?.owners || []), item?.owner] }]
    } else {
      res = [...res, { ...item, owners: [item?.owner] }]
    }
    return res;
  }, []);
};

export const flattenCraftObject = (craft) => {
  if (!craft) return [];
  const uniques = {};
  const tempCraft = JSON.parse(JSON.stringify(craft));

  const flatten = (innerCraft, unique) => {
    return innerCraft?.reduce((result, nextCraft) => {
      result.push(nextCraft);
      if (nextCraft.materials) {
        result = result.concat(flatten(nextCraft?.materials, unique));
        nextCraft.materials = [];
      }
      if (uniques[nextCraft?.itemName]) {
        uniques[nextCraft?.itemName].itemQuantity += nextCraft?.itemQuantity;
      } else {
        uniques[nextCraft?.itemName] = nextCraft;
      }
      return result;
    }, []);
  }

  flatten(tempCraft?.materials, uniques);
  return Object.values(uniques);
};

export const findQuantityOwned = (items, itemName) => {
  const inventoryItem = findItemInInventory(items, itemName);
  return Object.entries(inventoryItem)?.reduce((res, [owner, { amount }]) => {
    return {
      amount: res?.amount + amount,
      owner: [...res?.owner, owner]
    };
  }, { amount: 0, owner: [] });
}

export const addEquippedItems = (characters, shouldInclude) => {
  return shouldInclude ? characters?.reduce((res, {
    tools,
    equipment,
    food
  }) => [...res, ...tools, ...equipment, ...food], [])
    .filter(({ rawName }) => rawName !== 'Blank')
    .map((item) => item?.amount ? item : { ...item, amount: 1 }) : [];
};

export const getAllItems = (characters, account) => {
  const charItems = characters?.reduce((res, { inventory }) => [...res, ...inventory], []);
  return [...(charItems || []), ...(account?.storage || [])];
}

export const getAllTools = () => {
  const pickaxes = itemsArray?.filter(({ rawName }) => rawName?.match(/EquipmentTools[0-9]+/))
    ?.filter(({ rawName }) => rawName !== 'EquipmentTools13' && rawName !== 'EquipmentTools10');
  const hatchets = itemsArray?.filter(({ rawName }) => rawName?.match(/EquipmentToolsHatchet[0-9]+/))
    ?.filter(({ rawName }) => rawName !== 'EquipmentToolsHatchet0' &&
      rawName !== 'EquipmentToolsHatchet3' && rawName !== 'EquipmentToolsHatchet11' && rawName !== 'EquipmentToolsHatchet10');
  const fishingRods = itemsArray?.filter(({ rawName }) => rawName?.match(/FishingRod[0-9]+/))
    ?.filter(({ rawName }) => rawName !== 'FishingRod1');
  const catchingNets = itemsArray?.filter(({ rawName }) => rawName?.match(/CatchingNet[0-9]+/))
    ?.filter(({ rawName }) => rawName !== 'CatchingNet1');
  const traps = itemsArray?.filter(({ rawName }) => rawName?.match(/TrapBoxSet[0-9]+/));
  const skulls = itemsArray?.filter(({ rawName }) => rawName?.match(/WorshipSkull[0-9]+/))
    ?.filter(({ rawName }) => rawName !== 'WorshipSkull8');
  return [pickaxes, hatchets, fishingRods, catchingNets, traps, skulls]
}