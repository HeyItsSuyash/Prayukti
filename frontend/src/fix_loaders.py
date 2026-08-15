import os
import re

files_to_check = [
    r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\classroom\ClassroomLayout.tsx',
    r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\dashboard\DashboardWrapper.tsx',
    r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\video-tutor\VideoTutorLayout.tsx',
    r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\core\WorkspacesPanel.tsx'
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change background to transparent
    content = content.replace(
        'className="flex flex-col h-screen items-center justify-center bg-background"',
        'className="flex flex-col h-screen items-center justify-center bg-transparent"'
    )
    
    content = content.replace(
        'className="flex items-center justify-center h-screen bg-background"',
        'className="flex items-center justify-center h-screen bg-transparent"'
    )
    
    content = content.replace(
        'border-red-500',
        'border-primary'
    )
    
    content = content.replace(
        'border-accent',
        'border-primary'
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Loaders fixed.")
