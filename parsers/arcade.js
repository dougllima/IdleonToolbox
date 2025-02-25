import { growth, tryToParse } from "../utility/helpers";
import { arcadeShop } from "../data/website-data";
import { getMaxClaimTime, getSecPerBall } from "./dungeons";

export const getArcade = (idleonData, account, serverVars) => {
  const arcadeRaw = tryToParse(idleonData?.ArcadeUpg) || idleonData?.ArcadeUpg;
  return parseArcade(arcadeRaw, account, serverVars);
}

const parseArcade = (arcadeRaw, account, serverVars) => {
  const balls = account?.accountOptions?.[74];
  const goldBalls = account?.accountOptions?.[75];
  const maxBalls = Math.round(getMaxClaimTime(account?.stamps)
    / Math.max(1, getSecPerBall(account)));
  const arcadeShopList = arcadeShop?.map((upgrade, index) => {
    const { x1, x2, func } = upgrade;
    const level = arcadeRaw?.[index];
    return {
      ...upgrade,
      level,
      active: serverVars?.ArcadeBonuses?.includes(index),
      bonus: growth(func, level, x1, x2, false),
      iconName: `PachiShopICON${index}`
    }
  });

  return {
    shop: arcadeShopList,
    balls,
    goldBalls,
    maxBalls
  }
}

export const getArcadeBonus = (list, effectName) => {
  return list?.find(({ effect }) => effect.includes(effectName))
}