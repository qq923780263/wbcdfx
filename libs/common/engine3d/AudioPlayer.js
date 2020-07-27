"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioPlayerWX = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var AudioPlayer = cc.internal.AudioPlayer;
var _cc$AudioClip = cc.AudioClip,
    PlayingState = _cc$AudioClip.PlayingState,
    AudioType = _cc$AudioClip.AudioType;

cc.AudioClip.prototype._getPlayer = function (clip) {
  this._loadMode = AudioType.JSB_AUDIO;
  return AudioPlayerWX;
};

var AudioPlayerWX = /*#__PURE__*/function (_AudioPlayer) {
  _inherits(AudioPlayerWX, _AudioPlayer);

  function AudioPlayerWX(info) {
    var _this;

    _classCallCheck(this, AudioPlayerWX);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AudioPlayerWX).call(this, info));
    _this._startTime = 0;
    _this._offset = 0;
    _this._volume = 1;
    _this._loop = false;
    _this._oneShoting = false;
    _this._audio = info.clip;

    _this._audio.onPlay(function () {
      if (_this._state === PlayingState.PLAYING) {
        return;
      }

      _this._state = PlayingState.PLAYING;
      _this._startTime = performance.now();

      _this._eventTarget.emit('started');
    });

    _this._audio.onPause(function () {
      if (_this._state === PlayingState.STOPPED) {
        return;
      }

      _this._state = PlayingState.STOPPED;
      _this._offset += performance.now() - _this._startTime;
    });

    _this._audio.onStop(function () {
      if (_this._state === PlayingState.STOPPED) {
        return;
      }

      _this._state = PlayingState.STOPPED;
      _this._offset = 0;
    });

    _this._audio.onEnded(function () {
      if (_this._state === PlayingState.STOPPED) {
        return;
      }

      _this._state = PlayingState.STOPPED;
      _this._offset = 0;

      _this._eventTarget.emit('ended');
    });

    _this._audio.onError(function (res) {
      return console.error(res.errMsg);
    });

    return _this;
  }

  _createClass(AudioPlayerWX, [{
    key: "play",
    value: function play() {
      if (!this._audio || this._state === PlayingState.PLAYING) {
        return;
      }

      if (this._blocking) {
        this._interrupted = true;
        return;
      }

      if (this._oneShoting) {
        this._audio.volume = this._volume;
        this._audio.loop = this._loop;
        this._oneShoting = false;
      }

      this._audio.play();
    }
  }, {
    key: "pause",
    value: function pause() {
      if (!this._audio || this._state !== PlayingState.PLAYING) {
        return;
      }

      this._audio.pause();
    }
  }, {
    key: "stop",
    value: function stop() {
      if (!this._audio) {
        return;
      }

      this._audio.stop();
    }
  }, {
    key: "playOneShot",
    value: function playOneShot(volume) {
      /* InnerAudioContext doesn't support multiple playback at the
         same time so here we fall back to re-start style approach */
      if (volume === undefined) {
        volume = 1;
      }

      if (!this._audio) {
        return;
      }

      this._offset = 0;
      this._oneShoting = true;
      this._audio.loop = false;
      this._audio.volume = volume; // stop and play immediately could run into issues on iOS

      if (this._state === PlayingState.PLAYING) {
        this._audio.seek(0);
      } else {
        this._audio.play();
      }
    }
  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {
      if (this._state !== PlayingState.PLAYING) {
        return this._offset / 1000;
      }

      var current = (performance.now() - this._startTime + this._offset) / 1000;

      if (current > this._duration) {
        if (!this._loop) return 0;
        current -= this._duration;
        this._startTime += this._duration * 1000;
      }

      return current;
    }
  }, {
    key: "setCurrentTime",
    value: function setCurrentTime(val) {
      if (!this._audio) {
        return;
      }

      this._offset = cc.math.clamp(val, 0, this._duration) * 1000;
      this._startTime = performance.now();

      this._audio.seek(val);
    }
  }, {
    key: "getVolume",
    value: function getVolume() {
      return this._volume;
    }
  }, {
    key: "setVolume",
    value: function setVolume(val, immediate) {
      this._volume = val;

      if (this._audio) {
        this._audio.volume = val;
      }
    }
  }, {
    key: "getLoop",
    value: function getLoop() {
      return this._loop;
    }
  }, {
    key: "setLoop",
    value: function setLoop(val) {
      this._loop = val;

      if (this._audio) {
        this._audio.loop = val;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this._audio) {
        this._audio.destroy();
      }

      _get(_getPrototypeOf(AudioPlayerWX.prototype), "destroy", this).call(this);
    }
  }]);

  return AudioPlayerWX;
}(AudioPlayer);

exports.AudioPlayerWX = AudioPlayerWX;