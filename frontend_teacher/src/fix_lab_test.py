import os

filepath = r"c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\core\LabTest.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Fonts
content = content.replace("font-serif ", "")

# Fix Kicked Screen
content = content.replace('bg-red-50 text-red-900', 'bg-background text-foreground')
content = content.replace('bg-red-100 rounded-full', 'bg-red-500/10 rounded-full')
content = content.replace('text-red-700 max-w-lg', 'text-muted-foreground max-w-lg')

# Fix User Card Role Badge
content = content.replace('bg-blue-50 text-primary', 'bg-primary/20 text-primary')

# Fix Result Screen Info Cards
content = content.replace('bg-green-50 border border-green-100', 'bg-green-500/10 border border-green-500/20')
content = content.replace('bg-red-50 border border-red-100', 'bg-red-500/10 border border-red-500/20')
content = content.replace('bg-yellow-50 border border-yellow-100', 'bg-yellow-500/10 border border-yellow-500/20')
content = content.replace('bg-blue-50 border border-primary', 'bg-primary/10 border border-primary/20')

# Fix Final Status Row
content = content.replace('bg-green-100 text-green-700', 'bg-green-500/20 text-green-500')
content = content.replace('bg-red-100 text-red-700', 'bg-red-500/20 text-red-500')

# Fix Selected Option
content = content.replace('bg-blue-50/50 border-primary ring-1 ring-blue-400', 'bg-primary/10 border-primary ring-1 ring-primary/50')

# Fix Flagged Button
content = content.replace('bg-yellow-50 border-yellow-200 text-yellow-600', 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500')

# Fix Question Palette
content = content.replace('bg-yellow-50 text-yellow-700 border-yellow-200', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30')
content = content.replace('bg-yellow-100 border border-yellow-300', 'bg-yellow-500/20 border border-yellow-500/30')

# Fix "Prev" Button
content = content.replace('bg-orange-50 px-5', 'bg-orange-500/10 px-5')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates to LabTest.tsx applied.")
