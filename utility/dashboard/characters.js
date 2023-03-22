import { differenceInHours, differenceInMinutes, isPast } from "date-fns";
import { getPostOfficeBonus } from "../../parsers/postoffice";
import { randomList } from "../../data/website-data";
import { isArenaBonusActive } from "../../parsers/misc";

// character, characters, characterIndex, account

export const isTrapOverdue = (account, characterIndex) => {
  return account?.traps?.[characterIndex].some((slot) => isPast(slot?.timeLeft));
}

export const isTrapMissing = (tools, account, characterIndex) => {
  const traps = account?.traps?.[characterIndex];
  const usedTrap = tools?.[4]?.rawName !== 'Blank' ? tools?.[4] : null;
  const maxTraps = usedTrap ? parseInt(usedTrap?.rawName?.charAt(usedTrap?.rawName?.length - 1) ?? 0) + 1 : traps?.length;
  return traps?.length < maxTraps;
}

export const isWorshipOverdue = (worship) => {
  const fivePercent = 5 * worship?.maxCharge / 100;
  return worship?.currentCharge >= worship?.maxCharge - fivePercent;
}

export const hasUnspentPoints = (postOffice) => {
  return postOffice?.unspentPoints > 0 && postOffice.boxes.some(({ level, maxLevel }) => level < maxLevel);
}

export const isProductionMissing = (equippedBubbles, account, characterIndex) => {
  const hammerBubble = equippedBubbles?.find(({ bubbleName }) => bubbleName === 'HAMMER_HAMMER');
  const maxProducts = hammerBubble ? 3 : 2;
  const production = account?.anvil?.[characterIndex]?.production?.filter(({ hammers }) => hammers > 0);
  const numOfHammers = production.reduce((res, { hammers }) => res + hammers, 0);
  return maxProducts - numOfHammers;
}

export const isAnvilOverdue = (account, characterIndex) => {
  const anvil = account?.anvil?.[characterIndex];
  return anvil?.production?.some(({ currentAmount }) => currentAmount >= anvil?.stats?.anvilCapacity)
}

export const isTalentReady = (character) => {
  const { postOffice, afkTime, cooldowns, flatTalents } = character;
  const relevantTalents = {
    32: true, // Printer_Go_Brr
    130: true, // Refinery_Throttle
    490: true, // Cranium,
    25: true // ITS_YOUR_BIRTHDAY!
  };
  const cooldownBonus = getPostOfficeBonus(postOffice, "Magician_Starterpack", 2);
  const cdReduction = Math.max(0, cooldownBonus);
  const timePassed = (new Date().getTime() - afkTime) / 1000;
  return Object.entries(cooldowns)?.reduce((res, [tId, talentCd]) => {
    if (!relevantTalents[tId]) return res;
    const talent = flatTalents?.find(({ talentId }) => parseInt(tId) === talentId);
    if (!talent) return res;
    const calculatedCooldown = (1 - cdReduction / 100) * talentCd;
    const actualCd = calculatedCooldown - timePassed;
    const cooldown = actualCd < 0 ? actualCd : new Date().getTime() + actualCd * 1000;
    if (!isPast(cooldown)) return res;
    return [...res,
      { name: talent?.name, skillIndex: talent?.skillIndex }];
  }, []);
}

export const isMissingEquippedBubble = (character, account) => {
  const arenaWave = account?.accountOptions?.[89];
  const waveReqs = randomList?.[53];
  const arenaBonusUnlock = isArenaBonusActive(arenaWave, waveReqs, 11);
  const maxEquippedBubbles = arenaBonusUnlock ? 3 : 2;
  return character?.equippedBubbles?.length < maxEquippedBubbles;
}

export const isObolMissing = (character) => {
  return character?.obols?.list?.filter(({ rawName }) => rawName === 'Blank')
}

export const isMissingStarSigns = (character, account) => {
  const maxStarSigns = account?.starSigns?.reduce((res, { starName, unlocked }) => {
    if (starName.includes('Chronus_Cosmos') && unlocked) {
      return res < 2 ? 2 : res;
    } else if (starName.includes('Hydron_Cosmos') && unlocked) {
      return res < 3 ? 3 : res;
    }
    return res;
  }, 1);
  return maxStarSigns - character?.starSigns.length;
}

export const isAkfForMoreThanTenHours = (character, lastUpdated) => {
  const timePassed = new Date().getTime() + (character?.afkTime - lastUpdated);
  const minutes = differenceInMinutes(new Date(), new Date(timePassed));
  if (minutes >= 5) {
    const hasUnendingEnergy = character?.activePrayers?.find(({ name }) => name === "Unending_Energy");
    const hours = differenceInHours(new Date(), new Date(timePassed));
    return hasUnendingEnergy && hours > 10;
  }
  return false;
}