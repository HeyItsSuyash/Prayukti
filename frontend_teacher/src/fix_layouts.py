import os

def fix_lander_card():
    path = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\ui\LanderCourseCard.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix card background
    content = content.replace('bg-white hover:shadow-xl', 'bg-card hover:shadow-xl')
    content = content.replace('bg-white relative z-10', 'bg-card relative z-10')
    
    # Fix text colors
    content = content.replace('text-slate-900', 'text-foreground')
    content = content.replace('text-slate-500', 'text-muted-foreground')
    content = content.replace('border-slate-100', 'border-border')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_labs_grid():
    path = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\home\LabsGrid.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the filter for coming soon
    content = content.replace('.filter(lab => !isComingSoon(lab.slug))', '')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_page_layout(path):
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove PremiumFooter
    content = content.replace("import { PremiumFooter } from '@/components/layout/PremiumFooter';\n", "")
    content = content.replace('<PremiumFooter />', '')

    # Fix scroll wrapper
    # Usually they have:
    # <main className="min-h-screen bg-background flex flex-col font-sans transition-colors">
    # Replace min-h-screen with h-screen, add overflow-hidden
    # Then wrap the content under Navbar inside flex-1 overflow-y-auto
    
    # We'll do this carefully. 
    # For `labs/page.tsx`:
    if 'LabsPage' in content:
        content = content.replace(
            '<main className="min-h-screen bg-background flex flex-col font-sans transition-colors">',
            '<main className="h-screen bg-background flex flex-col font-sans transition-colors overflow-hidden">'
        )
        # wrap everything between navbar and end
        content = content.replace(
            '<section \n                className="pt-48 pb-32 text-white relative bg-slate-950"',
            '<div className="flex-1 overflow-y-auto w-full">\n            <section \n                className="pt-48 pb-32 text-white relative bg-slate-950"'
        )
        content = content.replace(
            '            </div>\n\n        </main>',
            '            </div>\n            </div>\n\n        </main>'
        )

    # For `video-tutor/page.tsx`
    elif 'VideoTutorPage' in content or 'AITutor' in content:
        content = content.replace(
            '<main className="min-h-screen bg-background font-sans transition-colors">',
            '<main className="h-screen bg-background flex flex-col font-sans transition-colors overflow-hidden">'
        )
        content = content.replace(
            '<div className="pt-24 pb-12 px-6">',
            '<div className="flex-1 overflow-y-auto w-full">\n            <div className="pt-24 pb-12 px-6">'
        )
        # find the end
        if '</div>\n\n        </main>' in content:
            content = content.replace(
                '</div>\n\n        </main>',
                '</div>\n            </div>\n\n        </main>'
            )

    # For `classroom/page.tsx`
    elif 'ClassroomPage' in content or 'SmartClass' in content:
        content = content.replace(
            '<div className="min-h-screen bg-background transition-colors font-sans">',
            '<div className="h-screen flex flex-col bg-background transition-colors font-sans overflow-hidden">'
        )
        # after navbar:
        content = content.replace(
            '<main className="pt-28 pb-20 px-6">',
            '<div className="flex-1 overflow-y-auto w-full">\n            <main className="pt-28 pb-20 px-6">'
        )
        content = content.replace(
            '            </main>\n        </div>',
            '            </main>\n            </div>\n        </div>'
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_lander_card()
fix_labs_grid()
fix_page_layout(r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\app\labs\page.tsx')
fix_page_layout(r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\app\(dashboard)\video-tutor\page.tsx')
fix_page_layout(r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\app\(dashboard)\classroom\page.tsx')

print("Layouts updated.")
