import React from 'react';
import FmeIconSvg from './fme_white.svg';
import DatabaseSvg from './database_white.svg';
import Controllpanel from './kontrollpanel_white.svg';
import GeoserverSvg from './server_white.svg';

export const FmeIcon = () => (
  <img src={FmeIconSvg} alt="" style={{ width: 32, height: 32 }} />
);

export const DatabaseIcon = () => (
  <img src={DatabaseSvg} alt="" style={{ width: 32, height: 32 }} />
);

export const GeoserverIcon = () => (
  <img src={GeoserverSvg} alt="" style={{ width: 32, height: 32 }} />
);

export const ControllpanelIcon = () => (
  <img src={Controllpanel} alt="" style={{ width: 32, height: 32 }} />
);
