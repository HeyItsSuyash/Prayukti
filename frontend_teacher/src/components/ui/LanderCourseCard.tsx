import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LanderCourseCardProps {
    id: string;
    slug?: string;
    title: string;
    description: string;
    imageSrc: string;
}

export function LanderCourseCard({ id, slug, title, description, imageSrc }: LanderCourseCardProps) {
    const href = `/dashboard/${slug || id}`;
    
    return (
        <a href={href} className="block h-full group">
            <Card className="h-full flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                <CardContent className="p-0 flex flex-col h-full relative">
                    <div className="w-full h-48 relative shrink-0 overflow-hidden">
                        <img 
                            src={imageSrc} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow bg-card relative z-10">
                        <h3 className="text-xl font-bold tracking-tight leading-tight mb-3 text-foreground group-hover:text-primary transition-colors">
                            {title}
                        </h3>

                        <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-3 flex-grow">
                            {description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary">Explore Course</span>
                            <i className="bx bx-right-arrow-alt text-xl text-primary transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </a>
    );
}
