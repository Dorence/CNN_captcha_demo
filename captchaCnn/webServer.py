import sys
import os
curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
rootPath += os.sep+"captchaCnn"

import http.server as hs
import subprocess
from urllib.parse import urlparse

import tensorflow as tf
from captchaCnn.cnn_train import cnn_graph
from captchaCnn.captcha_gen import gen_captcha_text_and_image
from captchaCnn.util import vec2text, convert2gray
from captchaCnn.util import CAPTCHA_LIST, CAPTCHA_WIDTH, CAPTCHA_HEIGHT, CAPTCHA_LEN

import time

class ServerException(Exception):
    '''服务器内部错误'''
    pass

class case_no_path(object):
    '''如果路径不存在'''
    def test(self, handler):
        print("test case_no_path", not os.path.exists(handler.fullPath))
        return not os.path.exists(handler.fullPath)
    def act(self, handler):
        raise ServerException("{0} not found".format(handler.fullPath))

class case_allother_fail(object):
    '''所有情况都不符合'''
    def test(self, handler):
        return True
    def act(self, handler):
        raise ServerException("Unknown object {0}".format(handler.fullPath))

class case_is_file(object):
    ''' 输入的路径是文件'''
    def test(self, handler):
        print("test case_is_file", os.path.isfile(handler.fullPath))
        return os.path.isfile(handler.fullPath)
    def act(self, handler):
        handler.handle_file(handler)


class case_CGI_file(object):
    def test(self, handler):
        print("test case_CGI_file", os.path.isfile(handler.fullPath)
              and handler.fullPath.endswith('.py'))
        return os.path.isfile(handler.fullPath) and handler.fullPath.endswith('.py')

    def act(self, handler):
        print("===  CGI begin  ===\n", handler.fullPath, "\n===  CGI end  ===")
        handler.run_cgi(handler)

class case_index_file(object):
    '''输入/url时显示index.html'''
    def index_path(self, handler):
        return os.path.join(handler.fullPath, 'index.html')
    # 判断目标路径是否是目录，且需要判断目录下是否包含index.html
    def test(self, handler):
        return os.path.isdir(handler.fullPath) and os.path.isfile(self.index_path(handler))
    def act(self, handler):
        handler.fullPath = self.index_path(handler)
        handler.mine=handler.MINE["html"]
        handler.handle_file(handler)


class RequestHandler(hs.BaseHTTPRequestHandler):
    '''
    请求路径合法则返回相应处理，否则返回错误页面
    '''
    fullPath = ""
    CGIPath= "D:\\Program\\anaconda3\\envs\\tensorflow\\python.exe"
    mine=""
    isByte=False

    # 注意优先顺序
    cases = [case_no_path(),
             case_CGI_file(),
             case_is_file(),
             case_index_file(),
             case_allother_fail()]

    MINE = {
        "aac": "audio/aac", "css": "text/css", "htm": "text/html", "html": "text/html", "ico": "image/x-icon",
        "jpe": "image/jpeg", "jpeg": "image/jpeg", "jpg": "image/jpeg", "js": "application/javascript",
        "json": "application/json", "mp4": "video/mp4", "png": "image/png", "svg": "image/svg+xml",
        "ttf": "application/octet-stream", "txt": "text/plain", "woff": "font/x-woff", "woff2": "application/font-woff2"
    }

    byteMINE = ("png","svg", "ttf", "woff", "woff2")

    def run_cgi(self, handler):
        # 运行cgi脚本,得到格式化的输出
        l = [self.CGIPath, handler.fullPath]
        if handler.path.query:
            q = handler.path.query.split("&")
            for i in q:
                w = i.split("=", 1)
                l += ["--"+w[0], w[1]]
        data = subprocess.check_output(l, timeout=15)
        self.send_content(page=data, isByte=True)

    def send_content(self, page, status=200, mine="text/html", isByte=False):
        self.send_response(status)
        self.send_header("Content-type", mine+"; charset=UTF-8")
        if not isByte:
            page = page.encode()
        self.send_header("Content-Length", str(len(page)))
        self.end_headers()
        self.wfile.write(page)
        print("===  Send end  ===")

    def do_GET(self):
        try:
            # 获取文件路径

            print("==== do_GET begin  ===")

            self.path = urlparse(self.path, "http")
            self.fullPath = rootPath + self.path.path.replace("/", os.sep)
            print("PATH      =>", self.path)
            print("FULL_PATH =>", self.fullPath)
            self.ext = self.path.path.split(".")[-1]
            print("EXT_NAME  =>", self.ext)
            self.isByte = self.ext in self.byteMINE
            print("IS_BYTE   =>", self.isByte)
            if self.ext in self.MINE:
                self.mine = self.MINE[self.ext]
            else:
                self.mine = "text/html"
            print("MINE_TYPE =>", self.mine)

            print("==== do_GET end  ===")

            for case in self.cases:
                if case.test(self):
                    case.act(self)
                    break
        except Exception as msg:
            self.handle_error(msg)

    def handle_file(self, handler):
        try:
            if handler.isByte:
                with open(handler.fullPath, mode="rb") as file:
                    content = file.read()
            else:
                with open(handler.fullPath, mode="r", encoding="UTF-8") as file:
                    content = file.read()
            self.send_content(page=content, mine=handler.mine, isByte=handler.isByte)
        except IOError as msg:
            msg = "'{0}' cannot be read: {1}".format(handler.path.path, msg)
            self.handle_error(msg)

    Error_Page = "<html><body><h1>Error accessing {path}</h1><p>{msg}</p></body></html>"

    def handle_error(self, msg):
        content = self.Error_Page.format(path=self.path.path, msg=msg)
        self.send_content(content, 404)

if __name__ == '__main__':
    httpAddress = ("", 8888)
    httpd = hs.HTTPServer(httpAddress, RequestHandler)
    httpd.serve_forever()
