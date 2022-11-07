import { ModifierKey } from '@tolgee/core';
import { TolgeeElement } from '../../types';
import { DEVTOOLS_ID } from '../../constants';
import { ElementStoreType } from './ElementStore';

const eCapture = {
  capture: true,
};

const ePassive = {
  capture: true,
  passive: true,
};

type Coordinates = {
  x: number;
  y: number;
};

type Props = {
  highlightKeys: ModifierKey[];
  elementStore: ElementStoreType;
  onClick: (event: MouseEvent, el: TolgeeElement) => void;
};

export const MouseEventHandler = ({
  highlightKeys,
  elementStore,
  onClick,
}: Props) => {
  let keysDown = new Set<ModifierKey>();
  let highlighted: TolgeeElement | undefined;
  // let mouseOnChanged = new EventEmitterImpl<Element>();
  // let keysChanged: EventEmitterImpl<boolean> =
  //   new EventEmitterImpl<boolean>();
  let cursorPosition: Coordinates | undefined;

  const highlight = (el: TolgeeElement | undefined) => {
    if (highlighted !== el) {
      unhighlight();
      const meta = elementStore.get(el);
      if (meta) {
        meta.preventClean = true;
        meta.highlight?.();
        highlighted = el;
        // mouseOnChanged.emit(el);
      }
    }
  };

  const unhighlight = () => {
    const meta = elementStore.get(highlighted);
    if (meta) {
      meta.preventClean = false;
      meta.unhighlight?.();
      highlighted = undefined;
      // mouseOnChanged.emit(highlighted);
    }
  };

  function updateHighlight() {
    const position = cursorPosition;

    let newHighlighted: TolgeeElement | undefined;
    if (position && areKeysDown()) {
      const element = document.elementFromPoint(position.x, position.y);
      if (element) {
        newHighlighted = getClosestTolgeeElement(element);
      }
    }
    highlight(newHighlighted);
  }

  function updateCursorPosition(position: Coordinates) {
    cursorPosition = position;
    updateHighlight();
  }

  const blockEvents = (e: MouseEvent) => {
    if (areKeysDown() && !isInUiDialog(e.target as Element)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  const onMouseMove = (e: MouseEvent) => {
    updateCursorPosition({ x: e.clientX, y: e.clientY });
  };
  const onBlur = () => {
    keysDown = new Set();
    // keysChanged.emit(areKeysDown());
    updateHighlight();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const modifierKey = e.key as unknown as ModifierKey;
    if (modifierKey !== undefined) {
      keysDown.add(modifierKey);
      // keysChanged.emit(areKeysDown());
    }
    updateHighlight();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    keysDown.delete(e.key as unknown as ModifierKey);
    // keysChanged.emit(areKeysDown());
    updateHighlight();
  };
  const onScroll = () => {
    const meta = elementStore.get(highlighted);
    meta?.highlight?.();
  };
  const handleClick = (e: MouseEvent) => {
    blockEvents(e);
    if (areKeysDown()) {
      const element = getClosestTolgeeElement(e.target as TolgeeElement);
      if (element && element === highlighted) {
        onClick(e, element);
        unhighlight();
      }
    }
  };

  function initEventListeners() {
    window.addEventListener('blur', onBlur, eCapture);
    window.addEventListener('keydown', onKeyDown, eCapture);
    window.addEventListener('keyup', onKeyUp, eCapture);
    window.addEventListener('mousemove', onMouseMove, ePassive);
    window.addEventListener('scroll', onScroll, ePassive);
    window.addEventListener('click', handleClick, eCapture);

    window.addEventListener('mouseenter', blockEvents, eCapture);
    window.addEventListener('mouseover', blockEvents, eCapture);
    window.addEventListener('mouseout', blockEvents, eCapture);
    window.addEventListener('mouseleave', blockEvents, eCapture);
    window.addEventListener('mousedown', blockEvents, eCapture);
    window.addEventListener('mouseup', blockEvents, eCapture);
  }

  function removeEventListeners() {
    window.removeEventListener('blur', onBlur, eCapture);
    window.removeEventListener('keydown', onKeyDown, eCapture);
    window.removeEventListener('keyup', onKeyUp, eCapture);
    window.removeEventListener('mousemove', onMouseMove, ePassive);
    window.removeEventListener('scroll', onScroll, ePassive);
    window.removeEventListener('click', handleClick, eCapture);

    window.removeEventListener('mouseenter', blockEvents, eCapture);
    window.removeEventListener('mouseover', blockEvents, eCapture);
    window.removeEventListener('mouseout', blockEvents, eCapture);
    window.removeEventListener('mouseleave', blockEvents, eCapture);
    window.removeEventListener('mousedown', blockEvents, eCapture);
    window.removeEventListener('mouseup', blockEvents, eCapture);
  }

  function isInUiDialog(element: Element) {
    return Boolean(findAncestor(element, (el) => el.id === DEVTOOLS_ID));
  }

  function getClosestTolgeeElement(
    element: Element
  ): TolgeeElement | undefined {
    return findAncestor(element, (el) =>
      elementStore.get(el as TolgeeElement)
    ) as TolgeeElement;
  }

  function findAncestor(
    element: Element,
    func: (el: Element) => any
  ): Element | undefined {
    if (func(element)) {
      return element;
    }
    if (element?.parentElement) {
      return findAncestor(element.parentElement, func);
    }
    return undefined;
  }

  function areKeysDown() {
    for (const key of highlightKeys) {
      if (!keysDown.has(key)) {
        return false;
      }
    }
    return true;
  }

  function stop() {
    removeEventListeners();
  }

  function run() {
    initEventListeners();
  }

  return Object.freeze({
    run,
    stop,
  });
};
