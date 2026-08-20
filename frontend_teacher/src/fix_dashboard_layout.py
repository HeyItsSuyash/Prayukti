import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove PremiumFooter import and usage
    content = content.replace('import { PremiumFooter } from "@/components/layout/PremiumFooter";\n', '')
    content = content.replace('<PremiumFooter />\n', '')
    content = content.replace('<PremiumFooter />', '')

    # Change min-h-screen to h-screen flex flex-col overflow-hidden
    content = content.replace(
        '<div className="min-h-screen bg-background font-sans transition-colors">',
        '<div className="h-screen flex flex-col bg-background font-sans transition-colors overflow-hidden">'
    )
    content = content.replace(
        '<div className="min-h-screen bg-background font-sans">',
        '<div className="h-screen flex flex-col bg-background font-sans overflow-hidden">'
    )

    # Wrap main in overflow-y-auto div
    # For StudentDashboard.tsx
    if 'StudentDashboard.tsx' in filepath:
        content = content.replace(
            '<main className="container mx-auto px-4 pt-28 pb-20 max-w-7xl">',
            '<div className="flex-1 overflow-y-auto w-full"><main className="container mx-auto px-4 pt-28 pb-10 max-w-7xl">'
        )
        content = content.replace(
            '</main>',
            '</main></div>'
        )
    # For [subject]/page.tsx
    elif 'page.tsx' in filepath:
        # Wrap everything after navbar
        content = content.replace(
            '<div \n                className="text-white',
            '<div className="flex-1 overflow-y-auto w-full">\n            <div \n                className="text-white'
        )
        # Add closing div before the end
        content = content.replace(
            '            </main>\n\n        </div>',
            '            </main>\n            </div>\n\n        </div>'
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\dashboard\StudentDashboard.tsx')
fix_file(r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\app\(dashboard)\dashboard\[subject]\page.tsx')
print("Dashboard footer removed and scrolling fixed.")
