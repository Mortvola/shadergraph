import { observable, runInAction } from 'mobx';
import type PropertyBase from './PropertyBase';
import PSCurve from './PSCurve';
import { type PropertyType } from './Types';

class PSValue2 {
  @observable
  private accessor _value: [number, number] = [1, 1]

  get value(): [number, number] {
    return this._value;
  }

  set value(value: PropertyType<[number,  number]>) {
    runInAction(() => {
      this._value = value.value;
      if (this.parent && value.override !== undefined) {
        this.parent.override = value.override && this.parent.base !== undefined
      }
    })
  }

  curve: [PSCurve, PSCurve]

  private _curveRange: [number, number] = [0, 1]

  get curveRange(): [number, number] {
    return this._curveRange;
  }

  set curveRange(value: PropertyType<[number,  number]>) {
    runInAction(() => {
      this._curveRange = value.value;
      if (this.parent && value.override !== undefined) {
        this.parent.override = value.override && this.parent.base !== undefined
      }
    })
  }

  parent?: { override: boolean, base?: PropertyBase };

  constructor(parent: { override: boolean }) {
    this.parent = parent;

    this.curve = [new PSCurve(parent), new PSCurve(parent)]
  }

  observables() {
    return ({
      value: this._value,
      curveRange: this._curveRange,
      curve: [
        { points: this.curve[0].points },
        { points: this.curve[1].points }
      ]
    })
  }
}

export default PSValue2;
