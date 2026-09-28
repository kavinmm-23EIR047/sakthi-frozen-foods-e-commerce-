'use client';

import React, { ReactNode } from 'react';
import './ScrollStack.css';

interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
  style?: React.CSSProperties;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = '',
  style = {}
}) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
  </div>
);

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemStackDistance?: number;
  topOffset?: number;
  itemDistance?: number;
  itemScale?: number;
  stackPosition?: string | number;
  scaleEndPosition?: string | number;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemStackDistance = 20,
  topOffset = 85,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`scroll-stack-container ${className}`.trim()}>
      <div className="scroll-stack-list">
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return child;

          const stickyTop = topOffset + index * itemStackDistance;

          return (
            <div
              key={index}
              className="scroll-stack-item-wrapper"
              style={{
                top: `${stickyTop}px`,
                zIndex: index + 10,
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollStack;
