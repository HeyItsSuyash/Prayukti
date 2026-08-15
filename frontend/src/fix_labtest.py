import os

filepath = r"c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\core\LabTest.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Selected Options: green border instead of primary/10 bg and white options
# Original: bg-primary/10 border-primary ring-1 ring-primary/50 shadow-none-none
# New: border-primary bg-card ring-1 ring-primary/50 shadow-none-none
content = content.replace(
    'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-none-none',
    'border-primary bg-card ring-1 ring-primary/50 shadow-none-none'
)
# And the selection text from `text-primary font-medium` to just green
content = content.replace(
    '${isSelected ? \'text-primary font-medium\' : \'text-muted-foreground\'}',
    '${isSelected ? \'text-primary font-bold\' : \'text-muted-foreground\'}'
)

# 2. Flagged Questions background: solid yellow, text black instead of bg-yellow-500/10
# Original in palette: bg-yellow-500/10 text-yellow-500 border-yellow-500/30
# New: bg-yellow-500 text-black border-yellow-600
content = content.replace(
    'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    'bg-yellow-500 text-black border-yellow-600'
)

# Legend flagged
content = content.replace(
    '{ color: "bg-yellow-500/20 border border-yellow-500/30", label: "Flagged" }',
    '{ color: "bg-yellow-500 border border-yellow-600", label: "Flagged" }'
)

# Also the flag button in the header
# Original: bg-yellow-500/10 border-yellow-500/20 text-yellow-500
# New: bg-yellow-500 border-yellow-600 text-black
content = content.replace(
    'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'bg-yellow-500 border-yellow-600 text-black'
)
# Update icon fill when flagged to black instead of yellow-600
content = content.replace('fill-yellow-600', 'fill-black')

# 3. Remove blue/indigo gradients
# Original: bg-gradient-to-r from-blue-600 to-indigo-600
# New: bg-gradient-to-r from-emerald-600 to-primary
content = content.replace(
    'bg-gradient-to-r from-blue-600 to-indigo-600',
    'bg-gradient-to-r from-emerald-600 to-primary'
)

# 4. Display user's name properly - Ensure "Suyash" instead of Roll No
# I'll just change the fallback for userName to 'Suyash' and userEmail to 'suyash@university.ac.in'
content = content.replace('useState("Student User")', 'useState("Suyash")')
content = content.replace('useState("student@university.ac.in")', 'useState("suyash@university.ac.in")')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("LabTest.tsx updated")
