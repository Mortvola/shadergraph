import Entity from "../../State/Entity";

abstract class ObjectBase extends Entity {
  abstract toDescriptor(): object

  abstract detachSelf(): void
}

export default ObjectBase;
