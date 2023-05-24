import { atom } from 'jotai';
import { isNull } from 'lodash-es';
import { IJotaiState, INotification } from '../../lib/types.js';

const makeActions = (atoms: IJotaiState) => {
  const removeNotificationAtom = atom(null, async (get, set, id) => {
    set(atoms.notificationsAtom, state => {
      const item = state.find(el => el.id === id);
      if (!item) return;
      item.isHidden = true;
      item.isInverseAnimation = true;
    });

    const notificationAnimationDuration = get(atoms.notificationAnimationDurationAtom);
    await new Promise(resolve => setTimeout(resolve, notificationAnimationDuration));
    set(atoms.notificationsAtom, state => state.filter(el => el.id !== id));
  });

  return {
    removeNotificationAtom,

    addNotificationAtom: atom(null, async (get, set, newNotification: INotification) => {
      const { autoremoveTimeout, id } = newNotification;
      set(atoms.notificationsAtom, state => [newNotification].concat(state));

      await new Promise(resolve => setTimeout(resolve, 50));
      set(atoms.notificationsAtom, state => {
        const item = state.find(el => el.id === newNotification.id);
        if (!item) return;
        item.isHidden = false;
      });

      if (isNull(autoremoveTimeout)) return;
      await new Promise(resolve => setTimeout(resolve, autoremoveTimeout));
      const notifications = get(atoms.notificationsAtom);
      const isAlreadyRemoved = !notifications.find(el => el.id === id);
      if (isAlreadyRemoved) return;

      set(removeNotificationAtom, id);
    }),
  };
};

export default makeActions;
