import os
import re

def count_js_files(directory):
    total_lines = 0
    non_empty_lines = 0
    word_count = 0

    # 遍歷資料夾中的所有檔案
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    total_lines += len(lines)
                    non_empty_lines += len([line for line in lines if line.strip()])
                    
                    # 使用正則表達式計算單字數量
                    for line in lines:
                        words = re.findall(r'\b[a-zA-Z]+\b', line)
                        word_count += len(words)
    
    print(f"總行數: {total_lines}")
    print(f"去除空白行的總行數: {non_empty_lines}")
    print(f"單字總數: {word_count}")

if __name__ == '__main__':
    folder_path = input("請輸入資料夾路徑: ").strip()
    count_js_files(folder_path)
    input()
