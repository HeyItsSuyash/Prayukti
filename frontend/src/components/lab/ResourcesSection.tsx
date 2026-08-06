import { useState, useEffect } from "react";
import { PlayCircle, BookOpen, HelpCircle, Link as LinkIcon, ExternalLink, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LabResources } from "@/lib/labs/rich-content";
import { QuizView } from "./QuizView";
import { motion } from "framer-motion";

interface ResourcesSectionProps {
    resources?: LabResources;
    labId?: string; // Add labId prop
}

type ResourceType = 'video' | 'notes' | 'quiz' | 'reading' | null;

export function ResourcesSection({ resources, labId }: ResourcesSectionProps) {
    const [selectedType, setSelectedType] = useState<ResourceType>(null);
    const [dynamicVideoUrl, setDynamicVideoUrl] = useState<string | null>(null);

    // Fetch dynamic video if labId is provided
    useEffect(() => {
        if (labId) {
            fetch("/api/videos")
                .then(res => res.json())
                .then(data => {
                    if (data[labId]) {
                        setDynamicVideoUrl(data[labId]);
                    }
                })
                .catch(err => console.error("Error fetching video:", err));
        }
    }, [labId]);

    if (!resources) {
        return (
<<<<<<< Updated upstream
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-2" />
=======
            <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded border border-dashed border-border">
                <i className="bx bx-bookopen mx-auto h-12 w-12 text-muted-foreground/50 mb-2"  />
>>>>>>> Stashed changes
                <p>No specific resources available for this experiment yet.</p>
            </div>
        );
    }

    const openResource = (type: ResourceType) => setSelectedType(type);
    const closeResource = () => setSelectedType(null);

    // Use dynamic video if available, otherwise fallback to static
    const videoData = resources.video ? { ...resources.video } : undefined;
    if (dynamicVideoUrl && videoData) {
        videoData.url = dynamicVideoUrl;
    } else if (dynamicVideoUrl && !videoData) {
        // If no static video but dynamic exists, create a video object
        // cast to any to avoid strict type issues if resources.video is optional in a way that blocks this
        (resources as any).video = {
            title: "Experiment Lecture",
            url: dynamicVideoUrl,
            description: "Instructor assigned lecture."
        };
    }

    // Use the potentially modified videoData
    const finalVideoData = dynamicVideoUrl ? {
        title: videoData?.title || "Experiment Lecture",
        url: dynamicVideoUrl,
        description: videoData?.description || "Instructor assigned lecture."
    } : resources.video;


    const resourceTypes = [
        {
            type: 'video' as const,
            data: finalVideoData,
            icon: PlayCircle,
            color: "text-destructive",
            bg: "bg-destructive/10",
            label: "Animated Lecture",
            desc: "Watch a visual explanation"
        },
        {
            type: 'notes' as const,
            data: resources.notes,
            icon: BookOpen,
            color: "text-primary",
            bg: "bg-primary/10",
            label: "Reference Notes",
            desc: "Quick revision guide"
        },
        {
            type: 'quiz' as const,
            data: resources.quiz,
            icon: HelpCircle,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            label: "Self Quiz",
            desc: "Test your understanding"
        },
        {
            type: 'reading' as const,
            data: resources.reading,
            icon: LinkIcon,
            color: "text-success",
            bg: "bg-success/10",
            label: "Further Reading",
            desc: "External articles & docs"
        }
    ];

    return (
        <section className="py-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Learning Resources</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {resourceTypes.map((item) => (
                    item.data && (
                        <motion.div
                            key={item.type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                className="cursor-pointer hover:shadow-md transition-shadow border-border h-full card-hover"
                                onClick={() => openResource(item.type)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                    <div className={`p-3 rounded ${item.bg}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-base font-semibold text-foreground">
                                            {item.label}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {item.data.title || item.desc}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                ))}
            </div>

            <Dialog open={!!selectedType} onOpenChange={(open) => !open && closeResource()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
<<<<<<< Updated upstream
                            {selectedType === 'video' && <PlayCircle className="text-red-500" />}
                            {selectedType === 'notes' && <BookOpen className="text-blue-500" />}
                            {selectedType === 'quiz' && <HelpCircle className="text-purple-500" />}
=======
                            {selectedType === 'video' && <i className="bx bx-play-circle text-red-500"  />}
                            {selectedType === 'notes' && <i className="bx bx-bookopen text-primary"  />}
                            {selectedType === 'quiz' && <i className="bx bx-help-circle text-purple-500"  />}
>>>>>>> Stashed changes
                            {selectedType === 'reading' && <LinkIcon className="text-green-500" />}

                            {selectedType === 'video' && finalVideoData?.title}
                            {selectedType === 'notes' && resources.notes?.title}
                            {selectedType === 'quiz' && resources.quiz?.title}
                            {selectedType === 'reading' && resources.reading?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedType === 'video' && finalVideoData?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {selectedType === 'video' && finalVideoData && (
                            <div className="aspect-video w-full rounded overflow-hidden bg-black shadow-lg">
                                <iframe
                                    className="w-full h-full"
                                    src={finalVideoData.url}
                                    title={finalVideoData.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {selectedType === 'notes' && resources.notes && (
                            <div className="prose prose-blue max-w-none bg-muted/30 p-6 rounded border border-border">
                                {resources.notes.content}
                            </div>
                        )}

                        {selectedType === 'quiz' && resources.quiz && (
                            <QuizView questions={resources.quiz.questions} />
                        )}

                        {selectedType === 'reading' && resources.reading && (
                            <div className="space-y-4">
                                {resources.reading.content && (
                                    <div className="prose prose-sm max-w-none mb-6">
                                        {resources.reading.content}
                                    </div>
                                )}
                                <div className="grid gap-3">
                                    {resources.reading.links.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-card border border-border rounded hover:border-primary/50 hover:shadow-sm transition-all group card-hover"
                                        >
<<<<<<< Updated upstream
                                            <span className="font-medium text-gray-700 group-hover:text-blue-600">{link.text}</span>
                                            <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
=======
                                            <span className="font-medium text-card-foreground group-hover:text-primary">{link.text}</span>
                                            <i className="bx bx-externallink text-muted-foreground group-hover:text-primary"  />
>>>>>>> Stashed changes
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
