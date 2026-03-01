function _class_call_check(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}
function _defineProperties(target, props) {
	for (var i = 0; i < props.length; i++) {
		var descriptor = props[i];
		descriptor.enumerable = descriptor.enumerable || false;
		descriptor.configurable = true;
		if ("value" in descriptor) descriptor.writable = true;
		Object.defineProperty(target, descriptor.key, descriptor);
	}
}
function _create_class(Constructor, protoProps, staticProps) {
	if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	if (staticProps) _defineProperties(Constructor, staticProps);
	return Constructor;
}
function _instanceof(left, right) {
	if (
		right != null &&
		typeof Symbol !== "undefined" &&
		right[Symbol.hasInstance]
	) {
		return !!right[Symbol.hasInstance](left);
	} else {
		return left instanceof right;
	}
}
import * as THREE from "three";

// A class to create and manage a dual-mirrored waveform visualizer using Tone.Analyser.
// The waveform is rendered as two symmetric ribbon meshes reflected across a center axis,
// with additive blending for a natural glow effect.
export var WaveformVisualizer = /*#__PURE__*/ (function () {
	"use strict";
	function WaveformVisualizer(scene, analyser, canvasWidth, canvasHeight) {
		_class_call_check(this, WaveformVisualizer);
		this.scene = scene;
		this.analyser = analyser;

		// Primary ribbon (above axis)
		this.meshTop = null;
		// Mirrored ribbon (below axis, reflected)
		this.meshBottom = null;
		// Thin axis line between the two ribbons
		this.axisMesh = null;
		// A second axis line for visual symmetry depth
		this.axisGroup = null;

		this.bufferLength = this.analyser.size;
		this.dataArray = new Float32Array(this.bufferLength);
		this.smoothedDataArray = new Float32Array(this.bufferLength);

		// Visual properties
		this.smoothingFactor = 0.4;
		this.width = canvasWidth * 0.8;
		this.height = 300; // Vertical amplitude — slightly reduced to fit both halves
		this.yPosition = 0; // Vertical center (axis sits here)
		this.thickness = 18.0; // Ribbon thickness (thinner for the mirrored aesthetic)

		this.currentColor = new THREE.Color("#7B4394");
		this.targetColor = new THREE.Color("#7B4394");

		// Complementary tint for the mirrored ribbon — shifts toward cyan/green
		this.mirrorColor = new THREE.Color("#44aaaa");
		this.currentMirrorColor = new THREE.Color("#44aaaa");

		// Uniforms shared via separate objects per mesh so colors can differ
		this.uniformsTop = {
			solidColor: { value: this.currentColor.clone() },
			opacity: { value: 0.92 },
		};
		this.uniformsBottom = {
			solidColor: { value: this.currentMirrorColor.clone() },
			opacity: { value: 0.55 },
		};

		this._createVisualizer();
	}

	_create_class(WaveformVisualizer, [
		{
			key: "_buildRibbonGeometry",
			value: function _buildRibbonGeometry() {
				var geometry = new THREE.BufferGeometry();
				var positions = new Float32Array(this.bufferLength * 2 * 3);
				var uvs = new Float32Array(this.bufferLength * 2 * 2);
				geometry.setAttribute(
					"position",
					new THREE.BufferAttribute(positions, 3),
				);
				geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

				var indices = [];
				for (var i = 0; i < this.bufferLength - 1; i++) {
					var p1 = i * 2;
					var p2 = p1 + 1;
					var p3 = (i + 1) * 2;
					var p4 = p3 + 1;
					indices.push(p1, p2, p3);
					indices.push(p2, p4, p3);
				}
				geometry.setIndex(indices);
				return geometry;
			},
		},
		{
			key: "_buildRibbonMaterial",
			value: function _buildRibbonMaterial(uniforms) {
				return new THREE.ShaderMaterial({
					uniforms: uniforms,
					vertexShader:
						"\n\
                        varying vec2 vUv;\n\
                        void main() {\n\
                            vUv = uv;\n\
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\
                        }\n\
                    ",
					fragmentShader:
						"\n\
                        uniform vec3 solidColor;\n\
                        uniform float opacity;\n\
                        varying vec2 vUv;\n\
                        void main() {\n\
                            // Soft edge fade along the ribbon height (vUv.y)\n\
                            float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);\n\
                            gl_FragColor = vec4(solidColor, opacity * edge);\n\
                        }\n\
                    ",
					transparent: true,
					depthWrite: false,
					blending: THREE.AdditiveBlending,
					side: THREE.DoubleSide,
				});
			},
		},
		{
			key: "_createAxisLine",
			value: function _createAxisLine() {
				// A hairline horizontal line sitting at the axis (yPosition)
				var points = [
					new THREE.Vector3(-this.width / 2, 0, 1.5),
					new THREE.Vector3(this.width / 2, 0, 1.5),
				];
				var geom = new THREE.BufferGeometry().setFromPoints(points);
				var mat = new THREE.LineBasicMaterial({
					color: 0xffffff,
					transparent: true,
					opacity: 0.18,
					blending: THREE.AdditiveBlending,
					depthWrite: false,
				});
				this.axisMesh = new THREE.Line(geom, mat);
				this.scene.add(this.axisMesh);
			},
		},
		{
			key: "_createVisualizer",
			value: function _createVisualizer() {
				// Top ribbon
				var geomTop = this._buildRibbonGeometry();
				var matTop = this._buildRibbonMaterial(this.uniformsTop);
				this.meshTop = new THREE.Mesh(geomTop, matTop);
				this.scene.add(this.meshTop);

				// Bottom ribbon (mirrored — y values will be negated in update())
				var geomBottom = this._buildRibbonGeometry();
				var matBottom = this._buildRibbonMaterial(this.uniformsBottom);
				this.meshBottom = new THREE.Mesh(geomBottom, matBottom);
				this.scene.add(this.meshBottom);

				// Axis line
				this._createAxisLine();

				this.updatePosition(window.innerWidth, window.innerHeight);
			},
		},
		{
			key: "_fillRibbonGeometry",
			value: function _fillRibbonGeometry(mesh, mirrorY) {
				var positions = mesh.geometry.attributes.position.array;
				var uvs = mesh.geometry.attributes.uv.array;

				var startX = -this.width / 2;
				var xStep = this.width / (this.bufferLength - 1);
				var halfThick = this.thickness / 2;
				var yMult = mirrorY ? -1 : 1;

				for (var i = 0; i < this.bufferLength; i++) {
					var x = startX + i * xStep;
					// Mirror clamps the ribbon downward; add a small gap from axis
					var y =
						this.yPosition +
						yMult *
							(this.smoothedDataArray[i] * this.height +
								halfThick * 0.3);

					var vi = i * 2 * 3;
					positions[vi] = x;
					positions[vi + 1] = y + halfThick;
					positions[vi + 2] = 2;

					positions[vi + 3] = x;
					positions[vi + 4] = y - halfThick;
					positions[vi + 5] = 2;

					var ui = i * 2 * 2;
					uvs[ui] = i / (this.bufferLength - 1);
					uvs[ui + 1] = 1.0;
					uvs[ui + 2] = i / (this.bufferLength - 1);
					uvs[ui + 3] = 0.0;
				}

				mesh.geometry.attributes.position.needsUpdate = true;
				mesh.geometry.attributes.uv.needsUpdate = true;
				mesh.geometry.computeBoundingSphere();
			},
		},
		{
			key: "update",
			value: function update() {
				if (!this.analyser || !this.meshTop || !this.meshBottom) return;

				// Color lerp — primary
				this.currentColor.lerp(this.targetColor, 0.05);
				this.uniformsTop.solidColor.value.copy(this.currentColor);

				// Mirror color: lerp toward a complementary hue derived from primary
				// We compute the complement by rotating hue 180 degrees in HSL space
				var hsl = {};
				this.currentColor.getHSL(hsl);
				var compHue = (hsl.h + 0.5) % 1.0;
				// Bias saturation/lightness for a cooler tint
				this.mirrorColor.setHSL(
					compHue,
					Math.min(1, hsl.s * 0.8),
					Math.min(0.8, hsl.l * 1.2),
				);
				this.currentMirrorColor.lerp(this.mirrorColor, 0.04);
				this.uniformsBottom.solidColor.value.copy(
					this.currentMirrorColor,
				);

				// Sample analyser
				var newArray = this.analyser.getValue();
				if (_instanceof(newArray, Float32Array)) {
					this.dataArray.set(newArray);
				}

				// Exponential smoothing
				for (var i = 0; i < this.bufferLength; i++) {
					this.smoothedDataArray[i] =
						this.smoothingFactor * this.dataArray[i] +
						(1 - this.smoothingFactor) * this.smoothedDataArray[i];
				}

				// Fill both ribbons
				this._fillRibbonGeometry(this.meshTop, false);
				this._fillRibbonGeometry(this.meshBottom, true);
			},
		},
		{
			key: "updateColor",
			value: function updateColor(newColor) {
				if (this.uniformsTop) {
					this.targetColor.set(newColor);
				}
			},
		},
		{
			key: "updatePosition",
			value: function updatePosition(canvasWidth, canvasHeight) {
				this.width = canvasWidth * 0.8;
				// Center vertically a bit above the drum beat indicators
				this.yPosition = -canvasHeight / 2 + 250;

				// Reposition the axis line to match
				if (this.axisMesh) {
					var pos = this.axisMesh.geometry.attributes.position;
					if (pos) {
						pos.array[0] = -this.width / 2;
						pos.array[1] = this.yPosition;
						pos.array[3] = this.width / 2;
						pos.array[4] = this.yPosition;
						pos.needsUpdate = true;
					}
				}
			},
		},
		{
			key: "dispose",
			value: function dispose() {
				var meshes = [this.meshTop, this.meshBottom];
				var _this = this;
				meshes.forEach(function (mesh) {
					if (mesh) {
						_this.scene.remove(mesh);
						if (mesh.geometry) mesh.geometry.dispose();
						if (mesh.material) mesh.material.dispose();
					}
				});
				if (this.axisMesh) {
					this.scene.remove(this.axisMesh);
					if (this.axisMesh.geometry)
						this.axisMesh.geometry.dispose();
					if (this.axisMesh.material)
						this.axisMesh.material.dispose();
				}
			},
		},
	]);
	return WaveformVisualizer;
})();
