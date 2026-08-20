import os
import re

directory = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\dbms'

for filename in os.listdir(directory):
    if filename.endswith('.tsx'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        def repl(match):
            cls_content = match.group(1)
            # If it already has dark mode styling, don't append
            if 'dark:bg-slate-900' not in cls_content:
                return f'{cls_content} bg-transparent dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"'
            return match.group(0)

        # Match <input ... className="..." or <select ... className="..." or <textarea ... className="..."
        new_content = re.sub(r'(<(?:input|select|textarea)[^>]*?className=\"[^\"]*)\"', repl, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("Done")
