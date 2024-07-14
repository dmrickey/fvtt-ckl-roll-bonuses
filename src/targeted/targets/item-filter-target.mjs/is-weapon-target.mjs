import { BaseIsItemTarget } from './base-is-item-target.mjs';

export class IsWeaponTarget extends BaseIsItemTarget {

  /**
   * @override
   */
  static get sourceKey() { return 'is-weapon'; }

  /**
   * @override
   * @param {object} args
   * @param {Nullable<ItemAction>} [args.action]
   * @returns {boolean}
   */
  static extendedItemFilter({ action = null }) {
    const item = action?.item;

    if (item instanceof pf1.documents.item.ItemWeaponPF || item instanceof pf1.documents.item.ItemAttackPF) {
      if (item.system.weaponGroups?.value.includes("natural")) {
        return false;
      }
    }

    return ['mwak', 'rwak', 'twak'].includes(action?.data.actionType ?? '');
  }
}
