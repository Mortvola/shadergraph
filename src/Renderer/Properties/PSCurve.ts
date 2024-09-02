import { makeObservable, observable, runInAction } from "mobx";
import { PSCurveDescriptor, PSCurvePoint } from "../ParticleSystem/Types";

class PSCurve {
  @observable
  accessor points: PSCurvePoint[] = [
    { id: 0, x: 0, y: 1, leftCtrl: { x: -0.1, y: 0 }, rightCtrl: { x: 0.1, y: 0 } },
    { id: 1, x: 1, y: 1, leftCtrl: { x: -0.1, y: 0 }, rightCtrl: { x: 0.1, y: 0 }},
  ];

  parent?: { override: boolean };

  constructor(parent?: { override: boolean }) {
    this.parent = parent;
  }

  copy(other: PSCurve) {
    runInAction(() => {
      this.points = other.points.map((p) => (
        JSON.parse(JSON.stringify(p))
      ))  
    })
  }

  static fromDescriptor(descriptor?: PSCurveDescriptor, parent?: { override: boolean }) {
    const curve = new PSCurve(parent);

    if (descriptor) {
      curve.points = descriptor.points.map((p, index, points) => ({
        id: p.id ?? index,
        x: p.x ?? (index / points.length - 1),
        y: p.y ?? 1,
        leftCtrl: {
          x: p.leftCtrl?.x ?? -0.1,
          y: p.leftCtrl?.y ?? 0,
        },
        rightCtrl: {
          x: p.rightCtrl?.x ?? 0.1,
          y: p.rightCtrl?.y ?? 0,
        },
      }));

      curve.sanitize();
    }

    return curve;
  }

  sanitize() {
    // Make sure the curve points are in order
    this.points.sort((a, b) => a.x - b.x);

    // Make sure there is a point at position 0
    if (this.points[0].x !== 0) {
      this.points = [
        {
          id: this.points.reduce((prev, p) => Math.max(prev, p.id), 0) + 1,
          x: 0,
          y: this.points[0].y,
          leftCtrl: { x: -0.1, y: 0 },
          rightCtrl: { x : 0.1, y: 0 },
        },
        ...this.points,
      ]
    }

    // Make sure there is a point at position 1
    if (this.points[this.points.length - 1].x !== 1) {
      this.points = [
        ...this.points,
        {
          id: this.points.reduce((prev, p) => Math.max(prev, p.id), 0) + 1,
          x: 1,
          y: this.points[this.points.length - 1].y,
          leftCtrl: { x: -0.1, y: 0 },
          rightCtrl: { x : 0.1, y: 0 },
        },
      ]
    }

    // Make sure there are no extra points at position 0.
    for (;;) {
      if (this.points[1].x === 0) {
        this.points = this.points.slice(1);
      }
      else {
        break;
      }
    }

    // Make sure there are no extra points at position 1.
    for (;;) {
      if (this.points[this.points.length - 2].x === 1) {
        this.points = this.points.slice(0, this.points.length - 1);
      }
      else {
        break;
      }
    }

    // Make sure the control points are on the correct side of each point
    for (const point of this.points) {
      if (point.leftCtrl.x > 0) {
        point.leftCtrl.x = -point.leftCtrl.x;
      }

      if (point.rightCtrl.x < 0) {
        point.rightCtrl.x = -point.rightCtrl.x;
      }
    }
  }

  toDesriptor(): PSCurveDescriptor {
    return ({
      points: this.points,
    })
  }

  setPoints(points: PSCurvePoint[], override?: boolean) {
    runInAction(() => {
      if (this.parent){
        this.parent.override = override ?? this.parent.override
      }
      
      this.points = points;
      this.sanitize();
    })
  }

  getValue(t: number) {
    const index = this.points.findIndex((p) => t <= p.x);

    if (index !== -1) {
      if (index === 0) {
        return this.points[0].y;
      }

      const t2 = (t - this.points[index - 1].x) / (this.points[index].x - this.points[index - 1].x)

      const y = Math.pow(1 - t2, 3) * this.points[index - 1].y
        + 3 * Math.pow(1 - t2, 2) * t2 * (this.points[index - 1].y + this.points[index - 1].rightCtrl.y)
        + 3 * (1 - t2) * t2 * t2 * (this.points[index].y + this.points[index].leftCtrl.y)
        + t2 * t2 * t2 * this.points[index].y;

      return y;
    }
  }
}

export default PSCurve;
