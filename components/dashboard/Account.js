import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { cleanUnderscore, pascalCase, prefix } from "../../utility/helpers";
import HtmlTooltip from "../Tooltip";
import {
  areKeysOverdue,
  areSigilsOverdue,
  areTowersOverdue,
  areVialsReady,
  canKillBosses,
  gamingAlerts,
  guildTasks,
  hasAvailableSpiceClicks,
  isBallsOverdue,
  isStampReducerMaxed,
  refineryAlerts,
  riftAlerts,
  zeroBargainTag
} from "../../utility/dashboard/account";

const alertsMapping = {
  stampReducer: isStampReducerMaxed,
  sigils: areSigilsOverdue,
  refinery: refineryAlerts,
  towers: areTowersOverdue,
  keys: areKeysOverdue,
  arcadeBalls: isBallsOverdue,
  vials: areVialsReady,
  cooking: hasAvailableSpiceClicks,
  miniBosses: canKillBosses,
  bargainTag: zeroBargainTag,
  gaming: gamingAlerts,
  guildTasks: guildTasks,
  rift: riftAlerts
}

const Account = ({ account, trackers, trackersOptions }) => {
  const [alerts, setAlerts] = useState();

  useEffect(() => {
    const anyTracker = trackers && Object.values(trackers).some((tracker) => tracker);
    if (anyTracker) {
      const tempAlerts = Object.entries(trackers).reduce((res, [trackerName, val]) => {
        if (val) {
          if (alertsMapping?.[trackerName]) {
            res[trackerName] = alertsMapping?.[trackerName](account, trackersOptions?.[trackerName]);
          }
        }
        return res;
      }, {});
      const anythingToShow = Object.values(tempAlerts).some((alert) => Array.isArray(alert) ? alert.length > 0 : alert)
      setAlerts(anythingToShow ? tempAlerts : null);
    } else {
      setAlerts(null)
    }
  }, [account, trackers, trackersOptions]);

  return <>
    <Card>
      <CardContent>
        {alerts ? <Stack direction={'row'} gap={2} flexWrap={'wrap'}>
          {trackers?.stampReducer && alerts?.stampReducer ?
            <Alert title={'Stamp reducer is maxed (90%)!'} iconPath={'data/Atom0'}/> : null}
          {trackers?.bargainTag && alerts?.bargainTag ?
            <Alert title={'You haven\'t use bargain tag even once today!'} iconPath={'data/aShopItems10'}/> : null}
          {trackers?.cooking && alerts?.cooking > 0 ?
            <Alert title={`You have ${alerts?.cooking} spice clicks left!`} iconPath={'data/CookingSpice0'}/> : null}
          {trackers?.arcadeBalls && alerts?.arcadeBalls ?
            <Alert title={'Max ball capacity has reached!'} iconPath={'data/PachiBall0'}/> : null}
          {trackers?.gaming && alerts?.gaming?.maxSprouts ?
            <Alert title={`Max sprouts capacity has reached (${alerts?.gaming?.maxSprouts})`}
                   imgStyle={{ objectFit: 'none' }}
                   iconPath={'etc/Sprouts'}/> : null}
          {trackers?.gaming && alerts?.gaming?.drops ?
            <Alert title={`Sprinkler drops has reached it's capacity (${alerts?.gaming?.drops})`}
                   iconPath={'data/GamingItem0b'}/> : null}
          {trackers?.gaming && alerts?.gaming?.squirrel?.hours >= 1 ?
            <Alert title={`${alerts?.gaming?.squirrel?.hours} hours has passed since you've clicked the squirrel!`}
                   iconPath={'data/GamingItem2'}/> : null}
          {trackers?.gaming && alerts?.gaming?.hours >= 1 ?
            <Alert title={`${alerts?.gaming?.shovel?.hours} hours has passed since you've clicked the shovel!`}
                   iconPath={'data/GamingItem1'}/> : null}
          {trackers?.rift && alerts?.rift?.gildedStamps > 0 ?
            <Alert title={`You have ${alerts?.rift?.gildedStamps} available gilded stamps`}
                   iconPath={'data/GildedStamp'}/> : null}
          {trackers?.miniBosses && alerts?.miniBosses?.length > 0 ?
            alerts?.miniBosses?.map(({ rawName, name, currentCount }) => <Alert key={rawName}
                                                                                title={`You can kill ${currentCount} ${cleanUnderscore(name)}s`}
                                                                                iconPath={`etc/${rawName}`}/>) : null}
          {trackers?.sigils && alerts?.sigils.length > 0 ?
            alerts?.sigils?.map(({ name, index }) => <Alert key={name}
                                                            title={`${cleanUnderscore(pascalCase(name))} is already unlocked!`}
                                                            iconPath={`data/aSiga${index}`}/>) : null}
          {trackers?.refinery && alerts?.refinery?.materials?.length > 0 ?
            alerts?.refinery?.materials?.map(({ rawName, missingMats }) => <Alert key={rawName}
                                                                                  title={<RefineryTitle
                                                                                    missingMats={missingMats}/>}
                                                                                  iconPath={`data/${rawName}`}/>) : null}
          {trackers?.refinery && alerts?.refinery?.rankUp?.length > 0 ?
            alerts?.refinery?.rankUp?.map(({ rawName, saltName }) => <Alert key={rawName}
                                                                            title={`${cleanUnderscore(saltName)} is ready to rank up!`}
                                                                            iconPath={`data/${rawName}`}/>) : null}
          {trackers?.towers && alerts?.towers?.length > 0 ?
            alerts?.towers?.map(({ name, index }) => <Alert key={name}
                                                            title={`${cleanUnderscore(pascalCase(name))} is ready to be built!`}
                                                            iconPath={`data/ConTower${index}`}/>) : null}
          {trackers?.keys && alerts?.keys?.length > 0 ?
            alerts?.keys?.map(({ name, rawName, totalAmount }) => <Alert key={name}
                                                                         title={`${totalAmount} of ${cleanUnderscore(pascalCase(name))} keys are ready!`}
                                                                         iconPath={`data/${rawName}`}/>) : null}
          {trackers?.vials && alerts?.vials?.length > 0 ?
            alerts?.vials?.map((vial) => <Alert key={vial?.mainItem}
                                                vial={vial}
                                                title={`You have enough materials to upgrade ${cleanUnderscore(vial?.name)} vial!`}
                                                iconPath={`data/${vial?.mainItem}`}/>) : null}
          {trackers?.guildTasks && alerts?.guildTasks?.daily ?
            <Alert title={`You have ${alerts?.guildTasks?.daily} uncompleted daily tasks`} iconPath={`etc/GP`}
                   imgStyle={{ filter: 'sepia(1) hue-rotate(46deg) saturate(1)' }}/> : null}
          {trackers?.guildTasks && alerts?.guildTasks?.weekly ?
            <Alert title={`You have ${alerts?.guildTasks?.weekly} uncompleted weekly tasks`} iconPath={`etc/GP`}
                   imgStyle={{ filter: 'sepia(1) hue-rotate(140deg) saturate(1)' }}/> : null}
        </Stack> : <Typography>There are no account alerts to display</Typography>}
      </CardContent>
    </Card>
  </>
};

