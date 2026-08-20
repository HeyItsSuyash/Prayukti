import os

def rewrite_exppage2():
    path = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\ExperimentPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rename export default function ExperimentPage -> function ExperimentPageContent
    content = content.replace(
        'export default function ExperimentPage({ id }: { id: string }) {',
        'function ExperimentPageContent({ id }: { id: string }) {'
    )

    # Add the new export default function ExperimentPage at the bottom
    mobile_lock_component = """

export default function ExperimentPage({ id }: { id: string }) {
    return (
        <>
            <div className="flex md:hidden flex-col items-center justify-center h-screen bg-background p-6 text-center z-[9999] relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-laptop text-4xl text-primary"></i>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-3 text-foreground">Larger Screen Required</h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mb-8">
                    Smaller device widths are not able to load experiment interfaces properly. Please open this page on a tablet or desktop.
                </p>
                <a href="/dashboard">
                    <Button className="bg-primary hover:bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-xl shadow-none">
                        Back to Dashboard
                    </Button>
                </a>
            </div>
            <div className="hidden md:block h-full w-full">
                <ExperimentPageContent id={id} />
            </div>
        </>
    );
}
"""
    content += mobile_lock_component

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite_exppage2()
print("ExperimentPage rewritten (part 2).")
