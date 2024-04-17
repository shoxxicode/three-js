import * as THREE from "three";
import TWEEN from "jsm/libs/tween.module.js";
import getRocketBolt from "./getRocketBolt.js";
let goalThrustMag = 0;
let isThrusting = false;

function getBolts (rocket) {
  const numBolts = 10;
  const bolts = [];
  for ( let i = 0; i < numBolts; i += 1) {
    let bolt = getRocketBolt(rocket);
    bolts.push(bolt);
  }
  rocket.userData.bolts = bolts;
  return bolts;
}

function getRocket(glb) {
  let rocketGroup = new THREE.Group();
  const size = 1.35;
  glb.scale.set(size, size, size);
  glb.position.set(-0.05, -0.5, 0);
  rocketGroup.add(glb);
  rocketGroup.position.set(-3, 0, 0);

  // collision sphere
  let directionAngle = 0;
  const radius = 0.18;
  const geometry = new THREE.IcosahedronGeometry(radius, 4);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
  });
  const collisionSphere = new THREE.Mesh(geometry, material);
  // rocketGroup.add(collisionSphere);

  const thrustFireGeo = new THREE.OctahedronGeometry(0.1, 0);
  const thrustFireMat = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
  });
  const thrustFireMesh = new THREE.Mesh(thrustFireGeo, thrustFireMat);
  thrustFireMesh.scale.y = 2;
  thrustFireMesh.position.set(0.04, -0.35, 0);
  thrustFireMesh.visible = false;
  rocketGroup.add(thrustFireMesh);

  let thrustMag = 0;
  let thrustDirection = 0;
  const decay = 0.01;

  let isRotationgLeft = false;
  let isRotationgRight = false;
  function rotateLeft(isTrue) {
    console.log("rotateLeft", isTrue);
    isRotationgLeft = isTrue;
  }
  function rotateRight(isTrue) {
    isRotationgRight = isTrue;
  }
  function thrust(isOn) {
    isThrusting = isOn;
    thrustFireMesh.visible = isOn;
    if (isOn === true) {
      goalThrustMag += 0.05;
    } else {
      goalThrustMag = 0;
    }
  }

  const screenBounds = { x: 5.5, y: 4 };
  const bolts = getBolts(rocketGroup);
  let boltIndex = 0;
  function fire() {
    boltIndex += 1;
    let curBolt = bolts[boltIndex];
    if (boltIndex >= bolts.length) {
      boltIndex = 0;
    }
    curBolt?.userData.fire(directionAngle);
    return curBolt;
  }
  const rotationRate = 0.05;
  function update() {
    if (isRotationgLeft === true) {
      directionAngle += rotationRate;
    }
    if (isRotationgRight === true) {
      directionAngle -= rotationRate;
    }
    let direction = directionAngle;
    rocketGroup.rotation.z = direction - Math.PI * 0.5;
    thrustMag -= (thrustMag - goalThrustMag) * decay;
    if (isThrusting === true) {
      thrustDirection = direction;
    }
    if (!isTweening) {
      rocketGroup.position.x += Math.cos(thrustDirection) * thrustMag;
      rocketGroup.position.y += Math.sin(thrustDirection) * thrustMag;
    }
    if (
      rocketGroup.position.x < -screenBounds.x ||
      rocketGroup.position.x > screenBounds.x
    ) {
      rocketGroup.position.x *= -1;
    }
    if (
      rocketGroup.position.y < -screenBounds.y ||
      rocketGroup.position.y > screenBounds.y
    ) {
      rocketGroup.position.y *= -1;
    }
    bolts.forEach(b => b.userData.update());
  }

  let isTweening = false;
  function playHitAnimation() {
    if (!isTweening) {
      thrustMag = 0;
      isTweening = true;
      let goalRote = new THREE.Vector3(0, 0, Math.PI * 12);
      let roteTween = new TWEEN.Tween(rocketGroup.rotation)
        .to({ x: goalRote.x, y: goalRote.y, z: goalRote.z }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
          rocketGroup.rotation.set(0, 0, 0);
          rocketGroup.position.set(-3, 0, 0);
          isTweening = false;
        })
        .start();
    }
  }
  rocketGroup.userData = {
    bolts,
    fire,
    getBolts: () => bolts,
    playHitAnimation,
    radius,
    rotateLeft,
    rotateRight,
    thrust,
    update,
  };
  return rocketGroup;
}

export default getRocket;
