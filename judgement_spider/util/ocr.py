import pytesseract as pyt
from PIL import Image


def ocr(filepath):
    return pyt.image_to_string(Image.open(filepath))


if __name__ == "__main__":
    print(ocr("/tmp/check_code.jpeg"))
