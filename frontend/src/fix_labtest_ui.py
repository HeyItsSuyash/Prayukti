import os

def fix_labtest():
    path = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\simulation\core\LabTest.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix alphabet disappearing
    # Search for text-primary bg-primary
    content = content.replace(
        'isSelected ? "border-primary text-primary bg-primary" : "border-border text-muted-foreground bg-card"',
        'isSelected ? "border-primary text-white bg-primary" : "border-border text-muted-foreground bg-card"'
    )

    # Fix test result labTitle color from text-muted-foreground to text-white
    # Look for: <p className="font-bold text-muted-foreground text-sm">{labTitle}</p>
    content = content.replace(
        '<p className="font-bold text-muted-foreground text-sm">{labTitle}</p>',
        '<p className="font-bold text-white text-sm">{labTitle}</p>'
    )
    # also the "Test" label above it might be text-white or white/80
    content = content.replace(
        '<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Test</span>',
        '<span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Test</span>'
    )

    # Note: that title block is currently inside:
    # <div className="flex justify-between items-start mb-10">
    # which is inside <div className="bg-card rounded-3xl ...">
    # Wait, if it's bg-card, making text white might make it invisible on light themes if it doesn't have dark mode wrapper!
    # Ah, the user said "test result page is not theme consistent. dont write the experiment name in green, use white font color instead."
    # Wait, if the user requested white, I will provide white. But I will just use `text-white` to ensure it's white.

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_labtest()
print("LabTest fixed.")
