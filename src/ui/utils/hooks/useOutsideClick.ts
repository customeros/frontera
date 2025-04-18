/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';

import { useCallbackRef } from '@shared/hooks/useCallbackRef';

export interface UseOutsideClickProps {
  enabled?: boolean;
  handler?: (e: Event) => void;
  ref: React.RefObject<HTMLElement>;
}

export function useOutsideClick(props: UseOutsideClickProps) {
  const { ref, handler, enabled = true } = props;
  const savedHandler = useCallbackRef(handler);

  const stateRef = useRef({
    isPointerDown: false,
    ignoreEmulatedMouseEvents: false,
  });

  const state = stateRef.current;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown: any = (e: PointerEvent) => {
      if (isValidEvent(e, ref)) {
        state.isPointerDown = true;
      }
    };

    const onMouseUp: any = (event: MouseEvent) => {
      if (state.ignoreEmulatedMouseEvents) {
        state.ignoreEmulatedMouseEvents = false;

        return;
      }

      if (state.isPointerDown && handler && isValidEvent(event, ref)) {
        state.isPointerDown = false;
        savedHandler(event);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      state.ignoreEmulatedMouseEvents = true;

      if (handler && state.isPointerDown && isValidEvent(event, ref)) {
        state.isPointerDown = false;
        savedHandler(event);
      }
    };

    const doc = getOwnerDocument(ref.current);

    doc.addEventListener('mousedown', onPointerDown, true);
    doc.addEventListener('mouseup', onMouseUp, true);
    doc.addEventListener('touchstart', onPointerDown, true);
    doc.addEventListener('touchend', onTouchEnd, true);

    return () => {
      doc.removeEventListener('mousedown', onPointerDown, true);
      doc.removeEventListener('mouseup', onMouseUp, true);
      doc.removeEventListener('touchstart', onPointerDown, true);
      doc.removeEventListener('touchend', onTouchEnd, true);
    };
  }, [handler, ref, savedHandler, state, enabled]);
}

function isValidEvent(event: Event, ref: React.RefObject<HTMLElement>) {
  const target = event.target as HTMLElement;

  if (target) {
    const doc = getOwnerDocument(target);

    if (!doc.contains(target)) return false;
  }

  return ref.current instanceof Node && !ref.current?.contains(target);
}

function getOwnerDocument(node?: Element | null): Document {
  return node?.ownerDocument ?? document;
}
