(function () {
    'use-strict';

    angular.module('ovac.gallery', []).directive('ovacGallery', ovacGallery);

    ovacGallery.$inject = ['$document', '$timeout', '$q', '$templateCache'];

    function ovacGallery($document, $timeout, $q, $templateCache) {

        var defaults = {
            baseClass: 'ovac-gallery',
            thumbClass: 'ovac-thumb',
            templateUrl: 'ovac-gallery.html'
        };

        var keys_codes = {
            enter: 13,
            esc: 27,
            left: 37,
            right: 39
        };

        function setScopeValues(scope, attrs) {
            scope.baseClass = scope.class || defaults.baseClass;
            scope.thumbClass = scope.thumbClass || defaults.thumbClass;
            scope.thumbsNum = scope.thumbsNum || 3; // should be odd
        }

        var template_url = defaults.templateUrl;
        // Set the default template
        $templateCache.put(template_url,
          `
          <div class="ovac-overlay" ng-show="opened"></div>
          <div class="ovac-gallery-content" unselectable="on" ng-show="opened" ng-swipe-left="nextImage()" ng-swipe-right="prevImage()">
            <div class="uil-ring-css" ng-show="loading"><div></div></div>
          <a href="{{getImageDownloadSrc()}}" target="_blank" ng-show="showImageDownloadButton()" class="download-image"><i class="icon save"></i></a>
            <a class="close-popup" ng-click="closeGallery()"><i class="icon close"></i></a>
            <a class="nav-left" ng-click="prevImage()"><i class="icon left arrow"></i></a>
            <img ondragstart="return false;" draggable="false" ng-src="{{ img }}" ng-click="nextImage()" ng-show="!loading" class="effect" />
            <a class="nav-right" ng-click="nextImage()"><i class="icon right arrow"></i></a>
            <span class="info-text">{{ index + 1 }}/{{ images.length }} - {{ description }}</span>
            <div class="ovac-thumbnails-wrapper">
              <div class="ovac-thumbnails slide-left">
                <div ng-repeat="i in images">
                  <img ng-src="{{ ''+thumbbase+i[thumbnailKey] }}" ng-class="{\active\: index === $index}" ng-click="changeImage($index)" />
                </div>
              </div>
            </div>
          </div>
          `
        );

        return {
            restrict: 'EA',
            scope: {
                images: '=',
                hideOverflow: '=',
                thumbsNum: '@',
                name: '@',
                imageKey: '@',
                thumbnailKey: '@',
                descriptionKey: '@',
                downloadKey : '@',
                base : '=',
                save : '='
            },
            controller: [
                '$scope',
                function ($scope) {
                    $scope.$on( `openGallery${$scope.name?':'+$scope.name:''}`, function (e, args) {
                        $scope.openGallery(args.index);
                    });
                }
            ],
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || defaults.templateUrl;
            },
            link: function (scope, element, attrs) {
                setScopeValues(scope, attrs);

                if (scope.thumbsNum >= 11) {
                    scope.thumbsNum = 11;
                }

                scope.thumbnailKey = scope.thumbnailKey || 'thumb';
                scope.descriptionKey = scope.descriptionKey || 'description';
                scope.imageKey = scope.imageKey || 'img';
                scope.imgbase = scope.base && scope.base[0] ? scope.base[0]:'';
                scope.thumbbase = scope.base && scope.base[1] ? scope.base[1]:'';
                scope.downloadSrc = scope.downloadKey || scope.imageKey;
                scope.saveImg = !!scope.save || false;

                var $body = $document.find('body');
                var $thumbwrapper = angular.element(element[0].querySelectorAll('.ovac-thumbnails-wrapper'));
                var $thumbnails = angular.element(element[0].querySelectorAll('.ovac-thumbnails'));

                scope.index = 0;
                scope.opened = false;

                scope.thumb_wrapper_width = 0;
                scope.thumbs_width = 0;

                var loadImage = function (i, key) {
                    var deferred = $q.defer();
                    var image = new Image();

                    image.onload = function () {
                        scope.loading = false;
                        if (this.complete === false || this.naturalWidth === 0) {
                            deferred.reject();
                        }
                        deferred.resolve(image);
                    };

                    image.onerror = function () {
                        deferred.reject();
                    };

                    // image.src = scope.images[i].img; as default
                    // Allow user to define the image Key
                    image.src = ''+scope.imgbase+scope.images[i][key]||'http://www.srinivasmusic.com/assets/images/oops.png';
                    scope.loading = true;

                    return deferred.promise;
                };

                var showImage = function (i) {

                  if(scope.images && scope.images.length){
                    loadImage(scope.index, scope.imageKey).then(
                      resp => { scope.img = resp.src; smartScroll(scope.index); },
                      () => { loadImage(scope.index, 'image')
                        .then(
                          resp => { scope.img = resp.src; smartScroll(scope.index); },
                          () => { scope.img = scope.imgbase+scope.images[i]['img']||'http://www.srinivasmusic.com/assets/images/oops.png'; scope.loading = false;}
                    )})}

                    scope.description = (scope.images ? scope.images[i][scope.descriptionKey]: false) || '';
                };

                scope.showImageDownloadButton = function () {
                    if ( !scope.images || scope.images[scope.index] == null || scope.images[scope.index][scope.downloadSrc] == null || !scope.saveImg) return
                    var image = scope.images[scope.index];
                    return angular.isDefined(image[scope.downloadSrc]) && 0 < image[scope.downloadSrc].length;
                };

                scope.getImageDownloadSrc = function () {
                    if ( !scope.images || scope.images[scope.index] == null || !scope.saveImg ) return
                    return '' + scope.imgbase + scope.images[scope.index][scope.downloadSrc];
                };

                scope.changeImage = function (i) {
                    scope.index = i;
                    showImage(i);
                };

                scope.nextImage = function () {
                    scope.index += 1;
                    if (scope.index === scope.images.length) {
                        scope.index = 0;
                    }
                    showImage(scope.index);
                };

                scope.prevImage = function () {
                    scope.index -= 1;
                    if (scope.index < 0) {
                        scope.index = scope.images.length - 1;
                    }
                    showImage(scope.index);
                };

                scope.openGallery = function (i) {
                    if (typeof i !== undefined) {
                        scope.index = i;
                        showImage(scope.index);
                    }
                    scope.opened = true;
                    if (scope.hideOverflow) {
                        $('body').css({overflow: 'hidden'});
                    }

                    $timeout(function () {
                        var calculatedWidth = calculateThumbsWidth();
                        scope.thumbs_width = calculatedWidth.width;
                        //Add 1px, otherwise some browsers move the last image into a new line
                        var thumbnailsWidth = calculatedWidth.width + 1;
                        $thumbnails.css({width: thumbnailsWidth + 'px'});
                        $thumbwrapper.css({width: calculatedWidth.visible_width + 'px'});
                        smartScroll(scope.index);
                    });
                };

                scope.closeGallery = function () {
                    scope.opened = false;
                    if (scope.hideOverflow) {
                        $('body').css({overflow: ''});
                    }
                };

                $body.bind('keydown', function (event) {
                    if (!scope.opened) {
                        return;
                    }
                    var which = event.which;
                    if (which === keys_codes.esc) {
                        scope.closeGallery();
                    } else if (which === keys_codes.right || which === keys_codes.enter) {
                        scope.nextImage();
                    } else if (which === keys_codes.left) {
                        scope.prevImage();
                    }
                    scope.$apply();
                });

                var calculateThumbsWidth = function () {
                    var width = 0,
                        visible_width = 0;
                    angular.forEach($thumbnails.find('img'), function (thumb) {
                        width += thumb.clientWidth;
                        width += 10; // margin-right
                        visible_width = thumb.clientWidth + 10;
                    });
                    return {
                        width: width,
                        visible_width: visible_width * scope.thumbsNum
                    };
                };

                var smartScroll = function (index) {
                    $timeout(function () {
                        var len = (scope.images ? scope.images.length : 0),
                            width = scope.thumbs_width,
                            item_scroll = parseInt( ''+(width / len), 10),
                            i = index + 1,
                            s = Math.ceil(len / i);

                        $thumbwrapper[0].scrollLeft = 0;
                        $thumbwrapper[0].scrollLeft = i * item_scroll - (s * item_scroll);
                    }, 100);
                };

            }
        };
    }
})();
