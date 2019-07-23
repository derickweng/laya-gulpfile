(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
var GameUI_1 = require("./script/GameUI");
var GameControl_1 = require("./script/GameControl");
var Bullet_1 = require("./script/Bullet");
var DropBox_1 = require("./script/DropBox");
/*
* 游戏初始化配置;
*/
var GameConfig = /** @class */ (function () {
    function GameConfig() {
    }
    GameConfig.init = function () {
        var reg = Laya.ClassUtils.regClass;
        reg("script/GameUI.ts", GameUI_1.default);
        reg("script/GameControl.ts", GameControl_1.default);
        reg("script/Bullet.ts", Bullet_1.default);
        reg("script/DropBox.ts", DropBox_1.default);
    };
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    return GameConfig;
}());
exports.default = GameConfig;
GameConfig.init();

},{"./script/Bullet":3,"./script/DropBox":4,"./script/GameControl":5,"./script/GameUI":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameConfig_1 = require("./GameConfig");
var Main = /** @class */ (function () {
    function Main() {
        //根据IDE设置初始化引擎		
        if (window["Laya3D"])
            Laya3D.init(GameConfig_1.default.width, GameConfig_1.default.height);
        else
            Laya.init(GameConfig_1.default.width, GameConfig_1.default.height, Laya["WebGL"]);
        Laya["Physics"] && Laya["Physics"].enable();
        Laya["DebugPanel"] && Laya["DebugPanel"].enable();
        Laya.stage.scaleMode = GameConfig_1.default.scaleMode;
        Laya.stage.screenMode = GameConfig_1.default.screenMode;
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = GameConfig_1.default.exportSceneToJson;
        //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
        if (GameConfig_1.default.debug || Laya.Utils.getQueryString("debug") == "true")
            Laya.enableDebugPanel();
        if (GameConfig_1.default.physicsDebug && Laya["PhysicsDebugDraw"])
            Laya["PhysicsDebugDraw"].enable();
        if (GameConfig_1.default.stat)
            Laya.Stat.show();
        Laya.alertGlobalError = true;
        //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    }
    Main.prototype.onVersionLoaded = function () {
        //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    };
    Main.prototype.onConfigLoaded = function () {
        //加载IDE指定的场景
        GameConfig_1.default.startScene && Laya.Scene.open(GameConfig_1.default.startScene);
    };
    return Main;
}());
//激活启动类
new Main();

},{"./GameConfig":1}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 子弹脚本，实现子弹飞行逻辑及对象池回收机制
 */
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet() {
        return _super.call(this) || this;
    }
    Bullet.prototype.onEnable = function () {
        //设置初始速度
        var rig = this.owner.getComponent(Laya.RigidBody);
        rig.setVelocity({ x: 0, y: -10 });
    };
    Bullet.prototype.onTriggerEnter = function (other, self, contact) {
        //如果被碰到，则移除子弹
        this.owner.removeSelf();
    };
    Bullet.prototype.onUpdate = function () {
        //如果子弹超出屏幕，则移除子弹
        if (this.owner.y < -10) {
            this.owner.removeSelf();
        }
    };
    Bullet.prototype.onDisable = function () {
        //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        Laya.Pool.recover("bullet", this.owner);
    };
    return Bullet;
}(Laya.Script));
exports.default = Bullet;

},{}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var GameUI_1 = require("./GameUI");
/**
 * 掉落盒子脚本，实现盒子碰撞及回收流程
 */
