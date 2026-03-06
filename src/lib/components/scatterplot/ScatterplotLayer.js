import { ScatterplotLayer as BaseLayer } from 'deck.gl';

export class ScatterplotLayer extends BaseLayer {
  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      inject: {
        'vs:#decl': `
          in float sortValue;
          uniform float zMin;
          uniform float zMax;
          uniform float highlightMultiplier;
        `,
        // add z-axis position based on sortValue, zMin, and zMax
        // to draw higher sortValue points above lower sortValue points
        // and picked points at the front
        'vs:DECKGL_FILTER_GL_POSITION': `
          float normalizedZ = (zMax > zMin)
            ? (sortValue - zMin) / (zMax - zMin)
            : 0.5;
          position.z = mix(position.w, -position.w, normalizedZ);
          if (isVertexPicked(geometry.pickingColor)) {
            position.z = -position.w;
          }
        `,
        // increase point size for hovered points
        'vs:DECKGL_FILTER_SIZE': `
          if (isVertexPicked(geometry.pickingColor)) {
            size *= highlightMultiplier;
          }
        `,
      },
    };
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      sortValue: {
        size: 1,
        accessor: 'getSortValue',
        defaultValue: 0,
      },
    });
  }

  draw(params) {
    const { zMin = 0, zMax = 1, highlightMultiplier = 1.0 } = this.props;
    const model = this.state.model;
    if (!model) {
      return;
    }
    model.setUniforms({ zMin, zMax, highlightMultiplier });

    super.draw(params);
  }
}
