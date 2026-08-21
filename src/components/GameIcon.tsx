/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IconDefinition } from '../types/index';
import { ALL_ICONS } from '../assets/icons';
import { motion } from 'motion/react';

export const GAME_ICONS = ALL_ICONS;

export type GameIconName = keyof typeof GAME_ICONS;

interface GameIconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  rotate?: number;
  animation?: 'none' | 'bounce' | 'pulse' | 'spin' | 'ping' | 'float';
  fallbackName?: GameIconName | string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  name,
  path: directPath,
  className,
  size,
  width,
  height,
  color,
  rotate: directRotate,
  animation: directAnimation,
  fallbackName,
  ...props
}) => {
  const getIconDef = (nameStr: string | undefined): IconDefinition | undefined => {
    if (!nameStr) return undefined;
    return (GAME_ICONS as any)[nameStr];
  };

  const def = getIconDef(name) || (fallbackName ? getIconDef(fallbackName) : undefined);
  const metadata = typeof def === 'object' ? def : null;

  const rawHtml = (metadata as any)?.rawHtml;
  const path = directPath || (typeof def === 'string' ? def : metadata?.path);

  if (!path && !rawHtml) {
    return null;
  }

  const finalColor = color || metadata?.color || "currentColor";
  const finalRotate = directRotate !== undefined ? directRotate : (metadata?.rotate || 0);
  const finalAnimation = directAnimation || metadata?.animation;

  const w = width || size || 24;
  const h = height || size || 24;

  const animationVariants = {
    bounce: {
      y: [0, -4, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    },
    float: {
      y: [0, -8, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    spin: {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    ping: {
      scale: [1, 1.5, 1],
      opacity: [1, 0, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
    }
  };

  const anim = finalAnimation && finalAnimation !== 'none' ? animationVariants[finalAnimation] : {};

  if (rawHtml) {
    return (
      <motion.svg
        viewBox={(metadata as any).viewBox || "0 0 512 512"}
        width={w}
        height={h}
        fill={finalColor}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          rotate: finalRotate,
          ...anim
        }}
        dangerouslySetInnerHTML={{ __html: rawHtml }}
        {...props as any}
      />
    );
  }

  return (
    <motion.svg
      viewBox="0 0 512 512"
      width={w}
      height={h}
      fill={finalColor}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        rotate: finalRotate,
        ...anim
      }}
      {...props as any}
    >
      <path d={path} />
    </motion.svg>
  );
};
