"use strict";

var systemInfo = require('../common/engine3d/globalAdapter/BaseSystemInfo');

var env = wx.getSystemInfoSync();
var adaptSysFunc = systemInfo.adaptSys;
Object.assign(systemInfo, {
  // Extend adaptSys interface
  adaptSys: function adaptSys(sys) {
    adaptSysFunc.call(this, sys); // TODO: add mac platform

    if (env.platform === 'windows') {
      sys.isMobile = false;
      sys.os = sys.OS_WINDOWS;
    } else if (env.platform === 'devtools') {
      var system = env.system.toLowerCase();

      if (system.indexOf('android') > -1) {
        sys.os = sys.OS_ANDROID;
      } else if (system.indexOf('ios') > -1) {
        sys.os = sys.OS_IOS;
      }
    } // wechatgame subdomain


    if (!wx.getOpenDataContext) {
      sys.platform = sys.WECHAT_GAME_SUB;
      sys.browserType = sys.BROWSER_TYPE_WECHAT_GAME_SUB;
    } else {
      sys.platform = sys.WECHAT_GAME;
      sys.browserType = sys.BROWSER_TYPE_WECHAT_GAME;
    }

    sys.glExtension = function (name) {
      if (name === 'OES_texture_float') {
        return false;
      }

      return !!cc.renderer.device.ext(name);
    };
  }
});
__globalAdapter.init = systemInfo.init;
__globalAdapter.adaptSys = systemInfo.adaptSys;