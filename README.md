# 简介 #

python3下基于CNN的**验证码识别**

## 快速开始 #

### 训练环境 #

各版本号以本人环境为样本

requirement         | version | description
-------------------:| ------- | ---------------------------------------
anaconda3(optional) | 5.3.1   | `Python`发行版，包括`conda`(包管理器)等<br>主要用于搭建`Python`虚拟环境   
python              | 3.6.7   | 不解释
pip(optional)       | 18.1    | 包管理器，可以安装`conda`上没有的东西
numpy               | 1.15.4  | 数值计算扩展库
tensorflow[-gpu]    | 1.12.0  | 机器学习框架,送同版本的`tensorboard`<br>使用GPU版的话需要同时安装`CUDA(9.2.148)`和`cuDNN(7.4)`
captcha             | 0.3     | `python`的验证码库
pillow              | 5.3.0   | `python`第三方图片处理库，是`PIL`(`python2`)的`python3`版本

注意：请将源码放在**文件夹 `'captchaCnn'` (大小写敏感)中**，以便`import	`

### 验证码生成 #

    python captcha_gen.py

后面的训练和测试会引用到，验证码的生成相关参数请见[源码](capcthaCnn/captcha_gen.py)，输出文件夹为 `imgSave`

### 训练模型 #

    python cnn_train.py

parameter | default | description
---------:| ------- | -------------------------------------------------------
ACC_FROM  |  0.95   | minimun of accepted accuracy rate
ACC_TO    |  0.98   | maximun of accepted accuracy rate
ACC_INC   |  0.05   | increasement after each acception
ACC_STEP  |  200    | step(number of sample batches) between two checkpoints
ACC_BATCH |  110    | the number of every sample batch

生成的所有checkpoint会保存在 `'train'` 文件夹中

### 模型测试 #

    python captcha_cnn.py [--captSize 10] [--modelName 5-963636]

parameter | default    | description
---------:| ---------- | ----------------------------------------
captSize  | 10         | the number of captchas which need testing
modelName | "5-963636" | the name of `tensorflow` model (in folder `'trainOK'`)

### 结果展示 #

     python webService.py

自己撸的简易py-`CGI`服务器，要使用的话请另行调试。默认的绑定是 `localhost:8888` ，直接浏览器输进去就行(默认文件`index.html`)。

Demo页面 : `index.html` 。所有 `index.html` 涉及的内容，就是 `assets/*`, `*.js`, `trainOK/*.json`，自己探索吧。

Demo使用的技术有

package               | version        | description
---------------------:| -------------- | -------------------------------------
jquery                | 3.3.1          | 快速、简洁、优秀的`JavaScript`代码库
bootstrap             | 3.3.7          | `Twitter`推出的基于`HTML, CSS, JS`的简洁、直观、强悍的前端开发框架
echarts               | 4.2.0(GL-1.1.1)| `Baidu`推出的`JavaScript`开源可视化库<br>提供直观、交互丰富、高度定制的数据可视化图表
chancejs              | 1.0.16         | Random generator helper for `JavaScript`
fontawesome(optional) | 4.7.0          | 矢量图标库，兼容性良好，不需要`JavaScript`

## 写在最后 #

这是信息技术导论课程的小课题作业，现将研究内容全部公开，请见**PDF**演示文档和Word讲稿。

> 感谢费越、梁子、黄鼎同学的大力相助
> 感谢程文青老师提供的学习机会
