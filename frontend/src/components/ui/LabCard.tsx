import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LabCardProps {
    id: string;
    slug?: string;
    title: string;
    description: string;
    icon?: string;
    imageSrc: string;
    comingSoon: boolean;
    onClick?: () => void;
}

export function LabCard({ id, slug, title, description, imageSrc, comingSoon, onClick }: LabCardProps) {
    const href = comingSoon ? "#" : `/dashboard/${slug || id}`;
    
    return (
        <a 
            href={href} 
            onClick={onClick}
            className={`block h-full ${comingSoon ? 'cursor-default pointer-events-none' : ''}`}
        >
            <Card
                className={`h-full flex flex-col border-border rounded-2xl overflow-hidden bg-card ${comingSoon ? 'opacity-60 grayscale-[50%]' : 'border'}`}
            >
                <CardContent className="p-0 flex flex-col h-full relative">
                    {comingSoon && (
                        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-background/20 flex flex-col items-center justify-center">
                            <span className="bg-background border border-border text-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                                Coming Soon
                            </span>
                        </div>
                    )}
                    <div className="w-full h-40 relative shrink-0 p-3 pb-0">
                        <div className="w-full h-full relative overflow-hidden rounded-xl bg-slate-100">
                            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold tracking-tight leading-tight mb-3 text-foreground">
                            {title}
                        </h3>

                        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-3 flex-grow">
                            {description}
                        </p>

                        {!comingSoon && (
                            <Button className="w-full mt-auto font-semibold bg-primary hover:bg-primary text-primary-foreground shrink-0 rounded-xl">
                                Access Lab
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </a>
    );
}
