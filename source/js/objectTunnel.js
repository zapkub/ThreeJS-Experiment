var app = angular.module('TimeMachine', ['rzModule'])
app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);


app.controller('mainController', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {

  var viewDepth = 2000;
  var offsetZ = 100;
  var fadeInRange = 100;
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var glCamera, glRenderer, glScene, controls;
  var cssRenderer, cssScene;
  var particleSystem;
  var numberOfPosts = 800;
  var distanceOfPostZAxis = 100;
  var posts = [];
  var rawPostData = [];
  $scope.timeSlider = distanceOfPostZAxis * numberOfPosts;
  var promise;

  var htmlMode = false;


  var init = function() {
    glRenderer = new THREE.WebGLRenderer({
      alpha: true
    });
    //0xa6baa9
    glRenderer.setClearColor(0xa6baa9);
    glRenderer.setPixelRatio(window.devicePixelRatio);
    glRenderer.setSize(window.innerWidth, window.innerHeight);
    glRenderer.shadowMapEnabled = true;
    glScene = new THREE.Scene();
    glCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, viewDepth + 1000);
    glScene.add(glCamera);
    glCamera.position.z = 500;
    var ambientLight = new THREE.AmbientLight(0xeeeeee);
    glScene.add(ambientLight);

    glRenderer.domElement.style.position = "absolute";
    glRenderer.domElement.style['z-index'] = '-1';
    glRenderer.domElement.style.top = 0;
    glRenderer.domElement.style.left = 0;
    document.body.appendChild(glRenderer.domElement);

    for (var i = 0; i < numberOfPosts; i++) {
      var randomX = Math.random() * 200
      var factorX = Boolean(Math.round(Math.random() * 1));
      var x = Math.random() * 800 - 400; //(200 + randomX) * factorX + ( -400 + randomX) * !factorX;
      var randomY = Math.random() * 200;
      var factorY = Boolean(Math.round(Math.random() * 1));
      var y = (200 + randomY) * factorY + (-400 + randomY) * !factorY;

      if (x > 200 || x < -200) {
        y = Math.random() * 800 - 400;
      }
      var post = createPost(new THREE.Vector3(x, y, -distanceOfPostZAxis * i), rawPostData[i]);
      post.inScreen = false;
      posts.push(post);
      glScene.add(post.mesh);
      //  cssScene.add(post.dom);
    }
    initControls(glRenderer, glCamera);
  }
  var initHtml = function() {
    cssRenderer = new THREE.CSS3DRenderer();
    cssScene = new THREE.Scene();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    cssRenderer.domElement.style.left = 0;
    document.body.appendChild(cssRenderer.domElement);
  }


  var createPost = function(position, data) {

    var elem = document.createElement('div');
    elem.className = "post";

    var cssObject3d = new THREE.CSS3DObject(elem);
    cssObject3d.originalZ = position.z;
    if (position)
      cssObject3d.position.set(position.x, position.y, position.z)

    var geometry = new THREE.PlaneGeometry(150, 200);
    var material = new THREE.MeshLambertMaterial({
      color: 'white',
      side: THREE.DoubleSide,
      transparent: true
    });
    material.opacity = 1;
    var mesh = new THREE.Mesh(geometry, material);
    mesh.originalZ = position.z;

    if (position)
      mesh.position.set(position.x, position.y, position.z)

    return {
      mesh: mesh,
      dom: cssObject3d,
      data: data
    };
  }
  var render = function() {
    glRenderer.render(glScene, glCamera);
    if (htmlMode)
    cssRenderer.render(cssScene, glCamera);
  }
  var clock = new THREE.Clock();
  var animate = function() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    particleSystem.rotation.x -= delta * 2 * Math.PI / 180;
    if (controls)
      controls.update();
    render();

  }

  function initControls(renderer, camera) {
    if(htmlMode)
    controls = new THREE.OrbitControls(camera, cssRenderer.domElement);
    else
    controls = new THREE.OrbitControls(camera, glRenderer.domElement);

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
    controls.enableZoom = false;
    controls.rotateSpeed = 0.05;

  }


  $http.get('http://www.gth.co.th/farewell/api/FetchAllApi.php').then(
    function(res) {
      rawPostData = res.data.data;
      if (htmlMode) {
        initHtml();
      }

      init();
      $scope.addParticle();
      animate();
      $scope.$watch('timeSlider', function(newVal, oldVal) {

        _.each(posts, function(object) {
          var post = object.mesh;
          var dom = object.dom;
          post.position.z = post.originalZ + $scope.timeSlider;

          var startOpacity = -(viewDepth + fadeInRange);
          var endOpacity = -(viewDepth - fadeInRange);
          var alpha = -(startOpacity - (post.position.z)) / fadeInRange

          if (htmlMode)
            dom.position.z = post.originalZ + $scope.timeSlider;
          //id media name source text time

          post.material.opacity = alpha;
          if (post.position.z > -viewDepth - fadeInRange && !post.inScreen && post.position.z < offsetZ) {

            if (htmlMode)
              cssScene.add(dom);
            post.inScreen = true;

          } else if (post.position.z >= offsetZ && post.inScreen) {

            if (htmlMode)
              cssScene.remove(dom);
            post.inScreen = false;
          } else if (post.position.z < -viewDepth - fadeInRange && post.inScreen) {

            if (htmlMode)
            cssScene.remove(dom);
            post.inScreen = false;
          }

          if (promise) {
            $timeout.cancel(promise);
          }

          // Calculate alpha
          if (htmlMode) {


            var insideHTML =
              '<div class="post-header">' +
              '<div class="profile_pic"><img src="' + 'http://www.gth.co.th/farewell/api/getAllImage.php?twitterID=' + object.data.twitterID + '"></img></div>' +
              '<div class="name">' + object.data.name + '<br>' + '<span>' + object.data.time + '</span>' + '</div>' +
              '</div>' +
              '<p class="text">' + object.data.text + '</p>';
            dom.element.innerHTML = insideHTML;
            dom.element.style.opacity = alpha;

          }
          if(!htmlMode){
            promise = $timeout(function() {
              _.each(posts, function(object) {
                var post = object.mesh;
                if (post.inScreen) {
                  loader.load('http://www.gth.co.th/farewell/api/media/' + object.data.id + '.jpg', function(texture) {
                    post.material.map = texture;
                    post.material.needsUpdate = true;
                  });
                }
              })
            }, 5);
          }

        });
      });
    }
  )


  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    glCamera.aspect = window.innerWidth / window.innerHeight;
    glCamera.updateProjectionMatrix();
    if (htmlMode)
    cssRenderer.setSize(window.innerWidth, window.innerHeight)
    glRenderer.setSize(window.innerWidth, window.innerHeight);
  }
  var PI2 = Math.PI * 2;
  var numberOfParticle = window.innerWidth * 2;
  var particles;


  $scope.addParticle = function() {

    particles = new THREE.Geometry();
    for (var p = 0; p < numberOfParticle; p++) {
      var particle =
        new THREE.Vector3(
          Math.random() * window.innerWidth * 10 - window.innerWidth * 5,
          Math.random() * window.innerHeight * 10 - window.innerHeight * 5,
          Math.random() * 5000 - 3000)

      particle.velocity = new THREE.Vector3(
        0, // x
        -Math.random(), // y: random vel
        0);
      particles.vertices.push(particle);
    }
    var particleMaterial = new THREE.PointsMaterial({
      color: 0xeeeeee,
      size: 30,
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


  }
  $scope.removeParticle = function() {
    glScene.remove(particleSystem);
  }
  $scope.isShowParticle = true;
  $scope.toogleParticle = function() {
    if (!$scope.isShowParticle) {
      $scope.addParticle()
    } else {
      $scope.removeParticle()
    }
    $scope.isShowParticle = !$scope.isShowParticle;

  }
}]);
