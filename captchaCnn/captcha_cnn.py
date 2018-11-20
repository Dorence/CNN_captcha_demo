import sys
import os
curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
rootPath += os.sep+"captchaCnn"+os.sep

import time
import tensorflow as tf
from captchaCnn.cnn_train import cnn_graph
from captchaCnn.captcha_gen import gen_captcha_text_and_image
from captchaCnn.util import vec2text, convert2gray
from captchaCnn.util import CAPTCHA_LIST, CAPTCHA_WIDTH, CAPTCHA_HEIGHT, CAPTCHA_LEN

tf.app.flags.DEFINE_string("captSize", "10", "size of test group")
tf.app.flags.DEFINE_string("modelName", "5-963636","name of trained CNN model")
FLAGS = tf.app.flags.FLAGS

def captcha2text(image_list, height=CAPTCHA_HEIGHT, width=CAPTCHA_WIDTH, trainRestore="5-963636"):
	'''
	验证码图片转化为文本
	:param image_list:
	:param height:
	:param width:
	:return:
	'''
	x = tf.placeholder(tf.float32, [None, height * width])
	keep_prob = tf.placeholder(tf.float32)
	y_conv = cnn_graph(x, keep_prob, (height, width))
	saver = tf.train.Saver(save_relative_paths=True)
	with tf.Session() as sess:
		model_file=rootPath+'trainOK'+os.sep+trainRestore
		# print(model_file)

		saver.restore(sess, model_file)

		TIME0 =	time.process_time()
		predict = tf.argmax(tf.reshape(y_conv, [-1, CAPTCHA_LEN, len(CAPTCHA_LIST)]), 2)
		vector_list = sess.run(predict, feed_dict={x: image_list, keep_prob: 1})
		TIME1 =	time.process_time()

		vector_list = vector_list.tolist()
		text_list = [vec2text(vector) for vector in vector_list]
		return text_list, TIME1-TIME0

def main(_):
	lsText = []
	lsImg = []
	size = int(FLAGS.captSize)
	while len(lsText) < size:
		text, image = gen_captcha_text_and_image(save=True)
		image = convert2gray(image).flatten() / 255
		if text in lsText:
			lsImg[lsText.index(text)]=image
		else:
			lsText.append(text)
			lsImg.append(image)
		pass
	
	pre_text, calc = captcha2text(image_list=lsImg, trainRestore=FLAGS.modelName)
	pre_text = '["'+'", "'.join(pre_text)+'"]'
	text = '["'+'", "'.join(lsText)+'"]'

	data = '{"text":' + text+', "predict":' + pre_text+',"time": '+str(calc)+'}'
	print(data)

if __name__ == '__main__':
	'''
	for key in tf.app.flags.FLAGS.flag_values_dict():
  		print(key, FLAGS[key].value)
	'''
	tf.app.run()
