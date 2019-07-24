# Laya开发速度优化笔记

# 1. 为何选择Laya引擎
微信小游戏推出之后，很多公司也相应的进入到微信小游戏这个领域，现在市场上的游戏开发引擎，如Cocos、Egret、Laya都对小游戏有了很好的兼容性。目前公司技术栈主要是使用Cocos和Laya，经过几个项目的接触，考量了引擎在IDE上的上手习惯，API的设计上，发现Laya更适合微信小游戏的开发。

# 2. 默认的Laya构建方式

![clipboard.png](/img/bVbvsj2)

Laya在使用IDE默认创建项目后(本文选择typescript语言),会在当前项目目录下，新建一个为.laya的文件夹。默认生成的编译配置文件为
![默认的laya构建配置](/img/bVbvsdU)
其中compile.js为开发时默认运行文件，这里如果开发者是mac系统，使用F8编译项目后，可能都会报以下错误：

![mac系统下新建项目后的编译报错](/img/bVbvseJ)
通过报错提示，这里如果出错的话，将compile.js名称改为gulpfile.js，并且，将文件内gulp运行的默认task改为'default'。



![clipboard.png](/img/bVbvshp)



通过compile.js文件可知，默认的Laya构建方式是，使用gulp、browserify进行项目构建，tsify编译typscript，vinyl-source-stream用于将tsify构建的node stream转化为gulp能识别的stream文件。所以我们每次修改ts源码，都需要手动点击编译或者使用F8编译。并且，就Laya的3D示例项目，每次编译的时间基本在1s~2s。

![clipboard.png](/img/bVbvsl6)


# 3. 改进的Laya构建方式
对于web前端开发，可能都会配置webpack+webpack-hot-middleware之类进行代码热更新，开发web网页的流程基本就是：修改代码 -> 自动编译  -> 自动刷新，倘若有两个屏幕，开发者不需要去刷新浏览器、输入命令重新编译等机械重复的行为。既然Laya默认使用了browserify（其实browserify这几年更新已经很慢了），这里我们可以加入gulp.watch，观察src目录源文件，每当src下文件发生修改时，自动触发编译操作，相当于开发者不需要再按F8编译。

```js
gulp.task("watch", ['default'], () => {
	gulp.watch("../src/**/*.ts", () => {
		gulp.run("default");
	});
});
```

但是这种方式，相当于gulp重新进行编译，实际编译速度依然不快。那么问题来了，有没有办法编译对时候，gulp只编译修改的那部分，从而加快编译速度？

![clipboard.png](/img/bVbvsyr)



# 4. 使用watchify监听文件变化并自动刷新
通过gulp官网可了解到watchify到相关使用，这里我们将代码改成，并结合browser-sync,带来自动刷新网页的功能。
```js

const watchedBrowserify = watchify(browserify({
	basedir: workSpaceDir,
	debug: false,
	entries: ['src/Main.ts'],
	cache: {},
	packageCache: {}
}).plugin(tsify));

// 记录watchify编译ts的时候是否出错，出错则不刷新浏览器
let isBuildError = false; 
gulp.task("build", () => {
	return watchedBrowserify
		.bundle()
		.on('error', (...args) => {
		   isBuildError = true;
			gutil.log(...args);
		})
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(workSpaceDir + "/bin/js"));
    });

    gulp.task("watch", ['build'], () => {
		// 浏览器开发时自动刷新页面
	    browserSync.init({
		    port: 3002,
		    server: {
		        watchFiles: ["../bin/"],
			    baseDir: "../bin/"
		    }
    });
    watchedBrowserify.on("update", () => {
	    isBuildError = false;
	    runSequence('build', () => {
		    if (!isBuildError) { // 没有编译错误时，刷新浏览器界面
			    browserSync.reload();
		    }
	    });
	});
    watchedBrowserify.on("log", gutil.log);
});
	
```
其中，runSequence用于同步执行gulp任务，多次实践，这里还需要加入变量isBuildError，在代码编译出错时，不执行browserSync的刷新。



