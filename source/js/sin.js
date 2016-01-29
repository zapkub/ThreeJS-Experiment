var glCamera, glRenderer, glScene, controls;
var particleSystem;
var testObject;

var init = function() {
  glRenderer = new THREE.WebGLRenderer({
    alpha: true
  });
  glScene = new THREE.Scene();
  glCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 7000);
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

  var numberOfParticle = 100300; //window.innerWidth / 20;
  console.log('particle' + window.innerWidth);
  particles = new THREE.Geometry();
  for (var p = 0; p < numberOfParticle; p++) {
    var particle =
      new THREE.Vector3(Math.random() * window.innerWidth - window.innerWidth / 2, Math.random() * window.innerHeight - window.innerHeight / 2, 0)
    particle.velocity = Math.random() * 0.5;
    particles.vertices.push(particle);
  }

  var particleMaterial = new THREE.PointsMaterial({
    color: 0xeeeeee,
    size: 4,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    map: THREE.ImageUtils.loadTexture('images/particle.png')
  });

  particleMaterial.alphaTest = 0.5;
  particleSystem = new THREE.Points(particles, particleMaterial);
  particleSystem.sortParticles = true;
  glScene.add(particleSystem);

  var textureLoader = new THREE.TextureLoader();

  var moonGeo = new THREE.SphereGeometry(100, 32, 32);
  var moonMaterial = new THREE.MeshLambertMaterial({
    side: THREE.DouleSide,
    map: textureLoader.load('images/moon.jpg')
  });

  var moonMesh = new THREE.Mesh(moonGeo, moonMaterial);

  //glScene.add(moonMesh);

}
var equaltion = 0;

function changeEquation(index) {
  equaltion = index;
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
  controls.maxDistance = 20000;
  controls.addEventListener('change', render);
  controls.enabled = true;
  //controls.enableZoom = false;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.05;

}

var render = function() {
  glRenderer.render(glScene, glCamera);
}
var clock = new THREE.Clock();
var animate = function() {
  requestAnimationFrame(animate);
  var elapsed = clock.getElapsedTime();
  var angularFactor = 0.08 * Math.sin(elapsed);
  //
  var shit = 5 * elapsed;
  if (equaltion == 0) {
    _.each(particles.vertices, function(dot) {
      dot.x += Math.cos(elapsed * dot.velocity * 90 * Math.PI / 180) * 4;
      dot.y += Math.sin (elapsed *90* dot.velocity * Math.PI/180);
      dot.z = dot.z - (Math.sin(100 * dot.velocity * elapsed * Math.PI / 180) * 10.5);

    });
  } else if (equaltion == 1) {
    _.each(particles.vertices, function(dot) {
      dot.y = dot.y + (Math.sin(90 * dot.velocity * elapsed * Math.PI / 180) * 10.5);
      dot.x = dot.x - (Math.sin(20 * dot.velocity * elapsed * Math.PI / 180) * 10.5) - (Math.sin(90 * dot.velocity * elapsed * Math.PI / 180) * 10.5) / 2;
      dot.z = dot.z - (Math.sin(100 * dot.velocity * elapsed * Math.PI / 180) * 10.5);
    });
  }

  particles.verticesNeedUpdate = true;

  render();
}



init();
animate();
initOrbitControls(glRenderer, glCamera);


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  glCamera.aspect = window.innerWidth / window.innerHeight;
  glCamera.updateProjectionMatrix();
  glRenderer.setSize(window.innerWidth, window.innerHeight);
}
