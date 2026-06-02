import * as THREE from 'three'

/**
 * Build planar UVs for a flat mesh via PCA of its local positions. Ported
 * verbatim from the original prototype — the algorithm picks the two largest
 * principal components of the screen geometry and projects each vertex into
 * a normalized [0,1] square, so a 128×64 framebuffer texture lines up with
 * the long edge of the screen mesh.
 */
export function buildPlanarUVs(geometry: THREE.BufferGeometry): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const n = pos.count
  const c = new THREE.Vector3()
  for (let i = 0; i < n; i++) c.add(new THREE.Vector3().fromBufferAttribute(pos, i))
  c.multiplyScalar(1 / n)
  const cov: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const d = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    d.fromBufferAttribute(pos, i).sub(c)
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) cov[a][b] += d.getComponent(a) * d.getComponent(b)
    }
  }
  const mv = (M: number[][], v: THREE.Vector3): THREE.Vector3 =>
    new THREE.Vector3(
      M[0][0] * v.x + M[0][1] * v.y + M[0][2] * v.z,
      M[1][0] * v.x + M[1][1] * v.y + M[1][2] * v.z,
      M[2][0] * v.x + M[2][1] * v.y + M[2][2] * v.z
    )
  const power = (M: number[][]): { v: THREE.Vector3; l: number } => {
    let v = new THREE.Vector3(0.41, 0.77, 0.49).normalize()
    let l = 0
    for (let it = 0; it < 200; it++) {
      const nv = mv(M, v)
      l = nv.length()
      if (l > 0) nv.multiplyScalar(1 / l)
      v.copy(nv)
    }
    return { v, l }
  }
  const e0 = power(cov)
  const M2 = cov.map((r) => r.slice())
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      M2[a][b] -= e0.l * e0.v.getComponent(a) * e0.v.getComponent(b)
    }
  }
  const e1 = power(M2)
  const uAxis = e0.v.clone().normalize()
  const vAxis = e1.v.clone().normalize()
  let uMin = 1e9
  let uMax = -1e9
  let vMin = 1e9
  let vMax = -1e9
  const us = new Float32Array(n)
  const vs = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    d.fromBufferAttribute(pos, i).sub(c)
    const uu = d.dot(uAxis)
    const vv = d.dot(vAxis)
    us[i] = uu
    vs[i] = vv
    if (uu < uMin) uMin = uu
    if (uu > uMax) uMax = uu
    if (vv < vMin) vMin = vv
    if (vv > vMax) vMax = vv
  }
  const out = new Float32Array(n * 2)
  for (let i = 0; i < n; i++) {
    out[i * 2] = (us[i] - uMin) / (uMax - uMin)
    out[i * 2 + 1] = (vs[i] - vMin) / (vMax - vMin)
  }
  return out
}
