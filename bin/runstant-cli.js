#!/usr/bin/env node

// カレントのhtml,css,jsをrunstant化する。
// あるいはgistをrunstant化する
var fs = require("fs");
var parseArgs = require('minimist');
var jszip = require("jszip");
var hogan = require("hogan.js");
var spawn = require('child_process').spawn;
var request = require('request');

var runstantTempl = fs.readFileSync(__dirname + "/../runstant.hjs", "utf-8");
var runstantUrl = "http://phi-jp.github.io/runstant/release/alpha/#";

function openUrl(url) {
  // OSXなら、open,Windowsならstartで開く
  //console.log(runstantUrl);
  if (process.platform == "darwin") {
    spawn("open", [url]);
  } else if (process.platform == "win32") {

    var options = {
      url: "https://www.googleapis.com/urlshortener/v1/url",
      headers: {
        'Content-Type': 'application/json'
      },
      json: true,
      body: JSON.stringify({
        longUrl: url
      })
    };

    request.post(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        spawn("cmd", ["/C", "start " + body.id]);
      } else {
        console.log('error: ' + response.statusCode);
      }
    });


  } else {
    console.log(url);
  }
}

/**
 * JSONからハッシュを生成する
 */
function json2hash(json) {
  var t = JSON.stringify(json);
  var jsz = new jszip();
  jsz.file("data", t);
  var zipedFile = jsz.generate();
  //encodeURI
  return encodeURI(zipedFile);
}

/**
 * gistからrunstantへ変換するrunstantなページを生成する
 */
function getFromGist(gistUrl) {

  // 変化用テンプレートの読み込み
  var gist2runstant = fs.readFileSync(__dirname + "/../gist2runstant.hjs", "utf-8");
  var obj = {};
  obj.gistUrl = gistUrl;
  var html = hogan.compile(gist2runstant).render(obj);

  obj = {};
  obj.myhtml = "";
  obj.mycss = "";
  obj.myjs = "";
  var jsonStr = hogan.compile(runstantTempl).render(obj);
  //console.log(jsonStr);
  // JSON文字列をJSON化する。
  var chkJson = JSON.parse(jsonStr);
  chkJson.code.html.value = html;
  runstantUrl = runstantUrl + json2hash(chkJson);

  openUrl(runstantUrl);
}

// main


var argv = parseArgs(process.argv.slice(2));
//console.dir(argv);

var targetDir;
if (argv._.length > 0) {
  // 引数が指定されている場合
  if (argv._[0].indexOf("http") === 0) {
    // URL指定の場合
    if (argv._[0].indexOf("http://phi-jp.github.io/runstant/release/alpha/") === 0) {
      console.log("sorry,not implement yet.");
      process.exit(0);
    } else {
      // 指定されたURLをインポートするみたいな
      getFromGist(argv._[0]);
      return;
    }
  } else {
    // コマンドラインに指定された文字列をディレクトリとみなして処理する。
    targetDir = argv._[0];
  }
} else {
  targetDir = "."
}
targetDir = targetDir.replace(/\/$/, "");



// html処理
// ディレクトリの.htmlを読み込む
var fileList = fs.readdirSync(targetDir);
var html = "";
var js = "";
var css = "";

for (var i = 0; i < fileList.length; i++) {
  if (/.*\html/.test(fileList[i])) {
    // htmlを読み込む。
    html = fs.readFileSync(targetDir + "/" + fileList[i], "utf-8");
  }
  if (/.*\js/.test(fileList[i])) {
    // JavaScriptを読み込む。
    js = fs.readFileSync(targetDir + "/" + fileList[i], "utf-8");
  }
  if (/.*\css/.test(fileList[i])) {
    // JavaScriptを読み込む。
    css = fs.readFileSync(targetDir + "/" + fileList[i], "utf-8");
  }

}

// css
html = html.replace(/<link (.*)>/, "");
html = html.replace(/<\/head>/, "<style>${style}</style>\n</head>");

// headタグの<script>${script}</script>を一旦消す。
// headタグの末尾に<script>${script}</script>を付ける。
html = html.replace(/<script src=(.*)><\/script>/, function(str, p1, offset) {
  if (str.indexOf("http") > 0) {
    return str;
  }
  return "";
});
html = html.replace(/<\/head>/, "<script>${script}</script>\n</head>");

//console.log(html);

// Hogan.jsでJSON文字列を作る。
obj = {};
obj.myhtml = "";
obj.mycss = "";
obj.myjs = "";
var jsonStr = hogan.compile(runstantTempl).render(obj);
//console.log(jsonStr);
// JSON文字列をJSON化する。
var chkJson = JSON.parse(jsonStr);
chkJson.code.html.value = html;
chkJson.code.style.value = css;
chkJson.code.script.value = js;
runstantUrl = runstantUrl + json2hash(chkJson);

openUrl(runstantUrl);
//console.log(runstantUrl);
