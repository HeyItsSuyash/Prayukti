import os
import re

directory = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src'

emoji_pattern = re.compile(r'[\U0001F300-\U0001F5FF\U0001F900-\U0001F9FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U00002600-\U000026FF\U00002700-\U000027BF\U0001F1E6-\U0001F1FF\U0001F191-\U0001F251\U0001F004\U0001F0CF\U0001F170-\U0001F171\U0001F17E-\U0001F17F\U0001F18E\U00003030\U00002B50\U00002B55\U00002934-\U00002935\U00002B05-\U00002B07\U00002B1B-\U00002B1C\U00003297\U00003299\U0000303D\U00002122\U000023F3\U000024C2\U000023E9-\U000023EF\U000025B6\U000023F8-\U000023FA\u26A0\uFE0F]+', re.UNICODE)

def walk(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # We specifically avoid replacing '✓', '➔', '©', '⬆' by ensuring they are not in our target list if they fall in some blocks
                # Let's just use a simple list of explicitly found emojis:
                explicit_emojis = ['🥇', '🥈', '🥉', '⚠️', '📉', '🔔', '✅', '❌', '📂', '🔍', '⚙️', '⚙', '👤', '⚡', '🚀', '📦', '💻', '📊', '🗄️', '🗄', '🌐', '📟', '⚠️', '☑️', '✔️', '✅']
                
                new_content = content
                for e in explicit_emojis:
                    new_content = new_content.replace(e, '')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Removed emojis from {filepath}")

walk(directory)
print("Done")
