import { Handle, Position } from '@xyflow/react';

export default function OutputNode({ data }: { data: { label?: string; value?: number } }) {
    const isOn = !!data.value;

    return (
        <div className="flex flex-col items-center group relative">
            {/* Label */}
            <div className="mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-card/80 px-1 rounded-none backdrop-blur-sm border border-transparent group-hover:border-border ">
                {data.label || 'LED'}
            </div>

            <div className="relative">
                {/* LED Body */}
                <div className={`
                    relative w-12 h-12 rounded-none-full border-4  duration-300 flex items-center justify-center shadow-none-none
                    ${isOn ? 'bg-red-500 border-red-600 shadow-none-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse-slow' : 'bg-red-900 border-border opacity-80'}
                `}>
                    {/* Reflection/Shine */}
                    <div className="absolute top-2 left-3 w-3 h-2 bg-card rounded-none-full opacity-40 blur-[1px]"></div>

                    {/* Inner Glow */}
                    {isOn && <div className="absolute inset-0 rounded-none-full bg-red-400 blur-md opacity-50"></div>}
                </div>

                {/* Inputs Handle - Outside Body */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!bg-card !w-3 !h-3 hover:!bg-primary !border-none transition-colors"
                    style={{ left: -6, top: '50%', zIndex: 50 }}
                />
            </div>

            {/* Base/Legs visualization (Optional decoration) */}
            <div className="flex gap-1 mt-[-2px] -z-10">
                <div className="w-1 h-3 bg-card"></div>
                <div className="w-1 h-3 bg-card"></div>
            </div>
        </div>
    );
}
