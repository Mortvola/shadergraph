import { makeObservable, observable } from "mobx";
import type { LightPropsDescriptor, LightPropsInterface } from "../Types";
import { PropsBase } from "./Types";

class LightProps extends PropsBase implements LightPropsInterface {
  color: number[] = [1, 1, 1, 1];

  constant = 1.0;

  linear = 0.09;

  quadratic = 0.032;

  constructor(descriptor?: LightPropsDescriptor) {
    super()
    
    this.color = descriptor?.color ?? this.color;
    this.constant = descriptor?.constant ?? this.constant;
    this.linear = descriptor?.linear ?? this.linear;
    this.quadratic = descriptor?.quadratic ?? this.quadratic;

    makeObservable(this, {
      color: observable,
      constant: observable,
      linear: observable,
      quadratic: observable,
    })
  }

  onChange?: () => void;

  handleChange = () => {
    if (this.onChange) {
      this.onChange()
    }
  }

  toDescriptor(): LightPropsDescriptor {
    return ({
      color: this.color,
      constant: this.constant,
      linear: this.linear,
      quadratic: this.quadratic,
    })
  }
}

export default LightProps;
