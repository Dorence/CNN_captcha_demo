import os
import numpy as np
from captchaCnn.captcha_gen import gen_captcha_text_and_image
from captchaCnn.captcha_gen import CAPTCHA_LIST, CAPTCHA_LEN, CAPTCHA_HEIGHT, CAPTCHA_WIDTH


def convert2gray(img):
    '''
    图片转为黑白，3维转1维
    :param img:
    :return:
    '''
    if len(img.shape) > 2:
        img = np.mean(img, -1)
    return img


def text2vec(text, captcha_len=CAPTCHA_LEN, captcha_list=CAPTCHA_LIST):
    '''
    验证码文本转为向量
    :param text:
    :param captcha_len:
    :param captcha_list:
    :return:
    '''
    text_len = len(text)
    if text_len > captcha_len:
        raise ValueError('验证码最长'+captcha_len+'个字符')
    capListLen = len(captcha_list)
    vector = np.zeros(captcha_len * capListLen)
    for i in range(text_len):
        vector[captcha_list.index(text[i])+i*capListLen] = 1
    return vector


def vec2text(vec, captcha_list=CAPTCHA_LIST, size=CAPTCHA_LEN):
    '''
    验证码向量转为文本
    :param vec:
    :param captcha_list:
    :param size:
    :return:
    '''
    # if np.size(np.shape(vec)) is not 1:
    #     raise ValueError('向量限定为1维')
    # vec = np.reshape(vec, (size, -1))
    # vec_idx = np.argmax(vec, 1)
    vec_idx = vec
    text_list = [captcha_list[v] for v in vec_idx]
    return ''.join(text_list)


def wrap_gen_captcha_text_and_image(shape=(60, 160, 3), save=False, batchNum=-1):
    '''
    返回特定shape图片
    :param shape:
    :return:
    '''
    while True:
        t, im = gen_captcha_text_and_image(
            width=shape[1], height=shape[0], save=save,batch=batchNum)
        if im.shape == shape:
            return t, im


def next_batch(batchCnt=64, width=CAPTCHA_WIDTH, height=CAPTCHA_HEIGHT, batchNum=-1, save=False):
    '''
    获取训练图片组
    '''
    if save and not os.path.exists("imgSave"+os.sep+("%d" % batchNum)):
        os.makedirs("imgSave"+os.sep+("%d" % batchNum))
    batch_x = np.zeros([batchCnt, width * height])
    batch_y = np.zeros([batchCnt, CAPTCHA_LEN * len(CAPTCHA_LIST)])
    for i in range(batchCnt):
        text, image = wrap_gen_captcha_text_and_image(save=save, batchNum=batchNum)
        '''text, image = wrap_gen_captcha_text_and_image()'''
        batch_x[i, :] = convert2gray(image).flatten() / 255
        batch_y[i, :] = text2vec(text)
    # 返回该训练批次
    return batch_x, batch_y


if __name__ == '__main__':
    x, y = next_batch(batchCnt=1, batchNum=0, save=True)
    print(x, y)
