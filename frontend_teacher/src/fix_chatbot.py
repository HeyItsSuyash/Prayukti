import os

filepath = r"c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\lab\Chatbot.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix text box and placeholder to be dark gray
# Original: bg-slate-50 dark:bg-card border-2 border-slate-100 dark:border-transparent rounded-xl focus:outline-none focus:border-black dark:focus:border-primary/50 transition-colors font-medium text-sm text-slate-800 dark:text-slate-200
# New: bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500
content = content.replace(
    'bg-slate-50 dark:bg-card border-2 border-slate-100 dark:border-transparent rounded-xl focus:outline-none focus:border-black dark:focus:border-primary/50 transition-colors font-medium text-sm text-slate-800 dark:text-slate-200',
    'bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500'
)

# User message bubbles (primary) and bot message bubbles (dark gray)
# Current user: bg-black dark:bg-primary text-white rounded-br-none
# New user: bg-primary text-primary-foreground rounded-br-none
content = content.replace(
    'bg-black dark:bg-primary text-white rounded-br-none',
    'bg-primary text-primary-foreground rounded-br-none'
)

# Current bot: bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none
# New bot: bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none
content = content.replace(
    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none ',
    'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none '
)

# Remove all blue references
content = content.replace('bg-blue-400', 'bg-primary')
content = content.replace('decoration-blue-500/30', 'decoration-primary/30')

# Also fix the top header to not be slate-50
content = content.replace('bg-slate-50/50 dark:bg-background scroll-smooth', 'bg-slate-50 dark:bg-background scroll-smooth')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Chatbot.tsx updated")
