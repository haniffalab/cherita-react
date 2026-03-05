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
        `,
        // add z-axis position based on sortValue, zMin, and zMax
        // to draw higher sortValue points above lower sortValue points
        'vs:DECKGL_FILTER_GL_POSITION': `
          float normalizedZ = (zMax > zMin)
            ? (sortValue - zMin) / (zMax - zMin)
            : 0.5;
          position.z = mix(position.w, -position.w, normalizedZ);
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
    const { zMin = 0, zMax = 1 } = this.props;
    const model = this.state.model;
    if (!model) {
      return;
    }
    model.setUniforms({ zMin, zMax });

    super.draw(params);
  }
}
