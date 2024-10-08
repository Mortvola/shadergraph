const fragmentOut = (lit: boolean, bloom: boolean) => {
  if (lit) {
    return /*wgsl*/`
    struct FragmentOut {
      @location(0) color: vec4f,
      @location(1) position: vec4f,
      @location(2) normal: vec4f,
    }        
    `  
  }

  return bloom ?
    /*wgsl*/`
    struct FragmentOut {
      @location(0) color: vec4f,
      @location(1) bright: vec4f,
      @location(2) normal: vec4f,
    }        
    `
    : ''
}

const store = (lit: boolean, bloom: boolean) => {
  if (lit) {
    return /*wgsl*/`
    var out: FragmentOut;

    out.color = fragOut;
    out.position = vertexOut.fragPos;
    out.position.w = vertexOut.id;
    out.normal = vertexOut.normal;

    return out;
    `
  }

  return bloom
    ? (
      /*wgsl*/`
      var out: FragmentOut;

      out.color = fragOut;

      // Compute relative luminance (coefficients from https://www.w3.org/TR/AERT/#color-contrast
      // Take into account the alpha channel to support the fading out of the material.
      var luminance = dot(out.color.rgb * out.color.a, vec3f(0.299, 0.587, 0.114));
    
      if (luminance > 1.0) {
        out.bright = out.color;
      }
      else {
        out.bright = vec4(0.0, 0.0, 0.0, 1.0);
      }
    
      return out;          
      `
    )
    : 'return fragOut;'
}

export const  getFragmentStage = (body: string, lit: boolean, bloom: boolean): string => {
  return /*wgsl*/`
    ${fragmentOut(lit, bloom)}

    @fragment
    fn fs(vertexOut: VertexOut) -> ${ bloom ? 'FragmentOut' : '@location(0) vec4f' }
    {
      ${
        body
          ? body
          : 'var fragOut = vertexOut.color;'
      }

      ${store(lit, bloom)}
    }
  `
}
