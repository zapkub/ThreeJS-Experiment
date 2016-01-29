var app = angular.module('particle', []);


var glCamera, glRenderer, glScene, controls;
var particleSystem;
var testObject;

var init = function() {
  glRenderer = new THREE.WebGLRenderer({
    alpha: true
  });
  glScene = new THREE.Scene();
  glCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 4000);
  glScene.add(glCamera);
  glCamera.position.z = 200;
  glRenderer.setClearColor(0x000000);
  glRenderer.setPixelRatio(window.devicePixelRatio);
  glRenderer.setSize(window.innerWidth, window.innerHeight);
  glRenderer.domElement.style.position = "absolute";
  glRenderer.domElement.style['z-index'] = '-1';
  glRenderer.domElement.style.top = 0;
  glRenderer.domElement.style.left = 0;
  document.body.appendChild(glRenderer.domElement);

  var ambientLight = new THREE.AmbientLight(0xeeeeee);
  glScene.add(ambientLight);

  var geometry = new THREE.SphereGeometry(100, 12, 12);
  var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    wireframe: true
  })


  var testObject = new THREE.Mesh(geometry, material);
  glScene.add(testObject);


}

function initOrbitControls(renderer, camera) {

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minPolarAngle = 45 * Math.PI / 180;
  controls.maxPolarAngle = 135 * Math.PI / 180;
  controls.userRotateSpeed = 0.5;
  controls.minAzimuthAngle = -45 * Math.PI / 180;
  controls.maxAzimuthAngle = 45 * Math.PI / 180;
  controls.minDistance = 90;
  controls.maxDistance = 1000;
  controls.addEventListener('change', render);
  controls.enabled = true;
  //controls.enableZoom = false;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.05;

}

var initFirstPersonControl = function(renderer, camera){
  controls =  THREE.FirstPersonControls(camera,renderer.domElement);

  //controls.addEventListener('change', render);
}

var render = function() {
  glRenderer.render(glScene, glCamera);
}
var animate = function() {
  requestAnimationFrame(animate);
  render();
}


init();
initFirstPersonControl(glRenderer,glCamera);
animate();
