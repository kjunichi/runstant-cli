#!/usr/bin/env node

// カレントのhtml,css,jsをrunstant化する。
// あるいはgistをrunstant化する
var fs = require("fs");
var parseArgs = require('minimist');
var jszip = require("jszip");
var hogan = require("hogan.js");
var argv = parseArgs(process.argv.slice(2));
var runstantTempl = fs.readFileSync(__dirname + "/../runstant.hjs", "utf-8");
var spawn = require('child_process').spawn;

var runstantUrl = "http://phi-jp.github.io/runstant/#";

// html処理
// カレントディレクトリの.htmlを読み込む
var fileList = fs.readdirSync(".");
var html = "";
var js = "";
var css = "";

for (var i = 0; i < fileList.length; i++) {
  if (/.*\html/.test(fileList[i])) {
    // htmlを読み込む。
    html = fs.readFileSync(fileList[i], "utf-8");
  }
  if (/.*\js/.test(fileList[i])) {
    // JavaScriptを読み込む。
    js = fs.readFileSync(fileList[i], "utf-8");
  }
  if (/.*\css/.test(fileList[i])) {
    // JavaScriptを読み込む。
    css = fs.readFileSync(fileList[i], "utf-8");
  }

}

// css
html = html.replace(/<link (.*)>/, "");
html = html.replace(/<\/head>/, "<style>${style}</style>\n</head>");

// headタグの<script>${script}</script>を一旦消す。
// headタグの末尾に<script>${script}</script>を付ける。
html = html.replace(/<script src=(.*)><\/script>/, "");
html = html.replace(/<\/head>/, "<script src=\"${script}\"></script>\n</head>");

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
var t = JSON.stringify(chkJson);
var jsz = new jszip();
jsz.file("data", t);
var zipedFile = jsz.generate();
//encodeURI
var myHash = encodeURI(encodeURI(zipedFile));
runstantUrl = runstantUrl + myHash;

//console.log(myHash);
// OSXなら、open,Windowsならstartで開く
//console.log(runstantUrl);
if (process.platform == "darwin") {
  spawn("open", [runstantUrl]);
} else if (process.platform == "win32") {
  spawn("start", [runstantUrl]);
} else {
  console.log(runstantUrl);
}
