import { Texture2D } from '@luma.gl/core';
import { ScatterplotLayer as BaseLayer } from 'deck.gl';

import { GRAY, GRAY_ALPHA, GRAY_MIX } from '../../constants/constants';

export class ScatterplotLayer extends BaseLayer {
  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      inject: {
        'vs:#decl': `
          in float value;
          in float indexEnabled;
          in float instanceIndex;
          out float vNormValue;
          out float vSelected;
          out float vEnabled;
          uniform float highlightMultiplier;
          uniform bool isCategorical;
          uniform float valueMin;
          uniform float valueMax;
          uniform bool pointInteractionEnabled;
          uniform float selectedIndex;
        `,
        // add z-axis position based on sortValue, zMin, and zMax
        // to draw higher sortValue points above lower sortValue points
        // and picked points at the front
        'vs:DECKGL_FILTER_GL_POSITION': `
          float normValue = clamp((value - valueMin) / max(valueMax - valueMin, 1e-6), 0.0, 1.0);
          if (isVertexPicked(geometry.pickingColor)) {
            position.z = -position.w;
          }
          else if (indexEnabled < 0.5) {
            position.z = position.w;
          }
          else if (isCategorical) {
            if (value == -1.0) {
              position.z = position.w; // draw invalid at back
            }
            else { position.z = 0.0; }
          }
          else {
            position.z = mix(position.w, -position.w, normValue);
          }
        `,
        // increase point size for hovered points
        'vs:DECKGL_FILTER_SIZE': `
          if (pointInteractionEnabled) {
            size *= 4.0;
            if(instanceIndex == selectedIndex) {
              size *= 3.0;
            }
          }
          if (isVertexPicked(geometry.pickingColor)) {
            size *= highlightMultiplier;
          }
          if (indexEnabled < 0.5) {
            size *= 0.3;
          }
        `,
        // Pass colorValue to fragment shader
        'vs:DECKGL_FILTER_COLOR': `
          float normValue = clamp((value - valueMin) / max(valueMax - valueMin, 1e-6), 0.0, 1.0);
          vNormValue = normValue;
          vEnabled = indexEnabled;
          vSelected = float(instanceIndex == selectedIndex);
        `,
        'fs:#decl': `
          in float vNormValue;
          in float vEnabled;
          in float vSelected;
          uniform sampler2D colorTexture;
          uniform bool useTexture;
          uniform float colormapSize;
          uniform vec4 gray;
          uniform float grayMix;
        `,
        // Sample color from texture in fragment shader
        'fs:DECKGL_FILTER_COLOR': `
          if (useTexture) {
            // Remap to texel centers so sampling matches JS interpolation
            float u = (vNormValue * (colormapSize - 1.0) + 0.5) / colormapSize;
            color = texture(colorTexture, vec2(u, 0.5));
          }
          if (vEnabled < 0.5) {
            color.rgb = mix(color.rgb, gray.rgb / 255.0, grayMix);
            color.a = gray.a / 255.0;
          }
          if(vSelected > 0.5) {
            color = picking_uHighlightColor;
          }
        `,
      },
    };
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      value: {
        size: 1,
        accessor: 'getValues',
        defaultValue: 0.0,
      },
      indexEnabled: {
        size: 1,
        accessor: 'getEnabled',
        defaultValue: 1.0,
      },
      instanceIndex: {
        size: 1,
        accessor: (_, { index }) => index,
        defaultValue: 0,
      },
    });
  }

  updateState(params) {
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;

    if (props.colormap !== oldProps.colormap || changeFlags.extensionsChanged) {
      this._updateColorTexture(props.colormap);
    }
  }

  _updateColorTexture(colormap) {
    const { gl } = this.context;

    // colormap is an array of hex strings
    const colors = colormap.flatMap((hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b, 255];
    });

    if (this.state.colorTexture) {
      this.state.colorTexture.delete();
    }

    const texture = new Texture2D(gl, {
      data: new Uint8Array(colors),
      width: colormap?.length,
      height: 1,
      format: gl.RGBA,
      type: gl.UNSIGNED_BYTE,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE,
      },
    });

    this.setState({ colorTexture: texture });
  }

  draw(params) {
    const {
      highlightMultiplier = 1.0,
      isCategorical = false,
      valueMin = 0,
      valueMax = 0,
      pointInteractionEnabled = false,
      selectedIndex = -1,
      gray = [...GRAY, 255 * GRAY_ALPHA],
      grayMix = GRAY_MIX,
    } = this.props;
    const { colorTexture } = this.state;
    const model = this.state.model;
    if (!model) {
      return;
    }
    model.setUniforms({
      highlightMultiplier,
      colorTexture: colorTexture || null,
      useTexture: !!colorTexture,
      colormapSize: this.props.colormap?.length ?? 1,
      isCategorical,
      valueMin: isNaN(valueMin) ? 0 : valueMin,
      valueMax: isNaN(valueMax) ? 0 : valueMax,
      pointInteractionEnabled,
      selectedIndex,
      gray,
      grayMix,
    });

    super.draw(params);
  }

  finalizeState(context) {
    super.finalizeState(context);
    this.state.colorTexture?.delete();
  }
}
