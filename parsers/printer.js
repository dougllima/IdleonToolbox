import { lavaLog, notateNumber, tryToParse } from "../utility/helpers";
import { getDeityLinkedIndex } from "./divinity";
import { isArtifactAcquired } from "./sailing";
import { getTalentBonus } from "./talents";
import { getSkillMasteryBonusByIndex } from "./misc";

export const getPrinter = (idleonData, charactersData, accountData) => {
  const rawPrinter = tryToParse(idleonData?.Print) || idleonData?.Printer;
  const rawExtraPrinter = tryToParse(idleonData?.PrinterXtra) || idleonData?.PrinterXtra;
  return parsePrinter(rawPrinter, rawExtraPrinter, charactersData, accountData);
}

const parsePrinter = (rawPrinter, rawExtraPrinter, charactersData, accountData) => {
  const harriepGodIndex = getDeityLinkedIndex(accountData?.divinity?.linkedDeities, charactersData, 3);
  const goldRelic = isArtifactAcquired(accountData?.sailing?.artifacts, 'Gold_Relic')
  const wiredInBonus = accountData?.lab?.labBonuses?.find((bonus) => bonus.name === 'Wired_In')?.active;
  const connectedPlayers = accountData?.lab?.connectedPlayers;
  const daysSinceLastSample = accountData?.accountOptions?.[125];
  const orbOfRemembranceKills = accountData?.accountOptions?.[138];
  const divineKnights = charactersData?.filter((character) => character?.class === 'Divine_Knight');
  const highestKingOfRemembrance = divineKnights?.reduce((res, { talents }) => {
    const kingOfRemembrance = getTalentBonus(talents, 3, "KING_OF_THE_REMEMBERED");
    if (kingOfRemembrance > res) {
      return kingOfRemembrance
    }
    return res;
  }, 0);

  const skillMasteryBonus = getSkillMasteryBonusByIndex(accountData?.totalSkillsLevels, accountData?.rift, 3);

  const printData = rawPrinter.slice(5, rawPrinter.length); // REMOVE 5 '0' ELEMENTS
  const printExtra = rawExtraPrinter;
  // There are 14 items per character
  // Every 2 items represent an item and it's value in the printer.
  // The first 5 pairs represent the stored samples in the printer.
  // The last 2 pairs represent the samples in production.
  const chunk = 14;
  const extraChunk = 10;

  return charactersData.map((charData, charIndex) => {
    let relevantPrinterData = printData.slice(
      charIndex * chunk,
      charIndex * chunk + chunk
    );
    if (printExtra) {
      const relevantExtraPrinterData = printExtra?.slice(
        charIndex * extraChunk,
        charIndex * extraChunk + extraChunk
      )
      relevantPrinterData.splice(-4, 0, relevantExtraPrinterData);
      relevantPrinterData = relevantPrinterData.flat();
    }
    return relevantPrinterData.reduce(
      (result, printItem, sampleIndex, array) => {
        if (sampleIndex % 2 === 0) {
          const sample = array
            .slice(sampleIndex, sampleIndex + 2)
            .map((item, sampleIndex) => sampleIndex === 0 ? item : item);
          let boostedValue = sample[1], labMulti = 1, rememberanceMulti = 1, skillMasteryMulti = 1, baseMath = 1,
            affectedBy = [];
          if (goldRelic?.acquired) {
            const goldRelicBonus = goldRelic?.acquired === 3 ? goldRelic?.eldritchMultiplier : goldRelic?.acquired === 2 ? goldRelic?.ancientMultiplier : 0;
            baseMath = 1 + ((daysSinceLastSample) * (1 + goldRelicBonus)) / 100;
            const notatedBonus = notateNumber(baseMath, "MultiplierInfo").replace('#', '');
            affectedBy = [...affectedBy, `Gold Relic (artifact) - x${notatedBonus}`];
          }
          const isPlayerConnected = connectedPlayers.find(({ playerId }) => playerId === charIndex);
          if (harriepGodIndex.includes(charIndex)) {
            affectedBy = [...affectedBy, 'Harriep (god) - x3'];
            if (isPlayerConnected && wiredInBonus) {
              affectedBy = [...affectedBy, 'Wired In (lab) - x2'];
              labMulti = 6;
            } else {
              labMulti = 3;
            }
          } else if (isPlayerConnected && wiredInBonus) {
            affectedBy = [...affectedBy, 'Wired In (lab) - x2'];
            labMulti = 2;
          }
          if (highestKingOfRemembrance > 0) {
            const bonus = lavaLog(orbOfRemembranceKills) * highestKingOfRemembrance;
            const notatedBonus = notateNumber(1 + bonus / 100, "MultiplierInfo").replace('#', '');
            affectedBy = [...affectedBy, `Divine Knight (King of..) x${notatedBonus}`];
            rememberanceMulti = 1 + bonus / 100;
          }
          if (skillMasteryBonus > 7) {
            skillMasteryMulti = 1 + skillMasteryBonus / 100
            affectedBy = [...affectedBy, `Skill Mastery x${skillMasteryMulti}`];
          }
          boostedValue *= labMulti * rememberanceMulti * baseMath * skillMasteryMulti;
          return [...result, {
            item: sample[0],
            value: sample[1],
            active: sampleIndex >= relevantPrinterData.length - 4,
            boostedValue,
            affectedBy
          }];
        }
        return result;
      }, []);
  });
}

// Harriep
// This character produces 3x more resources at 3d Printer! Works with the Lab Bonus, but won't affect the displayed printer amount.

// Gold Relic
// All 3d printer samples grow by +1% per day for 40 days. Resets when taking new samples.
// Samples grow by 1.5% for 60 days instead!