import { tryToParse } from "../utility/helpers";
import { atomsInfo } from "../data/website-data";
import { getBubbleBonus } from "./alchemy";

export const getAtoms = (idleonData, account) => {
  const atomsRaw = tryToParse(idleonData?.Atoms) || idleonData?.Atoms
  const divinityRaw = tryToParse(idleonData?.Divinity) || idleonData?.Divinity;
  return parseAtoms(divinityRaw, atomsRaw, account);
}

const parseAtoms = (divinityRaw, atomsRaw, account) => {
  const localAtoms = atomsRaw ?? [];
  const particles = Math.floor(divinityRaw?.[39]);
  const atoms = atomsInfo?.map((atomInfo, index) => {
    const level = localAtoms?.[index];
    const atomColliderLevel = account?.towers?.data?.[8]?.level ?? 0;
    const atomReductionFromAtom = atomsRaw?.[9] > 0 ? 1 : 0;
    const bubbleBonus = getBubbleBonus(account?.alchemy?.bubbles, 'kazam', 'ATOM_SPLIT', false)
    const cost = (1 / (1 + (atomReductionFromAtom + (bubbleBonus + atomColliderLevel / 10)) / 100)) * (atomInfo?.x3 + atomInfo?.x1 * level) * Math.pow(atomInfo?.x2, level);
    const bonus = getAtomBonus(atomInfo, level, account);
    return { level, rawName: `Atom${index}`, ...(atomsInfo?.[index] || {}), cost: Math.floor(cost), bonus }
  });
  return {
    particles,
    atoms
  }
}

const getAtomBonus = (atomInfo, level, account) => {
  if (atomInfo?.name === 'Fluoride_-_Void_Plate_Chef') {
    const voidMeals = account?.cooking?.meals?.reduce((res, { level }) => level >= 30 ? res + 1 : res, 0);
    return 100 * (Math.pow(1 + atomInfo?.baseBonus * level / 100, voidMeals) - 1);
  } else if (atomInfo?.name === 'Carbon_-_Wizard_Maximizer') {
    return 2 * account?.towers?.wizardOverLevels;
  }
}