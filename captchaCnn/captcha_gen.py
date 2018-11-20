import sys
import os
curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
rootPath += os.sep+"captchaCnn"+os.sep

import random
import numpy as np
from PIL import Image
from captcha.image import ImageCaptcha

NUMBER = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
LOW_CASE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
            'v', 'w', 'x', 'y', 'z']
UP_CASE = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
           'V', 'W', 'X', 'Y', 'Z']
CAPTCHA_LIST = NUMBER + LOW_CASE
'''CAPTCHA_LIST = NUMBER + LOW_CASE + UP_CASE'''
CAPTCHA_LEN = 4
CAPTCHA_HEIGHT = 60
CAPTCHA_WIDTH = 160


FONT_T = rootPath + "assets" + os.sep + "font" + os.sep
FONTS = [FONT_T+"BauhausITC.ttf", FONT_T+"Cafelatte.ttf", FONT_T+"MicrosoftNewTaiLue.ttf",FONT_T+"carmeRegular.ttf"]

def random_captcha_text(charSet=CAPTCHA_LIST, captchaLength=CAPTCHA_LEN):
    '''
    随机生成验证码文本
    :@param charSet:
    :@param captchaLength:
    :return:
    '''
    captcha_text = [random.choice(charSet) for _ in range(captchaLength)]
    return ''.join(captcha_text)


def gen_captcha_text_and_image(width=CAPTCHA_WIDTH, height=CAPTCHA_HEIGHT, save=False, batch=-1):
    '''
    生成随机验证码
    :param width:
    :param height:
    :param save=False:
    :param batch=-1:
    :return: np数组
    '''
    image = ImageCaptcha(width=width, height=height, fonts=FONTS)
    captcha_text = random_captcha_text()
    captcha = image.generate(chars=captcha_text,format='png')
    # 保存
    if save:
        path = rootPath+"imgSave" + os.sep + ("%d" % batch) + os.sep 
        #print("out put path :",path)
        image.write(captcha_text, path+ captcha_text + '.png')
    captcha_image = Image.open(captcha)
    # 转化为np数组
    captcha_image = np.array(captcha_image)
    return captcha_text, captcha_image


if __name__ == '__main__':
    t, im = gen_captcha_text_and_image(save=True)
    print(t, im)
