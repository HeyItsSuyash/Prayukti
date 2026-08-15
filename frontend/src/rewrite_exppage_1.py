import os

def rewrite_exppage():
    path = r'c:\Users\Suyash\Desktop\Prayukti_Legacy\frontend\src\components\ExperimentPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add simulationStarted state
    if 'const [simulationStarted, setSimulationStarted] = useState(false);' not in content:
        content = content.replace(
            'const [activeSection, setActiveSection] = useState("aim");',
            'const [activeSection, setActiveSection] = useState("aim");\n    const [simulationStarted, setSimulationStarted] = useState(false);'
        )

    # 2. Update renderContent to have the overview page
    # Look for the simulation case
    old_sim_case = """            case "simulation":
                return (
                    <div className="flex-1 flex flex-col h-full bg-background min-h-[600px] w-full">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                );"""
    
    new_sim_case = """            case "simulation":
                if (!simulationStarted) {
                    return (
                        <div className="flex flex-col items-center min-h-full bg-background text-muted-foreground select-none overflow-y-auto pb-12 w-full">
                            <div className="w-full max-w-4xl mt-8">
                                <div className="bg-gradient-to-br from-[#021D24] to-[#059669] rounded-t-2xl p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="bg-card/20 p-3 rounded-xl backdrop-blur-sm">
                                            <i className="bx bx-play-circle text-3xl text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-white/80 font-bold tracking-widest text-xs uppercase mb-1">{subjectName}</p>
                                            <h1 className="text-4xl font-bold text-white mb-3">{experiment.title}</h1>
                                            <p className="text-white/80 text-sm">Interactive Simulation Overview</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-card rounded-b-2xl shadow-none-none border border-border p-6 mb-6">
                                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Simulation Details</h2>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        {experiment.description || "In this interactive simulation, you will be able to visualize and interact with the concepts discussed in the theory section. Follow the provided algorithm and observe the outcomes closely."}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSimulationStarted(true)}
                                    className="w-full mt-4 py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl text-lg shadow-none-none active:scale-[0.98]"
                                >
                                    START SIMULATION
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex-1 flex flex-col h-full bg-background min-h-[600px] w-full">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                );"""
    
    content = content.replace(old_sim_case, new_sim_case)

    # 3. Add Mobile Lock wrapper to the main return
    # Find:
    # return (
    #     <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
    
    # We will replace `return (` with a wrapper that checks window width or uses CSS. CSS is preferred.
    # We can wrap the whole JSX in a fragment, with the desktop view having `hidden md:flex`, 
    # and mobile view having `flex md:hidden`.
    
    desktop_return = '<div className="hidden md:flex flex-col h-screen bg-background overflow-hidden font-sans">'
    content = content.replace('<div className="flex flex-col h-screen bg-background overflow-hidden font-sans">', desktop_return)
    
    # now we have to append the mobile view at the end before the last closing `);`
    # actually, replacing the whole return might be tricky with regex if there are multiple returns.
    # The non-programming lab returns:
    # return (
    #     <div className="hidden md:flex flex-col h-screen bg-background overflow-hidden font-sans">
    # ...
    #     </div>
    # );
    
    # And the programming lab returns:
    # if (isProgrammingLab) {
    #     return (
    #         <div className="hidden md:flex flex-col h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">
    # ...
    #         </div>
    #     );
    # }
    
    content = content.replace('<div className="flex flex-col h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">', '<div className="hidden md:flex flex-col h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">')

    # Wait, both need the mobile lock. 
    # Actually, a better approach is to wrap the entire component return!
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite_exppage()
print("ExperimentPage rewritten (part 1).")
