import {
  autoUpdate,
  ExtendedRefs,
  flip,
  offset as offsetMiddleware,
  Placement,
  ReferenceType,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import React from 'react';
import { Portal } from '../lib/utils.js';

type IUsePopupProps = {
  isOpen: boolean;
  setIsOpen: (isOpen) => void;
  offset?: number;
  placement?: Placement;
};

type IPopupProps = {
  children: any;
  isOpen: boolean;
  strategy: any;
  x: number | null;
  y: number | null;
  refs: ExtendedRefs<ReferenceType>;
  getFloatingProps: any;
  context: any;
};

export const usePopup = (props: IUsePopupProps) => {
  const { isOpen, setIsOpen, offset = 10, placement = 'bottom-start' } = props;

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offsetMiddleware(offset), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return { x, y, strategy, refs, getReferenceProps, getFloatingProps, context };
};

export const Popup = (props: IPopupProps) => {
  const tooltipRootSelector = '#popoverRoot';
  const { children, isOpen, x, y, strategy, refs, getFloatingProps, context } = props;

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: 150,
    initial: ({ side }) => {
      switch (side) {
        case 'left':
          return { opacity: 0, transform: `translate(12px, 0)` };
        case 'right':
          return { opacity: 0, transform: `translate(-12px, 0)` };
        case 'bottom':
          return { opacity: 0, transform: `translate(0, -12px)` };
        case 'top':
        default:
          return { opacity: 0, transform: `translate(0, 12px)` };
      }
    },
  });

  if (!isMounted) return null;

  return (
    <Portal selector={tooltipRootSelector}>
      <div
        style={{
          ...styles,
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
        }}
        ref={refs.setFloating}
        {...getFloatingProps()}
      >
        {children}
      </div>
    </Portal>
  );
};
