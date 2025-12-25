import React from 'react';
import './LogoLoop.css';

export type LogoItem = {
  node: React.ReactNode;
  href?: string;
  title?: string;
};

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  logoHeight?: number;
  gap?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLoop: React.FC<LogoLoopProps> = ({
  logos,
  speed = 20,
  logoHeight = 28,
  gap = 32,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  ariaLabel = 'Partner logos',
  className,
  style
}) => {
  const cssVariables = {
    '--logoloop-gap': `${gap}px`,
    '--logoloop-logoHeight': `${logoHeight}px`,
    '--logoloop-speed': `${speed}s`,
    ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor })
  } as React.CSSProperties;

  const rootClassName = [
    'logoloop',
    fadeOut && 'logoloop--fade',
    scaleOnHover && 'logoloop--scale-hover',
    className
  ].filter(Boolean).join(' ');

  const renderLogoItem = (item: LogoItem, key: React.Key) => {
    const content = (
      <span className="logoloop__node">
        {item.node}
      </span>
    );

    const itemContent = item.href ? (
      <a
        className="logoloop__link"
        href={item.href}
        aria-label={item.title || 'logo link'}
        target="_blank"
        rel="noreferrer noopener"
      >
        {content}
      </a>
    ) : (
      content
    );

    return (
      <li className="logoloop__item" key={key} role="listitem" title={item.title}>
        {itemContent}
      </li>
    );
  };

  // Duplicamos los logos para crear el efecto de loop infinito
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div 
      className={rootClassName} 
      style={{ ...cssVariables, ...style }} 
      role="region" 
      aria-label={ariaLabel}
    >
      <div className="logoloop__track">
        <ul className="logoloop__list" role="list">
          {duplicatedLogos.map((item, index) => renderLogoItem(item, index))}
        </ul>
      </div>
    </div>
  );
};

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
