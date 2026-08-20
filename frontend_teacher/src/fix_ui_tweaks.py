import os

# 1. Update ExperimentPage.tsx
filepath_exp = r"c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\ExperimentPage.tsx"
with open(filepath_exp, 'r', encoding='utf-8') as f:
    content_exp = f.read()

# Font of the title
content_exp = content_exp.replace(
    '<h1 className="text-3xl font-light text-primary">{experiment.title}</h1>',
    '<h1 className="text-3xl font-black uppercase tracking-tighter text-primary">{experiment.title}</h1>'
)

# Vertically center the menu
content_exp = content_exp.replace(
    '<aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 overflow-y-auto">',
    '<aside className="w-64 bg-card border-r border-border flex flex-col justify-center flex-shrink-0 overflow-y-auto">'
)

# Sidebar selector color to green and styling to match brand
old_selector = '''                                className={`w-full text-left px-8 py-3 text-sm font-semibold transition-colors ${
                                    activeSection === section.id 
                                        ? "text-orange-500 border-l-4 border-orange-500 bg-orange-500/5" 
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent"
                                }`}'''

new_selector = '''                                className={`w-full text-left px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors ${
                                    activeSection === section.id 
                                        ? "text-primary border-l-4 border-primary bg-primary/10" 
                                        : "text-muted-foreground hover:bg-muted border-l-4 border-transparent hover:border-primary/30"
                                }`}'''
content_exp = content_exp.replace(old_selector, new_selector)

# Loader
old_loader = '''    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <i className="bx bx-loader2 h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Lab Environment...</p>
            </div>
        );
    }'''

new_loader = '''    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-transparent">
                <i className="bx bx-loader2 h-10 w-10 animate-spin text-primary mb-4" />
            </div>
        );
    }'''
content_exp = content_exp.replace(old_loader, new_loader)


with open(filepath_exp, 'w', encoding='utf-8') as f:
    f.write(content_exp)

print("ExperimentPage.tsx updated")

# 2. Update LabTest.tsx
filepath_lab = r"c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\core\LabTest.tsx"
with open(filepath_lab, 'r', encoding='utf-8') as f:
    content_lab = f.read()

# Gradient for the Test Overview card
# From bg-gradient-to-r from-emerald-600 to-primary
content_lab = content_lab.replace(
    'bg-gradient-to-r from-emerald-600 to-primary',
    'bg-gradient-to-br from-[#021D24] to-[#059669]'
)

# Text to white and darker green shade if applicable
# The banner has text-white, but the subtitle was text-primary
content_lab = content_lab.replace(
    '<p className="text-primary font-bold tracking-widest text-xs uppercase mb-1">{getSubjectName(labId)}</p>',
    '<p className="text-white/80 font-bold tracking-widest text-xs uppercase mb-1">{getSubjectName(labId)}</p>'
)
content_lab = content_lab.replace(
    '<p className="text-primary text-sm">Chapter Test • Online Assessment</p>',
    '<p className="text-white/80 text-sm">Chapter Test • Online Assessment</p>'
)

with open(filepath_lab, 'w', encoding='utf-8') as f:
    f.write(content_lab)

print("LabTest.tsx updated")