const Alert = ({ title, iconPath, vial, imgStyle = {} }) => {
  return <HtmlTooltip title={title}>
    <Box sx={{ position: 'relative' }}>
      <IconImg style={{ ...imgStyle }} vial={vial} src={`${prefix}${iconPath}.png`} alt=""/>
      {vial ? <img key={`${vial?.name}`}
                   onError={(e) => {
                     e.target.src = `${prefix}data/aVials12.png`;
                     e.target.style = 'opacity: 0;'
                   }}
                   src={`${prefix}data/aVials${vial?.level === 0 ? '1' : vial?.level}.png`}
                   style={{ opacity: vial?.level === 0 ? .5 : 1, width: 35, height: 40 }}
                   alt={'vial image missing'}/> : null}
    </Box>
  </HtmlTooltip>
}

const RefineryTitle = ({ missingMats }) => {
  return <Stack alignItems={'center'}>
    Missing materials
    <Stack direction={'row'}>
      {missingMats.map(({ rawName }) =>
        <IconImg
          key={rawName}
          src={`${prefix}data/${rawName}.png`}
          alt=""/>)}
    </Stack>
  </Stack>
}

const IconImg = styled.img`
  width: ${({ vial }) => vial ? '25px' : '35px'};
  height: ${({ vial }) => vial ? '25px' : '35px'};
  object-fit: contain;
  ${({ vial }) => vial ? `top: 50%;left: 50%;transform:translate(-60%, -70%);` : ''}
  position: ${({ vial }) => vial ? 'absolute' : 'relative'};
`;

export default Account;
