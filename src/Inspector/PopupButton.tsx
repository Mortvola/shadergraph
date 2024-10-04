import React from 'react';
import PopupWrapper, { Position } from './PopupWrapper';
import { PopupContext } from './PopupContext';

type PropsType = {
  label?: React.ReactNode,
  onClick?: () => void,
  children?: React.ReactNode,
  className?: string,
  position?: Position,
}

const PopupButton: React.FC<PropsType> = ({
  label,
  onClick,
  children,
  className,
  position = Position.top,
}) => {
  const [showPopup, setShowPopup] = React.useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [popupContext] = React.useState({
    hidePopup: () => setShowPopup(null),
  });

  const handleClick = () => {
    const element = buttonRef.current;

    if (element) {
      if (onClick) {
        onClick()
      }

      const rect = element.getBoundingClientRect();
      setShowPopup(rect);
    }
  }

  const handlePopupClose = () => {
    setShowPopup(null);
  }

  return (
    <>
      <button ref={buttonRef} className={className} onClick={handleClick}>
        {label ?? 'Show Popup'}
      </button>
      <PopupContext.Provider value={popupContext}>
        {
          showPopup
            ? (
              <PopupWrapper rect={showPopup} onClose={handlePopupClose} position={position}>
                { children }
              </PopupWrapper>
            )
            : null
        }
      </PopupContext.Provider>
    </>
  )
}

export default PopupButton;
