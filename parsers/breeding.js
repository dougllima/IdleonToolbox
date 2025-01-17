import { arenaBonuses, petStats, petUpgrades } from "../data/website-data";
import { tryToParse } from "../utility/helpers";

export const getBreeding = (idleonData, account) => {
  const breedingRaw = tryToParse(idleonData?.Breeding) || idleonData?.Breeding;
  return parseBreeding(breedingRaw, account);
}

const parseBreeding = (breedingRaw, account) => {
  const eggs = breedingRaw?.[0];
  const deadCells = breedingRaw?.[3]?.[8];
  const speciesUnlocks = breedingRaw?.[1];
  const petUpgradesList = breedingRaw?.[2]?.map((upgradeLevel, index) => {
    return {
      ...(petUpgrades[index] || []),
      level: upgradeLevel
    }
  })
  const petsLevels = breedingRaw?.slice(4, 8);
  const shinyPetsLevels = breedingRaw?.slice(22, 26)
  const pets = petStats?.map((petList, worldIndex) => {
    const speciesUnlocked = speciesUnlocks?.[worldIndex];
    return petList?.map((pet, petIndex) => {
      let shinyLevel = new Array(19).fill(1)?.reduce((sum, _, index) => shinyPetsLevels?.[worldIndex]?.[petIndex] > Math.floor((1 + Math.pow(index + 1, 1.6)) * Math.pow(1.7, index + 1)) ? index + 2 : sum, 0)
      shinyLevel = shinyPetsLevels?.[worldIndex]?.[petIndex] === 0 ? 0 : shinyLevel === 0 ? 1 : shinyLevel;
      const passiveValue = Math.round(pet?.baseValue * shinyLevel);
      return {
        ...pet,
        level: petsLevels?.[worldIndex]?.[petIndex],
        shinyLevel,
        passive: pet?.passive?.replace('{', passiveValue),
        passiveValue,
        unlocked: petIndex < speciesUnlocked
      }
    })
  })

  return {
    eggs,
    deadCells,
    speciesUnlocks,
    maxArenaLevel: account?.accountOptions?.[89],
    petUpgrades: petUpgradesList,
    arenaBonuses,
    pets
  };
}

export const getShinyBonus = (pets, passiveName) => {
  return pets?.reduce((sum, world) => sum + world?.reduce((innerSum, {
    passive,
    passiveValue
  }) => innerSum + (passive.includes(passiveName) && passiveValue), 0), 0);
}