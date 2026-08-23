/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { CatalogAsset } from '../types/asset';
import { getAssetById } from '../lib/catalog';

interface GameIconProps extends Omit<HTMLMotionProps<'img'>, 'children'> {
  asset?: CatalogAsset | null;
  name?: string;
  file?: string;
  size?: number;
  width?: number;
  height?: number;
  animation?: 'none' | 'bounce' | 'pulse' | 'spin' | 'ping' | 'float';
  fallbackName?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  asset,
  name,
  file,
  className,
  size,
  width,
  height,
  animation,
  fallbackName = 'combat.attack',
  ...props
}) => {
  let resolvedFile = file || asset?.file;

  if (!resolvedFile && name) {
    const found = getAssetById(name);
    if (found) {
      resolvedFile = found.file;
    } else {
      const cleanName = name.split('/').pop()?.replace(/\.svg$/, '') || name;
      resolvedFile = `/assets/icons/${cleanName}.svg`;
    }
  }

  if (!resolvedFile && fallbackName) {
    const fallback = getAssetById(fallbackName);
    resolvedFile = fallback ? fallback.file : `/assets/icons/${fallbackName}.svg`;
  }

  if (!resolvedFile) {
    return null;
  }

  const w = width || size || 24;
  const h = height || size || 24;

  const animationVariants = {
    bounce: {
      y: [0, -4, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
    float: {
      y: [0, -8, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
    spin: {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
    ping: {
      scale: [1, 1.5, 1],
      opacity: [1, 0, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeOut' },
    },
  };

  const anim = animation && animation !== 'none' ? animationVariants[animation] : {};

  return (
    <motion.img
      src={resolvedFile}
      alt={asset?.name || name || 'Icon'}
      width={w}
      height={h}
      className={`inline-block object-contain pointer-events-none select-none ${className || ''}`}
      animate={{ ...anim }}
      {...props}
    />
  );
};
