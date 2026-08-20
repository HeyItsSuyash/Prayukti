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
                    <div className="w-full h-40 relative shrink-0 p-3 pb-0">
                        {comingSoon ? (
                            <div className="w-full h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex flex-col items-center justify-center p-4 text-center border border-primary/20">
                                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm mb-2">
                                    Coming Soon
                                </span>
                                <span className="text-muted-foreground text-xs font-medium leading-tight">
                                    Please be patient
                                </span>
                            </div>
                        ) : (
                            <div className="w-full h-full relative overflow-hidden rounded-xl bg-slate-100">
                                <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
                            </div>
                        )}
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
