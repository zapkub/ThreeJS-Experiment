var app = angular.module('TimeMachine', ['rzModule'])
app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);


app.controller('mainController', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {



  var viewDepth = 3000;
  var offsetZ = 100;
  var fadeInRange = 100;
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  var glCamera, glRenderer, glScene, controls;
  var cssRenderer, cssScene;
  var particleSystem;
  var numberOfPosts = 880;
  var particleDensity = 1000;
  var distanceOfPostZAxis = 100;

  if(isMobile()){
    distanceOfPostZAxis = 700;

  }
  var posts = [];
  var rawPostData = [];
  $scope.timeSlider = 500;
  var currentSlider = $scope.timeSlider;
  var promise;

  var htmlMode = false;
  $scope.sliderOptions = {
    options: {
      vertical: true,
      hideLimitLabels: true,
      floor: 0,
      ceil: distanceOfPostZAxis * numberOfPosts
    }
  };

  var init = function() {
    glRenderer = new THREE.WebGLRenderer({
      alpha: true
    });
    //0xa6baa9
    glRenderer.setClearColor(0xa6baa9);
    glRenderer.setPixelRatio(window.devicePixelRatio);
    glRenderer._microCache = new MicroCache();
    glRenderer.setSize(window.innerWidth, window.innerHeight);
    glRenderer.shadowMapEnabled = true;
    glScene = new THREE.Scene();
    glCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, viewDepth + 1000);
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

      // create Last post


      var geometry = new THREE.PlaneGeometry(380 / 2, 200);

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

    var geometry = new THREE.PlaneGeometry(380 / 2, 200);
    var material = new THREE.MeshLambertMaterial({
      color: 'white',
      side: THREE.DoubleSide,
      transparent: true
    });
    material.opacity = 0.8;
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
    glCamera.position.z -= delta * 10;
    controls.target.z -= delta * 10;

    if (controls)
      controls.update();
    render();


    var frustum = new THREE.Frustum;
    _.each(posts, function(object) {
      var post = object.mesh;
      var dom = object.dom;
      frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(glCamera.projectionMatrix, glCamera.matrixWorldInverse));
      if (frustum.containsPoint(object.mesh.position) && !object.isLoaded) {
        loader.load('http://www.gth.co.th/farewell/api/media/' + object.data.id + '.jpg', function(texture) {
            texture.minFilter = THREE.LinearFilter;
            post.material.map = texture;
            post.scale.y = texture.image.height / 2 / 200;
            post.translateY(texture.image.height / 2 / 200 / 2);
            post.material.needsUpdate = true;
            object.isLoaded = true;
          }, function() {

          },

          function(xhr) {
            console.log('An error happened');
            object.isLoaded = true;
          });
        if (htmlMode && !object.isLoaded) {
          var insideHTML = "<p>" + object.data.id + "</p>"
            // '<div class="post-header">' +
            // '<div class="profile_pic"><img src="' + 'http://www.gth.co.th/farewell/api/getAllImage.php?twitterID=' + object.data.twitterID + '"></img></div>' +
            // '<div class="name">' + object.data.name + '<br>' + '<span>' + object.data.time + '</span>' + '</div>' +
            // '</div>' +
            // '<p class="text">' + object.data.text + '</p>';
          dom.element.innerHTML = insideHTML;
          dom.element.style.opacity = 1;
          cssScene.add(dom);
          object.isLoaded = true;
        }
      }
    });


  }

  function initControls(renderer, camera) {
    if (htmlMode)
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
    //controls.enableZoom = false;
    controls.enableRotate = true;
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
        console.log(newVal);
        //  glCamera.position.z = -$scope.timeSlider + 1000;
        glCamera.updateMatrix(); // make sure camera's local matrix is updated
        glCamera.updateMatrixWorld(); // make sure camera's world matrix is updated
        glCamera.matrixWorldInverse.getInverse(glCamera.matrixWorld);
        if (controls) {
          controls.target.set(0, 0, -$scope.timeSlider + 1000)
          glCamera.position.z = -$scope.timeSlider + 1500

        }




        return;
        // below this s too much overhead
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
          if (!htmlMode) {
            promise = $timeout(function() {
              _.each(posts, function(object) {
                var post = object.mesh;
                if (post.inScreen) {
                  loader.load('/farewell/api/media/' + object.data.id + '.jpg', function(texture) {
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


  var particles;


  $scope.addParticle = function() {
    var numberOfParticle = window.innerWidth * 20;
    console.log('particle'+window.innerWidth);
    particles = new THREE.Geometry();
    for (var p = 0; p < numberOfParticle; p++) {
      var particle =
        new THREE.Vector3(
          Math.random() * window.innerWidth * 5 - window.innerWidth * 2.5,
          Math.random() * window.innerHeight * 5 - window.innerHeight * 2.5, -Math.random() * (distanceOfPostZAxis * numberOfPosts))

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


function isMobile(a, b) {
  a = navigator.userAgent || navigator.vendor || window.opera
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
    return true;
    else {
      return false;
    }
}
