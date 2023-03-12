const Router = require("koa-router");
const fs = require("fs");
const path = require("path");

const router = new Router();

// http://127.0.0.1:5000
router.get("/", (ctx) => {
  // 设置头类型, 如果不设置，会直接下载该页面
  ctx.type = "html";
  // 读取文件
  const pathUrl = path.join(__dirname, "../index.html");
  ctx.body = fs.createReadStream(pathUrl);
});

//使用路由跳转
router.get("/downPdf", async (ctx) => {
  console.log("请求url", "http://127.0.0.1:5000" + ctx.url);
  let filename = "xxxx";
  ctx.set("Content-disposition", "attachment; filename=" + filename + ".pdf"); // attachment
  // ctx.set('Content-disposition', 'inline; filename=' + filename + '.pdf');// inline
  // attachment 请求后就下载文件
  // inline     有时候可以下载，有时候可以直接浏览，好像跟浏览器有关。
  // ctx.set("Access-Control-Allow-Origin", "*");
  // ctx.set("Access-Control-Allow-Methods", "OPTIONS,GET, PUT, POST, DELETE");
  ctx.set("Content-type", "application/pdf");

  const pathUrl = path.join(__dirname, "../static/test2.pdf");
  let gReadData = fs.createReadStream(pathUrl);
  ctx.body = gReadData;
});
// 测试api
router.get("/api", (ctx) => {
  ctx.body = { msg: "Hello koa interfaces" };
});

// 上传单个或多个文件
// 上传有问题，根目录和目标目录都会有文件
router.post("/upload", (ctx) => {
  // https://www.cnblogs.com/tugenhua0707/p/10828869.html

  console.log("ctx.request", ctx.request);

  let files = ctx.request.files.file;
  if (files.length === undefined) {
    // 上传单个文件，它不是数组，只是单个的对象
    console.log("单文件上传");
    uploadFilePublic(ctx, files, false);
  } else {
    console.log("多文件上传");
    uploadFilePublic(ctx, files, true);
  }

  return (ctx.body = "上传成功！");
});
// 文件下载
router.get("/fileload/:name", async (ctx) => {
  const name = ctx.params.name;
  const path = `static/upload/${name}`;
  console.log("前端想下载：name", name);
  ctx.attachment(path);
  await send(ctx, path);
});

// 上传文件
const uploadUrl = "http://localhost:5000/static/upload";
/*
 * @params flag: 是否是多个文件上传
 */
const uploadFilePublic = function (ctx, files, flag) {
  // 文件保存的路径
  const filePath = path.join(__dirname, "../upload/");
  // 写入文件
  const saveFile = function (file) {
    console.log("写入文件");
    let rs = fs.createReadStream(file.path); // createWriteStream 不会自己创建不存在的文件夹，需要自行判断创建
    let ws = fs.createWriteStream(filePath + `${file.name}`);
    // 写入方法一
    rs.pipe(ws);
    // 写入方法二
    // rs.on('data', function (chunk) {
    //   console.log(chunk.length);//chunk就是一个Buffer(存放16进制数据的"数组",长度以B字节计算(两个16进制为一个元素))
    //   ws.write(chunk);// Node中的Buffer不占用垃圾回收机制中的内存。  Buffer是由C/C++模块维护。  'data'+chunk会在内部自动调用toString()函数。 建议直接返回buffer节省处理字符串的性能开销。
    // });
    // rs.on('end', function () {
    //   console.log('结束啦！');
    //   ws.end();
    // });
  };

  // 给前端返数据
  const returnBody = function (flag) {
    if (flag) {
      let url = "";
      for (let i = 0; i < files.length; i++) {
        url += uploadUrl + `/${files[i].name},`;
      }
      url = url.replace(/,$/gi, "");
      ctx.body = { url: url, code: 200, message: "上传成功" };
    } else {
      ctx.body = {
        url: uploadUrl + `/${files.name}`,
        code: 200,
        message: "上传成功",
      };
    }
  };
  if (flag) {
    // 多个文件上传
    for (let i = 0; i < files.length; i++) {
      const f1 = files[i];
      saveFile(f1);
    }
  } else {
    saveFile(files);
  }
  // 判断 /static/upload 文件夹是否存在，如果不在的话就创建一个
  if (!fs.existsSync(filePath)) {
    console.log("目录不存在", filePath);
    fs.mkdir(filePath, (err) => {
      if (err) {
        throw new Error(err);
      } else {
        returnBody(flag);
      }
    });
  } else {
    console.log("目录存在", filePath);
    returnBody(flag);
  }
};

module.exports = router;
