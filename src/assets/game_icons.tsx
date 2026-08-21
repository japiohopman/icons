import React from 'react';
import { IconDefinition } from '@/types/vault';
import { ALL_ICONS } from './icons';
import { motion } from 'motion/react';

export const GAME_ICONS = ALL_ICONS;

interface GameIconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  fallbackName?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  name,
  path: directPath,
  className,
  size,
  width,
  height,
  color,
  fallbackName = 'save',
  ...props
}) => {
  const getIconDef = (nameStr: string | undefined): IconDefinition | undefined => {
    if (!nameStr) return undefined;
    return (GAME_ICONS as Record<string, IconDefinition>)[nameStr];
  };

  const def = getIconDef(name) || getIconDef(fallbackName);
  const path = directPath || def?.path || 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z';

  const w = width || size || 24;
  const h = height || size || 24;
  const finalColor = color || "currentColor";

  return (
    <motion.svg
      viewBox="0 0 512 512"
      width={w}
      height={h}
      fill={finalColor}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(props as any)}
    >
      <path d={path} />
    </motion.svg>
  );
};
