import React from 'react';
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { cleanUnderscore, prefix } from "../../../../../utility/helpers";
import styled from "@emotion/styled";

const BoatsAndCaptains = ({ boats, captains, captainsOnBoats }) => {
  return <>
    <Typography my={3} variant={'h3'}>Boats</Typography>
    <Stack mt={1} direction={'row'} flexWrap={'wrap'} gap={1}>
      {boats?.map(({
                     rawName,
                     level,
                     artifactChance,
                     loot,
                     lootLevel,
                     speedLevel,
                     boatIndex,
                     captainIndex,
                     captainMappedIndex,
                     island
                   }, index) => <Card
        key={`${rawName}-${index}`}>
        <CardContent sx={{ width: 250 }}>
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <BoatWrapper>
              <img style={{ width: 50, objectFit: 'contain' }}
                   src={`${prefix}etc/${rawName}.png`} alt=""/>
              <Typography component={'span'}>{boatIndex}</Typography>
            </BoatWrapper>
            <Stack>
              <Typography>Lv. {level}</Typography>
              <Typography variant={'caption'}>Captain {captainMappedIndex}</Typography>
              <Typography variant={'caption'}>Island - {cleanUnderscore(island)}</Typography>
            </Stack>
          </Stack>
          <Divider sx={{ my: 1 }}/>
          <Typography>Loot Value: {loot.value}</Typography>
          <Typography variant={'caption'}>Next level: {loot.nextLevelValue}</Typography>
          <Divider sx={{ my: 1 }}/>
          <Stack>
            <Typography variant={'caption'}>Base loot: {lootLevel}</Typography>
            <Typography variant={'caption'}>Base speed: {speedLevel}</Typography>
          </Stack>
          <Divider sx={{ my: 1 }}/>
          <Typography>Artifact Odds: {artifactChance}x</Typography>
        </CardContent>
      </Card>)}
    </Stack>
    <Typography my={3} variant={'h3'}>Captains</Typography>
    <Stack mt={1} direction={'row'} flexWrap={'wrap'} gap={1}>
      {captains?.map(({
                        firstBonusDescription,
                        secondBonusDescription,
                        level,
                        exp,
                        expReq,
                        firstBonusIndex,
                        secondBonusIndex,
                        captainIndex,
                        captainType
                      }, index) => <Card key={index}>
        <CardContent sx={{ width: 250, minHeight: 220 }}>
          {captainType >= 0 ? <>
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Stack gap={1}>
                <img style={{ width: 25, height: 25, objectFit: 'contain' }}
                     src={`${prefix}etc/Sailing_Skill_${firstBonusIndex}.png`} alt=""/>
                {secondBonusIndex > 0 ? <img style={{ width: 25, height: 25, objectFit: 'contain' }}
                                             src={`${prefix}etc/Sailing_Skill_${secondBonusIndex}.png`}
                                             alt=""/> : <>&nbsp;</>}
              </Stack>
              <img style={{ width: 40, height: 50, objectFit: 'contain' }}
                   src={`${prefix}etc/Captain_${captainType}.png`} alt=""/>
              <Stack>
                <Typography>{captainIndex}</Typography>
                <Typography variant={'caption'}>Boat {captainsOnBoats?.[captainIndex]}</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 1 }}/>
            <Stack>
              <Typography>Lv.{level}</Typography>
              <Typography>Exp: {exp} / {expReq}</Typography>
              <Divider sx={{ my: 1 }}/>
              <Typography variant={'caption'}>{cleanUnderscore(firstBonusDescription)}</Typography>
              <Typography variant={'caption'}>{cleanUnderscore(secondBonusDescription)}</Typography>
            </Stack>
          </> : <Stack alignItems={'center'} justifyContent={'center'}>
            <Typography>EMPTY</Typography>
          </Stack>}
        </CardContent>
      </Card>)}
    </Stack>
  </>
};

const BoatWrapper = styled.div`
  position: relative;

  & > span {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`

export default BoatsAndCaptains;