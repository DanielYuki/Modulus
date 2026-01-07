// Activity Indicator Component that we should improve/change in the future
// As of now, it is just an atm.icon wrapper

import type * as React from 'react';
import { Icon } from '../atm.icon'; // ATOMIC DESIGN EXCEPTION
import { type StyleVariants, style } from './activity-indicator.component.style';

// Available spinner icon types from Material Symbols
export const ActivityIndicatorTypes = {
  spinner: 'progress_activity',
  sync: 'sync',
  cog: 'settings',
} as const;

export type ActivityIndicatorType = keyof typeof ActivityIndicatorTypes;

export interface ActivityIndicatorProps extends StyleVariants {
  type: ActivityIndicatorType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = props => {
  const { type = 'spinner', size = 'md' } = props;

  const iconName = ActivityIndicatorTypes[type];

  return <Icon name={iconName} className={`${style()} animate-spin`} size={size} />;
};
