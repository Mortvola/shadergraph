import { DrawableType } from '../../Drawables/DrawableInterface';
import { getMeshVertex } from './meshVertex';
import { billboard } from './billboard';
import { circle } from './circle';
import { mesh2D } from './mesh2D';
import { twoD } from './twoD';

export const getVertexStage = (drawableType: DrawableType, lit: boolean): string => {
  switch (drawableType) {
    case DrawableType.Mesh:
      return getMeshVertex(lit)

    case DrawableType.Billboard:
      return billboard;

    case DrawableType.Circle:
      return circle;

    case DrawableType.TwoD:
      return twoD;

    case DrawableType.Mesh2D:
      return mesh2D;
  }

  throw new Error(`Unknown drawable type: ${drawableType} `)
}