// v1.0.0
//是否使用IDE自带的node环境和插件，设置false后，则使用自己环境(使用命令行方式执行)
let useIDENode = process.argv[0].indexOf("LayaAir") > -1 ? true : false;
//获取Node插件和工作路径
let ideModuleDir = useIDENode ? process.argv[1].replace("gulp\\bin\\gulp.js", "").replace("gulp/bin/gulp.js", "") : "";
let workSpaceDir = useIDENode ? process.argv[2].replace("--gulpfile=", "").replace("\\.laya\\gulpfile.js", "").replace("/.laya/gulpfile.js", "") : "./../";

//引用插件模块
let gulp = require(ideModuleDir + "gulp");
let browserify = require(ideModuleDir + "browserify");
let source = require(ideModuleDir + "vinyl-source-stream");
let tsify = require(ideModuleDir + "tsify");
var watchify = useIDENode ? null : require("watchify");
var gutil = useIDENode ? null : require("gulp-util");
let browserSync = useIDENode ? null : require('browser-sync').create();
let runSequence = useIDENode ? null : require('run-sequence');
// 如果是发布时调用编译功能，增加prevTasks
let prevTasks = "";
if (global.publish) {
	prevTasks = ["loadConfig"];
}

//使用browserify，转换ts到js，并输出到bin/js目录
gulp.task("default", prevTasks, function () {
	// 发布时调用编译功能，判断是否点击了编译选项
	if (global.publish && !global.config.compile) {
		return;
	} else if (global.publish && global.config.compile) {
		// 发布时调用编译，workSpaceDir使用publish.js里的变量
		workSpaceDir = global.workSpaceDir;
	}
	return browserify({
		basedir: workSpaceDir,
		//是否开启调试，开启后会生成jsmap，方便调试ts源码，但会影响编译速度
		debug: false,
		entries: ['src/Main.ts'],
		cache: {},
		packageCache: {}
	})
		//使用tsify插件编译ts
		.plugin(tsify)
		.bundle()
		//使用source把输出文件命名为bundle.js
		.pipe(source('bundle.js'))
		//把bundle.js复制到bin/js目录
		.pipe(gulp.dest(workSpaceDir + "/bin/js"));
});

if (watchify) {
	const watchedBrowserify = watchify(browserify({
		basedir: workSpaceDir,
		//是否开启调试，开启后会生成jsmap，方便调试ts源码，但会影响编译速度
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
	});
	watchedBrowserify.on("log", gutil.log);
}
