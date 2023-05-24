import cn from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { uniqueId } from 'lodash-es';
import React from 'react';
import { IMakeNotification } from '../../lib/types.js';
import { getCssValue, useContext } from '../lib/utils.jsx';
import s from './Notifications.module.css';

export const Notifications = () => {
  const { notificationsAtom, notificationAnimationDurationAtom, removeNotificationAtom } =
    useContext();
  const notifications = useAtomValue(notificationsAtom);
  const setNotificationAnimationDuration = useSetAtom(notificationAnimationDurationAtom);
  const removeNotification = useSetAtom(removeNotificationAtom);

  React.useEffect(() => {
    const rootStyles = getComputedStyle(document.querySelector(`.${s.root}`)!);
    const animationDuration =
      getCssValue(rootStyles.getPropertyValue('--animationDuration')) * 1000;
    setNotificationAnimationDuration(animationDuration);
  }, []);

  return (
    <div className={s.root}>
      {notifications.map(el => (
        <div
          key={el.id}
          className={cn(s.item, {
            [s.item_hidden]: el.isHidden,
            [s.item_inverseAnimation]: el.isInverseAnimation,
          })}
        >
          <div>
            <div className="font-bold text-primary">{el.title}</div>
            {el.text && <div className="text-justify">{el.text}</div>}
            {el.component && React.createElement(el.component)}
          </div>
          <i
            className="far fa-circle-xmark fa_big fa_link text-lg ml-2"
            onClick={() => removeNotification(el.id)}
          ></i>
        </div>
      ))}
    </div>
  );
};

export const makeNotification: IMakeNotification = opts => {
  const { title, text, component, autoremoveTimeout = 10_000 } = opts;

  const notification: any = {
    id: uniqueId(),
    title,
    isHidden: true,
    isInverseAnimation: false,
    autoremoveTimeout,
  };

  if (text) {
    return { ...notification, text };
  } else {
    return { ...notification, component };
  }
};
