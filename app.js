const Koa = require("koa");
const path = require("path");
const cors = require("koa2-cors");
const koabody = require("koa-body");
const static = require("koa-static");
const send = require("koa-send");
const router = require("./router");
const app = new Koa();

app.use(
  koabody({
    multipart: true, // 支持文件上传
    formidable: {
      multipart: true, // 是否支持 multipart-formdate 的表单
      maxFieldsSize: 2 * 1024 * 1024, // 最大文件为2兆
      uploadDir: "./", //文件保存路径
      keepExtensions: true, //保持源文件的扩展
      onFileBegin: (name, file) => {
        //文件保存之前的预处理
        file.path = file.name; //保存文件名改为源文件的文件名，否则文件名随机
      },
    },
  })
);

// 允许跨域
app.use(
  cors({
    origin: function (ctx) {
      return "*";
      if (ctx.url === "/test") {
        return "http://localhost:3000"; // 只允许http://localhost:3000这个域名的请求
      }
    },
    maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //设置所允许的HTTP请求方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], //设置服务器支持的所有头信息字段
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], //设置获取其他自定义字段
  })
);

app.use(static(path.join(__dirname, "./static"))); // http://127.0.0.1:5000/pdf/sample.pdf

// 配置路由 allowedMethods是补充响应头的
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