var DropBox = /** @class */ (function (_super) {
    __extends(DropBox, _super);
    function DropBox() {
        var _this = _super.call(this) || this;
        /**盒子等级 */
        _this.level = 1;
        return _this;
    }
    DropBox.prototype.onEnable = function () {
        /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
        this._rig = this.owner.getComponent(Laya.RigidBody);
        this.level = Math.round(Math.random() * 5) + 1;
        this._text = this.owner.getChildByName("levelTxt");
        this._text.text = this.level + "";
    };
    DropBox.prototype.onUpdate = function () {
        //让持续盒子旋转
        this.owner.rotation++;
    };
    DropBox.prototype.onTriggerEnter = function (other, self, contact) {
        var owner = this.owner;
        if (other.label === "buttle") {
            //碰撞到子弹后，增加积分，播放声音特效
            if (this.level > 1) {
                this.level--;
                this._text.changeText(this.level + "");
                owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                Laya.SoundManager.playSound("sound/hit.wav");
            }
            else {
                if (owner.parent) {
                    var effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                    effect.pos(owner.x, owner.y);
                    owner.parent.addChild(effect);
                    effect.play(0, true);
                    owner.removeSelf();
                    Laya.SoundManager.playSound("sound/destroy.wav");
                }
            }
            GameUI_1.default.instance.addScore(1);
        }
        else if (other.label === "ground") {
            //只要有一个盒子碰到地板，则停止游戏
            owner.removeSelf();
            GameUI_1.default.instance.stopGame();
        }
    };
    /**使用对象池创建爆炸动画 */
    DropBox.prototype.createEffect = function () {
        var ani = new Laya.Animation();
        ani.loadAnimation("test/TestAni.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover() {
            ani.removeSelf();
            Laya.Pool.recover("effect", ani);
        }
        return ani;
    };
    DropBox.prototype.onDisable = function () {
        //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("dropBox", this.owner);
    };
    return DropBox;
}(Laya.Script));
exports.default = DropBox;

},{"./GameUI":6}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
var GameControl = /** @class */ (function (_super) {
    __extends(GameControl, _super);
    function GameControl() {
        var _this = _super.call(this) || this;
        /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:1000}*/
        _this.createBoxInterval = 1000;
        /**开始时间*/
        _this._time = 0;
        /**是否已经开始游戏 */
        _this._started = false;
        return _this;
    }
    GameControl.prototype.onEnable = function () {
        this._time = Date.now();
        this._gameBox = this.owner.getChildByName("gameBox");
    };
    GameControl.prototype.onUpdate = function () {
        //每间隔一段时间创建一个盒子
        var now = Date.now();
        if (now - this._time > this.createBoxInterval && this._started) {
            this._time = now;
            this.createBox();
        }
    };
    GameControl.prototype.createBox = function () {
        //使用对象池创建盒子
        var box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        box.pos(Math.random() * (Laya.stage.width - 100), -100);
        this._gameBox.addChild(box);
    };
    GameControl.prototype.onStageClick = function (e) {
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
        //舞台被点击后，使用对象池创建子弹
        var flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
        flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        this._gameBox.addChild(flyer);
    };
    /**开始游戏，通过激活本脚本方式开始游戏*/
    GameControl.prototype.startGame = function () {
        if (!this._started) {
            this._started = true;
            this.enabled = true;
        }
    };
    /**结束游戏，通过非激活本脚本停止游戏 */
    GameControl.prototype.stopGame = function () {
        this._started = false;
        this.enabled = false;
        this.createBoxInterval = 1000;
        this._gameBox.removeChildren();
    };
    return GameControl;
}(Laya.Script));
exports.default = GameControl;

},{}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layaMaxUI_1 = require("./../ui/layaMaxUI");
var GameControl_1 = require("./GameControl");
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
var GameUI = /** @class */ (function (_super) {
    __extends(GameUI, _super);
    function GameUI() {
        var _this = _super.call(this) || this;
        GameUI.instance = _this;
        //关闭多点触控，否则就无敌了
        Laya.MouseManager.multiTouchEnabled = false;
        return _this;
    }
    GameUI.prototype.onEnable = function () {
        this._control = this.getComponent(GameControl_1.default);
        //点击提示文字，开始游戏
        this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
    };
    GameUI.prototype.onTipClick = function (e) {
        this.tipLbll.visible = false;
        this._score = 0;
        this.scoreLbl.text = "";
        this._control.startGame();
    };
    /**增加分数 */
    GameUI.prototype.addScore = function (value) {
        if (value === void 0) { value = 1; }
        this._score += value;
        this.scoreLbl.changeText("分数：" + this._score);
        //随着分数越高，难度增大
        if (this._control.createBoxInterval > 600 && this._score % 20 == 0)
            this._control.createBoxInterval -= 20;
    };
    /**停止游戏 */
    GameUI.prototype.stopGame = function () {
        this.tipLbll.visible = true;
        this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
        this._control.stopGame();
    };
    return GameUI;
}(layaMaxUI_1.ui.test.TestSceneUI));
exports.default = GameUI;

},{"./../ui/layaMaxUI":7,"./GameControl":5}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Scene = Laya.Scene;
var REG = Laya.ClassUtils.regClass;
var ui;
(function (ui) {
    var test;
    (function (test) {
        var TestSceneUI = /** @class */ (function (_super) {
            __extends(TestSceneUI, _super);
            function TestSceneUI() {
                return _super.call(this) || this;
            }
            TestSceneUI.prototype.createChildren = function () {
                _super.prototype.createChildren.call(this);
                this.loadScene("test/TestScene");
            };
            return TestSceneUI;
        }(Scene));
        test.TestSceneUI = TestSceneUI;
        REG("ui.test.TestSceneUI", TestSceneUI);
    })(test = ui.test || (ui.test = {}));
})(ui = exports.ui || (exports.ui = {}));

},{}]},{},[2]);
